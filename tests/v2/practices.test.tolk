import "@acton/emulation/config"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@gen/JettonWalletV2.code"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@contracts/v1/fees-management"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/wallet-fees"
import "@contracts/v2/wallet-messages"
import "@contracts/v2/wallet-storage"
import "migration"

fun practiceOptions(): LaunchOptions {
    return {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("100"),
        minDevTokens: 0,
    };
}

fun practiceMaster(owner: address, treasury: address): BondingCurveMasterV2 {
    val master = BondingCurveMasterV2.fromStorage({ admin: owner, nextAdmin: null, treasury, totalLaunches: 0, feesBalance: 0 });
    master.deploy(owner, { value: ton("2") });
    return master;
}

fun practicePending(owner: address): (BondingCurveV2, JettonMinterV2, TxCursor) {
    val master = practiceMaster(owner, owner);
    val options = practiceOptions();
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner, 1, options));
    val cursor = v2Cursor(
        owner,
        master.address,
        ton("101"),
        CreateLaunch {
            queryId: 1,
            metadata: beginCell().endCell(),
            salt: 1,
            options: options.toCell(),
        },
    );
    cursor.executeTill<InitializeCurve>({ to: curve.address });
    return (curve, JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!), cursor);
}

get fun `test v2: invalid treasury is rejected at update and launch including recovery`() {
    val owner = testing.treasury("treasury-guard").address;
    val incompatible = testing.treasury("treasury-masterchain", -1).address;
    val master = practiceMaster(owner, owner);
    expect(
        master.sendChangeTreasury(owner, 1, incompatible, { value: ton("0.1") }),
    ).toHaveFailedTx<ChangeTreasury>({ to: master.address, exitCode: 333 });
    expect(master.getMasterData().treasury).toEqual(owner);
    val invalid = practiceMaster(owner, incompatible);
    val options = practiceOptions();
    expect(
        invalid.sendCreateLaunch(
            owner,
            2,
            beginCell().endCell(),
            2,
            options,
            { value: ton("101") },
        ),
    ).toHaveFailedTx<CreateLaunch>({ to: invalid.address, exitCode: 333 });
    expect(invalid.getMasterData().totalLaunches).toEqual(0);
    expect(invalid.getMasterData().feesBalance).toEqual(0);
    expect(
        invalid.sendReinitializeCurve(
            owner,
            3,
            owner,
            2,
            beginCell().endCell(),
            options,
            { value: ton("1") },
        ),
    ).toHaveFailedTx<ReinitializeCurve>({ to: invalid.address, exitCode: 333 });
    invalid.sendChangeTreasury(owner, 4, owner, { value: ton("0.1") });
    invalid.sendCreateLaunch(
        owner,
        5,
        beginCell().endCell(),
        2,
        options,
        { value: ton("101") },
    );
    expect(
        BondingCurveV2.fromAddress(invalid.getLaunchAddress(owner, 2, options)).getState(),
    ).toEqual(CURVE_STATE_TRADING);
}

get fun `test v2: admin drop clears pending and fee flush does not repeat it`() {
    val owner = testing.treasury("admin-confirmation").address;
    val (curve, minter, cursor) = practicePending(owner);
    cursor.executeAllRemaining();
    cursor.close();
    expect(minter.getJettonData().adminAddress == null).toEqual(true);
    expect(curve.getCurveData().dropAdminPending).toEqual(false);
    val trace = curve.sendFlushFees(owner, 2, { value: ton("0.1") });
    expect(trace.findTransaction<DropMinterAdmin>({ to: minter.address }) == null).toEqual(true);
}

get fun `test v2: delayed admin acknowledgment can be retried without reopening rights`() {
    val owner = testing.treasury("admin-delayed").address;
    val (curve, minter, cursor) = practicePending(owner);
    cursor.executeTill<DropMinterAdmin>({ to: minter.address });
    expect(minter.getJettonData().adminAddress == null).toEqual(true);
    expect(curve.getCurveData().dropAdminPending).toEqual(true);
    expect(
        curve.sendMinterAdminDropped(owner, 3, { value: ton("0.05") }),
    ).toHaveFailedTx<MinterAdminDropped>({ to: curve.address, exitCode: 73 });
    val retry = curve.sendFlushFees(owner, 4, { value: ton("0.1") });
    expect(retry).toHaveSuccessfulTx<DropMinterAdmin>({ to: minter.address });
    expect(curve.getCurveData().dropAdminPending).toEqual(false);
    cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getCurveData().dropAdminPending).toEqual(false);
    expect(minter.getJettonData().mintable).toEqual(false);
}

get fun `test v2: failed admin drop stays pending until a funded retry succeeds`() {
    val owner = testing.treasury("admin-retry").address;
    val (curve, minter, cursor) = practicePending(owner);
    cursor.executeTill<MintDelivered>({ from: minter.getWalletAddress(owner), to: curve.address });
    val original = testing.getConfig();
    var expensive = original;
    var prices = expensive.getGasPrices(BASECHAIN);
    var other = prices.other;
    other.gasPrice *= 1000;
    prices.other = other;
    expensive.setGasPrices(prices, BASECHAIN);
    testing.setConfig(expensive);
    val failed = cursor.executeTill<DropMinterAdmin>({ to: minter.address });
    expect(
        failed.findTransaction<DropMinterAdmin>({ to: minter.address, success: false }) != null,
    ).toEqual(true);
    testing.setConfig(original);
    cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getCurveData().dropAdminPending).toEqual(true);
    expect(minter.getJettonData().adminAddress).toEqual(curve.address);
    curve.sendFlushFees(owner, 5, { value: ton("0.1") });
    expect(curve.getCurveData().dropAdminPending).toEqual(false);
    expect(minter.getJettonData().adminAddress == null).toEqual(true);
}

get fun `test v2: wallet reserve covers compiled code maximum data and actual five year storage`() {
    val owner = testing.treasury("storage-v2").address;
    val recipient = testing.treasury("storage-recipient").address;
    val (curve, minter, cursor) = practicePending(owner);
    cursor.executeAllRemaining();
    cursor.close();
    val (codeCells, codeBits, _) = jettonWalletV2CompiledCode().calculateSizeStrict(1000);
    val (dataCells, dataBits, _) = WalletStorageV2 {
        jettonBalance: (1 << 120) - 1,
        ownerAddress: owner,
        minterAddress: minter.address,
        protection: beginCell().storeBool(true).toSlice(),
    }
    .toCell()
    .calculateSizeStrict(1000);
    expect(codeCells + dataCells + 1 <= V2_WALLET_STORAGE_CELLS).toEqual(true);
    expect(codeBits + dataBits + 256 <= V2_WALLET_STORAGE_BITS).toEqual(true);
    val reserve = walletStorageReserve();
    val wallets: array<address> = [
        minter.getWalletAddress(owner),
        minter.getWalletAddress(curve.address),
    ];
    var i = 0;
    repeat (2) {
        expect(
            testing.getAccountStorageFee(wallets.get(i), MIN_STORAGE_DURATION)! <= reserve,
        ).toEqual(true);
        expect(testing.getAccountBalance(wallets.get(i)) >= reserve).toEqual(true);
        i += 1;
    }
    net.send(
        owner,
        createMessage({ bounce: true, dest: minter.getWalletAddress(
                owner,
            ), value: ton("0.1"), body: AskToTransfer {
                queryId: 6,
                jettonAmount: 1000,
                transferRecipient: recipient,
                sendExcessesTo: owner,
                customPayload: null,
                forwardTonAmount: 0,
                forwardPayload: beginCell().storeBool(false).toSlice(),
            } }),
    );
    expect(v2Tokens(minter, recipient)).toEqual(1000);
    expect(testing.getAccountBalance(minter.getWalletAddress(recipient)) >= reserve).toEqual(true);
    expect(
        testing.getAccountStorageFee(minter.getWalletAddress(recipient), MIN_STORAGE_DURATION)! <=
            reserve,
    ).toEqual(true);
}
