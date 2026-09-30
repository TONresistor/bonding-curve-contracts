import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/FeeSplitterV2.gen"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/fee-storage"
import "../../scripts/v2/arguments"
import "../../scripts/v2/create-launch"

get fun `test v2: creation script passes all optional settings and beneficiaries`() {
    val name = "create-script-owner";
    val owner = testing.treasury(name).address;
    val recipient = testing.treasury("create-script-beneficiary").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: owner, nextAdmin: null, treasury: owner, totalLaunches: 0, feesBalance: 0 });
    master.deploy(owner, { value: ton("2") });
    createLaunch(
        name,
        master.address,
        "https://example.invalid/token.json",
        8400,
        1000000000,
        100,
        0,
        0,
        1000,
        8,
        ton("1"),
        ton("10"),
        [recipient],
        [10000],
    );
    var shares: map<address, uint16> = [];
    shares.set(recipient, 10000);
    val o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: 0,
        minDevTokens: 0,
        graduationThreshold: ton("1000"),
        reserveRatio: 8,
        minBuy: ton("1"),
        maxBuy: ton("10"),
        beneficiaries: FeeBeneficiaries { shares }.toCell(),
    };
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner, 8400, o));
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    expect(curve.getCurveData().virtualTonReserve).toEqual(ton("125"));
    expect(curve.getLaunchOptions().minBuy).toEqual(ton("1"));
    expect(curve.getLaunchOptions().maxBuy).toEqual(ton("10"));
    expect(FeeSplitterV2.fromAddress(curve.getFeeManagerAddress()).getBeneficiaries()).toEqual(
        shares,
    );
}

get fun `test v2: script strings accept CLI slices and native Tolk cells`() {
    val text = "https://example.invalid/metadata.json";
    val fromCli = text.beginParse() as unknown as string;
    expect(scriptString(fromCli)).toEqual(text);
    expect(scriptString(text)).toEqual(text);
}
