import "@acton/io"
import "@acton/emulation/config"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/tlb/maybe"
import "@acton/types/message"
import "@acton/types/transaction"
import "@contracts/bonding-config"
import "@contracts/bonding-messages"
import "@contracts/errors"
import "@contracts/messages"
import "@wrappers/BondingCurve.gen"
import "@wrappers/BondingCurveMaster.gen"
import "@wrappers/JettonMinter.gen"
import "@wrappers/JettonWallet.gen"
import "@wrappers/utils"
import "test-utils"

fun verifyBuyDeliveryBudget(gasMultiplier: int) {
    val admin = testing.treasury("delivery-admin");
    val buyer = testing.treasury("delivery-buyer");
    val master = BondingCurveMaster.fromStorage({
        admin: admin.address,
        nextAdmin: null,
        treasury: admin.address,
        totalLaunches: 0,
        feesBalance: 0,
    });
    master.sendDeploy(admin.address, { value: ton("1") });
    master.sendCreateLaunch(
        admin.address,
        1,
        buildTestMetadata("ipfs://delivery"),
        9001,
        { value: ton("3"), bounce: true },
    );
    val curve = BondingCurve.fromAddress(master.getLaunchAddress(admin.address, 9001));
    val before = curve.getCurveData();
    val minter = JettonMinter.fromAddress(before.jettonMinter!);
    val wallet = JettonWallet.fromAddress(minter.getWalletAddress(buyer.address));

    // Gas-price stress test.
    var config = testing.getConfig();
    var prices = config.getGasPrices(BASECHAIN);
    var extended = prices.other;
    extended.gasPrice *= gasMultiplier;
    prices.other = extended;
    config.setGasPrices(prices, BASECHAIN);
    expect(testing.setConfig(config)).toEqual(true);

    val result = curve.sendBuyJettons(buyer.address, 2, 0, { value: ton("10"), bounce: true });
    println(result);
    val after = curve.getCurveData();
    println(
        "gasMultiplier={} realReserve={} buyerWalletDeployed={}",
        gasMultiplier,
        after.realTonReserve,
        testing.isDeployed(wallet.address),
    );
    if (gasMultiplier == 1) {
        expect(result).toHaveSuccessfulTx<BuyJettons>({ to: curve.address });
        expect(wallet.getWalletData().jettonBalance).toEqual(
            before.curveJettonBalance - after.curveJettonBalance,
        );
    } else {
        expect(
            result,
        ).toHaveFailedTx<BuyJettons>({ to: curve.address, exitCode: Errors.NotEnoughGas });
        val rejected = result.findTransaction<BuyJettons>({ to: curve.address })!;
        val description = rejected.description.load();
        assert (description is TlbTransOrd) throw 1000;
        assert (description.computePh is TlbTrComputeVm) throw 1001;
        val bounce = description.bounce.unwrap();
        assert (bounce is TlbTrBounceOk) throw 1002;
        val refund = result.findTransaction({ from: curve.address, to: buyer.address, bounced: true })!;
        val incoming = refund.loadInMsg<RemainingBitsAndRefs>();
        assert (incoming.info is TlbInternalMessage) throw 1003;
        expect(incoming.info.value.grams).toEqual(
            ton("10") - description.computePh.gasFees - bounce.msgFees - bounce.fwdFees,
        );
        expect(after.realTonReserve).toEqual(before.realTonReserve);
        expect(after.curveJettonBalance).toEqual(before.curveJettonBalance);
        expect(after.feeAccrued).toEqual(before.feeAccrued);
        expect(after.migrationReserve).toEqual(before.migrationReserve);
        expect(testing.isDeployed(wallet.address)).toEqual(false);
    }
}

get fun `test buy delivery: current gas prices deliver tokens`() {
    verifyBuyDeliveryBudget(1);
}

get fun `test buy delivery: insufficient transfer budget rejects before charging buyer`() {
    verifyBuyDeliveryBudget(100);
}
