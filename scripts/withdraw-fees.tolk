import "@acton/fmt"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurveMaster.gen"
import "utils/common"

fun main() {
    val admin = promptJettonWallet("ADMIN", "Select admin ActonWallet");
    val masterAddr = promptJettonAddressRequired("MASTER_ADDRESS", "BondingCurveMaster address");
    val master = BondingCurveMaster.fromAddress(masterAddr);

    val data = master.getMasterData();
    println("Master state:");
    println("  admin:              {}", data.admin);
    println("  treasury:           {}", data.treasury);
    println("  feesBalance:        {} nano-TON", data.feesBalance);

    if (data.admin != admin.address) {
        println("ABORT: caller {} is not the master admin {}", admin.address, data.admin);
        return;
    }
    if (data.feesBalance == 0) {
        println("ABORT: feesBalance is zero. Run flush-fees on individual curves first.");
        return;
    }

    val amountStr = promptJettonString(
        "WITHDRAW_AMOUNT",
        "Amount in nano-TON (blank = full feesBalance)",
        format("{}", data.feesBalance),
    );
    val amount = parseInt(amountStr) as coins;
    if (amount <= 0 || amount > data.feesBalance) {
        println("ABORT: amount {} is invalid (max withdrawable = {})", amount, data.feesBalance);
        return;
    }

    val res = master.sendWithdrawProtocolFees(
        admin.address,
        0,
        amount,
        { value: ton("0.05"), bounce: true },
    );
    res.waitForFirstTransaction();

    val after = master.getMasterData();
    println("=== WithdrawProtocolFees submitted ===");
    println("Withdrawn:              {} nano-TON", amount);
    println("feesBalance: {} -> {}", data.feesBalance, after.feesBalance);
    println("Treasury:               {}", after.treasury);
}
