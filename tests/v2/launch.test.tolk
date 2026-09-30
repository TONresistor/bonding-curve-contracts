import "@acton/emulation/network"

import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWallet.gen"
import "@contracts/v1/bonding-config"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"

fun launchScenario(supply: coins, fee: uint16, dev: coins, salt: uint64) {
    val creator = testing.treasury("v2-creator");
    val buyer = testing.treasury("v2-buyer");
    val master = BondingCurveMasterV2.fromStorage({ admin: creator.address, nextAdmin: null, treasury: creator.address, totalLaunches: 0, feesBalance: 0 });
    master.deploy(creator.address, { value: ton("2") });
    val options = LaunchOptions {
        supply,
        creatorFeeBps: fee,
        devBuyAmount: dev,
        minDevTokens: 0,
    };
    val trace = master.sendCreateLaunch(
        creator.address,
        1,
        beginCell().endCell(),
        salt,
        options,
        { value: dev + ton("1"), bounce: true },
    );
    expect(trace).toHaveSuccessfulTx<CreateLaunch>({ to: master.address });
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(creator.address, salt, options));
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    val state = curve.getCurveData();
    val minter = JettonMinterV2.fromAddress(state.jettonMinter!);
    expect(minter.getJettonData().totalSupply).toEqual(supply);
    expect(minter.getJettonData().adminAddress).toEqual(null);
    val netDev = dev - dev / 100 - dev * fee / 10000;
    val expectedDev = supply - ton("400") * supply / (ton("400") + netDev);
    expect(state.realTonReserve).toEqual(netDev);
    if (dev > 0) {
        val wallet = JettonWallet.fromAddress(minter.getWalletAddress(creator.address));
        expect(wallet.getWalletData().jettonBalance).toEqual(expectedDev);
    }
    expect(state.curveJettonBalance).toEqual(supply - expectedDev);
    val before = curve.getLaunchProgress().creatorAccrued;
    val quote = curve.getQuoteBuy(ton("10"));
    val buy = curve.sendBuyJettons(buyer.address, 8, quote, { value: ton("10.05"), bounce: true });
    expect(buy).toHaveSuccessfulTx<BuyJettons>({ to: curve.address });
    expect(
        JettonWallet
            .fromAddress(minter.getWalletAddress(buyer.address))
            .getWalletData()
            .jettonBalance,
    ).toEqual(quote);
    expect(curve.getLaunchProgress().creatorAccrued).toEqual(before + ton("10") * fee / 10000);
    val earned = curve.getLaunchProgress().creatorAccrued;
    val claim = curve.sendClaimCurveCreatorFees(creator.address, 9, { value: ton("0.05") });
    if (earned > 0) {
        expect(
            claim,
        ).toHaveSuccessfulTx<ReturnExcessesBack>({ from: curve.address, to: creator.address, value: earned });
    }
    expect(curve.getLaunchProgress().creatorAccrued).toEqual(0);
    curve.sendClaimCurveCreatorFees(creator.address, 10, { value: ton("0.05") });
    expect(curve.getLaunchProgress().creatorAccrued).toEqual(0);
}

get fun `test v2: all fifteen presets with and without dev buy`() {
    val supplies: array<coins> = [100000000000000000, 1000000000000000000, 10000000000000000000];
    val fees: array<uint16> = [0, 10, 50, 100, 200];
    var id: uint64 = 0;
    repeat (3) {
        val supply = supplies.get(id / 10);
        var j = 0;
        repeat (5) {
            launchScenario(supply, fees.get(j), 0, id);
            id += 1;
            launchScenario(supply, fees.get(j), ton("100"), id);
            id += 1;
            j += 1;
        }
    }
}
