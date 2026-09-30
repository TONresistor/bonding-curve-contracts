import "@acton/build"
import "@acton/fmt"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/big_array"
import "@acton/types/message"
import "@acton/types/transaction"
import "@contracts/bonding-config"
import "@contracts/bonding-dedust"
import "@contracts/bonding-messages"
import "@contracts/bonding-storage"
import "@contracts/messages"
import "@wrappers/BondingCurve.gen"
import "@wrappers/BondingCurveMaster.gen"
import "@wrappers/JettonMinter.gen"
import "@wrappers/JettonWallet.gen"
import "@wrappers/utils"
import "dedust"
import "../test-utils"

const MARKET_TIME = 1801267200

// Null-only optional fields use their absent TL-B bit; no partner/referral fees.
struct (0xc442500f) MarketSwap {
    minimalAmountOut: coins
    deadline: uint40
    next: cell? = null
    partnerAbsent: bool = false
    referrerAbsent: bool = false
}

struct (0xa5a7cbf8) MarketPayNative {
    queryId: uint64
    amount: coins
    paymentPayload: cell
    payoutConfig: cell
}

struct Market {
    seed: int
    rng: int
    master: BondingCurveMaster
    curve: BondingCurve
    minter: JettonMinter
    admin: address
    creator: address
    devPayout: address
    pool: address
    actors: array<address>
    expectedTokens: array<coins>
    native: map<address, coins>
    budgets: map<address, coins>
    expectedNative: map<address, coins>
    deliveredNative: map<address, coins>
    protocolDelivered: coins = 0
    protocolClaimCount: int = 0
    knownAdminRetries: int = 0
    txCount: int = 0
    maxActiveChains: int = 0
    buyCount: int = 0
    sellCount: int = 0
    poolSwapCount: int = 0
    rejectionCount: int = 0
    knownExcessRejections: int = 0
    totalGas: int = 0
    totalFees: coins = 0
    scheduleHash: uint256 = 0
    migrationCount: int = 0
    claimCount: int = 0
    unauthorizedClaims: int = 0
    claimedX: coins = 0
    claimedY: coins = 0
    devTonDelivered: coins = 0
    earnedX: coins = 0
    earnedY: coins = 0
}

fun marketBalance(addr: address): coins {
    val account = testing.getAccountState(addr);
    return account == null ? 0 : account.storage.balance.grams;
}

fun Market.remember(mutate self, addr: address) {
    if (!self.native.exists(addr)) {
        self.native.set(addr, marketBalance(addr));
    }
}

fun Market.draw(mutate self, bound: int): int {
    self.rng = (self.rng * 1664525 + 1013904223) % 4294967296;
    return self.rng % bound;
}

fun Market.actorIndex(self, addr: address): int {
    var i = 0;
    while (i < self.actors.size()) {
        if (self.actors.get(i) == addr) {
            return i;
        }
        i += 1;
    }
    throw 1001;
}

fun Market.tokenBalance(self, owner: address): coins {
    val wallet = JettonWallet.fromAddress(self.minter.getWalletAddress(owner));
    return testing.isDeployed(wallet.address) ? wallet.getWalletData().jettonBalance : 0;
}

fun loadMarketLibraries() {
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

fun setupMarket(seed: int, count: int): Market {
    assert (!net.isBroadcasting()) throw 1000;
    assert (seed >= 0 && seed < 4294967296 && count >= 4 && count <= 100) throw 1002;
    testing.setNow(MARKET_TIME);
    testing.setRandomSeed(seed);
    val admin = testing.treasury(format("market-admin-{}", seed)).address;
    val creator = testing.treasury(format("market-creator-{}", seed)).address;
    val devPayout = testing.treasury(format("market-dev-payout-{}", seed)).address;
    val master = BondingCurveMaster.fromStorage({
        admin,
        nextAdmin: null,
        treasury: admin,
        totalLaunches: 0,
        feesBalance: 0,
    });
    expect(
        master.sendDeploy(admin, { value: ton("1") }),
    ).toHaveSuccessfulDeploy({ to: master.address });
    master.sendCreateLaunch(
        creator,
        1,
        buildTestMetadata("ipfs://market-simulation"),
        seed as uint64,
        { value: ton("0.6"), bounce: true },
    );
    val curve = BondingCurve.fromAddress(master.getLaunchAddress(creator, seed as uint64));
    val initial = curve.getCurveData();
    expect(initial.state).toEqual(CURVE_STATE_TRADING);
    val minter = JettonMinter.fromAddress(initial.jettonMinter!);
    expect(minter.getJettonData().totalSupply).toEqual(TOTAL_SUPPLY);
    expect(minter.getJettonData().adminAddress).toEqual(null);
    var market: Market = {
        seed,
        rng: seed,
        master,
        curve,
        minter,
        admin,
        creator,
        devPayout,
        pool: calcDeployedCpmmV2Pool(minter.address, creator).calculateAddress(),
        actors: [],
        expectedTokens: [],
        native: [],
        budgets: [],
        expectedNative: [],
        deliveredNative: [],
    };
    var i = 0;
    while (i < count) {
        val actor = testing.treasury(format("market-{}-{}", seed, i)).address;
        market.actors.push(actor);
        market.expectedTokens.push(0);
        market.expectedNative.set(actor, 0);
        market.deliveredNative.set(actor, 0);
        market.remember(actor);
        market.budgets.set(actor, i == 0 ? ton("5000") : ton("100"));
        market.remember(minter.getWalletAddress(actor));
        i += 1;
    }
    market.budgets.set(admin, ton("100"));
    market.budgets.set(creator, ton("100"));
    market.remember(admin);
    market.remember(creator);
    market.remember(devPayout);
    market.remember(master.address);
    market.remember(curve.address);
    market.remember(minter.address);
    market.remember(minter.getWalletAddress(curve.address));
    println("START seed={} actors={} time={}", seed, count, MARKET_TIME);
    return market;
}

// The reference calculation does not call the contract's quote/math helpers.
fun Market.checkCurveStep(
    mutate self,
    before: BondingCurveDataReply,
    tx: TlbTransaction,
    success: bool,
    opcode: int,
    sender: address,
    value: coins,
) {
    var predicted = before;
    if (opcode == 0xa0a0a011) {
        val msg = tx.loadBody<BuyJettons>();
        if (before.state != CURVE_STATE_TRADING) {
            expect(success).toEqual(false);
            return;
        }
        if (value < ton("0.06")) {
            expect(success).toEqual(false);
            return;
        }
        val input = value - CURVE_TRANSFER_VALUE;
        val fee = input / 100;
        val netIn = input - fee;
        val remaining = (before.virtualTonReserve + before.realTonReserve) *
            before.curveJettonBalance /
            (before.virtualTonReserve + before.realTonReserve + netIn);
        val output = before.curveJettonBalance - remaining;
        val allowed = output > 0 && output >= msg.minJettonsOut && remaining >= DEX_RESERVE_SUPPLY;
        expect(success).toEqual(allowed);
        if (allowed) {
            predicted.realTonReserve += netIn;
            predicted.curveJettonBalance = remaining;
            val cut = min(fee / 10, MIGRATION_RESERVE_TARGET - before.migrationReserve);
            predicted.migrationReserve += cut;
            predicted.feeAccrued += fee - cut;
            if (predicted.realTonReserve >= GRADUATION_THRESHOLD_TON) {
                predicted.state = CURVE_STATE_FROZEN;
            }
            val index = self.actorIndex(sender);
            self.expectedTokens.set(self.expectedTokens.get(index) + output, index);
            self.buyCount += 1;
        }
    } else if (opcode == 0x7362d09c && sender == self.minter.getWalletAddress(self.curve.address)) {
        expect(success).toEqual(true);
        val msg = tx.loadBody<TransferNotificationForRecipient>();
        if (before.state == CURVE_STATE_TRADING && msg.transferInitiator != null) {
            val safe = max(
                0,
                (before.virtualTonReserve + before.realTonReserve) * before.curveJettonBalance /
                    (before.virtualTonReserve + 1) -
                    before.curveJettonBalance,
            );
            val accepted = min(msg.jettonAmount, safe);
            var payload = msg.forwardPayload;
            expect(payload.loadUint(1)).toEqual(1);
            val minOut = SellPayload.fromCell(payload.loadRef()).minTonOut;
            if (accepted > 0) {
                val x = before.virtualTonReserve + before.realTonReserve;
                val y = before.curveJettonBalance + accepted;
                val gross = x - x * before.curveJettonBalance / y;
                val fee = x * accepted / (y * 100);
                val output = gross - fee;
                if (output >= minOut && output > 0 && gross <= before.realTonReserve) {
                    predicted.realTonReserve -= gross;
                    predicted.curveJettonBalance += accepted;
                    val cut = min(fee / 10, MIGRATION_RESERVE_TARGET - before.migrationReserve);
                    predicted.migrationReserve += cut;
                    predicted.feeAccrued += fee - cut;
                    val index = self.actorIndex(msg.transferInitiator!);
                    self.expectedTokens.set(self.expectedTokens.get(index) - accepted, index);
                    val seller = msg.transferInitiator!;
                    self
                        .expectedNative
                        .set(seller, self.expectedNative.get(seller).loadValue() + output);
                    self.sellCount += 1;
                }
            }
        }
    } else {
        return;
    }
    val after = self.curve.getCurveData();
    expect(after.realTonReserve).toEqual(predicted.realTonReserve);
    expect(after.curveJettonBalance).toEqual(predicted.curveJettonBalance);
    expect(after.feeAccrued).toEqual(predicted.feeAccrued);
    expect(after.migrationReserve).toEqual(predicted.migrationReserve);
    expect(after.state).toEqual(predicted.state);
}

// One transaction per cursor step: no completed trace is mistaken for concurrency.
fun Market.step(mutate self, cursor: TxCursor, allowOversell: bool = false) {
    val before = self.curve.getCurveData();
    var beforePool: SimulationPoolData? = null;
    if (before.state == CURVE_STATE_MIGRATED) {
        beforePool = net.runGetMethod<SimulationPoolData>(self.pool, "get_pool_data");
    }
    val segment = cursor.executeN(1);
    expect(segment.size()).toEqual(1);
    val result = segment.at(0);
    val tx = result.tx.load();
    val dest = tx.getAccountAddress();
    val incoming = tx.loadInMsg<RemainingBitsAndRefs>();
    val body = incoming.loadBody();
    val opcode = body.remainingBitsCount() >= 32 ? body.preloadUint(32) : -1;
    var inValue: coins = 0;
    var sender = self.admin;
    var bounced = false;
    if (incoming.info is TlbInternalMessage) {
        inValue = incoming.info.value.grams;
        sender = incoming.info.src;
        bounced = incoming.info.bounced;
    }
    val descr = tx.description.load();
    assert (descr is TlbTransOrd) throw 1003;
    var exitCode = -1;
    if (descr.computePh is TlbTrComputeVm) {
        exitCode = descr.computePh.data.load().exitCode;
    }
    val success = !descr.aborted;
    self.txCount += 1;
    self.totalGas += result.gasUsed;
    self.totalFees += tx.totalFees.grams;
    // Commit to logical execution, excluding nondeterministic raw TVM metadata.
    val economics = self.curve.getCurveData();
    self.scheduleHash = beginCell()
        .storeUint(self.scheduleHash, 256)
        .storeRef(
            beginCell()
                .storeAddress(sender)
                .storeAddress(dest)
                .storeInt(opcode, 64)
                .storeCoins(inValue)
                .storeInt(exitCode, 32)
                .endCell(),
        )
        .storeRef(
            beginCell()
                .storeCoins(tx.totalFees.grams)
                .storeUint(result.gasUsed, 64)
                .storeUint(economics.state, 8)
                .storeCoins(economics.realTonReserve)
                .storeCoins(economics.curveJettonBalance)
                .storeCoins(economics.feeAccrued)
                .storeCoins(economics.migrationReserve)
                .endCell(),
        )
        .endCell()
        .hash();
    println(
        "STEP {} {} {} {} {}",
        self.seed,
        self.txCount,
        opcode,
        dest,
        exitCode,
    );

    // Exact native accounting at the receiving account, including forward fees
    // still carried by its outbound messages. Track new destinations before execution.
    expect(self.native.exists(dest)).toEqual(true);
    var outgoingValue: coins = 0;
    var i = 0;
    while (i < result.outMessages.size()) {
        val rawOut = result.outMessages.atCell(i);
        if (rawOut.beginParse().preloadUint(1) == 0) {
            val out = TlbMessageRelaxed<RemainingBitsAndRefs>.fromCell(rawOut);
            outgoingValue += out.info.value.grams + out.info.fwdFee;
            self.remember(out.info.dest);
        }
        i += 1;
    }
    val actual = marketBalance(dest);
    val expected = self.native.get(dest).loadValue() + inValue - tx.totalFees.grams - outgoingValue;
    expect(actual).toEqual(expected);
    self.native.set(dest, actual);
    if (self.budgets.exists(dest)) {
        self
            .budgets
            .set(
                dest,
                self.budgets.get(dest).loadValue() + inValue - tx.totalFees.grams - outgoingValue,
            );
    }
    if (dest == self.devPayout && sender == self.pool && !bounced) {
        self.devTonDelivered += inValue;
    }
    if (
        self.deliveredNative.exists(dest) && !bounced &&
        ((sender == self.curve.address && opcode == 0xd53276db) ||
            (sender == self.pool && opcode == 0x3216ca09))
    ) {
        self.deliveredNative.set(dest, self.deliveredNative.get(dest).loadValue() + inValue);
    }
    if (dest == self.admin && sender == self.master.address && opcode == 0xa0a0a015 && !bounced) {
        self.protocolDelivered += inValue;
    }

    if (!success) {
        val excess = dest == self.curve.address && opcode == 0xd53276db && exitCode == 65535;
        val invalidBuy = dest == self.curve.address && opcode == 0xa0a0a011 &&
            (exitCode == 48 || exitCode == 49 || exitCode == 72 || exitCode == 47);
        val oversell = allowOversell && opcode == 0x0f8a7ea5 && exitCode == 47;
        val badClaim = dest == self.pool && opcode == 0xbe3e3179 && sender != self.creator &&
            exitCode == 23;
        val adminRetry = dest == self.minter.address && sender == self.curve.address &&
            opcode == 0x7431f221 &&
            exitCode == 7 &&
            self.minter.getJettonData().adminAddress == null;
        if (!(excess || invalidBuy || oversell || badClaim || adminRetry)) {
            println(segment);
            throw 1004;
        }
        self.rejectionCount += 1;
        if (excess) {
            self.knownExcessRejections += 1;
        }
        if (adminRetry) {
            self.knownAdminRetries += 1;
        }
        if (badClaim) {
            self.unauthorizedClaims += 1;
        }
    }
    if (dest == self.curve.address && !bounced) {
        self.checkCurveStep(
            before,
            tx,
            success,
            opcode,
            sender,
            inValue,
        );
        if (opcode == 0xce185bd7 && success && before.state == CURVE_STATE_GRADUATING) {
            self.migrationCount += 1;
        }
    }
    if (dest == self.pool && beforePool != null && !bounced) {
        val after = net.runGetMethod<SimulationPoolData>(self.pool, "get_pool_data");
        if (opcode == 0xbe3e3179) {
            if (sender == self.creator) {
                expect(success).toEqual(true);
                expect(after.creatorFeeX).toEqual(0);
                expect(after.creatorFeeY).toEqual(0);
                self.claimedX += beforePool.creatorFeeX;
                self.claimedY += beforePool.creatorFeeY;
                self.claimCount += 1;
            } else {
                expect(success).toEqual(false);
                expect(after.creatorFeeX).toEqual(beforePool.creatorFeeX);
                expect(after.creatorFeeY).toEqual(beforePool.creatorFeeY);
            }
            expect(after.reserveX).toEqual(beforePool.reserveX);
            expect(after.reserveY).toEqual(beforePool.reserveY);
            expect(after.liquidity).toEqual(beforePool.liquidity);
        } else {
            self.checkPoolSwap(beforePool, after, tx, opcode, sender);
            expect(after.creatorFeeX >= beforePool.creatorFeeX).toEqual(true);
            expect(after.creatorFeeY >= beforePool.creatorFeeY).toEqual(true);
            self.earnedX += after.creatorFeeX - beforePool.creatorFeeX;
            self.earnedY += after.creatorFeeY - beforePool.creatorFeeY;
        }
    }
}

// CPMM v2 fees are inclusive: net = input * 10000 / (10000 + baseFeeBPS).
// The pinned library takes a 20% protocol share; creatorFeeBPS is a share of
// the remaining base fee, not an additional percentage of swap notional.
fun Market.checkPoolSwap(
    mutate self,
    before: SimulationPoolData,
    after: SimulationPoolData,
    tx: TlbTransaction,
    opcode: int,
    sender: address,
) {
    var input: coins = 0;
    var trader = sender;
    var xToY = false;
    var payload: cell? = null;
    if (opcode == 0xa5a7cbf8) {
        val pay = tx.loadBody<MarketPayNative>();
        input = pay.amount;
        payload = pay.paymentPayload;
        xToY = true;
    } else if (opcode == 0x7362d09c) {
        val msg = tx.loadBody<TransferNotificationForRecipient>();
        input = msg.jettonAmount;
        trader = msg.transferInitiator!;
        var forwarded = msg.forwardPayload;
        expect(forwarded.loadUint(1)).toEqual(1);
        var pay = forwarded.loadRef().beginParse();
        expect(pay.loadUint(32)).toEqual(DEDUST_CPMM_V2_OP_PAY_JETTON);
        payload = pay.loadRef();
    }
    if (payload == null || payload.beginParse().preloadUint(32) != 0xc442500f) {
        return;
    }
    val netInput = input * 10000 / (10000 + before.baseFeeBPS);
    val fee = input - netInput;
    val protocol = fee * 2000 / 10000;
    val creator = (fee - protocol) * DEDUST_POOL_CREATOR_FEE_BPS / 10000;
    val index = self.actorIndex(trader);
    var expectedHeld = self.expectedTokens.get(index);
    if (xToY) {
        val output = before.reserveY * netInput / (before.reserveX + netInput);
        expect(after.reserveX).toEqual(before.reserveX + netInput);
        expect(after.reserveY).toEqual(before.reserveY - output);
        expect(after.protocolFeeX - before.protocolFeeX).toEqual(protocol);
        expect(after.creatorFeeX - before.creatorFeeX).toEqual(creator);
        expectedHeld += output;
    } else {
        val output = before.reserveX * netInput / (before.reserveY + netInput);
        expect(after.reserveY).toEqual(before.reserveY + netInput);
        expect(after.reserveX).toEqual(before.reserveX - output);
        expect(after.protocolFeeY - before.protocolFeeY).toEqual(protocol);
        expect(after.creatorFeeY - before.creatorFeeY).toEqual(creator);
        expectedHeld -= input;
        self.expectedNative.set(trader, self.expectedNative.get(trader).loadValue() + output);
    }
    expect(after.liquidity).toEqual(before.liquidity);
    self.expectedTokens.set(expectedHeld, index);
    self.poolSwapCount += 1;
}

fun Market.start(mutate self, sender: address, dest: address, value: coins, body: cell): TxCursor {
    // Acton injects root messages without a signed-wallet debit. Maintain a
    // finite spending ledger explicitly; receiving transactions credit it above.
    if (self.budgets.exists(sender)) {
        val remaining = self.budgets.get(sender).loadValue();
        expect(remaining >= value).toEqual(true);
        self.budgets.set(sender, remaining - value);
    }
    println(
        "ORDER seed={} from={} to={} value={} body={:x}",
        self.seed,
        sender,
        dest,
        value,
        body.hash(),
    );
    self.remember(sender);
    self.remember(dest);
    return testing.createTraceIterationCursor(
        sender,
        createMessage({ bounce: true, value, dest, body }),
    );
}

fun Market.drain(mutate self, cursors: array<TxCursor>, allowOversell: bool = false) {
    self.maxActiveChains = max(self.maxActiveChains, cursors.size());
    var remaining = cursors.size();
    var steps = 0;
    while (remaining > 0) {
        val index = self.draw(cursors.size());
        val cursor = cursors.get(index);
        if (!cursor.isDone()) {
            self.step(cursor, allowOversell);
            if (cursor.isDone()) {
                remaining -= 1;
            }
        }
        steps += 1;
        assert (steps < 10000) throw 1005;
    }
    var i = 0;
    while (i < cursors.size()) {
        cursors.get(i).close();
        i += 1;
    }
}

fun Market.buy(mutate self, index: int, value: coins, minimum: coins = 0): TxCursor {
    return self.start(
        self.actors.get(index),
        self.curve.address,
        value,
        BuyJettons {
            queryId: self.txCount as uint64,
            minJettonsOut: minimum,
        }.toCell(),
    );
}

fun Market.sell(mutate self, index: int, amount: coins, minimum: coins = 0): TxCursor {
    val sender = self.actors.get(index);
    val payload = SellPayload {
        queryId: self.txCount as uint64,
        minTonOut: minimum,
    }.toCell();
    return self.start(
        sender,
        self.minter.getWalletAddress(sender),
        ton("0.3"),
        AskToTransfer {
            queryId: self.txCount as uint64,
            jettonAmount: amount,
            transferRecipient: self.curve.address,
            sendExcessesTo: sender,
            customPayload: null,
            forwardTonAmount: ton("0.1"),
            forwardPayload: beginCell().storeUint(1, 1).storeRef(payload).toSlice(),
        }.toCell(),
    );
}

fun Market.settled(self, checkTraderLedger: bool = true) {
    var sum = self.tokenBalance(self.curve.address) + self.tokenBalance(self.pool) +
        self.tokenBalance(self.devPayout);
    var i = 0;
    while (i < self.actors.size()) {
        val held = self.tokenBalance(self.actors.get(i));
        sum += held;
        if (checkTraderLedger) {
            expect(held).toEqual(self.expectedTokens.get(i));
        }
        val actor = self.actors.get(i);
        expect(self.deliveredNative.get(actor).loadValue()).toEqual(
            self.expectedNative.get(actor).loadValue(),
        );
        i += 1;
    }
    expect(sum).toEqual(TOTAL_SUPPLY);
    expect(self.minter.getJettonData().totalSupply).toEqual(TOTAL_SUPPLY);
    expect(self.minter.getJettonData().adminAddress).toEqual(null);
    val curve = self.curve.getCurveData();
    expect(self.tokenBalance(self.curve.address)).toEqual(curve.curveJettonBalance);
    expect(
        marketBalance(self.curve.address) >=
            curve.realTonReserve + curve.feeAccrued + curve.migrationReserve,
    ).toEqual(true);
}

fun Market.tradeCampaign(mutate self, operations: int) {
    var i = 0;
    while (i < self.actors.size()) {
        val queued = [self.buy(i, ton("10"))];
        self.drain(queued);
        i += 1;
    }
    self.settled();
    // Two buyers submit the same current quote; only the first price remains valid.
    val staleQuote = self.curve.getQuoteBuy(ton("10") - CURVE_TRANSFER_VALUE);
    val buysBefore = self.buyCount;
    val staleBatch = [self.buy(0, ton("10"), staleQuote), self.buy(1, ton("10"), staleQuote)];
    self.drain(staleBatch);
    expect(self.buyCount).toEqual(buysBefore + 1);
    self.settled();
    i = 0;
    while (i < operations) {
        var batch: array<TxCursor> = [];
        val offset = self.draw(self.actors.size());
        var j = 0;
        while (j < min(self.actors.size(), min(5, operations - i))) {
            val actor = (offset + j) % self.actors.size();
            val held = self.tokenBalance(self.actors.get(actor));
            val choice = self.draw(100);
            if (choice < 48 && held > 0) {
                val amount = max(1, held * (1 + self.draw(30)) / 100);
                val minOut = choice < 5 ? ton("10000") : 0 as coins;
                batch.push(self.sell(actor, amount, minOut));
            } else {
                val value = choice == 99 ? ton("0.01") : ton("0.06") + self.draw(5000000000);
                val minOut = choice == 98 ? TOTAL_SUPPLY : 0 as coins;
                batch.push(self.buy(actor, value, minOut));
            }
            j += 1;
        }
        self.drain(batch);
        self.settled();
        expect(self.curve.getState()).toEqual(CURVE_STATE_TRADING);
        i += j;
        println(
            "BATCH seed={} operations={} buys={} sells={}",
            self.seed,
            i,
            self.buyCount,
            self.sellCount,
        );
    }
    // Two pending sales of 75% of one wallet: only one can spend those tokens.
    val held = self.tokenBalance(self.actors.get(0));
    val first = self.sell(0, held * 3 / 4);
    val second = self.sell(0, held * 3 / 4);
    self.drain([first, second], true);
    self.settled();
}

fun Market.protocolClaims(mutate self) {
    var round = 0;
    while (round < 3) {
        val buy = self.buy(round, ton("2"));
        self.drain([buy]);
        val curve = self.curve.getCurveData();
        val previousMasterFees = self.master.getMasterData().feesBalance;
        val surplus = max(
            0,
            marketBalance(self.curve.address) - curve.realTonReserve - curve.feeAccrued -
                curve.migrationReserve -
                CURVE_STORAGE_RESERVE,
        );
        val expectedCredit = curve.feeAccrued + surplus;
        val flush = self.start(
            self.admin,
            self.curve.address,
            ton("0.2"),
            FlushFees { queryId: (700 + round) as uint64 }.toCell(),
        );
        self.drain([flush]);
        expect(self.curve.getCurveData().feeAccrued).toEqual(0);
        val amount = self.master.getMasterData().feesBalance;
        expect(amount).toEqual(previousMasterFees + expectedCredit);
        val delivered = self.protocolDelivered;
        val withdraw = self.start(
            self.admin,
            self.master.address,
            ton("0.1"),
            WithdrawProtocolFees {
                queryId: (800 + round) as uint64,
                amount,
            }.toCell(),
        );
        self.drain([withdraw]);
        expect(self.master.getMasterData().feesBalance).toEqual(0);
        expect(self.protocolDelivered - delivered).toEqual(amount);
        self.protocolClaimCount += 1;
        self.settled();
        round += 1;
    }
}

fun Market.migrate(mutate self) {
    val data = self.curve.getCurveData();
    val required = (GRADUATION_THRESHOLD_TON - data.realTonReserve) * 100 / 99 + ton("0.1");
    val crossing = self.buy(0, required);
    // Stop after the threshold-crossing transaction, while its descendants are pending.
    while (self.curve.getState() == CURVE_STATE_TRADING) {
        self.step(crossing);
    }
    expect(self.curve.getState()).toEqual(CURVE_STATE_FROZEN);
    val frozen = self.curve.getCurveData();
    val expectedTon = frozen.realTonReserve - MIGRATION_FEE;
    val expectedTokens = expectedTon * frozen.curveJettonBalance /
        (frozen.virtualTonReserve + frozen.realTonReserve);
    val feesBefore = self.master.getMasterData().feesBalance;
    val pendingSell = self.sell(1, self.tokenBalance(self.actors.get(1)) / 10);
    val pendingBuy = self.buy(2, ton("1"));
    self.drain([crossing, pendingSell, pendingBuy]);
    expect(self.curve.getState()).toEqual(CURVE_STATE_MIGRATED);
    expect(self.migrationCount).toEqual(1);
    expect(self.master.getMasterData().feesBalance).toEqual(feesBefore + MIGRATION_FEE);
    val pool = net.runGetMethod<SimulationPoolData>(self.pool, "get_pool_data");
    expect(pool.status).toEqual(2);
    expect(pool.reserveX).toEqual(expectedTon);
    expect(pool.reserveY).toEqual(expectedTokens);
    self.checkLocked();
    self.settled();
    // Duplicate successful callback must not seed or charge migration twice.
    val duplicate = self.start(
        self.pool,
        self.curve.address,
        ton("0.01"),
        InitPoolResultMessage {
            queryId: 999,
            exitCode: 0,
            customPayload: null,
        }.toCell(),
    );
    self.drain([duplicate]);
    expect(self.master.getMasterData().feesBalance).toEqual(feesBefore + MIGRATION_FEE);
    expect(net.runGetMethod<SimulationPoolData>(self.pool, "get_pool_data").reserveX).toEqual(
        expectedTon,
    );
}

fun Market.checkLocked(self) {
    val pool = net.runGetMethod<SimulationPoolData>(self.pool, "get_pool_data");
    val addr = net.runGetMethod<address>(self.pool, "get_position_address", [self.curve.address]);
    val position = net.runGetMethod<SimulationPositionData>(addr, "get_position_data");
    expect(position.liquidity).toEqual(pool.liquidity);
    expect(position.lockedLiquidity).toEqual(position.liquidity);
    expect(position.liquidity > 0).toEqual(true);
}

fun Market.poolBuy(mutate self, index: int, amount: coins): TxCursor {
    val actor = self.actors.get(index);
    return self.start(
        actor,
        self.pool,
        amount + ton("0.3"),
        MarketPayNative {
            queryId: self.txCount as uint64,
            amount,
            paymentPayload: MarketSwap {
                minimalAmountOut: 1,
                deadline: MARKET_TIME + 3600,
            }.toCell(),
            payoutConfig: buildEmptyExtendedPayoutConfig(actor),
        }.toCell(),
    );
}

fun Market.poolSell(mutate self, index: int, amount: coins): TxCursor {
    val actor = self.actors.get(index);
    val pay = beginCell()
        .storeUint(DEDUST_CPMM_V2_OP_PAY_JETTON, 32)
        .storeRef(
            MarketSwap {
                minimalAmountOut: 1,
                deadline: MARKET_TIME + 3600,
            }.toCell(),
        )
        .storeRef(buildEmptyExtendedPayoutConfig(actor))
        .endCell();
    return self.start(
        actor,
        self.minter.getWalletAddress(actor),
        ton("0.5"),
        AskToTransfer {
            queryId: self.txCount as uint64,
            jettonAmount: amount,
            transferRecipient: self.pool,
            sendExcessesTo: actor,
            customPayload: null,
            forwardTonAmount: ton("0.3"),
            forwardPayload: beginCell().storeUint(1, 1).storeRef(pay).toSlice(),
        }.toCell(),
    );
}

fun Market.claim(mutate self, sender: address): TxCursor {
    return self.start(
        sender,
        self.pool,
        ton("0.3"),
        DedustClaimCreatorFees {
            queryId: self.txCount as uint64,
            to: self.devPayout,
            excessesTo: self.creator,
        }.toCell(),
    );
}

fun Market.claimsAndSwaps(mutate self) {
    // Claim before any swap; then repeated and overlapping claims as fees accrue.
    val queued = [self.claim(self.creator)];
    self.drain(queued);
    var round = 0;
    while (round < 6) {
        val buyActor = round % self.actors.size();
        val sellActor = (round + 1) % self.actors.size();
        val buy = self.poolBuy(buyActor, ton("5") + round * ton("1"));
        val sell = self.poolSell(sellActor, self.tokenBalance(self.actors.get(sellActor)) / 100);
        val claimA = self.claim(self.creator);
        val claimB = self.claim(self.creator);
        self.drain([buy, sell, claimA, claimB]);
        val queued = [self.claim(self.creator)];
        self.drain(queued);
        val pool = net.runGetMethod<SimulationPoolData>(self.pool, "get_pool_data");
        expect(pool.creatorFeeX).toEqual(0);
        expect(pool.creatorFeeY).toEqual(0);
        expect(self.tokenBalance(self.devPayout)).toEqual(self.claimedY);
        expect(self.devTonDelivered).toEqual(self.claimedX);
        self.settled();
        self.checkLocked();
        round += 1;
    }
    val lastSwap = self.poolBuy(0, ton("3"));
    self.drain([lastSwap]);
    val pending = net.runGetMethod<SimulationPoolData>(self.pool, "get_pool_data");
    expect(pending.creatorFeeX > 0).toEqual(true);
    val attackerClaim = self.claim(self.actors.get(0));
    self.drain([attackerClaim]);
    expect(self.unauthorizedClaims).toEqual(1);
    val lastClaims = [self.claim(self.creator), self.claim(self.creator)];
    self.drain(lastClaims);
    expect(self.claimedX).toEqual(self.earnedX);
    expect(self.claimedY).toEqual(self.earnedY);
    expect(self.claimedX > 0 && self.claimedY > 0).toEqual(true);
    expect(self.poolSwapCount).toEqual(13);
    expect(self.claimCount).toEqual(21);
    expect(self.devTonDelivered).toEqual(self.claimedX);
    expect(self.tokenBalance(self.devPayout)).toEqual(self.claimedY);
    self.settled();
    self.checkLocked();
}

fun runMarket(seed: int, operations: int, actors: int, withMigration: bool) {
    if (withMigration) {
        loadMarketLibraries();
    }
    var market = setupMarket(seed, actors);
    try {
        market.tradeCampaign(operations);
        if (withMigration) {
            market.protocolClaims();
            market.migrate();
            market.claimsAndSwaps();
        }
        println("METRIC seed {}", seed);
        println("METRIC operations {}", operations);
        println("METRIC actors {}", actors);
        println("METRIC transactions {}", market.txCount);
        println("METRIC max_active_chains {}", market.maxActiveChains);
        println("METRIC buys {}", market.buyCount);
        println("METRIC sells {}", market.sellCount);
        println("METRIC pool_swaps {}", market.poolSwapCount);
        println("METRIC rejections {}", market.rejectionCount);
        println("METRIC known_excess_rejections {}", market.knownExcessRejections);
        println("METRIC migrations {}", market.migrationCount);
        println("METRIC claims {}", market.claimCount);
        println("METRIC protocol_claims {}", market.protocolClaimCount);
        println("METRIC known_admin_retries {}", market.knownAdminRetries);
        println("METRIC unauthorized_claims {}", market.unauthorizedClaims);
        println("METRIC creator_ton_nanounits {}", market.claimedX);
        println("METRIC creator_jetton_nanounits {}", market.claimedY);
        println("METRIC gas {}", market.totalGas);
        println("METRIC transaction_fees_nanounits {}", market.totalFees);
        println("METRIC schedule_hash {:x}", market.scheduleHash);
        println("MARKET_PASS");
    } catch (error) {
        println("MARKET_FAIL seed={} error={}", seed, error);
        testing.saveSnapshot(format("build/market-simulation/failure-{}.json", seed));
        throw error;
    }
}
