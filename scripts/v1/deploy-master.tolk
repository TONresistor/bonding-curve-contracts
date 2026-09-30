import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurveMaster.gen"
import "@wrappers/utils"
import "utils/common"

fun main() {
    val deployer = promptJettonWallet("DEPLOYER", "Select deployer ActonWallet");
    val admin = promptJettonAddress("MASTER_ADMIN", "Master admin address", deployer.address);
    val treasury = promptJettonAddress("MASTER_TREASURY", "Treasury (1% fees)", deployer.address);

    val master = BondingCurveMaster.fromStorage({
        admin,
        nextAdmin: null,
        treasury,
        totalLaunches: 0,
        feesBalance: 0,
    });

    val res = master.sendDeploy(deployer.address, { value: ton("1") });
    res.waitForFirstTransaction();

    println("=== BondingCurveMaster deployed ===");
    println("Address:  {}", master.address);
    println("Admin:    {}", admin);
    println("Treasury: {}", treasury);
}
