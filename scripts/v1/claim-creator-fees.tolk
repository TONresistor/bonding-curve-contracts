import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@contracts/v1/bonding-messages"
import "utils/common"

fun main() {
    val creator = promptJettonWallet(
        "CREATOR",
        "Select creator ActonWallet (= CreateLaunch caller)",
    );
    val poolAddr = promptJettonAddressRequired(
        "POOL_ADDRESS",
        "DeDust CPMM v2 pool address (printed in the GraduateEvent at graduation)",
    );
    val payoutTo = promptJettonAddress("PAYOUT_TO", "Where to send fees", creator.address);

    println("Claim plan:");
    println("  pool address    = {}", poolAddr);
    println("  caller (signer) = {}", creator.address);
    println("  payout target   = {}", payoutTo);
    println("");

    val claimBody: DedustClaimCreatorFees = {
        queryId: 0,
        to: payoutTo,
        excessesTo: creator.address,
    };
    val claimMsg = createMessage({
        bounce: true,
        value: ton("0.15"),
        dest: poolAddr,
        body: claimBody,
    });
    val res = net.send(creator.address, claimMsg);
    res.waitForFirstTransaction();

    println("=== ClaimCreatorFees submitted ===");
    println("Pool:           {}", poolAddr);
    println("Payout to:      {}", payoutTo);
    println("");
    println("Check the payout target balance in ~30s — TON arrives first, then jettons");
    println("(via TEP-74 transfer chain) typically within 60s.");
}
