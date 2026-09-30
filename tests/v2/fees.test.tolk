import "@acton/fmt"
import "@acton/emulation/config"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/FeeSplitterV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWallet.gen"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/fee-storage"
import "@contracts/v2/wallet-messages"

fun feeTestShares(): map<address, uint16> {
    var shares: map<address, uint16> = [];
    shares.set(testing.treasury("fees-alice").address, 6000);
    shares.set(testing.treasury("fees-bob").address, 3000);
    shares.set(testing.treasury("fees-charlie").address, 1000);
    return shares;
}

fun feeTestManager(): (FeeSplitterV2, JettonMinterV2, address, address, address) {
    val owner = testing.treasury("fees-owner").address;
    val collector = testing.treasury("fees-collector").address;
    val protocol = testing.treasury("fees-protocol").address;
    val curve = testing.treasury("fees-curve").address;
    val minter = JettonMinterV2.fromStorage({ totalSupply: 0, adminAddress: owner, nextAdminAddress: null, metadata: beginCell().endCell() });
    minter.deploy(owner, { value: ton("1") });
    val splitter = FeeSplitterV2.fromStorage({
        config: SplitterConfig {
            collector,
            minter: minter.address,
            recipients: FeeRecipients {
                creator: owner,
                protocol,
                creatorBps: 100,
                curve,
                beneficiaries: FeeBeneficiaries { shares: feeTestShares() }.toCell(),
            }.toCell(),
        }.toCell(),
        creatorTon: 0,
        protocolTon: 0,
        creatorTokens: 0,
        protocolTokens: 0,
        nextId: 1,
        pending: [],
    });
    splitter.deploy(owner, { value: ton("1") });
    return (splitter, minter, collector, protocol, curve);
}

fun feeTestTokens(splitter: FeeSplitterV2, minter: JettonMinterV2, collector: address) {
    val owner = testing.treasury("fees-owner").address;
    minter.sendMintNewJettons(
        owner,
        1,
        collector,
        ton("0.2"),
        InternalTransferStep {
            queryId: 1,
            jettonAmount: 11000,
            transferInitiator: null,
            sendExcessesTo: null,
            forwardTonAmount: 0,
            forwardPayload: beginCell().storeUint(0, 1).toSlice(),
        },
        { value: ton("0.3") },
    );
    net.send(
        collector,
        createMessage({ bounce: true, dest: minter.getWalletAddress(
                collector,
            ), value: ton("0.4"), body: AskToTransfer {
                queryId: 2,
                jettonAmount: 11000,
                transferRecipient: splitter.address,
                sendExcessesTo: collector,
                customPayload: null,
                forwardTonAmount: ton("0.15"),
                forwardPayload: beginCell().storeUint(0, 1).toSlice(),
            } }),
    );
}

get fun `test v2: curve fees reach fixed beneficiaries before migration`() {
    val creator = testing.treasury("fees-deployer").address;
    val buyer = testing.treasury("fees-buyer").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: creator, nextAdmin: null, treasury: creator, totalLaunches: 0, feesBalance: 0 });
    master.deploy(creator, { value: ton("2") });
    val shares = feeTestShares();
    val o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("100"),
        minDevTokens: 0,
        beneficiaries: FeeBeneficiaries { shares }.toCell(),
    };
    master.sendCreateLaunch(
        creator,
        1,
        beginCell().endCell(),
        8200,
        o,
        { value: ton("101") },
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(creator, 8200, o));
    val manager = FeeSplitterV2.fromAddress(curve.getFeeManagerAddress());
    expect(manager.getBeneficiaries()).toEqual(shares);
    curve.sendBuyJettons(buyer, 2, 0, { value: ton("10.05") });
    expect(curve.getLaunchProgress().creatorAccrued).toEqual(ton("1.1"));
    val protocolBefore = curve.getCurveData().feeAccrued;
    curve.sendFlushCreatorFees(buyer, 3, { value: ton("0.05") });
    expect(curve.getLaunchProgress().creatorAccrued).toEqual(0);
    expect(curve.getCurveData().feeAccrued).toEqual(protocolBefore);
    expect(manager.getSplitterData().protocolTon).toEqual(0);
    expect(manager.getSplitterData().creatorTon).toEqual(ton("1.1"));
    expect(
        manager.sendClaimSplitFees(creator, 4, false, { value: ton("0.2") }),
    ).toHaveFailedTx<ClaimSplitFees>({ to: manager.address, exitCode: 73 });
    var item = shares.findFirst();
    while (item.isFound) {
        val recipient = item.getKey();
        val amount = ton("1.1") * item.loadValue() / 10000;
        expect(manager.getFeeBalance(recipient, false).tonAmount).toEqual(amount);
        val claim = manager.sendClaimSplitFees(recipient, 5, false, { value: ton("0.2") });
        expect(
            claim,
        ).toHaveSuccessfulTx<ReturnExcessesBack>({ from: manager.address, to: recipient, value: amount });
        expect(manager.getFeeBalance(recipient, false).tonAmount).toEqual(0);
        manager.sendClaimSplitFees(recipient, 5, false, { value: ton("0.2") });
        item = shares.iterateNext(item);
    }
    curve.sendFlushCreatorFees(buyer, 6, { value: ton("0.05") });
    expect(manager.getSplitterData().creatorTon).toEqual(0);
}

get fun `test v2: pool and curve credits split exactly with rounding and authenticated claims`() {
    val (manager, minter, collector, protocol, curve) = feeTestManager();
    val attacker = testing.treasury("fees-attacker").address;
    expect(
        manager.sendCreditCurveFees(attacker, 1, 1, { value: ton("0.05") }),
    ).toHaveFailedTx<CreditCurveFees>({ to: manager.address, exitCode: 73 });
    expect(
        manager.sendCreditNativeFees(attacker, 2, 1, { value: ton("0.05") }),
    ).toHaveFailedTx<CreditNativeFees>({ to: manager.address, exitCode: 73 });
    manager.sendCreditCurveFees(curve, 3, 7, { value: ton("0.05") });
    manager.sendCreditNativeFees(collector, 4, 111, { value: ton("0.05") });
    expect(manager.getSplitterData().protocolTon).toEqual(10);
    expect(manager.getSplitterData().creatorTon).toEqual(108);
    feeTestTokens(manager, minter, collector);
    expect(manager.getSplitterData().protocolTokens).toEqual(1000);
    expect(manager.getSplitterData().creatorTokens).toEqual(10000);
    val shares = feeTestShares();
    var item = shares.findFirst();
    var sumTon: coins = 0;
    var sumTokens: coins = 0;
    var cursors: array<TxCursor> = [];
    while (item.isFound) {
        val recipient = item.getKey();
        val balance = manager.getFeeBalance(recipient, false);
        sumTon += balance.tonAmount;
        sumTokens += balance.tokenAmount;
        expect(balance.tokenAmount).toEqual(10000 * item.loadValue() / 10000);
        cursors.push(
            testing.createTraceIterationCursor(
                recipient,
                createMessage({ bounce: true, dest: manager.address, value: ton("0.2"), body: ClaimSplitFees {
                        queryId: 5,
                        protocol: false,
                    } }),
            ),
        );
        item = shares.iterateNext(item);
    }
    expect(sumTon).toEqual(108);
    expect(sumTokens).toEqual(10000);
    var i = 0;
    repeat (3) {
        cursors.get(i).executeN(1);
        i += 1;
    }
    expect(manager.getSplitterData().creatorTon).toEqual(0);
    expect(manager.getSplitterData().creatorTokens).toEqual(0);
    i = 0;
    repeat (3) {
        cursors.get(i).executeAllRemaining();
        cursors.get(i).close();
        i += 1;
    }
    item = shares.findFirst();
    while (item.isFound) {
        val recipient = item.getKey();
        expect(
            JettonWallet
                .fromAddress(minter.getWalletAddress(recipient))
                .getWalletData()
                .jettonBalance,
        ).toEqual(item.loadValue());
        expect(manager.getFeeBalance(recipient, false).tokenAmount).toEqual(0);
        manager.sendClaimSplitFees(recipient, 5, false, { value: ton("0.2") });
        item = shares.iterateNext(item);
    }
    expect(
        manager.sendClaimSplitFees(attacker, 6, true, { value: ton("0.2") }),
    ).toHaveFailedTx<ClaimSplitFees>({ to: manager.address, exitCode: 73 });
    manager.sendClaimSplitFees(protocol, 7, true, { value: ton("0.2") });
    expect(
        JettonWallet.fromAddress(minter.getWalletAddress(protocol)).getWalletData().jettonBalance,
    ).toEqual(1000);
    expect(manager.getSplitterData().pending.isEmpty()).toEqual(true);
    expect(manager.getSplitterData().protocolTon).toEqual(0);
}

get fun `test v2: failed beneficiary token payout restores only its balance and can retry`() {
    val (manager, minter, collector, _, _) = feeTestManager();
    feeTestTokens(manager, minter, collector);
    val alice = testing.treasury("fees-alice").address;
    val bob = testing.treasury("fees-bob").address;
    val cursor = testing.createTraceIterationCursor(
        alice,
        createMessage({ bounce: true, dest: manager.address, value: ton("0.2"), body: ClaimSplitFees {
                queryId: 9,
                protocol: false,
            } }),
    );
    cursor.executeN(1);
    expect(manager.getFeeBalance(alice, false).tokenAmount).toEqual(0);
    val original = testing.getConfig();
    var expensive = original;
    var prices = expensive.getGasPrices(BASECHAIN);
    var other = prices.other;
    other.gasPrice *= 100;
    prices.other = other;
    expensive.setGasPrices(prices, BASECHAIN);
    testing.setConfig(expensive);
    val failed = cursor.executeTill<AskToTransferTracked>({ to: minter.getWalletAddress(
            manager.address,
        ) });
    expect(failed).toHaveFailedTx<AskToTransferTracked>({ to: minter.getWalletAddress(
            manager.address,
        ), exitCode: 48 });
    testing.setConfig(original);
    cursor.executeAllRemaining();
    cursor.close();
    expect(manager.getFeeBalance(alice, false).tokenAmount).toEqual(6000);
    expect(manager.getFeeBalance(bob, false).tokenAmount).toEqual(3000);
    expect(manager.getSplitterData().creatorTokens).toEqual(10000);
    manager.sendTransferFailed(
        minter.getWalletAddress(manager.address),
        1,
        6000,
        { value: ton("0.05") },
    );
    expect(manager.getFeeBalance(alice, false).tokenAmount).toEqual(6000);
    manager.sendClaimSplitFees(alice, 10, false, { value: ton("0.2") });
    expect(
        JettonWallet.fromAddress(minter.getWalletAddress(alice)).getWalletData().jettonBalance,
    ).toEqual(6000);
    expect(manager.getFeeBalance(bob, false).tokenAmount).toEqual(3000);
    expect(manager.getSplitterData().pending.isEmpty()).toEqual(true);
}

get fun `test v2: eight beneficiaries receive and claim all curve fees`() {
    val creator = testing.treasury("eight-deployer").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: creator, nextAdmin: null, treasury: creator, totalLaunches: 0, feesBalance: 0 });
    master.deploy(creator, { value: ton("2") });
    var shares: map<address, uint16> = [];
    var i = 0;
    repeat (8) {
        shares.set(testing.treasury(format("eight-beneficiary-{}", i)).address, 1250);
        i += 1;
    }
    val o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: 0,
        minDevTokens: 0,
        beneficiaries: FeeBeneficiaries { shares }.toCell(),
    };
    master.sendCreateLaunch(
        creator,
        1,
        beginCell().endCell(),
        8300,
        o,
        { value: ton("1") },
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(creator, 8300, o));
    val manager = FeeSplitterV2.fromAddress(curve.getFeeManagerAddress());
    curve.sendBuyJettons(creator, 2, 0, { value: ton("10.05") });
    curve.sendFlushCreatorFees(creator, 3, { value: ton("0.05") });
    expect(curve.getLaunchProgress().creatorAccrued).toEqual(0);
    expect(manager.getSplitterData().creatorTon).toEqual(ton("0.1"));
    var item = shares.findFirst();
    while (item.isFound) {
        val recipient = item.getKey();
        expect(manager.getFeeBalance(recipient, false).tonAmount).toEqual(ton("0.0125"));
        val claim = manager.sendClaimSplitFees(recipient, 4, false, { value: ton("0.2") });
        expect(
            claim,
        ).toHaveSuccessfulTx<ReturnExcessesBack>({ from: manager.address, to: recipient, value: ton("0.0125") });
        item = shares.iterateNext(item);
    }
    expect(manager.getSplitterData().creatorTon).toEqual(0);
}
