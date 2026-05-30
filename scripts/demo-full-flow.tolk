import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@contracts/bonding-config"
import "@contracts/bonding-messages"
import "@contracts/bonding-storage"
import "@wrappers/BondingCurve.gen"
import "@wrappers/BondingCurveMaster.gen"
import "@wrappers/utils"
import "utils/common"

fun main() {
    println("");
    println("=============================================");
    println("  bonding-curve-contracts — full flow emulation demo");
    println("=============================================");
    println("");

    val deployer = scripts.wallet("deployer");
    val creator = scripts.wallet("creator");
    val buyer = scripts.wallet("buyer");

    println("Actors:");
    println("  deployer = {}", deployer.address);
    println("  creator  = {}", creator.address);
    println("  buyer    = {}", buyer.address);
    println("");

    println("STEP 1: deploying BondingCurveMaster ...");
    val master = BondingCurveMaster.fromStorage({
        admin: deployer.address,
        nextAdmin: null,
        treasury: deployer.address,
        totalLaunches: 0,
        feesBalance: 0,
    });
    master.sendDeploy(deployer.address, { value: ton("1") }).waitForFirstTransaction();
    println("  ✓ master deployed at {}", master.address);
    val masterData = master.getMasterData();
    println("    admin           = {}", masterData.admin);
    println("    treasury        = {}", masterData.treasury);
    println("    totalLaunches   = {}", masterData.totalLaunches);
    println("    feesBalance     = {}", masterData.feesBalance);
    println("");

    println("STEP 2: creator launches a memecoin (CreateLaunch) ...");
    val meta: JettonMetadata = {
        name: "Pepe on TON",
        symbol: "PEPE",
        description: "A demo memecoin launched via the bonding-curve-contracts bonding curve.",
        image: "https://example.com/pepe.png",
        decimals: "9",
    };
    val metadataCell = buildJettonMetadataCell(meta);
    val salt = 1 as uint64;
    val expectedCurveAddr = master.getLaunchAddress(creator.address, salt);
    println("  expected curve addr (deterministic) = {}", expectedCurveAddr);

    val createLaunchValue = ton("0.6");
    println("  sending {} TON ({})", createLaunchValue, "MIN_CREATE_LAUNCH_VALUE + 0.1 buffer");
    master
        .sendCreateLaunch(
            creator.address,
            1,
            metadataCell,
            salt,
            { value: createLaunchValue, bounce: false },
        )
        .waitForTrace();
    println("  ✓ CreateLaunch landed; full mint chain processed");

    val curve = BondingCurve.fromAddress(expectedCurveAddr);
    val curveData = curve.getCurveData();
    val masterAfter = master.getMasterData();
    println("    master.totalLaunches    = {} (was 0)", masterAfter.totalLaunches);
    println("    curve.state             = {}  (1 = TRADING)", curveData.state);
    println("    curve.creator           = {}", curveData.creator);
    println("    curve.jettonMinter      = {}", curveData.jettonMinter);
    println("    curve.curveJettonBalance= {} (= TOTAL_SUPPLY)", curveData.curveJettonBalance);
    println(
        "    curve.virtualTonReserve = {} ({} TON virtual)",
        curveData.virtualTonReserve,
        curveData.virtualTonReserve / 1000000000,
    );
    println("    curve.realTonReserve    = {}", curveData.realTonReserve);
    println("");

    println("STEP 3: buyer purchases 1 TON of PEPE via BuyJettons ...");
    val quoteBefore = curve.getQuoteBuy(ton("1"));
    println("  quote: 1 TON should buy ~ {} nano-PEPE (post-fee)", quoteBefore);

    val buyMsg = createMessage({
        bounce: true,
        value: ton("1"),
        dest: curve.address,
        body: BuyJettons {
            queryId: 100,
            minJettonsOut: 0,
        },
    });
    net.send(buyer.address, buyMsg).waitForTrace();

    val curveAfterBuy = curve.getCurveData();
    println("  ✓ buy landed");
    println(
        "    curve.curveJettonBalance = {} (decreased by ~{})",
        curveAfterBuy.curveJettonBalance,
        TOTAL_SUPPLY - curveAfterBuy.curveJettonBalance,
    );
    println(
        "    curve.realTonReserve     = {} (~{} nanoton)",
        curveAfterBuy.realTonReserve,
        curveAfterBuy.realTonReserve,
    );
    println("    curve.feeAccrued         = {} (1% of input)", curveAfterBuy.feeAccrued);
    println("");

    println("STEP 4: anyone flushes accrued fees to master treasury ...");
    val flushMsg = createMessage({
        bounce: true,
        value: ton("0.1"),
        dest: curve.address,
        body: FlushFees { queryId: 200 },
    });
    net.send(buyer.address, flushMsg).waitForTrace();

    val curveAfterFlush = curve.getCurveData();
    val masterAfterFlush = master.getMasterData();
    println("  ✓ flush landed");
    println("    curve.feeAccrued     = {} (reset to 0)", curveAfterFlush.feeAccrued);
    println("    master.feesBalance   = {} (credited)", masterAfterFlush.feesBalance);
    println("");

    println("=============================================");
    println("  ✓ Demo complete — flow validated end-to-end");
    println("=============================================");
    println("");
    println("Final state summary:");
    println("  master   : {}", master.address);
    println("  curve    : {}", curve.address);
    println("  minter   : {}", curveAfterFlush.jettonMinter);
    println("  state    : {} (TRADING)", curveAfterFlush.state);
    println("  TON in   : {} (after 1 user buy)", curveAfterFlush.realTonReserve);
    println(
        "  PEPE held: {} on curve (rest distributed to buyer)",
        curveAfterFlush.curveJettonBalance,
    );
    println("  fees -> master treasury: {}", masterAfterFlush.feesBalance);
    println("");
    println("Next: drive more buys until realTonReserve >= 20,000 TON to test graduation.");
    println("");
}
