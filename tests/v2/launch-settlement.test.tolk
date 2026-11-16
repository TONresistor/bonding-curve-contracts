import "@acton/io"
import "@acton/emulation/config"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/big_array"
import "@acton/types/message"
import "@acton/types/transaction"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@contracts/v1/bonding-config"
import "@contracts/v1/fees-management"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/fee-storage"
import "@contracts/v2/launch-fees"
import "@contracts/v2/wallet-messages"
import "activation.test"
import "migration"

fun settlementMaster(): (BondingCurveMasterV2, address, address) {
    val admin = testing.treasury("settlement-protocol").address;
    val creator = testing.treasury("settlement-creator").address;
    val attacker = testing.treasury("settlement-attacker").address;
    val master = BondingCurveMasterV2.fromStorage({ admin, nextAdmin: null, treasury: admin, totalLaunches: 0, feesBalance: 0 });
    master.deploy(admin, { value: ton("2") });
    return (master, creator, attacker);
}

fun settlementRequest(dev: coins = 0, threshold: coins = ton("2000")): CreateLaunch {
    return {
        queryId: 491,
        metadata: beginCell()
            .storeUint(1, 8)
            .storeString("https://example.com/launch.json")
            .endCell(),
        salt: 49,
        options: LaunchOptions {
            supply: 1000000000000000000,
            creatorFeeBps: 100,
            devBuyAmount: dev,
            minDevTokens: 0,
            graduationThreshold: threshold,
        }.toCell(),
    };
}

fun settlementCursor(
    master: BondingCurveMasterV2,
    creator: address,
    request: CreateLaunch,
    value: coins,
): TxCursor {
    return testing.createTraceIterationCursor(
        creator,
        createMessage({ bounce: true, dest: master.address, value, body: request }),
    );
}

fun settlementRefunds(trace: SendResultList, curve: address, creator: address): (int, coins) {
    var count = 0;
    var amount: coins = 0;
    var i = 0;
    while (i < trace.size()) {
        val tx = trace.at(i).tx.load();
        val msg = tx.loadInMsg<RemainingBitsAndRefs>();
        val body = msg.loadBody();
        if (
            msg.info is TlbInternalMessage && msg.info.src == curve && msg.info.dest == creator &&
            body.remainingBitsCount() >= 32 &&
            body.preloadUint(32) == 0xd53276db
        ) {
            count += 1;
            amount += msg.info.value.grams;
        }
        i += 1;
    }
    return (count, amount);
}

fun settlementGas(trace: SendResultList, enforceBounds: bool = true) {
    var i = 0;
    var boundsOK = true;
    while (i < trace.size()) {
        val item = trace.at(i);
        val tx = item.tx.load();
        val msg = tx.loadInMsg<RemainingBitsAndRefs>();
        val body = msg.loadBody();
        if (body.remainingBitsCount() >= 32) {
            val op = body.preloadUint(32);
            println("LAUNCH_GAS op={} gas={}", op, item.gasUsed);
            val bound = op == 0xa0a0b001
                ? LAUNCH_MASTER_CREATE_GAS
                : op == 0xa0a0a010
                    ? LAUNCH_CURVE_INIT_GAS
                    : op == 0xa0a0b080
                        ? LAUNCH_MINTER_MINT_GAS
                        : op == 0xa0a0b081
                            ? LAUNCH_WALLET_MINT_GAS
                            : op == 0xa0a0b050
                                ? LAUNCH_CURVE_RECEIPT_GAS
                                : op == 0xa0a0b033
                                    ? LAUNCH_MASTER_CONFIRM_GAS
                                    : op == 0x7431f221
                                        ? LAUNCH_MINTER_DROP_GAS
                                        : op == 0xa0a0b05b || op == 0xa0a0b082
                                            ? LAUNCH_CURVE_SERVICE_GAS
                                            : op == 0xa0a0b083
                                                ? max(LAUNCH_RECOVERY_GAS, LAUNCH_CURVE_SERVICE_GAS)
                                                : op == 0xa0a0b085
                                                    ? LAUNCH_PROBE_GAS
                                                    : op == 0xa0a0b086
                                                        ? LAUNCH_PROBE_RECEIPT_GAS
                                                        : op == 0xa0a0b084
                                                            ? LAUNCH_CURVE_FINALIZE_GAS
                                                            : 0;
            if (bound > 0 && enforceBounds) {
                boundsOK = boundsOK && bound >= (item.gasUsed * 125 + 9999) / 10000 * 100;
            }
        }
        i += 1;
    }
    if (enforceBounds) {
        expect(boundsOK).toEqual(true);
    }
}

fun successfulSettlement(dev: coins, extra: coins, threshold: coins = ton("2000")) {
    val (master, creator, attacker) = settlementMaster();
    val request = settlementRequest(dev, threshold);
    val options = request.options.load();
    val quote = master.getCreateLaunchQuote(creator, request);
    println(
        "LAUNCH_QUOTE dev={} minimum={} execution={}",
        dev,
        quote.minimumCreateValue,
        quote.executionBudget,
    );
    expect(quote.protocolFee).toEqual(ton("0.2"));
    expect(quote.minimumCreateValue).toEqual(
        quote.protocolFee + quote.migrationPrefund + quote.operatingReserves +
            quote.executionBudget +
            dev,
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(creator, request.salt, options));
    val masterBalance = testing.getAccountBalance(master.address);
    val cursor = settlementCursor(master, creator, request, quote.minimumCreateValue + extra);
    val trace = cursor.executeAllRemaining();
    cursor.close();
    settlementGas(trace);
    expect(trace).toHaveAllSuccessfulTxs();
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    expect(curve.getLaunchSettlement().settlement!.phase).toEqual(LaunchSettlementPhase.Complete);
    val (count, returned) = settlementRefunds(trace, curve.address, creator);
    expect(count).toEqual(1);
    println(
        "LAUNCH_SETTLED sent={} returned={} net_cost={}",
        quote.minimumCreateValue + extra,
        returned,
        quote.minimumCreateValue + extra - returned,
    );
    expect(returned > extra).toEqual(true);
    expect(quote.minimumCreateValue < dev + ton("1") + quote.migrationPrefund).toEqual(true);
    expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
    expect(testing.getAccountBalance(master.address)).toBeGreaterOrEqual(
        masterBalance + ton("0.2"),
    );
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    val deployment = trace.findTransaction<TopUpTons>({ to: minter.address })!;
    expect(
        LAUNCH_MINTER_DEPLOY_GAS >= (deployment.getUsedGas() * 125 + 9999) / 10000 * 100,
    ).toEqual(true);
    expect(minter.getJettonData().adminAddress == null).toEqual(true);
    expect(minter.getJettonData().totalSupply).toEqual(options.supply);
    expect(testing.getAccountBalance(minter.address)).toBeGreaterOrEqual(
        testing.getAccountStorageFee(minter.address, MIN_STORAGE_DURATION)!,
    );
    val data = curve.getCurveData();
    val protected = data.realTonReserve + data.feeAccrued + data.migrationReserve +
        curve.getLaunchProgress().creatorAccrued +
        CURVE_STORAGE_RESERVE;
    expect(testing.getAccountBalance(curve.address)).toBeGreaterOrEqual(protected);
    expect(testing.getAccountBalance(curve.address) - protected < ton("0.001")).toEqual(true);
    val balance = testing.getAccountBalance(creator);
    val duplicate = curve.sendRetryLaunchSettlement(attacker, 800, { value: ton("0.1") });
    val (duplicateCount, _) = settlementRefunds(duplicate, curve.address, creator);
    expect(duplicateCount).toEqual(0);
    expect(testing.getAccountBalance(creator)).toEqual(balance);
}

get fun `test launch settlement: exact quote refunds unused TON once`() {
    successfulSettlement(0, 0);
}

get fun `test launch settlement: five TON overpayment is refunded instead of protocol fees`() {
    successfulSettlement(0, ton("5"));
}

get fun `test launch settlement: dev principal fees and reserves remain funded`() {
    successfulSettlement(ton("100"), 0);
}

get fun `test launch settlement: low migration threshold retains its prefund`() {
    successfulSettlement(0, 0, ton("500"));
}

get fun `test launch settlement: below quote rejects before any deployment`() {
    val (master, creator, _) = settlementMaster();
    val request = settlementRequest();
    val quote = master.getCreateLaunchQuote(creator, request);
    val curve = master.getLaunchAddress(creator, request.salt, request.options.load());
    val cursor = settlementCursor(master, creator, request, quote.minimumCreateValue - 1);
    expect(
        cursor.executeAllRemaining(),
    ).toHaveFailedTx<CreateLaunch>({ to: master.address, exitCode: 48 });
    cursor.close();
    expect(testing.isDeployed(curve)).toEqual(false);
    expect(master.getMasterData().totalLaunches).toEqual(0);
    expect(master.getMasterData().feesBalance).toEqual(0);
}

get fun `test launch settlement: prefunded curve minter and wallet balances are protected`() {
    val (master, creator, attacker) = settlementMaster();
    val request = settlementRequest(ton("100"));
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    net.send(
        attacker,
        createMessage({ bounce: false, dest: curve.address, value: ton("3"), body: createEmptySlice() }),
    );
    val prior = testing.getAccountBalance(curve.address);
    val cursor = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    cursor.executeTill<InitializeCurve>({ to: curve.address });
    expect(curve.getLaunchSettlement().adminDropped).toEqual(false);
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    net.send(
        attacker,
        createMessage({ bounce: false, dest: minter.address, value: ton("2"), body: TopUpTons {} }),
    );
    val minterPrior = testing.getAccountBalance(minter.address);
    val wallet = minter.getWalletAddress(curve.address);
    net.send(
        attacker,
        createMessage({ bounce: false, dest: wallet, value: ton("1"), body: createEmptySlice() }),
    );
    val walletPrior = testing.getAccountBalance(wallet);
    val trace = cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    expect(curve.getLaunchSettlement().settlement!.preExistingBalance).toEqual(prior);
    val data = curve.getCurveData();
    expect(testing.getAccountBalance(curve.address)).toBeGreaterOrEqual(
        prior + CURVE_STORAGE_RESERVE + data.realTonReserve + data.feeAccrued +
            data.migrationReserve +
            curve.getLaunchProgress().creatorAccrued,
    );
    expect(testing.getAccountBalance(minter.address)).toBeGreaterOrEqual(minterPrior);
    expect(testing.getAccountBalance(wallet)).toBeGreaterOrEqual(walletPrior);
    val (count, _) = settlementRefunds(trace, curve.address, creator);
    expect(count).toEqual(1);
}

get fun `test launch settlement: delayed confirmations block trading and fee sweeping without duplicate sends`() {
    val (master, creator, attacker) = settlementMaster();
    val request = settlementRequest(ton("100"));
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val cursor = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue + ton("5"),
    );
    cursor.executeTill<LaunchConfirmed>({ from: master.address, to: curve.address });
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    expect(curve.getLaunchSettlement().settlement!.dropInFlight).toEqual(true);
    expect(
        curve.sendFlushFees(attacker, 1, { value: ton("0.05") }),
    ).toHaveFailedTx<FlushFees>({ to: curve.address, exitCode: 72 });
    expect(
        curve.sendBuyJettons(attacker, 1, 0, { value: ton("1") }),
    ).toHaveFailedTx<BuyJettons>({ to: curve.address, exitCode: 72 });
    expect(
        curve.sendLaunchConfirmed(attacker, request.queryId, { value: ton("0.05") }),
    ).toHaveFailedTx<LaunchConfirmed>({ to: curve.address, exitCode: 73 });
    curve.sendLaunchConfirmed(master.address, request.queryId, { value: ton("0.01") });
    val retry = curve.sendRetryLaunchSettlement(attacker, 2, { value: ton("0.1") });
    expect(retry.findTransaction<ConfirmLaunch>({ to: master.address }) == null).toEqual(true);
    expect(
        retry.findTransaction<DropMinterAdmin>({ to: curve.getCurveData().jettonMinter! }) == null,
    ).toEqual(true);
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    val trace = cursor.executeAllRemaining();
    cursor.close();
    val (count, amount) = settlementRefunds(trace, curve.address, creator);
    expect(count).toEqual(1);
    expect(amount > ton("5")).toEqual(true);
    expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
}

fun serviceBounceSettlement(drop: bool) {
    val (master, creator, attacker) = settlementMaster();
    val request = settlementRequest(ton("100"));
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val cursor = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    cursor.executeTill<InitializeCurve>({ to: curve.address });
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    cursor.executeTill<MintDelivered>({ from: minter.getWalletAddress(
            creator,
        ), to: curve.address });
    val target = drop ? minter.address : master.address;
    val saved = testing.getShardAccount(target)!;
    testing.setShardAccount(target, null);
    if (drop) {
        cursor.executeTill<DropMinterAdmin>({ to: target });
    } else {
        cursor.executeTill<ConfirmLaunch>({ to: target });
    }
    testing.setShardAccount(target, saved);
    cursor.executeAllRemaining();
    cursor.close();
    val pending = curve.getLaunchSettlement();
    expect(pending.settlement!.phase).toEqual(LaunchSettlementPhase.WaitingServices);
    expect(
        drop ? pending.settlement!.dropInFlight : pending.settlement!.confirmInFlight,
    ).toEqual(false);
    val supply = minter.getJettonData().totalSupply;
    val one = testing.createTraceIterationCursor(
        creator,
        createMessage({ bounce: true, dest: curve.address, value: pending.minimumRetryValue, body: RetryLaunchSettlement {
                queryId: 701,
            } }),
    );
    val two = testing.createTraceIterationCursor(
        attacker,
        createMessage({ bounce: true, dest: curve.address, value: pending.minimumRetryValue, body: RetryLaunchSettlement {
                queryId: 702,
            } }),
    );
    settlementGas(one.executeN(1));
    val duplicate = two.executeAllRemaining();
    settlementGas(duplicate);
    two.close();
    expect(duplicate.findTransaction<ConfirmLaunch>({ to: master.address }) == null).toEqual(true);
    expect(
        duplicate.findTransaction<DropMinterAdmin>({ to: minter.address }) == null,
    ).toEqual(true);
    val trace = one.executeAllRemaining();
    one.close();
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    expect(minter.getJettonData().totalSupply).toEqual(supply);
    expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
    val (count, _) = settlementRefunds(trace, curve.address, creator);
    expect(count).toEqual(1);
}

get fun `test launch settlement: factory bounce retries once with concurrent requests`() {
    serviceBounceSettlement(false);
}

get fun `test launch settlement: admin drop bounce retries once without reminting`() {
    serviceBounceSettlement(true);
}

get fun `test launch settlement: finalization bounce preserves confirmations and can retry`() {
    val (master, creator, attacker) = settlementMaster();
    val request = settlementRequest();
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val cursor = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    cursor.executeTill<MinterAdminDropped>({ to: curve.address });
    expect(curve.getLaunchSettlement().settlement!.phase).toEqual(LaunchSettlementPhase.Finalizing);
    expect(
        curve.sendFinalizeLaunch(attacker, request.queryId, { value: ton("0.05") }),
    ).toHaveFailedTx<FinalizeLaunch>({ to: curve.address, exitCode: 73 });
    var storage = BondingCurveStorage.fromCell(settlementData(curve.address));
    val prior = storage.settlement!.load().preExistingBalance;
    var settlement = storage.settlement!.load();
    // Fault injection: an action-phase reserve failure preserves funds for a real bounce.
    settlement.preExistingBalance += ton("1");
    storage.settlement = settlement.toCell();
    setSettlementData(curve.address, storage.toCell());
    val failed = cursor.executeTill<FinalizeLaunch>({ to: curve.address });
    expect(
        failed.findTransaction<FinalizeLaunch>({ to: curve.address, success: false }) != null,
    ).toEqual(true);
    storage = BondingCurveStorage.fromCell(settlementData(curve.address));
    settlement = storage.settlement!.load();
    settlement.preExistingBalance = prior;
    storage.settlement = settlement.toCell();
    setSettlementData(curve.address, storage.toCell());
    cursor.executeAllRemaining();
    cursor.close();
    val ready = curve.getLaunchSettlement();
    expect(ready.settlement!.phase).toEqual(LaunchSettlementPhase.Ready);
    val retry = curve.sendRetryLaunchSettlement(
        creator,
        708,
        { value: ready.minimumRetryValue + ton("0.05") },
    );
    settlementGas(retry);
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    val (count, _) = settlementRefunds(retry, curve.address, creator);
    expect(count).toEqual(1);
    expect(retry.findTransaction<MintLaunchTokens>() == null).toEqual(true);
    expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
}

get fun `test launch settlement: immediate migration refunds once and locks every initial LP`() {
    loadV2Libraries();
    testing.setNow(V2_TIME);
    val (master, creator, _) = settlementMaster();
    val request = settlementRequest(ton("3000"));
    val options = request.options.load();
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(creator, request.salt, options));
    val cursor = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue + ton("5"),
    );
    val trace = cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getState()).toEqual(CURVE_STATE_MIGRATED);
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    val e = Env {
        curve,
        minter,
        creator,
        buyer: creator,
        attacker: creator,
        activator: creator,
    };
    expectMigrated(e, curve.getPoolAddress());
    val (count, amount) = settlementRefunds(trace, curve.address, creator);
    expect(count).toEqual(1);
    expect(amount > ton("5")).toEqual(true);
    expect(master.getMasterData().feesBalance).toEqual(ton("20.2"));
    settlementGas(trace);
}

fun settlementData(target: address): cell {
    val account = testing.getAccountState(target)!;
    val active = account.storage.state;
    assert (active is TlbAccountStateActive) throw 1301;
    return active.stateInit.data!;
}

fun setSettlementData(target: address, data: cell) {
    var shard = testing.getShardAccount(target)!;
    var account = shard.account.load();
    assert (account is TlbAccountInfo) throw 1301;
    var active = account.storage.state;
    assert (active is TlbAccountStateActive) throw 1301;
    active.stateInit.data = data;
    account.storage.state = active;
    shard.account = (account as TlbAccount).toCell();
    testing.setShardAccount(target, shard);
}

get fun `test launch settlement: quote covers large metadata and eight beneficiaries`() {
    val (master, creator, attacker) = settlementMaster();
    var request = settlementRequest(ton("100"));
    var options = request.options.load();
    var shares: map<address, uint16> = [];
    val names: array<string> = [
        "cost-a",
        "cost-b",
        "cost-c",
        "cost-d",
        "cost-e",
        "cost-f",
        "cost-g",
        "cost-h",
    ];
    var i = 0;
    repeat (8) {
        shares.set(testing.treasury(names.get(i)).address, 1250);
        i += 1;
    }
    options.creatorFeeBps = 1000;
    options.beneficiaries = FeeBeneficiaries { shares }.toCell();
    request.options = options.toCell();
    val small = master.getCreateLaunchQuote(creator, request);
    var metadata = beginCell().storeUint(0, 8).endCell();
    repeat (16) {
        metadata = beginCell().storeUint(1, 8).storeUint(0xfeed, 256).storeRef(metadata).endCell();
    }
    request.metadata = metadata;
    val quote = master.getCreateLaunchQuote(creator, request);
    expect(quote.minimumCreateValue > small.minimumCreateValue).toEqual(true);
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(creator, request.salt, options));
    val cursor = settlementCursor(master, creator, request, quote.minimumCreateValue);
    val trace = cursor.executeAllRemaining();
    cursor.close();
    expect(trace).toHaveAllSuccessfulTxs();
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    settlementGas(trace);
    val minter = curve.getCurveData().jettonMinter!;
    expect(testing.getAccountBalance(minter)).toBeGreaterOrEqual(
        testing.getAccountStorageFee(minter, MIN_STORAGE_DURATION)!,
    );
}

get fun `test launch settlement: invalid mint receipts cannot advance initialization`() {
    val (master, creator, attacker) = settlementMaster();
    val request = settlementRequest(ton("100"));
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val cursor = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    cursor.executeTill<InitializeCurve>({ to: curve.address });
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    val wallet = minter.getWalletAddress(curve.address);
    val amount = request.options.load().supply - curve.getLaunchProgress().devTokens;
    curve.sendMintDelivered(attacker, 1, amount, { value: ton("0.05") });
    curve.sendMintDelivered(wallet, 2, amount, { value: ton("0.05") });
    expect(
        curve.sendMintDelivered(wallet, 1, amount - 1, { value: ton("0.05") }),
    ).toHaveFailedTx<MintDelivered>({ to: curve.address, exitCode: 49 });
    curve.sendReturnExcessesBack(attacker, 1, { value: ton("0.05") });
    expect(curve.getLaunchProgress().curveReceived).toEqual(false);
    expect(curve.getLaunchProgress().devReceived).toEqual(false);
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    val trace = cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    val (count, _) = settlementRefunds(trace, curve.address, creator);
    expect(count).toEqual(1);
}

get fun `test launch settlement: finalization in flight cannot be scheduled twice`() {
    val (master, creator, attacker) = settlementMaster();
    val request = settlementRequest();
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val cursor = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    cursor.executeTill<MinterAdminDropped>({ to: curve.address });
    val retry = curve.sendRetryLaunchSettlement(attacker, 901, { value: ton("0.1") });
    expect(retry.findTransaction<FinalizeLaunch>() == null).toEqual(true);
    expect(curve.getLaunchSettlement().settlement!.phase).toEqual(LaunchSettlementPhase.Finalizing);
    val trace = cursor.executeAllRemaining();
    cursor.close();
    val (count, _) = settlementRefunds(trace, curve.address, creator);
    expect(count).toEqual(1);
}

get fun `test launch settlement: insufficient refundable dust is retained and never swept as fees`() {
    val (master, creator, attacker) = settlementMaster();
    val request = settlementRequest();
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val cursor = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    cursor.executeTill<MinterAdminDropped>({ to: curve.address });
    cursor.close();
    // Fault injection: deliver the finalizer with a depleted gas remainder.
    val trace = curve.sendFinalizeLaunch(curve.address, request.queryId, { value: ton("0.0013") });
    settlementGas(trace);
    expect(trace).toHaveAllSuccessfulTxs();
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    val (count, _) = settlementRefunds(trace, curve.address, creator);
    expect(count).toEqual(0);
    expect(curve.getLaunchSettlement().retainedBuffer > 0).toEqual(true);
    expect(curve.getLaunchSettlement().retainedBuffer).toEqual(
        testing.getAccountBalance(curve.address) - CURVE_STORAGE_RESERVE,
    );
    expect(testing.getAccountBalance(curve.address)).toBeGreaterOrEqual(CURVE_STORAGE_RESERVE);
    expect(
        curve.sendFlushFees(attacker, 902, { value: ton("0.05"), bounce: true }),
    ).toHaveFailedTx<FlushFees>({ to: curve.address, exitCode: 47 });
    expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
    val dust = curve.getLaunchSettlement().retainedBuffer;
    expect(dust <= curve.getLaunchSettlement().settlement!.retainedBufferLimit).toEqual(true);
    var storage = BondingCurveStorage.fromCell(settlementData(curve.address));
    storage.state = CURVE_STATE_AWAITING_LIQUIDITY;
    storage.migration = MigrationProgress {
        nativeQueryId: 1,
        jettonQueryId: 1,
        tonAmount: ton("1"),
        jettonAmount: 1,
        nativeRetry: false,
        jettonRetry: false,
        pendingNativeRefund: true,
    }.toCell();
    setSettlementData(curve.address, storage.toCell());
    // Isolate principal accounting from transaction gas: inject an already received principal.
    var shard = testing.getShardAccount(curve.address)!;
    var account = shard.account.load();
    assert (account is TlbAccountInfo) throw 1301;
    account.storage.balance.grams += ton("1");
    shard.account = (account as TlbAccount).toCell();
    testing.setShardAccount(curve.address, shard);
    expect(curve.getLaunchSettlement().retainedBuffer).toEqual(dust);
    expect(
        curve.sendFlushFees(attacker, 903, { value: ton("0.05"), bounce: true }),
    ).toHaveFailedTx<FlushFees>({ to: curve.address, exitCode: 47 });
    expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
}

get fun `test launch settlement: quote follows network gas prices and still funds every hop`() {
    val (master, creator, _) = settlementMaster();
    val request = settlementRequest();
    val before = master.getCreateLaunchQuote(creator, request);
    val original = testing.getConfig();
    var expensive = original;
    var prices = expensive.getGasPrices(BASECHAIN);
    var other = prices.other;
    other.gasPrice *= 2;
    prices.other = other;
    expensive.setGasPrices(prices, BASECHAIN);
    testing.setConfig(expensive);
    val quote = master.getCreateLaunchQuote(creator, request);
    expect(quote.minimumCreateValue > before.minimumCreateValue).toEqual(true);
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val cursor = settlementCursor(master, creator, request, quote.minimumCreateValue);
    val trace = cursor.executeAllRemaining();
    cursor.close();
    testing.setConfig(original);
    expect(trace).toHaveAllSuccessfulTxs();
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    val (count, _) = settlementRefunds(trace, curve.address, creator);
    expect(count).toEqual(1);
    settlementGas(trace);
}

fun lostLaunchAcknowledgement(leg: int, loseProbe: bool = false, moveTokens: bool = false) {
    val (master, creator, _) = settlementMaster();
    val request = settlementRequest(ton("100"));
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val cursor = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    cursor.executeTill<InitializeCurve>({ to: curve.address });
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    if (leg <= 1) {
        cursor.executeTill<InternalLaunchMint>({ to: minter.getWalletAddress(
                leg == 0 ? curve.address : creator,
            ) });
    } else if (leg == 2) {
        cursor.executeTill<ConfirmLaunch>({ to: master.address });
    } else if (leg == 3) {
        cursor.executeTill<LaunchConfirmed>({ to: curve.address });
    } else {
        cursor.executeTill<MinterAdminDropped>({ to: curve.address });
    }
    val supplyBefore = minter.getJettonData().totalSupply;
    if (leg < 4) {
        var storage = BondingCurveStorage.fromCell(settlementData(curve.address));
        val progress = storage.progress;
        // Fault injection at the receiver only: the sender already committed its operation.
        storage.progress = beginCell().endCell() as Cell<LaunchProgress>;
        setSettlementData(curve.address, storage.toCell());
        if (leg <= 1) {
            val failed = cursor.executeTill<MintDelivered>({ to: curve.address });
            expect(
                failed.findTransaction<MintDelivered>({ to: curve.address, success: false }) !=
                    null,
            ).toEqual(true);
        } else if (leg == 2) {
            val failed = cursor.executeTill<LaunchConfirmed>({ to: curve.address });
            expect(
                failed.findTransaction<LaunchConfirmed>({ to: curve.address, success: false }) !=
                    null,
            ).toEqual(true);
        } else {
            val failed = cursor.executeTill<MinterAdminDropped>({ to: curve.address });
            expect(
                failed.findTransaction<MinterAdminDropped>({ to: curve.address, success: false }) !=
                    null,
            ).toEqual(true);
        }
        storage = BondingCurveStorage.fromCell(settlementData(curve.address));
        storage.progress = progress;
        setSettlementData(curve.address, storage.toCell());
    } else {
        val original = testing.getConfig();
        var expensive = original;
        var prices = expensive.getGasPrices(BASECHAIN);
        var other = prices.other;
        other.gasPrice *= 1000;
        prices.other = other;
        expensive.setGasPrices(prices, BASECHAIN);
        testing.setConfig(expensive);
        val failed = cursor.executeTill<FinalizeLaunch>({ to: curve.address });
        expect(
            failed.findTransaction<FinalizeLaunch>({ to: curve.address, success: false }) != null,
        ).toEqual(true);
        testing.setConfig(original);
    }
    cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    if (moveTokens) {
        val attacker = testing.treasury("receipt-holder").address;
        val wallet = minter.getWalletAddress(creator);
        val amount = curve.getLaunchProgress().devTokens / 2;
        net.send(
            creator,
            createMessage({ bounce: true, dest: wallet, value: ton("0.2"), body: AskToTransfer {
                    queryId: 980,
                    jettonAmount: amount,
                    transferRecipient: attacker,
                    sendExcessesTo: creator,
                    customPayload: null,
                    forwardTonAmount: 0,
                    forwardPayload: beginCell().storeUint(0, 1).toSlice(),
                } }),
        );
        expect(v2Tokens(minter, creator)).toEqual(curve.getLaunchProgress().devTokens - amount);
    }
    if (loseProbe) {
        val probe = testing.createTraceIterationCursor(
            creator,
            createMessage({ bounce: true, dest: curve.address, value: ton("0.5"), body: RetryLaunchSettlement {
                    queryId: 949,
                } }),
        );
        probe.executeTill<ProbeLaunchSettlement>({ to: minter.getWalletAddress(creator) });
        var storage = BondingCurveStorage.fromCell(settlementData(curve.address));
        val progress = storage.progress;
        storage.progress = beginCell().endCell() as Cell<LaunchProgress>;
        setSettlementData(curve.address, storage.toCell());
        val failed = probe.executeTill<LaunchSettlementState>({ to: curve.address });
        expect(
            failed.findTransaction<LaunchSettlementState>({ to: curve.address, success: false }) !=
                null,
        ).toEqual(true);
        storage = BondingCurveStorage.fromCell(settlementData(curve.address));
        storage.progress = progress;
        setSettlementData(curve.address, storage.toCell());
        probe.executeAllRemaining();
        probe.close();
        expect(curve.getLaunchSettlement().settlement!.recoveryPending > 0).toEqual(true);
    }
    val funding = leg == 4 ? curve.getLaunchSettlement().minimumRetryValue : ton("0.5");
    val resumed = curve.sendRetryLaunchSettlement(creator, 950, { value: funding });
    settlementGas(resumed);
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    expect(minter.getJettonData().totalSupply).toEqual(request.options.load().supply);
    if (leg != 0) {
        expect(minter.getJettonData().totalSupply).toEqual(supplyBefore);
    }
    val minted = resumed.findTransaction<MintLaunchTokens>();
    if (minted != null) {
        expect(leg == 0 && minted!.loadBody<MintLaunchTokens>().queryId == 2).toEqual(true);
    }
    expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
    val (count, _) = settlementRefunds(resumed, curve.address, creator);
    expect(count).toEqual(1);
}

get fun `test launch settlement: curve mint receipt fails without bounce and resumes safely`() {
    lostLaunchAcknowledgement(0);
}

get fun `test launch settlement: dev mint receipt fails without bounce and resumes safely`() {
    lostLaunchAcknowledgement(1);
}

get fun `test launch settlement: factory receipt fails without bounce and resumes safely`() {
    lostLaunchAcknowledgement(2);
}

get fun `test launch settlement: admin receipt fails without bounce and resumes safely`() {
    lostLaunchAcknowledgement(3);
}

get fun `test launch settlement: finalizer fails without bounce and resumes safely`() {
    lostLaunchAcknowledgement(4);
}

get fun `test launch settlement: recovery reply fails without bounce and can be requested again`() {
    lostLaunchAcknowledgement(1, true);
}

fun launchRecoveryRace(finalizer: bool) {
    val (master, creator, attacker) = settlementMaster();
    val request = settlementRequest(ton("100"));
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val original = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    original.executeTill<InitializeCurve>({ to: curve.address });
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    if (finalizer) {
        original.executeTill<MinterAdminDropped>({ to: curve.address });
    } else {
        original.executeTill<InternalLaunchMint>({ to: minter.getWalletAddress(creator) });
    }
    val one = testing.createTraceIterationCursor(
        creator,
        createMessage({ bounce: true, dest: curve.address, value: ton("0.5"), body: RetryLaunchSettlement {
                queryId: 960,
            } }),
    );
    val two = testing.createTraceIterationCursor(
        creator,
        createMessage({ bounce: true, dest: curve.address, value: ton("0.5"), body: RetryLaunchSettlement {
                queryId: 961,
            } }),
    );
    one.executeN(1);
    two.executeN(1);
    expect(curve.getLaunchSettlement().settlement!.recoveryId).toEqual(2);
    val bad = net.send(
        attacker,
        createMessage({ bounce: true, dest: curve.address, value: ton("0.05"), body: LaunchSettlementState {
                queryId: 2,
                leg: 1,
                completed: true,
                amount: 1,
            } }),
    );
    expect(bad).toHaveFailedTx<LaunchSettlementState>({ to: curve.address, exitCode: 73 });
    // Preserve TON FIFO: the old acknowledgement/finalizer precedes its sender's probe replies.
    val delayed = original.executeAllRemaining();
    original.close();
    val (delayedCount, _) = settlementRefunds(delayed, curve.address, creator);
    expect(delayedCount).toEqual(0);
    val stale = one.executeAllRemaining();
    one.close();
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    expect(curve.getLaunchSettlement().settlement!.recoveryPending > 0).toEqual(true);
    val (staleCount, _) = settlementRefunds(stale, curve.address, creator);
    expect(staleCount).toEqual(0);
    val resumed = two.executeAllRemaining();
    two.close();
    settlementGas(resumed);
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    expect(minter.getJettonData().totalSupply).toEqual(request.options.load().supply);
    expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
    val (resumedCount, _) = settlementRefunds(resumed, curve.address, creator);
    expect(resumedCount).toEqual(1);
    expect(resumed.findTransaction<MintLaunchTokens>() == null).toEqual(true);
}

get fun `test launch settlement: concurrent recovery awaits the delayed mint receipt and ignores stale replies`() {
    launchRecoveryRace(false);
}

get fun `test launch settlement: concurrent recovery awaits the old finalizer and refunds only once`() {
    launchRecoveryRace(true);
}

get fun `test launch settlement: recovery generation overflow leaves tracking unchanged`() {
    val (master, creator, _) = settlementMaster();
    val request = settlementRequest();
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val cursor = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    cursor.executeTill<InitializeCurve>({ to: curve.address });
    var storage = BondingCurveStorage.fromCell(settlementData(curve.address));
    var settlement = storage.settlement!.load();
    settlement.recoveryId = (1 << 64) - 1;
    storage.settlement = settlement.toCell();
    setSettlementData(curve.address, storage.toCell());
    val failed = curve.sendRetryLaunchSettlement(creator, 970, { value: ton("0.5") });
    expect(failed).toHaveFailedTx<RetryLaunchSettlement>({ to: curve.address, exitCode: 72 });
    expect(curve.getLaunchSettlement().settlement!.toCell().hash()).toEqual(
        settlement.toCell().hash(),
    );
    settlement.recoveryId = 0;
    storage.settlement = settlement.toCell();
    setSettlementData(curve.address, storage.toCell());
    cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
}

get fun `test launch settlement: cached mint proof survives a token transfer before recovery`() {
    lostLaunchAcknowledgement(1, false, true);
}

get fun `test launch settlement: two lost service receipts recover without duplicate operations`() {
    val (master, creator, _) = settlementMaster();
    val request = settlementRequest();
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val original = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    original.executeTill<ConfirmLaunch>({ to: master.address });
    var storage = BondingCurveStorage.fromCell(settlementData(curve.address));
    val progress = storage.progress;
    storage.progress = beginCell().endCell() as Cell<LaunchProgress>;
    setSettlementData(curve.address, storage.toCell());
    original.executeTill<MinterAdminDropped>({ to: curve.address });
    storage = BondingCurveStorage.fromCell(settlementData(curve.address));
    storage.progress = progress;
    setSettlementData(curve.address, storage.toCell());
    original.executeAllRemaining();
    original.close();
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    val resumed = curve.sendRetryLaunchSettlement(creator, 982, { value: ton("0.5") });
    settlementGas(resumed);
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    expect(resumed.findTransaction<ConfirmLaunch>() == null).toEqual(true);
    expect(resumed.findTransaction<DropMinterAdmin>() == null).toEqual(true);
    expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
    val (count, _) = settlementRefunds(resumed, curve.address, creator);
    expect(count).toEqual(1);
}

fun failedMintOperationWithoutBounce(stage: int, devLeg: bool = false) {
    val (master, creator, _) = settlementMaster();
    val request = settlementRequest(ton("100"));
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val original = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    original.executeTill<InitializeCurve>({ to: curve.address });
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    if (devLeg) {
        original.executeTill<MintDelivered>({ from: minter.getWalletAddress(
                curve.address,
            ), to: curve.address });
    }
    val recipient = devLeg ? creator : curve.address;
    if (stage <= 1) {
        if (stage == 1) {
            original.executeTill<MintLaunchTokens>({ to: minter.address });
        }
        val config = testing.getConfig();
        var expensive = config;
        var prices = expensive.getGasPrices(BASECHAIN);
        var other = prices.other;
        other.gasPrice *= 10000;
        prices.other = other;
        expensive.setGasPrices(prices, BASECHAIN);
        testing.setConfig(expensive);
        if (stage == 0) {
            val failed = original.executeTill<MintLaunchTokens>({ to: minter.address });
            expect(
                failed.findTransaction<MintLaunchTokens>({ to: minter.address, success: false }) !=
                    null,
            ).toEqual(true);
        } else {
            val failed = original.executeTill<InternalLaunchMint>({ to: minter.getWalletAddress(
                    recipient,
                ) });
            expect(
                failed.findTransaction<InternalLaunchMint>({ to: minter.getWalletAddress(
                        recipient,
                    ), success: false }) !=
                    null,
            ).toEqual(true);
        }
        testing.setConfig(config);
        original.executeAllRemaining();
        original.close();
    } else {
        val sent = original.executeTill<MintLaunchTokens>({ to: minter.address });
        val outputs = sent.at(sent.size() - 1).outMessages;
        var rejected: cell? = null;
        var i = 0;
        while (i < outputs.size()) {
            var message = TlbMessageRelaxedGeneric.fromCell(outputs.atCell(i));
            val opcode = message.loadOpcode();
            if (opcode != null && opcode! == 0xa0a0b081) {
                var body = InternalLaunchMint.fromSlice(
                    TlbMessageRelaxed<RemainingBitsAndRefs>.fromCell(outputs.atCell(i)).loadBody(),
                );
                // Fault injection: reject the transfer in the wallet; lose only its failure notification.
                body.protect = !body.protect;
                message.body = beginCell().storeBool(true).storeRef(body.toCell()).toSlice();
                rejected = message.toCell();
            }
            i += 1;
        }
        original.close();
        assert (rejected != null) throw 1302;
        var storage = BondingCurveStorage.fromCell(settlementData(curve.address));
        val progress = storage.progress;
        storage.progress = beginCell().endCell() as Cell<LaunchProgress>;
        setSettlementData(curve.address, storage.toCell());
        val failure = testing.createTraceIterationCursor(
            minter.address,
            OutMessage { messageCell: rejected! },
        );
        val lost = failure.executeTill<LaunchMintFailed>({ to: curve.address });
        expect(
            lost.findTransaction<LaunchMintFailed>({ to: curve.address, success: false }) != null,
        ).toEqual(true);
        storage = BondingCurveStorage.fromCell(settlementData(curve.address));
        storage.progress = progress;
        setSettlementData(curve.address, storage.toCell());
        failure.executeAllRemaining();
        failure.close();
    }
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    val resumed = curve.sendRetryLaunchSettlement(creator, 990, { value: ton("0.5") });
    settlementGas(resumed, false);
    expect(curve.getState()).toEqual(CURVE_STATE_CANCELLED);
    expect(minter.getJettonData().totalSupply).toEqual(
        devLeg ? request.options.load().supply - curve.getLaunchProgress().devTokens : 0 as coins,
    );
    expect(resumed.findTransaction<MintLaunchTokens>() == null).toEqual(true);
    expect(master.getMasterData().totalLaunches).toEqual(0);
    expect(master.getMasterData().feesBalance).toEqual(0);
    val (count, returned) = settlementRefunds(resumed, curve.address, creator);
    expect(count).toEqual(1);
    expect(returned > ton("99")).toEqual(true);
}

get fun `test mint operation recovery: minter request fails without bounce and safely cancels`() {
    failedMintOperationWithoutBounce(0);
}

get fun `test mint operation recovery: wallet mint fails without bounce and safely cancels`() {
    failedMintOperationWithoutBounce(1);
}

get fun `test mint operation recovery: lost mint failure notification safely cancels`() {
    failedMintOperationWithoutBounce(2);
}

get fun `test mint operation recovery: dev minter request fails without bounce and cancels`() {
    failedMintOperationWithoutBounce(0, true);
}

get fun `test mint operation recovery: dev wallet mint fails without bounce and cancels`() {
    failedMintOperationWithoutBounce(1, true);
}

get fun `test mint operation recovery: dev mint failure notification is lost and cancels`() {
    failedMintOperationWithoutBounce(2, true);
}

get fun `test mint operation recovery: original mint in flight completes before ordered inspection`() {
    val (master, creator, _) = settlementMaster();
    val request = settlementRequest(ton("100"));
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val original = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    original.executeTill<InitializeCurve>({ to: curve.address });
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    val one = testing.createTraceIterationCursor(
        creator,
        createMessage({ bounce: true, dest: curve.address, value: ton("0.5"), body: RetryLaunchSettlement {
                queryId: 1001,
            } }),
    );
    val two = testing.createTraceIterationCursor(
        creator,
        createMessage({ bounce: true, dest: curve.address, value: ton("0.5"), body: RetryLaunchSettlement {
                queryId: 1002,
            } }),
    );
    one.executeN(1);
    two.executeN(1);
    // Curve -> minter FIFO: process the original request before either resolver.
    original.executeTill<MintLaunchTokens>({ to: minter.address });
    one.executeTill<ResolveLaunchMint>({ to: minter.address });
    two.executeTill<ResolveLaunchMint>({ to: minter.address });
    // Minter -> wallet FIFO: process the original mint before either inspection.
    val initial = original.executeAllRemaining();
    original.close();
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    val (initialCount, _) = settlementRefunds(initial, curve.address, creator);
    expect(initialCount).toEqual(0);
    val stale = one.executeAllRemaining();
    one.close();
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    val finished = two.executeAllRemaining();
    two.close();
    settlementGas(finished, false);
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    expect(minter.getJettonData().totalSupply).toEqual(request.options.load().supply);
    expect(finished.findTransaction<MintLaunchTokens>() == null).toEqual(true);
    expect(stale.findTransaction<MintLaunchTokens>() == null).toEqual(true);
    val (finishedCount, _) = settlementRefunds(finished, curve.address, creator);
    expect(finishedCount).toEqual(1);
    expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
}

get fun `test mint operation recovery: concurrent negative inspections roll supply back once`() {
    val (master, creator, _) = settlementMaster();
    val request = settlementRequest(ton("100"));
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, request.salt, request.options.load()),
    );
    val original = settlementCursor(
        master,
        creator,
        request,
        master.getCreateLaunchQuote(creator, request).minimumCreateValue,
    );
    original.executeTill<InitializeCurve>({ to: curve.address });
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    original.executeTill<MintLaunchTokens>({ to: minter.address });
    val config = testing.getConfig();
    var expensive = config;
    var prices = expensive.getGasPrices(BASECHAIN);
    var other = prices.other;
    other.gasPrice *= 10000;
    prices.other = other;
    expensive.setGasPrices(prices, BASECHAIN);
    testing.setConfig(expensive);
    original.executeTill<InternalLaunchMint>({ to: minter.getWalletAddress(curve.address) });
    testing.setConfig(config);
    original.executeAllRemaining();
    original.close();
    val one = testing.createTraceIterationCursor(
        creator,
        createMessage({ bounce: true, dest: curve.address, value: ton("0.5"), body: RetryLaunchSettlement {
                queryId: 1010,
            } }),
    );
    val two = testing.createTraceIterationCursor(
        creator,
        createMessage({ bounce: true, dest: curve.address, value: ton("0.5"), body: RetryLaunchSettlement {
                queryId: 1011,
            } }),
    );
    one.executeN(1);
    two.executeN(1);
    one.executeTill<ResolveLaunchMint>({ to: minter.address });
    two.executeTill<ResolveLaunchMint>({ to: minter.address });
    val stale = one.executeAllRemaining();
    one.close();
    expect(minter.getJettonData().totalSupply).toEqual(0);
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    val failed = two.executeAllRemaining();
    two.close();
    settlementGas(failed, false);
    expect(minter.getJettonData().totalSupply).toEqual(0);
    expect(curve.getState()).toEqual(CURVE_STATE_CANCELLED);
    expect(
        stale.findTransaction<MintLaunchTokens>() == null &&
            failed.findTransaction<MintLaunchTokens>() ==
            null,
    ).toEqual(true);
    expect(master.getMasterData().totalLaunches).toEqual(0);
    val (count, _) = settlementRefunds(failed, curve.address, creator);
    expect(count).toEqual(1);
}
