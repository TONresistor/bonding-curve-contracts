import "@stdlib/strings"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurveMasterV2.gen"
import "@contracts/v2/bonding-dedust"
import "@contracts/v2/bonding-math"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/fee-storage"
import "arguments"

fun createLaunch(
    walletName: string,
    masterAddress: address,
    metadataUri: string,
    salt: uint64,
    supplyTokens: int,
    creatorFeeBps: uint16,
    devBuyNano: coins,
    minDevTokens: coins,
    graduationTon: int = 2000,
    soldSupplyBps: uint16 = 8333,
    minBuyBps: uint16 = 0,
    maxBuyBps: uint16 = 0,
    beneficiaryWallets: array<address> = [],
    beneficiaryBps: array<uint16> = [],
    buybackBurn: bool = false,
) {
    val wallet = scripts.wallet(scriptString(walletName));
    assert (beneficiaryWallets.size() == beneficiaryBps.size()) throw 49;
    var beneficiaries: Cell<FeeBeneficiaries>? = null;
    if (beneficiaryWallets.size() > 0) {
        var shares: map<address, uint16> = [];
        var i = 0;
        while (i < beneficiaryWallets.size()) {
            val recipient = beneficiaryWallets.get(i);
            assert (!shares.exists(recipient)) throw 49;
            shares.set(recipient, beneficiaryBps.get(i));
            i += 1;
        }
        beneficiaries = FeeBeneficiaries { shares }.toCell();
    }
    val options = LaunchOptions {
        supply: supplyTokens * 1000000000,
        creatorFeeBps,
        devBuyAmount: devBuyNano,
        minDevTokens,
        graduationThreshold: graduationTon * 1000000000,
        soldSupplyBps,
        minBuyBps,
        maxBuyBps,
        beneficiaries,
        buybackBurn,
    };
    validateLaunchOptions(options);
    println("Effective fees (parts per billion): {}", effectiveFeeRates(creatorFeeBps));
    println("Launch preview: {}", previewLaunch(options));
    val metadata = beginCell().storeUint(1, 8).storeString(scriptString(metadataUri)).endCell();
    val master = BondingCurveMasterV2.fromAddress(masterAddress);
    master
        .sendCreateLaunch(
            wallet.address,
            0,
            metadata,
            salt,
            options,
            { value: minimumCreateValue(options), bounce: true },
        )
        .waitForFirstTransaction();
    println(
        "Launch requested; verify completion at curve={}",
        master.getLaunchAddress(wallet.address, salt, options),
    );
}

fun main(
    walletName: string,
    masterAddress: address,
    metadataUri: string,
    salt: uint64,
    supplyTokens: int,
    creatorFeeBps: uint16,
    devBuyNano: coins,
    minDevTokens: coins,
    graduationTon: int = 2000,
    soldSupplyBps: uint16 = 8333,
    minBuyBps: uint16 = 0,
    maxBuyBps: uint16 = 0,
    beneficiaryWallets: array<address> = [],
    beneficiaryBps: array<uint16> = [],
    buybackBurn: bool = false,
) {
    createLaunch(
        walletName,
        masterAddress,
        metadataUri,
        salt,
        supplyTokens,
        creatorFeeBps,
        devBuyNano,
        minDevTokens,
        graduationTon,
        soldSupplyBps,
        minBuyBps,
        maxBuyBps,
        beneficiaryWallets,
        beneficiaryBps,
        buybackBurn,
    );
}
