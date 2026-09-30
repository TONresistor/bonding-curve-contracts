import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurve.gen"
import "@contracts/v1/bonding-config"
import "@contracts/v1/bonding-messages"
import "@contracts/v1/bonding-storage"
import "@contracts/v1/messages"

fun plantCurveSimple(): (BondingCurve, address, address) {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val creator = testing.treasury("h2-creator");
    val saltUsed = 1052 as uint64;

    val cfg: LaunchConfig = {
        master: masterAddr,
        creator: creator.address,
        salt: saltUsed,
        curveSupply: CURVE_SUPPLY,
        dexReserveSupply: DEX_RESERVE_SUPPLY,
        graduationThreshold: GRADUATION_THRESHOLD_TON,
    };
    val planted: BondingCurveStorage = {
        state: CURVE_STATE_TRADING,
        jettonMinter: minterAddr,
        virtualTonReserve: VIRTUAL_TON_RESERVE_INIT,
        realTonReserve: ton("100"),
        curveJettonBalance: TOTAL_SUPPLY - ton("1000"),
        feeAccrued: 0,
        migrationReserve: 0,
        config: cfg.toCell(),
        dropAdminPending: false,
        pendingBuyTonInNet: 0,
    };
    val curve = BondingCurve.fromStorage(planted);
    val funder = testing.treasury("h2-funder");
    net.send(
        funder.address,
        createMessage({
            bounce: false,
            dest: { stateInit: curve.stateInit! },
            value: ton("5"),
            body: TopUpTons {},
        }),
    );
    return (curve, masterAddr, creator.address);
}

get fun `test BUG H2: DepositProtocolFees TVM-truncated bounce loses feeAccrued`() {
    val (curve, masterAddr, creatorAddr) = plantCurveSimple();
    val bouncedAmount = ton("3");

    val fullCell = DepositProtocolFees {
        queryId: 0,
        amount: bouncedAmount,
        creator: creatorAddr,
        salt: 1052,
    }.toCell();
    var fullSlice = fullCell.beginParse();
    val truncatedBody = beginCell()
        .storeUint(0xffffffff, 32)
        .storeSlice(fullSlice.loadBits(256))
        .endCell();

    val bouncedMsg = createMessage({
        bounce: false,
        value: bouncedAmount,
        dest: curve.address,
        body: truncatedBody,
    }).bounced();

    testing.processSingleTraceStep(masterAddr, bouncedMsg);

    val after = curve.getCurveData();

    expect(after.feeAccrued).toEqual(bouncedAmount);
}
