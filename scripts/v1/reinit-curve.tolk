import "@acton/fmt"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurve.gen"
import "@wrappers/BondingCurveMaster.gen"
import "utils/common"

fun main() {
    val admin = promptJettonWallet("ADMIN", "Select admin ActonWallet");
    val masterAddr = promptJettonAddressRequired("MASTER_ADDRESS", "BondingCurveMaster address");
    val master = BondingCurveMaster.fromAddress(masterAddr);

    val data = master.getMasterData();
    if (data.admin != admin.address) {
        println("ABORT: caller {} is not the master admin {}", admin.address, data.admin);
        return;
    }

    val creator = promptJettonAddressRequired("CREATOR", "Original launch creator address");
    val saltStr = promptJettonString("LAUNCH_SALT", "Original salt (uint64)", "1");
    val salt = parseInt(saltStr) as uint64;

    val curveAddr = master.getLaunchAddress(creator, salt);
    val curve = BondingCurve.fromAddress(curveAddr);
    val curveData = curve.getCurveData();
    println("Stuck curve state:");
    println("  address:                {}", curveAddr);
    println("  state:                  {}  (expect 0=Initializing)", curveData.state);
    println("  jettonMinter:           {}  (expect null)", curveData.jettonMinter);

    if (curveData.state != 0 as uint8) {
        println(
            "ABORT: curve state is {} — not stuck. Reinit only works on state==0.",
            curveData.state,
        );
        return;
    }
    if (curveData.jettonMinter != null) {
        println("ABORT: jettonMinter is set — init mint already happened.");
        return;
    }

    val metadata = buildJettonMetadataCell(promptJettonMetadata("Reinit recovery"));

    val res = master.sendReinitializeCurve(
        admin.address,
        0,
        creator,
        salt,
        metadata,
        { value: ton("0.6"), bounce: true },
    );
    res.waitForFirstTransaction();

    val after = curve.getCurveData();
    println("=== ReinitializeCurve submitted ===");
    println("Curve:                  {}", curveAddr);
    println("state: {} -> {}", curveData.state, after.state);
    println("jettonMinter: {} -> {}", curveData.jettonMinter, after.jettonMinter);
    println("");
    println("If state==1 (Trading) and jettonMinter is set, recovery succeeded.");
    println("Otherwise re-query in 30s — the mint chain is still in flight.");
}
