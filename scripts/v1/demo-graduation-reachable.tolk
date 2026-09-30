import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurve.gen"
import "@wrappers/BondingCurveMaster.gen"
import "@wrappers/utils"
import "@contracts/v1/bonding-config"
import "utils/common"

fun main() {
    val deployer = scripts.wallet("deployer");
    val creator = scripts.wallet("creator");
    val buyer = scripts.wallet("buyer");

    println("=== Graduation reachability proof ===");
    println("Constants:");
    println("  V (virtualTon)   = {} nano (= 20 TON)", VIRTUAL_TON_RESERVE_INIT);
    println("  S (totalSupply)  = {} nano (= 1B)", TOTAL_SUPPLY);
    println("  DEX (dexReserve) = {} nano (= 1M)", DEX_RESERVE_SUPPLY);
    println("  T (threshold)    = {} nano (= 20000 TON)", GRADUATION_THRESHOLD_TON);
    println("");

    val master = BondingCurveMaster.fromStorage({
        admin: deployer.address,
        nextAdmin: null,
        treasury: deployer.address,
        totalLaunches: 0,
        feesBalance: 0,
    });
    master.sendDeploy(deployer.address, { value: ton("1") }).waitForFirstTransaction();

    val meta: JettonMetadata = {
        name: "Reachability Test",
        symbol: "REACH",
        description: "Proof script",
        image: "x",
        decimals: "9",
    };
    val metadataCell = buildJettonMetadataCell(meta);
    val salt = 42 as uint64;
    val curveAddr = master.getLaunchAddress(creator.address, salt);
    master
        .sendCreateLaunch(
            creator.address,
            1,
            metadataCell,
            salt,
            { value: ton("0.6"), bounce: false },
        )
        .waitForTrace();

    val curve = BondingCurve.fromAddress(curveAddr);
    val initial = curve.getCurveData();
    println(
        "Initial curve: realTon={}, curveJettons={}, state={}",
        initial.realTonReserve,
        initial.curveJettonBalance,
        initial.state,
    );
    println("");

    var buys: int = 0;
    var totalSent: coins = 0;
    var keepGoing: bool = true;
    while (keepGoing && buys < 250) {
        val before = curve.getCurveData();
        val res = curve.sendBuyJettons(
            buyer.address,
            (buys + 1000) as uint64,
            0,
            { value: ton("100"), bounce: true },
        );
        res.waitForTrace();
        val after = curve.getCurveData();
        if (after.realTonReserve == before.realTonReserve) {
            keepGoing = false;
        } else {
            totalSent += ton("100");
            buys += 1;
        }
    }

    keepGoing = true;
    while (keepGoing && buys < 350) {
        val before = curve.getCurveData();
        val res = curve.sendBuyJettons(
            buyer.address,
            (buys + 2000) as uint64,
            0,
            { value: ton("1"), bounce: true },
        );
        res.waitForTrace();
        val after = curve.getCurveData();
        if (after.realTonReserve == before.realTonReserve) {
            keepGoing = false;
        } else {
            totalSent += ton("1");
            buys += 1;
        }
    }

    keepGoing = true;
    while (keepGoing && buys < 500) {
        val before = curve.getCurveData();
        val res = curve.sendBuyJettons(
            buyer.address,
            (buys + 3000) as uint64,
            0,
            { value: ton("0.06"), bounce: true },
        );
        res.waitForTrace();
        val after = curve.getCurveData();
        if (after.realTonReserve == before.realTonReserve) {
            keepGoing = false;
        } else {
            totalSent += ton("0.06");
            buys += 1;
        }
    }

    val final = curve.getCurveData();
    println("After {} successful 100-TON buys ({} TON total):", buys, totalSent);
    println("  realTon       = {} nano", final.realTonReserve);
    println("  curveJettons  = {} nano", final.curveJettonBalance);
    println("  feeAccrued    = {} nano", final.feeAccrued);
    println("");
    println(
        "Threshold check (realTon >= {}): {}",
        GRADUATION_THRESHOLD_TON,
        final.realTonReserve >= GRADUATION_THRESHOLD_TON,
    );
    println(
        "Floor check (curveJettons == {}): {}",
        DEX_RESERVE_SUPPLY,
        final.curveJettonBalance == DEX_RESERVE_SUPPLY,
    );
    println("");

    println("Attempting Graduate ...");
    val gradRes = curve.sendGraduate(
        deployer.address,
        9999,
        { value: ton("1.2"), bounce: true },
    );
    gradRes.waitForTrace();

    val postGrad = curve.getCurveData();
    println("Post-Graduate state: {} (1=Trading, 2=Graduating, 3=Migrated)", postGrad.state);
    println("");

    if (postGrad.state == 1 as uint8) {
        println("VERDICT: Graduate REJECTED. Curve still in TRADING.");
        println("         REGRESSION — v0.2.0 fix has been broken; investigate.");
    } else {
        println("VERDICT: Graduate ACCEPTED. State == {} (3=Migrated).", postGrad.state);
        println("         Reachability OK — v0.2.0 fix working as expected.");
    }
}
