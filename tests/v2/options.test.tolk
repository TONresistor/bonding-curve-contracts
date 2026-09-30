import "@acton/fmt"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWallet.gen"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/fee-storage"

fun optionsMaster(): (BondingCurveMasterV2, address) {
    val owner = testing.treasury("options-owner").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: owner, nextAdmin: null, treasury: owner, totalLaunches: 0, feesBalance: 0 });
    master.deploy(owner, { value: ton("2") });
    return (master, owner);
}

fun optionsLaunch(
    master: BondingCurveMasterV2,
    owner: address,
    o: LaunchOptions,
    salt: uint64,
): BondingCurveV2 {
    val launch = master.sendCreateLaunch(
        owner,
        1,
        beginCell().endCell(),
        salt,
        o,
        { value: o.devBuyAmount + ton("1"), bounce: true },
    );
    expect(launch).toHaveSuccessfulTx<CreateLaunch>({ to: master.address });
    return BondingCurveV2.fromAddress(master.getLaunchAddress(owner, salt, o));
}

fun invalidOptions(master: BondingCurveMasterV2, owner: address, o: LaunchOptions, salt: uint64) {
    val before = master.getMasterData();
    val trace = master.sendCreateLaunch(
        owner,
        1,
        beginCell().endCell(),
        salt,
        o,
        { value: o.devBuyAmount + ton("1"), bounce: true },
    );
    expect(trace).toHaveFailedTx<CreateLaunch>({ to: master.address, exitCode: 49 });
    expect(master.getMasterData().totalLaunches).toEqual(before.totalLaunches);
    expect(master.getMasterData().feesBalance).toEqual(before.feesBalance);
}

get fun `test v2: all 135 curve fee and supply configurations match preview`() {
    val (master, owner) = optionsMaster();
    val supplies: array<coins> = [100000000000000000, 1000000000000000000, 10000000000000000000];
    val fees: array<uint16> = [0, 10, 50, 100, 200];
    val thresholds: array<coins> = [ton("1000"), ton("2000"), ton("3000")];
    val ratios: array<uint8> = [3, 5, 8];
    var id: uint64 = 7000;
    var a = 0;
    repeat (3) {
        var b = 0;
        repeat (5) {
            var t = 0;
            repeat (3) {
                var r = 0;
                repeat (3) {
                    val o = LaunchOptions {
                        supply: supplies.get(a),
                        creatorFeeBps: fees.get(b),
                        devBuyAmount: 0,
                        minDevTokens: 0,
                        graduationThreshold: thresholds.get(t),
                        reserveRatio: ratios.get(r),
                    };
                    val preview = master.getLaunchPreview(o);
                    val curve = optionsLaunch(master, owner, o, id);
                    val data = curve.getCurveData();
                    expect(data.virtualTonReserve).toEqual(o.graduationThreshold / o.reserveRatio);
                    expect(data.graduationThreshold).toEqual(o.graduationThreshold);
                    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
                    expect(curve.getProgressBps()).toEqual(0);
                    val remaining = o.supply - preview.soldTokens;
                    expect(preview.poolTon).toEqual(o.graduationThreshold - ton("20"));
                    expect(preview.poolTokens + preview.remainingTokens).toEqual(remaining);
                    expect(
                        preview.soldTokens + preview.poolTokens + preview.remainingTokens,
                    ).toEqual(o.supply);
                    expect(
                        preview.poolTokens > 0 && remaining >= data.dexReserveSupply,
                    ).toEqual(true);
                    expect(curve.getLaunchPreview().poolTokens).toEqual(preview.poolTokens);
                    expect(preview.initialPriceNanoPerBillion).toEqual(
                        data.virtualTonReserve * 1000000000000000000 / o.supply,
                    );
                    expect(preview.graduationPriceNanoPerBillion).toEqual(
                        (data.virtualTonReserve + o.graduationThreshold) * 1000000000000000000 /
                            remaining,
                    );
                    id += 1;
                    r += 1;
                }
                t += 1;
            }
            b += 1;
        }
        a += 1;
    }
}

get fun `test v2: invalid curve limits and beneficiary configurations reject before deployment`() {
    val (master, owner) = optionsMaster();
    var o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: 0,
        minDevTokens: 0,
    };
    o.graduationThreshold = ton("999");
    invalidOptions(master, owner, o, 8000);
    o.graduationThreshold = ton("2000");
    o.reserveRatio = 4;
    invalidOptions(master, owner, o, 8001);
    o.reserveRatio = 8;
    o.minBuy = ton("250") + 1;
    invalidOptions(master, owner, o, 8002);
    o.minBuy = ton("2");
    o.maxBuy = ton("1");
    invalidOptions(master, owner, o, 8003);
    o.minBuy = 0;
    o.maxBuy = 0;
    o.maxBuy = 1;
    invalidOptions(master, owner, o, 8099);
    o.maxBuy = 0;
    o.beneficiaries = FeeBeneficiaries { shares: [] }.toCell();
    invalidOptions(master, owner, o, 8004);
    var shares: map<address, uint16> = [];
    shares.set(owner, 9999);
    o.beneficiaries = FeeBeneficiaries { shares }.toCell();
    invalidOptions(master, owner, o, 8005);
    shares.set(owner, 10000);
    shares.set(testing.treasury("zero-share").address, 0);
    o.beneficiaries = FeeBeneficiaries { shares }.toCell();
    invalidOptions(master, owner, o, 8006);
    shares = [];
    var i = 0;
    repeat (9) {
        shares.set(
            testing.treasury(format("nine-beneficiaries-{}", i)).address,
            i == 8 ? 2000 : 1000,
        );
        i += 1;
    }
    o.beneficiaries = FeeBeneficiaries { shares }.toCell();
    invalidOptions(master, owner, o, 8007);
}

get fun `test v2: independent public buy limits include exact boundaries and exempt dev buy`() {
    val (master, owner) = optionsMaster();
    val buyer = testing.treasury("limits-buyer").address;
    var mode = 0;
    repeat (4) {
        val o = LaunchOptions {
            supply: 1000000000000000000,
            creatorFeeBps: 100,
            devBuyAmount: ton("100"),
            minDevTokens: 0,
            minBuy: mode == 1 || mode == 3 ? ton("1") : 0,
            maxBuy: mode == 2 || mode == 3 ? ton("10") : 0,
        };
        val curve = optionsLaunch(master, owner, o, 8100 + mode);
        expect(curve.getCurveData().realTonReserve).toEqual(ton("98"));
        val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
        val wallet = JettonWallet.fromAddress(minter.getWalletAddress(buyer));
        if (o.minBuy > 0) {
            val before = curve.getCurveData();
            val rejected = curve.sendBuyJettons(
                buyer,
                2,
                0,
                { value: o.minBuy - 1 + ton("0.05"), bounce: true },
            );
            expect(rejected).toHaveFailedTx<BuyJettons>({ to: curve.address, exitCode: 49 });
            expect(curve.getCurveData().realTonReserve).toEqual(before.realTonReserve);
            expect(curve.getCurveData().curveJettonBalance).toEqual(before.curveJettonBalance);
        }
        val first: coins = o.minBuy > 0 ? o.minBuy : ton("0.01");
        val quote = curve.getQuoteBuy(first);
        expect(
            curve.sendBuyJettons(buyer, 3, quote, { value: first + ton("0.05"), bounce: true }),
        ).toHaveSuccessfulTx<BuyJettons>({ to: curve.address });
        expect(wallet.getWalletData().jettonBalance).toEqual(quote);
        val last: coins = o.maxBuy > 0 ? o.maxBuy : ton("20");
        expect(
            curve.sendBuyJettons(buyer, 4, 0, { value: last + ton("0.05"), bounce: true }),
        ).toHaveSuccessfulTx<BuyJettons>({ to: curve.address });
        if (o.maxBuy > 0) {
            val before = curve.getCurveData();
            val tokensBefore = wallet.getWalletData().jettonBalance;
            expect(
                curve.sendBuyJettons(
                    buyer,
                    5,
                    0,
                    { value: o.maxBuy + 1 + ton("0.05"), bounce: true },
                ),
            ).toHaveFailedTx<BuyJettons>({ to: curve.address, exitCode: 49 });
            expect(curve.getCurveData().realTonReserve).toEqual(before.realTonReserve);
            expect(wallet.getWalletData().jettonBalance).toEqual(tokensBefore);
        }
        val beforeSell = wallet.getWalletData().jettonBalance;
        val reserveBeforeSell = curve.getCurveData().realTonReserve;
        val sell = beforeSell / 2;
        net.send(
            buyer,
            createMessage({ bounce: true, dest: wallet.address, value: ton("0.4"), body: AskToTransfer {
                    queryId: 6,
                    jettonAmount: sell,
                    transferRecipient: curve.address,
                    sendExcessesTo: buyer,
                    customPayload: null,
                    forwardTonAmount: ton("0.2"),
                    forwardPayload: beginCell()
                        .storeUint(1, 1)
                        .storeRef(
                            SellPayload {
                                queryId: 6,
                                minTonOut: 0,
                            }.toCell(),
                        )
                        .toSlice(),
                } }),
        );
        expect(wallet.getWalletData().jettonBalance).toEqual(beforeSell - sell);
        expect(curve.getCurveData().realTonReserve < reserveBeforeSell).toEqual(true);
        mode += 1;
    }
}
