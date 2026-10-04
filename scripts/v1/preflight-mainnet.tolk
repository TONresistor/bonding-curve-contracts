import "@acton/io"
import "@acton/emulation/scripts"
import "utils/common"

fun main() {
    val addr = promptJettonAddressRequired(
        "WALLET_ADDRESS",
        "Wallet's real mainnet address (UQ... or EQ...)",
    );
    println("Address:                {}", addr);
    println("Workchain:              {}", addr.getWorkchain());
    if (addr.getWorkchain() != 0) {
        println("RED: address is not in workchain 0. TEP-74 derivation will be wrong.");
        return;
    }

    val balance = scripts.fetchAccountBalance(addr);
    println("Mainnet balance:        {} nano-TON ({:ton})", balance, balance);

    val minDeployBalance: coins = ton("3");
    if (balance < minDeployBalance) {
        println(
            "RED: balance < {:ton}. Top up before broadcasting master-deploy-mainnet.",
            minDeployBalance,
        );
        return;
    }

    val minFullPhase1Balance: coins = ton("5");
    if (balance < minFullPhase1Balance) {
        println(
            "AMBER: balance < {:ton}. Enough for master deploy alone, but may run short for full Phase 1 (deploy + verify + 1 launch + a few buys + flush + withdraw).",
            minFullPhase1Balance,
        );
    } else {
        println("GREEN: balance is sufficient for full Phase 1 ops (~5 TON).");
    }

    println("");
    println("Next step: acton run master-deploy-mainnet");
}
