import "@acton/io"
import "@acton/emulation/config"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/BuybackBurnV2.gen"
import "@wrappers/FeeCollectorV2.gen"
import "@wrappers/FeeSplitterV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWalletV2.gen"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-dedust"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/buyback-messages"
import "@contracts/v2/buyback-storage"
import "@contracts/v2/fee-storage"
import "@contracts/v2/wallet-messages"
import "migration"

fun launchBuyback(
    supply: coins = 1000000000000000000,
    fee: uint16 = 100,
    dev: coins = ton("3000"),
): (BondingCurveV2, JettonMinterV2, BuybackBurnV2, address) {
    loadV2Libraries();
    testing.setNow(V2_TIME);
    val user = testing.treasury("buyback-user").address;
    val protocol = testing.treasury("buyback-protocol").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: protocol, nextAdmin: null, treasury: protocol, totalLaunches: 0, feesBalance: 0 });
    master.deploy(protocol, { value: ton("2") });
    val options = LaunchOptions {
        supply,
        creatorFeeBps: fee,
        devBuyAmount: dev,
        minDevTokens: 0,
        buybackBurn: true,
    };
    master.sendCreateLaunch(
        user,
        1,
        beginCell().endCell(),
        1,
        options,
        { value: dev + ton("1") },
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(user, 1, options));
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    curve.sendPrepareBuyback(user, 2, { value: ton("0.15") });
    val burner = BuybackBurnV2.fromAddress(curve.getBuybackAddress()!);
    curve.sendFlushCreatorFees(user, 3, { value: ton("0.05") });
    burner.sendClaimBuybackFees(user, 4, { value: ton("0.5") });
    return (curve, minter, burner, user);
}

get fun `test buyback: actual DeDust quote swap and confirmed burn`() {
    val (curve, minter, burner, user) = launchBuyback();
    expect(curve.getCurveData().state).toEqual(CURVE_STATE_MIGRATED);
    expect(burner.getBuybackData().availableTon > 0).toEqual(true);
    val supply = minter.getJettonData().totalSupply;
    val trace = burner.sendExecuteBuyback(user, 5, { value: BUYBACK_TRIGGER_GAS });
    expect(burner.getBuybackData().burned > 0).toEqual(true);
    expect(minter.getJettonData().totalSupply).toEqual(supply - burner.getBuybackData().burned);
    expect(burner.getBuybackData().swap == null).toEqual(true);
    expect(burner.getBuybackData().burnId).toEqual(0);
    expect(burner.getBuybackData().availableTon).toEqual(0);
    expect(
        JettonWalletV2
            .fromAddress(minter.getWalletAddress(burner.address))
            .getWalletData()
            .jettonBalance,
    ).toEqual(0);
}

get fun `test buyback: curve fees wait for confirmed migration`() {
    val (curve, minter, burner, user) = launchBuyback(1000000000000000000, 100, ton("100"));
    expect(burner.getBuybackData().active).toEqual(false);
    expect(burner.getBuybackData().availableTon).toEqual(ton("1"));
    expect(
        burner.sendExecuteBuyback(user, 6, { value: BUYBACK_TRIGGER_GAS }),
    ).toHaveFailedTx<ExecuteBuyback>({ to: burner.address, exitCode: 49 });
    val stranger = testing.treasury("buyback-stranger").address;
    val c = burner.getBuybackData().config!;
    expect(
        burner.sendInitBuyback(stranger, 7, c.load(), true, { value: ton("0.1") }),
    ).toHaveFailedTx<InitBuyback>({ to: burner.address, exitCode: 73 });
    expect(burner.getBuybackData().active).toEqual(false);
}

fun checkBuybackSlippage(marketBuy: coins, accepted: bool) {
    val (curve, _, burner, user) = launchBuyback(
        accepted ? 100000000000000000 : 1000000000000000000,
    );
    val initial = burner.getBuybackData().availableTon;
    val cursor = v2Cursor(
        user,
        burner.address,
        BUYBACK_TRIGGER_GAS,
        ExecuteBuyback { queryId: 10 },
    );
    cursor.executeN(3);
    expect(burner.getBuybackData().swap != null).toEqual(true);
    val pending = burner.getBuybackData().swap!.load();
    // A genuine trade moves the price between the quote and execution.
    net.send(
        user,
        createMessage({ bounce: true, dest: curve.getPoolAddress(), value: marketBuy +
                ton("0.3"), body: V2PayNative {
                queryId: 11,
                amount: marketBuy,
                paymentPayload: V2Swap {
                    minimalAmountOut: 1,
                    deadline: V2_TIME + 3600,
                }.toCell(),
                payoutConfig: buildEmptyExtendedPayoutConfig(user),
            } }),
    );
    cursor.executeAllRemaining();
    cursor.close();
    expect(burner.getBuybackData().swap == null).toEqual(true);
    if (accepted) {
        val burned = burner.getBuybackData().burned;
        expect(burned >= pending.minimumTokens).toEqual(true);
        expect(burned < pending.minimumTokens * 9900 / 9700).toEqual(true);
        expect(burner.getBuybackData().availableTon).toEqual(0);
        return;
    }
    expect(burner.getBuybackData().availableTon >= initial).toEqual(true);
    expect(burner.getBuybackData().burned).toEqual(0);
    burner.sendExecuteBuyback(user, 12, { value: BUYBACK_TRIGGER_GAS });
    expect(burner.getBuybackData().burned > 0).toEqual(true);
}

get fun `test buyback: three percent slippage accepts movement and refunds worse execution`() {
    checkBuybackSlippage(ton("30"), true);
    checkBuybackSlippage(ton("1000"), false);
}

get fun `test buyback: expired quote and duplicate triggers never spend twice`() {
    val (_, _, burner, user) = launchBuyback();
    val initial = burner.getBuybackData().availableTon;
    val cursor = v2Cursor(
        user,
        burner.address,
        BUYBACK_TRIGGER_GAS,
        ExecuteBuyback { queryId: 10 },
    );
    cursor.executeN(2);
    expect(
        burner.sendExecuteBuyback(user, 11, { value: BUYBACK_TRIGGER_GAS }),
    ).toHaveFailedTx<ExecuteBuyback>({ to: burner.address, exitCode: 49 });
    testing.setNow(V2_TIME + BUYBACK_QUOTE_TTL + 1);
    cursor.executeAllRemaining();
    cursor.close();
    expect(burner.getBuybackData().availableTon).toEqual(initial);
    expect(burner.getBuybackData().quoteId).toEqual(0);
    expect(burner.getBuybackData().burned).toEqual(0);
    burner.sendExecuteBuyback(user, 12, { value: BUYBACK_TRIGGER_GAS });
    expect(burner.getBuybackData().burned > 0).toEqual(true);
}

get fun `test buyback: third party pool payouts cannot consume pending refunds`() {
    val (curve, _, burner, user) = launchBuyback();
    val initial = burner.getBuybackData().availableTon;
    val cursor = v2Cursor(
        user,
        burner.address,
        BUYBACK_TRIGGER_GAS,
        ExecuteBuyback { queryId: 10 },
    );
    cursor.executeN(3);
    val pending = burner.getBuybackData().swap!.load();
    // DeDust authenticates the pool, not the initiator encoded in a payout.
    net.send(
        user,
        createMessage({ bounce: true, dest: curve.getPoolAddress(), value: ton("0.31"), body: BuybackPayNative {
                queryId: pending.id,
                amount: ton("0.01"),
                paymentPayload: BuybackSwap {
                    minimalAmountOut: 1000000000000000000,
                    deadline: V2_TIME + 3600,
                }.toCell(),
                payoutConfig: BuybackPayoutConfig {
                    fulfill: {
                        destination: user,
                        extraGas: 0,
                        payload: null,
                    },
                    reject: {
                        destination: burner.address,
                        extraGas: 0,
                        payload: BuybackRefund { queryId: pending.id }.toCell(),
                    },
                    excessesTo: user,
                }.toCell(),
            } }),
    );
    expect(burner.getBuybackData().swap != null).toEqual(true);
    // Force the original swap to reject too, using its real deadline.
    testing.setNow(V2_TIME + BUYBACK_QUOTE_TTL + 1);
    cursor.executeAllRemaining();
    cursor.close();
    expect(burner.getBuybackData().swap == null).toEqual(true);
    expect(burner.getBuybackData().availableTon >= initial + ton("0.005")).toEqual(true);
}

get fun `test buyback: DeDust TON and token fees burn without touching protocol share`() {
    val (curve, minter, burner, user) = launchBuyback();
    burner.sendExecuteBuyback(user, 10, { value: BUYBACK_TRIGGER_GAS });
    val collector = FeeCollectorV2.fromAddress(curve.getCollectorAddress());
    val splitter = FeeSplitterV2.fromAddress(collector.getSplitterAddress());
    val protocolBefore = splitter.getSplitterData().protocolTon;
    val tokens = v2Tokens(minter, user) / 1000;
    net.send(
        user,
        createMessage({ bounce: true, dest: minter.getWalletAddress(
                user,
            ), value: ton("0.4"), body: v2Transfer(
                11,
                tokens,
                curve.getPoolAddress(),
                user,
                beginCell()
                    .storeUint(DEDUST_CPMM_V2_OP_PAY_JETTON, 32)
                    .storeRef(
                        V2Swap {
                            minimalAmountOut: 1,
                            deadline: V2_TIME + 3600,
                        }.toCell(),
                    )
                    .storeRef(buildEmptyExtendedPayoutConfig(user))
                    .endCell(),
            ) }),
    );
    collector.sendCollectPoolFees(user, 12, { value: ton("0.4") });
    val collectedTokens = v2Tokens(minter, collector.address);
    expect(collectedTokens > 0).toEqual(true);
    collector.sendSweepCollectedTokens(user, 13, collectedTokens, { value: ton("0.4") });
    val protocolTokens = splitter.getSplitterData().protocolTokens;
    val creatorTokens = splitter.getFeeBalance(burner.address, false).tokenAmount;
    expect(protocolTokens > 0 && creatorTokens > 0).toEqual(true);
    val supplyBefore = minter.getJettonData().totalSupply;
    burner.sendClaimBuybackFees(user, 14, { value: ton("0.5") });
    expect(minter.getJettonData().totalSupply).toEqual(supplyBefore - creatorTokens);
    burner.sendBurnAvailable(user, 15, { value: ton("0.2") });
    expect(minter.getJettonData().totalSupply).toEqual(supplyBefore - creatorTokens);
    expect(splitter.getSplitterData().protocolTokens).toEqual(protocolTokens);
    expect(splitter.getSplitterData().protocolTon > protocolBefore).toEqual(true);
    expect(burner.getBuybackData().availableTon > 0).toEqual(true);
    burner.sendExecuteBuyback(user, 16, { value: BUYBACK_TRIGGER_GAS });
    expect(minter.getJettonData().totalSupply < supplyBefore - creatorTokens).toEqual(true);
    expect(splitter.getSplitterData().protocolTokens).toEqual(protocolTokens);
}

get fun `test buyback: every supply and nonzero fee preset completes quote swap burn`() {
    val supplies: array<coins> = [100000000000000000, 1000000000000000000, 10000000000000000000];
    val fees: array<uint16> = [10, 50, 100, 200];
    var i = 0;
    repeat (3) {
        var j = 0;
        repeat (4) {
            val (_, minter, burner, user) = launchBuyback(supplies.get(i), fees.get(j));
            burner.sendExecuteBuyback(user, 20, { value: BUYBACK_TRIGGER_GAS });
            val s = burner.getBuybackData();
            expect(s.burned > 0).toEqual(true);
            expect(minter.getJettonData().totalSupply).toEqual(supplies.get(i) - s.burned);
            expect(s.swap == null && s.burnId == 0).toEqual(true);
            j += 1;
        }
        i += 1;
    }
}

get fun `test buyback: a bounced burn is restored once and can be retried`() {
    val (_, minter, burner, user) = launchBuyback();
    val supply = minter.getJettonData().totalSupply;
    val cursor = v2Cursor(
        user,
        burner.address,
        BUYBACK_TRIGGER_GAS,
        ExecuteBuyback { queryId: 30 },
    );
    cursor.executeTill<TransferNotificationForRecipient>({ to: burner.address });
    val pending = burner.getBuybackData();
    expect(pending.burnId > 0).toEqual(true);
    val original = testing.getConfig();
    var expensive = original;
    var prices = expensive.getGasPrices(BASECHAIN);
    var other = prices.other;
    other.gasPrice *= 500;
    prices.other = other;
    expensive.setGasPrices(prices, BASECHAIN);
    testing.setConfig(expensive);
    val failed = cursor.executeTill<AskToBurnTracked>({ to: minter.getWalletAddress(
            burner.address,
        ) });
    expect(failed).toHaveFailedTx<AskToBurnTracked>({ to: minter.getWalletAddress(
            burner.address,
        ), exitCode: 48 });
    testing.setConfig(original);
    cursor.executeAllRemaining();
    cursor.close();
    expect(burner.getBuybackData().availableTokens).toEqual(pending.burnAmount);
    expect(burner.getBuybackData().burnId).toEqual(0);
    expect(minter.getJettonData().totalSupply).toEqual(supply);
    burner.sendBurnFailed(
        minter.getWalletAddress(burner.address),
        pending.burnId,
        pending.burnAmount,
        { value: ton("0.05") },
    );
    expect(burner.getBuybackData().availableTokens).toEqual(pending.burnAmount);
    burner.sendBurnAvailable(user, 31, { value: ton("0.2") });
    expect(minter.getJettonData().totalSupply).toEqual(supply - pending.burnAmount);
    burner.sendBurnDelivered(
        minter.address,
        pending.burnId,
        pending.burnAmount,
        { value: ton("0.05") },
    );
    expect(burner.getBuybackData().burned).toEqual(pending.burnAmount);
}

get fun `test buyback: configuration excludes beneficiaries and zero fee`() {
    val user = testing.treasury("invalid-buyback").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: user, nextAdmin: null, treasury: user, totalLaunches: 0, feesBalance: 0 });
    master.deploy(user, { value: ton("1") });
    var o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 0,
        devBuyAmount: 0,
        minDevTokens: 0,
        buybackBurn: true,
    };
    expect(
        master.sendCreateLaunch(
            user,
            1,
            beginCell().endCell(),
            1,
            o,
            { value: ton("1") },
        ),
    ).toHaveFailedTx<CreateLaunch>({ to: master.address, exitCode: 49 });
    o.creatorFeeBps = 100;
    var shares: map<address, uint16> = [];
    shares.set(user, 10000);
    o.beneficiaries = FeeBeneficiaries { shares }.toCell();
    expect(
        master.sendCreateLaunch(
            user,
            1,
            beginCell().endCell(),
            1,
            o,
            { value: ton("1") },
        ),
    ).toHaveFailedTx<CreateLaunch>({ to: master.address, exitCode: 49 });
}

get fun `test buyback: strangers cannot fabricate fees quotes or burn results`() {
    val (_, _, burner, user) = launchBuyback();
    val stranger = testing.treasury("fake-buyback-receipts").address;
    val before = burner.getBuybackData().availableTon;
    burner.sendReturnExcessesBack(stranger, 0, { value: ton("1") });
    expect(burner.getBuybackData().availableTon).toEqual(before);
    expect(
        burner.sendBurnDelivered(stranger, 1, 100, { value: ton("0.05") }),
    ).toHaveFailedTx<BurnDelivered>({ to: burner.address, exitCode: 73 });
    expect(
        burner.sendBurnFailed(stranger, 1, 100, { value: ton("0.05") }),
    ).toHaveFailedTx<BurnFailed>({ to: burner.address, exitCode: 73 });
    expect(
        burner.sendBuybackRefund(stranger, 1, { value: ton("1") }),
    ).toHaveFailedTx<BuybackRefund>({ to: burner.address, exitCode: 73 });
    expect(
        burner.sendExecuteBuyback(user, 1, { value: BUYBACK_TRIGGER_GAS - 1 }),
    ).toHaveFailedTx<ExecuteBuyback>({ to: burner.address, exitCode: 48 });
    expect(burner.getBuybackData().availableTon).toEqual(before);
}

get fun `test buyback: unsolicited pool refunds fund their own processing`() {
    val (curve, _, burner, user) = launchBuyback();
    repeat (100) {
        net.send(
            user,
            createMessage({ bounce: true, dest: curve.getPoolAddress(), value: ton("0.31"), body: BuybackPayNative {
                    queryId: 999,
                    amount: ton("0.01"),
                    paymentPayload: BuybackSwap {
                        minimalAmountOut: 1000000000000000000,
                        deadline: V2_TIME + 3600,
                    }.toCell(),
                    payoutConfig: BuybackPayoutConfig {
                        fulfill: {
                            destination: user,
                            extraGas: 0,
                            payload: null,
                        },
                        reject: {
                            destination: burner.address,
                            extraGas: 0,
                            payload: BuybackRefund { queryId: 999 }.toCell(),
                        },
                        excessesTo: user,
                    }.toCell(),
                } }),
        );
    }
    burner.sendExecuteBuyback(user, 40, { value: BUYBACK_TRIGGER_GAS });
    expect(burner.getBuybackData().burned > 0).toEqual(true);
    expect(burner.getBuybackData().availableTon).toEqual(0);
}
