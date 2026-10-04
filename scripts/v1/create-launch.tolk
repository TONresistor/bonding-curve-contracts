import "@acton/fmt"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurveMaster.gen"
import "utils/common"

fun main() {
    val creator = promptJettonWallet("CREATOR", "Select creator ActonWallet");
    val masterAddr = promptJettonAddressRequired("MASTER_ADDRESS", "BondingCurveMaster address");
    val master = BondingCurveMaster.fromAddress(masterAddr);

    val metadata = buildJettonMetadataCell(promptJettonMetadata("Bonding-curve launch"));

    val saltStr = promptJettonString("LAUNCH_SALT", "Salt (uniqueness key)", "1");
    val salt = parseInt(saltStr) as uint64;

    val res = master.sendCreateLaunch(
        creator.address,
        0,
        metadata,
        salt,
        { value: ton("2"), bounce: false },
    );
    res.waitForFirstTransaction();

    val launchAddr = master.getLaunchAddress(creator.address, salt);
    println("=== Launch created ===");
    println("Curve address: {}", launchAddr);
    println("Creator:       {}", creator.address);
    println("Salt:          {}", salt);
}
