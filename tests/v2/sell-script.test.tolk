import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWalletV2.gen"
import "@contracts/v2/bonding-storage"
import "../../scripts/v2/sell-jettons"

get fun `test v2: sell script funds protected wallet and executes quote`() {
    val name = "sell-script-owner";
    val owner = testing.treasury(name).address;
    val master = BondingCurveMasterV2.fromStorage({ admin: owner, nextAdmin: null, treasury: owner, totalLaunches: 0, feesBalance: 0 });
    master.deploy(owner, { value: ton("2") });
    val o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("100"),
        minDevTokens: 0,
    };
    master.sendCreateLaunch(
        owner,
        1,
        beginCell().endCell(),
        100,
        o,
        { value: ton("101") },
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner, 100, o));
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    val wallet = JettonWalletV2.fromAddress(minter.getWalletAddress(owner));
    val before = wallet.getWalletData().jettonBalance;
    val amount = before / 3;
    sellJettons(name, curve.address, amount, curve.getQuoteSell(amount));
    expect(wallet.getWalletData().jettonBalance).toEqual(before - amount);
    expect(curve.getCurveData().realTonReserve < ton("98")).toEqual(true);
}
