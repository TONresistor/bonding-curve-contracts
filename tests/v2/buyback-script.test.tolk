import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/BuybackBurnV2.gen"
import "@contracts/v2/bonding-storage"
import "migration"
import "../../scripts/v2/buyback"

get fun `test buyback: script prepares claim execute and inspect`() {
    loadV2Libraries();
    testing.setNow(V2_TIME);
    val name = "buyback-script";
    val owner = testing.treasury(name).address;
    val master = BondingCurveMasterV2.fromStorage({ admin: owner, nextAdmin: null, treasury: owner, totalLaunches: 0, feesBalance: 0 });
    master.deploy(owner, { value: ton("2") });
    val options = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("3000"),
        minDevTokens: 0,
        buybackBurn: true,
    };
    master.sendCreateLaunch(
        owner,
        0,
        beginCell().endCell(),
        66,
        options,
        { value: ton("3001") },
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner, 66, options));
    runBuyback(name, curve.address, 1);
    curve.sendFlushCreatorFees(owner, 1, { value: ton("0.05") });
    runBuyback(name, curve.address, 2);
    runBuyback(name, curve.address, 3);
    runBuyback(name, curve.address, 4);
    runBuyback(name, curve.address, 0);
    expect(
        BuybackBurnV2.fromAddress(curve.getBuybackAddress()!).getBuybackData().burned > 0,
    ).toEqual(true);
}
