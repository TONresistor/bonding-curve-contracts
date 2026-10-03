import "@acton/emulation/config"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWallet.gen"
import "@wrappers/JettonWalletV2.gen"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/wallet-messages"

fun notificationSetup(): (
    BondingCurveMasterV2,
    BondingCurveV2,
    JettonMinterV2,
    JettonWallet,
    address,
    address,
) {
    val creator = testing.treasury("review-creator").address;
    val buyer = testing.treasury("review-buyer").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: creator, nextAdmin: null, treasury: creator, totalLaunches: 0, feesBalance: 0 });
    master.deploy(creator, { value: ton("2") });
    val options = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("100"),
        minDevTokens: 0,
    };
    master.sendCreateLaunch(
        creator,
        1,
        beginCell().endCell(),
        900001,
        options,
        { value: ton("101") },
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(creator, 900001, options));
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    curve.sendBuyJettons(buyer, 2, 0, { value: ton("10.05") });
    return (
        master,
        curve,
        minter,
        JettonWallet.fromAddress(minter.getWalletAddress(buyer)),
        creator,
        buyer,
    );
}

fun notificationSell(
    wallet: JettonWallet,
    buyer: address,
    curve: address,
    amount: coins,
    forward: coins,
    payload: cell,
) {
    net.send(
        buyer,
        createMessage({ bounce: true, dest: wallet.address, value: ton("0.4"), body: AskToTransfer {
                queryId: 3,
                jettonAmount: amount,
                transferRecipient: curve,
                sendExcessesTo: buyer,
                customPayload: null,
                forwardTonAmount: forward,
                forwardPayload: beginCell().storeUint(1, 1).storeRef(payload).toSlice(),
            } }),
    );
}

get fun `test v2: underfunded sell notifications bounce and restore all tokens`() {
    val (
        _,
        curve,
        minter,
        wallet,
        _,
        buyer,
    ) = notificationSetup();
    val curveWallet = JettonWalletV2.fromAddress(minter.getWalletAddress(curve.address));
    expect(curveWallet.getMinSellNotification()).toEqual(ton("0.2"));
    expect(JettonWalletV2.fromAddress(wallet.address).getMinSellNotification()).toEqual(0);
    val before = wallet.getWalletData().jettonBalance;
    val held = curveWallet.getWalletData().jettonBalance;
    val state = curve.getCurveData();
    val fees = curve.getLaunchProgress().creatorAccrued;
    val forwards: array<coins> = [0, 1, ton("0.2") - 1];
    var i = 0;
    repeat (3) {
        var j = 0;
        repeat (2) {
            val payload = j == 0
                ? beginCell()
                    .storeUint(1, 1)
                    .storeRef(
                        SellPayload {
                            queryId: 3,
                            minTonOut: 0,
                        }.toCell(),
                    )
                    .toSlice()
                : beginCell().storeUint(0, 1).toSlice();
            val trace = net.send(
                buyer,
                createMessage({ bounce: true, dest: wallet.address, value: ton("0.5"), body: AskToTransfer {
                        queryId: 3,
                        jettonAmount: before / 2,
                        transferRecipient: curve.address,
                        sendExcessesTo: buyer,
                        customPayload: null,
                        forwardTonAmount: forwards.get(i),
                        forwardPayload: payload,
                    } }),
            );
            expect(
                trace,
            ).toHaveFailedTx<InternalTransferStep>({ to: curveWallet.address, exitCode: 48 });
            expect(
                trace.findTransaction<TransferNotificationForRecipient>({ to: curve.address }) ==
                    null,
            ).toEqual(true);
            expect(wallet.getWalletData().jettonBalance).toEqual(before);
            expect(curveWallet.getWalletData().jettonBalance).toEqual(held);
            expect(curve.getCurveData().realTonReserve).toEqual(state.realTonReserve);
            expect(curve.getCurveData().curveJettonBalance).toEqual(state.curveJettonBalance);
            expect(curve.getCurveData().feeAccrued).toEqual(state.feeAccrued);
            expect(curve.getCurveData().migrationReserve).toEqual(state.migrationReserve);
            expect(curve.getLaunchProgress().creatorAccrued).toEqual(fees);
            expect(curveWallet.getMinSellNotification()).toEqual(ton("0.2"));
            j += 1;
        }
        i += 1;
    }
    val tracked = net.send(
        buyer,
        createMessage({ bounce: true, dest: wallet.address, value: ton("0.5"), body: AskToTransferTracked {
                queryId: 4,
                jettonAmount: before / 2,
                transferRecipient: curve.address,
                sendExcessesTo: buyer,
                customPayload: null,
                forwardTonAmount: 0,
                forwardPayload: beginCell().storeUint(0, 1).toSlice(),
            } }),
    );
    expect(
        tracked,
    ).toHaveFailedTx<InternalTransferTracked>({ to: curveWallet.address, exitCode: 48 });
    expect(wallet.getWalletData().jettonBalance).toEqual(before);
    expect(curveWallet.getWalletData().jettonBalance).toEqual(held);
}

get fun `test v2: funded sells and ordinary zero-notification transfers still work`() {
    val (
        _,
        curve,
        minter,
        wallet,
        _,
        buyer,
    ) = notificationSetup();
    var i = 0;
    repeat (2) {
        val before = wallet.getWalletData().jettonBalance;
        val amount = before / 4;
        val quote = curve.getQuoteSell(amount);
        notificationSell(
            wallet,
            buyer,
            curve.address,
            amount,
            ton("0.2") + i,
            SellPayload {
                queryId: 3,
                minTonOut: quote,
            }.toCell(),
        );
        expect(wallet.getWalletData().jettonBalance).toEqual(before - amount);
        i += 1;
    }
    val receiver = testing.treasury("notification-receiver").address;
    val amount = wallet.getWalletData().jettonBalance / 3;
    net.send(
        buyer,
        createMessage({ bounce: true, dest: wallet.address, value: ton("0.2"), body: AskToTransfer {
                queryId: 5,
                jettonAmount: amount,
                transferRecipient: receiver,
                sendExcessesTo: buyer,
                customPayload: null,
                forwardTonAmount: 0,
                forwardPayload: beginCell().storeUint(0, 1).toSlice(),
            } }),
    );
    val received = JettonWalletV2.fromAddress(minter.getWalletAddress(receiver));
    expect(received.getWalletData().jettonBalance).toEqual(amount);
    expect(received.getMinSellNotification()).toEqual(0);
    val rejected = received.sendInternalCurveMint(buyer, 1, 100, { value: ton("0.2") });
    expect(rejected).toHaveFailedTx<InternalCurveMint>({ to: received.address, exitCode: 74 });
    expect(received.getWalletData().jettonBalance).toEqual(amount);
    expect(received.getMinSellNotification()).toEqual(0);
}

fun guardedPendingLaunch(): (
    BondingCurveMasterV2,
    BondingCurveV2,
    address,
    TxCursor,
    LaunchOptions,
) {
    val creator = testing.treasury("guard-init-owner").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: creator, nextAdmin: null, treasury: creator, totalLaunches: 0, feesBalance: 0 });
    master.deploy(creator, { value: ton("2") });
    val o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("100"),
        minDevTokens: 0,
    };
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(creator, 910001, o));
    val cursor = testing.createTraceIterationCursor(
        creator,
        createMessage({ bounce: true, dest: master.address, value: ton("101"), body: CreateLaunch {
                queryId: 1,
                metadata: beginCell().endCell(),
                salt: 910001,
                options: o.toCell(),
            } }),
    );
    cursor.executeTill<InitializeCurve>({ to: curve.address });
    return (master, curve, creator, cursor, o);
}

get fun `test v2: protected curve wallet is confirmed before dev tokens are minted`() {
    val (_, curve, creator, cursor, o) = guardedPendingLaunch();
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    val attacker = testing.treasury("guard-init-attacker").address;
    expect(
        minter.sendMintCurveWallet(attacker, 1, 100, ton("0.2"), { value: ton("0.3") }),
    ).toHaveFailedTx<MintCurveWallet>({ to: minter.address, exitCode: 73 });
    expect(minter.getJettonData().totalSupply).toEqual(0);
    val wallet = JettonWalletV2.fromAddress(minter.getWalletAddress(curve.address));
    cursor.executeTill<InternalCurveMint>({ to: wallet.address });
    expect(wallet.getMinSellNotification()).toEqual(ton("0.2"));
    expect(curve.getLaunchProgress().curveReceived).toEqual(false);
    expect(minter.getJettonData().totalSupply).toEqual(
        o.supply - curve.getLaunchProgress().devTokens,
    );
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    cursor.executeTill<TransferNotificationForRecipient>({ to: curve.address });
    expect(curve.getLaunchProgress().curveReceived).toEqual(true);
    expect(curve.getLaunchProgress().devReceived).toEqual(false);
    expect(minter.getJettonData().totalSupply).toEqual(
        o.supply - curve.getLaunchProgress().devTokens,
    );
    expect(
        curve.sendBuyJettons(attacker, 8, 0, { value: ton("10.05") }),
    ).toHaveFailedTx<BuyJettons>({ to: curve.address, exitCode: 72 });
    cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    expect(minter.getJettonData().totalSupply).toEqual(o.supply);
    expect(
        JettonWalletV2.fromAddress(minter.getWalletAddress(creator)).getMinSellNotification(),
    ).toEqual(0);
}

get fun `test v2: failed dev mint after wallet protection cancels and refunds launch`() {
    val (master, curve, creator, cursor, o) = guardedPendingLaunch();
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    cursor.executeTill<TransferNotificationForRecipient>({ to: curve.address });
    expect(curve.getLaunchProgress().curveReceived).toEqual(true);
    val original = testing.getConfig();
    var expensive = original;
    var prices = expensive.getGasPrices(BASECHAIN);
    var other = prices.other;
    other.gasPrice *= 1000;
    prices.other = other;
    expensive.setGasPrices(prices, BASECHAIN);
    testing.setConfig(expensive);
    val failure = cursor.executeTill<MintNewJettons>({ to: minter.address });
    expect(failure).toHaveFailedTx<MintNewJettons>({ to: minter.address, exitCode: 48 });
    testing.setConfig(original);
    val recovery = cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getState()).toEqual(CURVE_STATE_CANCELLED);
    expect(master.getMasterData().totalLaunches).toEqual(0);
    expect(master.getMasterData().feesBalance).toEqual(0);
    expect(minter.getJettonData().totalSupply).toEqual(
        o.supply - curve.getLaunchProgress().devTokens,
    );
    val refund = recovery.findTransaction<ReturnExcessesBack>({ from: curve.address, to: creator });
    expect(refund != null).toEqual(true);
}

get fun `test v2: dev sell before launch confirmation returns tokens`() {
    val (_, curve, creator, cursor, o) = guardedPendingLaunch();
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    val devWallet = JettonWalletV2.fromAddress(minter.getWalletAddress(creator));
    cursor.executeTill<InternalTransferStep>({ to: devWallet.address });
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    expect(curve.getLaunchProgress().curveReceived).toEqual(true);
    expect(curve.getLaunchProgress().devReceived).toEqual(false);
    val before = devWallet.getWalletData().jettonBalance;
    val reserve = curve.getCurveData().realTonReserve;
    val curveWallet = JettonWalletV2.fromAddress(minter.getWalletAddress(curve.address));
    val inventory = curveWallet.getWalletData().jettonBalance;
    net.send(
        creator,
        createMessage({ bounce: true, dest: devWallet.address, value: ton("0.4"), body: AskToTransfer {
                queryId: 9,
                jettonAmount: before / 2,
                transferRecipient: curve.address,
                sendExcessesTo: creator,
                customPayload: null,
                forwardTonAmount: ton("0.2"),
                forwardPayload: beginCell()
                    .storeUint(1, 1)
                    .storeRef(
                        SellPayload {
                            queryId: 9,
                            minTonOut: 0,
                        }.toCell(),
                    )
                    .toSlice(),
            } }),
    );
    expect(devWallet.getWalletData().jettonBalance).toEqual(before);
    expect(curveWallet.getWalletData().jettonBalance).toEqual(inventory);
    expect(curve.getCurveData().realTonReserve).toEqual(reserve);
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    expect(minter.getJettonData().totalSupply).toEqual(o.supply);
}
