import "@stdlib/strings"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurveMasterV2.gen"
import "@contracts/v2/bonding-dedust"
import "@contracts/v2/bonding-math"
import "@contracts/v2/bonding-storage"

fun main(
    walletName: string,
    masterAddress: address,
    metadataUri: string,
    salt: uint64,
    supplyTokens: int,
    creatorFeeBps: uint16,
    devBuyNano: coins,
    minDevTokens: coins,
) {
    val wallet = scripts.wallet(walletName);
    val options = LaunchOptions {
        supply: supplyTokens * 1000000000,
        creatorFeeBps,
        devBuyAmount: devBuyNano,
        minDevTokens,
    };
    validateLaunchOptions(options);
    println("Effective fees (parts per billion): {}", effectiveFeeRates(creatorFeeBps));
    val metadata = beginCell().storeUint(1, 8).storeString(metadataUri).endCell();
    val master = BondingCurveMasterV2.fromAddress(masterAddress);
    master
        .sendCreateLaunch(
            wallet.address,
            0,
            metadata,
            salt,
            options,
            { value: devBuyNano + ton("1"), bounce: true },
        )
        .waitForFirstTransaction();
    println(
        "Launch requested; verify completion at curve={}",
        master.getLaunchAddress(wallet.address, salt, options),
    );
}
