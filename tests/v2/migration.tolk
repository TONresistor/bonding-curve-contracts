import "@acton/build"
import "@acton/fmt"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/big_array"
import "@acton/types/message"
import "@acton/types/transaction"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/FeeCollectorV2.gen"
import "@wrappers/FeeSplitterV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWallet.gen"
import "@contracts/v1/bonding-config"
import "@contracts/v1/jetton-utils"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-dedust"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/collector-address"
import "@contracts/v2/fee-addresses"
import "@contracts/v2/fee-storage"
import "migration-finalization"
import "../shared/dedust"

const V2_TIME = 1801267200

struct (0xc442500f) V2Swap {
    minimalAmountOut: coins
    deadline: uint40
    next: cell? = null
    partnerAbsent: bool = false
    referrerAbsent: bool = false
}

struct (0xa5a7cbf8) V2PayNative {
    queryId: uint64
    amount: coins
    paymentPayload: cell
    payoutConfig: cell
}

fun loadV2Libraries() {
    val pool = build("DeDustPool", "build/cache/market-libraries/pool.boc");
    val deposit = build("DeDustDeposit", "build/cache/market-libraries/deposit.boc");
    val position = build("DeDustPosition", "build/cache/market-libraries/position.boc");
    expect(pool.hash()).toEqual(DEDUST_POOL_V2_LIBRARY_HASH);
    expect(
        deposit.hash(),
    ).toEqual(0x2cac3fddd30969d08df036067108c6e7d69780a9459d931d2eb63d95d5ff6825);
    expect(
        position.hash(),
    ).toEqual(0xdd82f24db614798ee7c579f8b3f07f0645d06d65cede368d80d0d74b180d2dd6);
    testing.registerLibrary(pool);
    testing.registerLibrary(deposit);
    testing.registerLibrary(position);
}

fun v2Tokens(minter: JettonMinterV2, owner: address): coins {
    val wallet = JettonWallet.fromAddress(minter.getWalletAddress(owner));
    return testing.isDeployed(wallet.address) ? wallet.getWalletData().jettonBalance : 0;
}

fun v2Transfer(
    id: uint64,
    amount: coins,
    recipient: address,
    owner: address,
    payload: cell,
): AskToTransfer {
    return {
        queryId: id,
        jettonAmount: amount,
        transferRecipient: recipient,
        sendExcessesTo: owner,
        customPayload: null,
        forwardTonAmount: ton("0.2"),
        forwardPayload: beginCell().storeUint(1, 1).storeRef(payload).toSlice(),
    };
}

fun v2Cursor<T>(sender: address, target: address, amount: coins, body: T): TxCursor {
    return testing.createTraceIterationCursor(
        sender,
        createMessage({ bounce: true, dest: target, value: amount, body }),
    );
}

fun v2Drain(cursors: array<TxCursor>) {
    var active = true;
    var steps = 0;
    while (active) {
        active = false;
        var i = 0;
        while (i < cursors.size()) {
            val cursor = cursors.get(i);
            if (!cursor.isDone()) {
                active = true;
                val segment = cursor.executeN(1);
                var j = 0;
                while (j < segment.size()) {
                    val tx = segment.at(j).tx.load();
                    val d = tx.description.load();
                    if (d is TlbTransOrd) {
                        if (d.aborted) {
                            println(segment);
                            throw 1001;
                        }
                    }
                    j += 1;
                }
            }
            i += 1;
        }
        steps += 1;
        assert (steps < 10000) throw 1002;
    }
    var i = 0;
    while (i < cursors.size()) {
        cursors.get(i).close();
        i += 1;
    }
}

fun v2Payout(trace: SendResultList, sender: address, to: address, amount: coins) {
    if (amount > 0) {
        expect(trace).toHaveSuccessfulTx<ReturnExcessesBack>({ from: sender, to, value: amount });
    }
}

fun v2MigrationScenario(supply: coins, fee: uint16, dev: coins, salt: uint64, rounds: int = 10) {
    val admin = testing.treasury("v2-protocol");
    val creator = testing.treasury("v2-creator");
    var actors: array<address> = [];
    var i = 0;
    repeat (10) {
        actors.push(testing.treasury(format("v2-trader-{}", i)).address);
        i += 1;
    }
    val trader = actors.get(0);
    val master = BondingCurveMasterV2.fromStorage({ admin: admin.address, nextAdmin: null, treasury: admin.address, totalLaunches: 0, feesBalance: 0 });
    testing.setShardAccount(master.address, null);
    master.deploy(admin.address, { value: ton("2") });
    val options = LaunchOptions {
        supply,
        creatorFeeBps: fee,
        devBuyAmount: dev,
        minDevTokens: 0,
    };
    // Initialize fresh test accounts locally; forks retain the pinned chain config.
    val curveAddress = master.getLaunchAddress(creator.address, salt, options);
    val mintCandidate = JettonMinterV2.fromStorage({ totalSupply: 0, adminAddress: curveAddress, nextAdminAddress: null, metadata: beginCell().endCell() });
    val collectorCandidate = collectorAddress(
        mintCandidate.address,
        creator.address,
        admin.address,
        fee,
    ).calculateAddress();
    val recipients = FeeRecipients {
        creator: creator.address,
        protocol: admin.address,
        creatorBps: fee,
    }.toCell();
    val splitterCandidate = splitterAddress(
        collectorCandidate,
        mintCandidate.address,
        recipients,
    ).calculateAddress();
    val poolCandidate = calcDeployedCpmmV2Pool(
        mintCandidate.address,
        collectorCandidate,
        fee,
    ).calculateAddress();
    val owners: array<address> = [
        curveAddress,
        creator.address,
        admin.address,
        collectorCandidate,
        splitterCandidate,
        poolCandidate,
    ];
    testing.setShardAccount(curveAddress, null);
    testing.setShardAccount(mintCandidate.address, null);
    testing.setShardAccount(collectorCandidate, null);
    testing.setShardAccount(splitterCandidate, null);
    testing.setShardAccount(poolCandidate, null);
    var cleared = 0;
    while (cleared < owners.size()) {
        testing.setShardAccount(
            calcAddressOfJettonWallet(
                owners.get(cleared),
                mintCandidate.address,
                build("JettonWalletV2"),
            ),
            null,
        );
        cleared += 1;
    }
    cleared = 0;
    while (cleared < actors.size()) {
        testing.setShardAccount(
            calcAddressOfJettonWallet(
                actors.get(cleared),
                mintCandidate.address,
                build("JettonWalletV2"),
            ),
            null,
        );
        cleared += 1;
    }
    val launch = master.sendCreateLaunch(
        creator.address,
        1,
        beginCell().endCell(),
        salt,
        options,
        { value: dev + ton("1"), bounce: true },
    );
    expect(launch).toHaveSuccessfulTx<CreateLaunch>({ to: master.address });
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(creator.address, salt, options));
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    expect(minter.getJettonData().totalSupply).toEqual(supply);
    expect(minter.getJettonData().adminAddress).toEqual(null);
    val devNet = dev - dev / 100 - dev * fee / 10000;
    val devTokens = supply - ton("400") * supply / (ton("400") + devNet);
    expect(v2Tokens(minter, creator.address)).toEqual(devTokens);
    var expectedSeed: coins = 0;
    var expectedPoolTokens: coins = 0;
    if (devNet < GRADUATION_THRESHOLD_TON) {
        expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
        i = 0;
        repeat (10) {
            curve.sendBuyJettons(actors.get(i), 10 + i, 0, { value: ton("5.05") });
            i += 1;
        }
        var round = 0;
        repeat (rounds) {
            val a = actors.get(round % 10);
            val b = actors.get((round + 1) % 10);
            val sellAmount = v2Tokens(minter, b) / 5;
            val before = curve.getCurveData();
            val beforeA = v2Tokens(minter, a);
            val beforeB = v2Tokens(minter, b);
            val buyerNet = ton("2") - ton("2") / 100 - ton("2") * fee / 10000;
            val expectedBuy = before.curveJettonBalance -
                (before.virtualTonReserve + before.realTonReserve) * before.curveJettonBalance /
                    (before.virtualTonReserve + before.realTonReserve + buyerNet);
            // Buy root executes before the sell's wallet delivery reaches the curve.
            val buy = v2Cursor(
                a,
                curve.address,
                ton("2.05"),
                BuyJettons {
                    queryId: 100 + round,
                    minJettonsOut: 0,
                },
            );
            val sell = v2Cursor(
                b,
                minter.getWalletAddress(b),
                ton("0.4"),
                v2Transfer(
                    200 + round,
                    sellAmount,
                    curve.address,
                    b,
                    SellPayload {
                        queryId: 200 + round,
                        minTonOut: 0,
                    }.toCell(),
                ),
            );
            val claim = v2Cursor(
                creator.address,
                curve.address,
                ton("0.05"),
                ClaimCurveCreatorFees { queryId: 300 + round },
            );
            v2Drain([buy, sell, claim]);
            expect(v2Tokens(minter, a)).toEqual(beforeA + expectedBuy);
            expect(v2Tokens(minter, b)).toEqual(beforeB - sellAmount);
            val afterBuyY = before.curveJettonBalance - expectedBuy;
            val afterBuyX = before.virtualTonReserve + before.realTonReserve + buyerNet;
            val sellGross = afterBuyX - afterBuyX * afterBuyY / (afterBuyY + sellAmount);
            expect(curve.getCurveData().realTonReserve).toEqual(
                before.realTonReserve + buyerNet - sellGross,
            );
            expect(curve.getCurveData().curveJettonBalance).toEqual(afterBuyY + sellAmount);
            round += 1;
        }
        val before = curve.getCurveData();
        val gross = ton("2500");
        val netIn = gross - gross / 100 - gross * fee / 10000;
        val out = before.curveJettonBalance -
            (before.virtualTonReserve + before.realTonReserve) * before.curveJettonBalance /
                (before.virtualTonReserve + before.realTonReserve + netIn);
        expectedSeed = before.realTonReserve + netIn - MIGRATION_FEE;
        expectedPoolTokens = expectedSeed * (before.curveJettonBalance - out) /
            (before.virtualTonReserve + expectedSeed + MIGRATION_FEE);
        val migration = curve.sendBuyJettons(
            trader,
            500,
            out,
            { value: gross + CURVE_TRANSFER_VALUE },
        );
        expect(migration).toHaveSuccessfulTx<Graduate>({ to: curve.address });
    } else {
        expectedSeed = devNet - MIGRATION_FEE;
        expectedPoolTokens = expectedSeed * (supply - devTokens) / (ton("400") + devNet);
    }
    expect(curve.getState()).toEqual(CURVE_STATE_MIGRATED);
    val pool = curve.getPoolAddress();
    val initial = net.runGetMethod<SimulationPoolData>(pool, "get_pool_data");
    expect(initial.status).toEqual(2);
    expect(initial.reserveX).toEqual(expectedSeed);
    expect(initial.reserveY).toEqual(expectedPoolTokens);
    expect(initial.baseFeeBPS).toEqual(poolBaseFeeBps(fee));
    val position = net.runGetMethod<address>(pool, "get_position_address", [curve.address]);
    val lp = net.runGetMethod<SimulationPositionData>(position, "get_position_data");
    expect(lp.lockedLiquidity).toEqual(initial.liquidity);
    expect(lp.liquidity).toEqual(initial.liquidity);
    expect(master.getMasterData().feesBalance).toEqual(CREATE_LAUNCH_FEE + MIGRATION_FEE);
    expect(curve.getCurveData().migrationReserve).toEqual(0);
    var total = v2Tokens(minter, creator.address) + v2Tokens(minter, curve.address) +
        v2Tokens(minter, pool);
    i = 0;
    repeat (10) {
        total += v2Tokens(minter, actors.get(i));
        i += 1;
    }
    expect(total).toEqual(supply);
    val collector = FeeCollectorV2.fromAddress(curve.getCollectorAddress());
    val splitter = FeeSplitterV2.fromAddress(collector.getSplitterAddress());
    var earnedProtocolX: coins = 0;
    var earnedCreatorX: coins = 0;
    var earnedProtocolY: coins = 0;
    var earnedCreatorY: coins = 0;
    val creatorInitialTokens = v2Tokens(minter, creator.address);
    var trade = 0;
    repeat (4) {
        val swap = V2Swap {
            minimalAmountOut: 1,
            deadline: V2_TIME + 3600,
        }.toCell();
        val poolBefore = net.runGetMethod<SimulationPoolData>(pool, "get_pool_data");
        val base = poolBaseFeeBps(fee);
        val input = ton("5");
        val charge = input - input * 10000 / (10000 + base);
        val expectedCollected = (charge - charge * 2000 / 10000) * 5000 / 10000;
        net.send(
            trader,
            createMessage({ bounce: true, dest: pool, value: input + ton("0.3"), body: V2PayNative {
                    queryId: 600 + trade,
                    amount: input,
                    paymentPayload: swap,
                    payoutConfig: buildEmptyExtendedPayoutConfig(trader),
                } }),
        );
        val afterBuy = net.runGetMethod<SimulationPoolData>(pool, "get_pool_data");
        expect(afterBuy.creatorFeeX - poolBefore.creatorFeeX).toEqual(expectedCollected);
        val sellTokens = v2Tokens(minter, trader) / 100;
        net.send(
            trader,
            createMessage({ bounce: true, dest: minter.getWalletAddress(
                    trader,
                ), value: ton("0.4"), body: v2Transfer(
                    700 + trade,
                    sellTokens,
                    pool,
                    trader,
                    beginCell()
                        .storeUint(DEDUST_CPMM_V2_OP_PAY_JETTON, 32)
                        .storeRef(swap)
                        .storeRef(buildEmptyExtendedPayoutConfig(trader))
                        .endCell(),
                ) }),
        );
        val beforeClaim = net.runGetMethod<SimulationPoolData>(pool, "get_pool_data");
        expect(beforeClaim.creatorFeeX > 0 && beforeClaim.creatorFeeY > 0).toEqual(true);
        val cpX = beforeClaim.creatorFeeX * 10 / (10 + fee);
        val cpY = beforeClaim.creatorFeeY * 10 / (10 + fee);
        earnedProtocolX += cpX;
        earnedCreatorX += beforeClaim.creatorFeeX - cpX;
        earnedProtocolY += cpY;
        earnedCreatorY += beforeClaim.creatorFeeY - cpY;
        // Two collection requests in flight cannot claim the same accrued fees twice.
        v2Drain(
            [
                v2Cursor(trader, collector.address, ton("0.4"), CollectPoolFees { queryId: 800 }),
                v2Cursor(trader, collector.address, ton("0.4"), CollectPoolFees { queryId: 800 }),
            ],
        );
        expect(v2Tokens(minter, collector.address)).toEqual(beforeClaim.creatorFeeY);
        val oversweep = collector.sendSweepCollectedTokens(
            trader,
            801,
            beforeClaim.creatorFeeY + 1,
            { value: ton("0.4") },
        );
        expect(oversweep).toHaveFailedTx<AskToTransfer>({ to: minter.getWalletAddress(
                collector.address,
            ), exitCode: 47 });
        expect(splitter.getSplitterData().creatorTokens).toEqual(0);
        expect(splitter.getSplitterData().protocolTokens).toEqual(0);
        collector.sendSweepCollectedTokens(
            trader,
            802,
            beforeClaim.creatorFeeY,
            { value: ton("0.4") },
        );
        val ledger = splitter.getSplitterData();
        expect(ledger.protocolTon).toEqual(cpX);
        expect(ledger.creatorTon).toEqual(beforeClaim.creatorFeeX - cpX);
        expect(ledger.protocolTokens).toEqual(cpY);
        expect(ledger.creatorTokens).toEqual(beforeClaim.creatorFeeY - cpY);
        val pc = splitter.sendClaimSplitFees(admin.address, 900, true, { value: ton("0.2") });
        expect(
            splitter.sendClaimSplitFees(trader, 901, true, { value: ton("0.2") }),
        ).toHaveFailedTx<ClaimSplitFees>({ to: splitter.address, exitCode: 73 });
        val ccCursor = v2Cursor(
            creator.address,
            splitter.address,
            ton("0.2"),
            ClaimSplitFees {
                queryId: 901,
                protocol: false,
            },
        );
        ccCursor.executeN(1);
        splitter.sendClaimSplitFees(creator.address, 901, false, { value: ton("0.2") });
        val cc = ccCursor.executeAllRemaining();
        ccCursor.close();
        v2Payout(pc, splitter.address, admin.address, cpX);
        v2Payout(cc, splitter.address, creator.address, beforeClaim.creatorFeeX - cpX);
        expect(v2Tokens(minter, admin.address)).toEqual(earnedProtocolY);
        expect(v2Tokens(minter, creator.address)).toEqual(creatorInitialTokens + earnedCreatorY);
        expect(v2Tokens(minter, splitter.address)).toEqual(0);
        expect(splitter.getSplitterData().pending.isEmpty()).toEqual(true);
        v2Drain(
            [
                v2Cursor(
                    creator.address,
                    splitter.address,
                    ton("0.2"),
                    ClaimSplitFees {
                        queryId: 902,
                        protocol: false,
                    },
                ),
                v2Cursor(
                    creator.address,
                    splitter.address,
                    ton("0.2"),
                    ClaimSplitFees {
                        queryId: 902,
                        protocol: false,
                    },
                ),
            ],
        );
        expect(v2Tokens(minter, creator.address)).toEqual(creatorInitialTokens + earnedCreatorY);
        val afterClaim = net.runGetMethod<SimulationPoolData>(pool, "get_pool_data");
        expect(afterClaim.reserveX).toEqual(beforeClaim.reserveX);
        expect(afterClaim.reserveY).toEqual(beforeClaim.reserveY);
        expect(afterClaim.creatorFeeX).toEqual(0);
        expect(afterClaim.creatorFeeY).toEqual(0);
        expect(
            net.runGetMethod<SimulationPositionData>(position, "get_position_data").lockedLiquidity,
        ).toEqual(initial.liquidity);
        trade += 1;
    }
    expect(earnedProtocolX > 0 && earnedProtocolY > 0).toEqual(true);
    if (fee == 0) {
        expect(earnedCreatorX).toEqual(0);
        expect(earnedCreatorY).toEqual(0);
    }
    println(
        "V2_PASS supply={} creator_bps={} dev_nano={} base_fee_bps={} curve_rounds={} swaps=8 claims=20",
        supply,
        fee,
        dev,
        initial.baseFeeBPS,
        devNet < GRADUATION_THRESHOLD_TON ? rounds : 0,
    );
}

fun runV2Matrix(rounds: int = 10) {
    assert (!net.isBroadcasting()) throw 1000;
    testing.setNow(V2_TIME);
    loadV2Libraries();
    val supplies: array<coins> = [100000000000000000, 1000000000000000000, 10000000000000000000];
    val fees: array<uint16> = [0, 10, 50, 100, 200];
    val buys: array<coins> = [0, ton("100"), ton("3000"), ton("1000000")];
    var id: uint64 = 0;
    var a = 0;
    repeat (3) {
        var b = 0;
        repeat (5) {
            var d = 0;
            repeat (4) {
                v2MigrationScenario(supplies.get(a), fees.get(b), buys.get(d), id, rounds);
                id += 1;
                d += 1;
            }
            b += 1;
        }
        a += 1;
    }
    simulateFinalization(0);
    simulateFinalization(1);
    println("V2_MATRIX_PASS scenarios=60 presets=15 wallets=10");
}
