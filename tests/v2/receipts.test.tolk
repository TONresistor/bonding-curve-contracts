import "@acton/build"
import "@acton/io"
import "@acton/emulation/config"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/big_array"
import "@acton/types/transaction"
import "@wrappers/FeeSplitterV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWallet.gen"
import "@contracts/v1/jetton-utils"
import "@contracts/v1/messages"
import "@contracts/v2/fee-storage"
import "@contracts/v2/wallet-messages"

fun receiptTest() {
    val owner = testing.treasury("receipt-owner");
    val collector = testing.treasury("receipt-collector");
    val protocol = testing.treasury("receipt-protocol");
    val attacker = testing.treasury("receipt-attacker");
    val minter = JettonMinterV2.fromStorage({ totalSupply: 0, adminAddress: owner.address, nextAdminAddress: null, metadata: beginCell().endCell() });
    net.send(
        owner.address,
        createMessage({ bounce: false, dest: {
                stateInit: minter.stateInit!,
            }, value: ton("1"), body: TopUpTons {} }),
    );
    val splitter = FeeSplitterV2.fromStorage({ config: SplitterConfig {
            collector: collector.address,
            minter: minter.address,
            recipients: FeeRecipients {
                creator: owner.address,
                protocol: protocol.address,
                creatorBps: 100,
            }.toCell(),
        }.toCell(), creatorTon: 0, protocolTon: 0, creatorTokens: 0, protocolTokens: 0, nextId: 1, pending: [] });
    splitter.deploy(owner.address, { value: ton("1") });
    minter.sendMintNewJettons(
        owner.address,
        1,
        collector.address,
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
        collector.address,
        createMessage({ bounce: true, dest: minter.getWalletAddress(
                collector.address,
            ), value: ton("0.4"), body: AskToTransfer {
                queryId: 2,
                jettonAmount: 11000,
                transferRecipient: splitter.address,
                sendExcessesTo: collector.address,
                customPayload: null,
                forwardTonAmount: ton("0.15"),
                forwardPayload: beginCell().storeUint(0, 1).toSlice(),
            } }),
    );
    expect(splitter.getSplitterData().creatorTokens).toEqual(10000);
    val cursor = testing.createTraceIterationCursor(
        owner.address,
        createMessage({ bounce: true, dest: splitter.address, value: ton("0.2"), body: ClaimSplitFees {
                queryId: 3,
                protocol: false,
            } }),
    );
    cursor.executeN(1);
    expect(splitter.getSplitterData().pending.exists(1)).toEqual(true);
    val attackerWallet = calcDeployedJettonWallet(
        attacker.address,
        minter.address,
        build("JettonWalletV2"),
    );
    net.send(
        attacker.address,
        createMessage({ bounce: false, dest: attackerWallet, value: ton("0.1"), body: TopUpTons {} }),
    );
    // Send a standard receipt with the pending payout's id.
    net.send(
        attacker.address,
        createMessage({ bounce: true, dest: attackerWallet.calculateAddress(), value: ton("0.1"), body: AskToTransfer {
                queryId: 1,
                jettonAmount: 0,
                transferRecipient: owner.address,
                sendExcessesTo: splitter.address,
                customPayload: null,
                forwardTonAmount: 0,
                forwardPayload: beginCell().storeUint(0, 1).toSlice(),
            } }),
    );
    expect(splitter.getSplitterData().pending.exists(1)).toEqual(true);
    val original = testing.getConfig();
    var expensive = original;
    var prices = expensive.getGasPrices(BASECHAIN);
    var other = prices.other;
    other.gasPrice *= 100;
    prices.other = other;
    expensive.setGasPrices(prices, BASECHAIN);
    testing.setConfig(expensive);
    val failed = cursor.executeTill<AskToTransferTracked>({ to: minter.getWalletAddress(
            splitter.address,
        ) });
    expect(failed).toHaveFailedTx<AskToTransferTracked>({ to: minter.getWalletAddress(
            splitter.address,
        ), exitCode: 48 });
    testing.setConfig(original);
    cursor.executeAllRemaining();
    cursor.close();
    expect(splitter.getSplitterData().creatorTokens).toEqual(10000);
    expect(splitter.getSplitterData().pending.isEmpty()).toEqual(true);
    expect(
        JettonWallet
            .fromAddress(minter.getWalletAddress(splitter.address))
            .getWalletData()
            .jettonBalance,
    ).toEqual(11000);
    expect(
        JettonWallet
            .fromAddress(minter.getWalletAddress(owner.address))
            .getWalletData()
            .jettonBalance,
    ).toEqual(0);
    // A duplicate failure must not credit the balance again.
    splitter.sendTransferFailed(
        minter.getWalletAddress(splitter.address),
        1,
        10000,
        { value: ton("0.05") },
    );
    expect(splitter.getSplitterData().creatorTokens).toEqual(10000);
    splitter.sendClaimSplitFees(owner.address, 4, false, { value: ton("0.2") });
    expect(
        JettonWallet
            .fromAddress(minter.getWalletAddress(owner.address))
            .getWalletData()
            .jettonBalance,
    ).toEqual(10000);
    expect(splitter.getSplitterData().creatorTokens).toEqual(0);
    expect(splitter.getSplitterData().pending.isEmpty()).toEqual(true);
}

get fun `test v2: forged excess cannot erase pending claim before first-hop failure`() {
    receiptTest();
}
