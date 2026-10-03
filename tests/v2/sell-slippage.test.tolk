import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWallet.gen"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"

fun slippageSetup(): (
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

fun slippageSell(
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

get fun `test v2: malformed sell slippage returns all tokens without changing reserves or fees`() {
    val (
        _,
        curve,
        minter,
        wallet,
        _,
        buyer,
    ) = slippageSetup();
    val before = wallet.getWalletData().jettonBalance;
    val state = curve.getCurveData();
    val creatorFees = curve.getLaunchProgress().creatorAccrued;
    val curveWallet = JettonWallet.fromAddress(minter.getWalletAddress(curve.address));
    val heldBefore = curveWallet.getWalletData().jettonBalance;
    val malformed: array<cell> = [
        beginCell().storeUint(0xa0a0a020, 32).endCell(),
        beginCell().storeUint(0xa0a0a020, 32).storeUint(3, 32).endCell(),
        beginCell().storeUint(0xa0a0a020, 32).storeUint(3, 64).endCell(),
        beginCell().storeUint(0xa0a0a020, 32).storeUint(3, 64).storeUint(15, 4).endCell(),
        beginCell()
            .storeSlice(
                SellPayload {
                    queryId: 3,
                    minTonOut: 0,
                }
                .toCell()
                .beginParse(),
            )
            .storeUint(1, 1)
            .endCell(),
        beginCell()
            .storeSlice(
                SellPayload {
                    queryId: 3,
                    minTonOut: 0,
                }
                .toCell()
                .beginParse(),
            )
            .storeRef(beginCell().endCell())
            .endCell(),
    ];
    var i = 0;
    repeat (6) {
        slippageSell(
            wallet,
            buyer,
            curve.address,
            before / 2,
            ton("0.2"),
            malformed.get(i),
        );
        expect(wallet.getWalletData().jettonBalance).toEqual(before);
        expect(curveWallet.getWalletData().jettonBalance).toEqual(heldBefore);
        expect(curve.getCurveData().realTonReserve).toEqual(state.realTonReserve);
        expect(curve.getCurveData().curveJettonBalance).toEqual(state.curveJettonBalance);
        expect(curve.getCurveData().feeAccrued).toEqual(state.feeAccrued);
        expect(curve.getCurveData().migrationReserve).toEqual(state.migrationReserve);
        expect(curve.getLaunchProgress().creatorAccrued).toEqual(creatorFees);
        i += 1;
    }
}

get fun `test v2: valid inline referenced and wrapped sell payloads preserve minimum payout`() {
    val (
        _,
        curve,
        _,
        wallet,
        _,
        buyer,
    ) = slippageSetup();
    var i = 0;
    repeat (3) {
        val before = wallet.getWalletData().jettonBalance;
        val amount = before / 4;
        val quote = curve.getQuoteSell(amount);
        val body = SellPayload {
            queryId: 4,
            minTonOut: quote,
        }.toCell();
        val payload = i == 0
            ? beginCell().storeUint(0, 1).storeSlice(body.beginParse()).toSlice()
            : i == 1
                ? beginCell().storeUint(1, 1).storeRef(body).toSlice()
                : beginCell()
                    .storeUint(1, 1)
                    .storeRef(beginCell().storeUint(1, 1).storeRef(body).endCell())
                    .toSlice();
        val trace = net.send(
            buyer,
            createMessage({ bounce: true, dest: wallet.address, value: ton("0.4"), body: AskToTransfer {
                    queryId: 4,
                    jettonAmount: amount,
                    transferRecipient: curve.address,
                    sendExcessesTo: buyer,
                    customPayload: null,
                    forwardTonAmount: ton("0.2"),
                    forwardPayload: payload,
                } }),
        );
        expect(
            trace,
        ).toHaveSuccessfulTx<ReturnExcessesBack>({ from: curve.address, to: buyer, value: quote });
        expect(wallet.getWalletData().jettonBalance).toEqual(before - amount);
        val remaining = wallet.getWalletData().jettonBalance;
        slippageSell(
            wallet,
            buyer,
            curve.address,
            remaining / 2,
            ton("0.2"),
            SellPayload {
                queryId: 5,
                minTonOut: ton("10000"),
            }.toCell(),
        );
        expect(wallet.getWalletData().jettonBalance).toEqual(remaining);
        i += 1;
    }
}
