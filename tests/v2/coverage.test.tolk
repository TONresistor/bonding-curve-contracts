import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/FeeSplitterV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWallet.gen"
import "@contracts/v1/bonding-config"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/wallet-messages"

fun coverageSetup(supply: coins, fee: uint16, dev: coins, salt: uint64): (
    BondingCurveMasterV2,
    BondingCurveV2,
    address,
    address,
) {
    val creator = testing.treasury("coverage-creator").address;
    val buyer = testing.treasury("coverage-buyer").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: creator, nextAdmin: null, treasury: creator, totalLaunches: 0, feesBalance: 0 });
    master.deploy(creator, { value: ton("2") });
    val options = LaunchOptions {
        supply,
        creatorFeeBps: fee,
        devBuyAmount: dev,
        minDevTokens: 0,
    };
    master.sendCreateLaunch(
        creator,
        1,
        beginCell().endCell(),
        salt,
        options,
        { value: dev + ton("1"), bounce: true },
    );
    return (
        master,
        BondingCurveV2.fromAddress(master.getLaunchAddress(creator, salt, options)),
        creator,
        buyer,
    );
}

get fun `test v2: exact sell payout and both commissions for all fifteen presets`() {
    val supplies: array<coins> = [100000000000000000, 1000000000000000000, 10000000000000000000];
    val fees: array<uint16> = [0, 10, 50, 100, 200];
    var a = 0;
    repeat (3) {
        var b = 0;
        repeat (5) {
            val fee = fees.get(b);
            val (_, curve, creator, buyer) = coverageSetup(
                supplies.get(a),
                fee,
                ton("100"),
                1000 + a * 5 + b,
            );
            curve.sendBuyJettons(buyer, 2, 0, { value: ton("10.05") });
            val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
            val wallet = JettonWallet.fromAddress(minter.getWalletAddress(buyer));
            val amount = wallet.getWalletData().jettonBalance / 3;
            val before = curve.getCurveData();
            val creatorBefore = curve.getLaunchProgress().creatorAccrued;
            val gross = before.virtualTonReserve + before.realTonReserve -
                (before.virtualTonReserve + before.realTonReserve) * before.curveJettonBalance /
                    (before.curveJettonBalance + amount);
            val protocolFee = gross / 100;
            val creatorFee = gross * fee / 10000;
            val netOut = gross - protocolFee - creatorFee;
            val reserveCut = min(
                protocolFee / 10,
                MIGRATION_RESERVE_TARGET - before.migrationReserve,
            );
            val trace = net.send(
                buyer,
                createMessage({ bounce: true, dest: wallet.address, value: ton("0.4"), body: AskToTransfer {
                        queryId: 3,
                        jettonAmount: amount,
                        transferRecipient: curve.address,
                        sendExcessesTo: buyer,
                        customPayload: null,
                        forwardTonAmount: ton("0.2"),
                        forwardPayload: beginCell()
                            .storeUint(1, 1)
                            .storeRef(
                                SellPayload {
                                    queryId: 3,
                                    minTonOut: netOut,
                                }.toCell(),
                            )
                            .toSlice(),
                    } }),
            );
            expect(
                trace,
            ).toHaveSuccessfulTx<ReturnExcessesBack>({ from: curve.address, to: buyer, value: netOut });
            val after = curve.getCurveData();
            expect(after.realTonReserve).toEqual(before.realTonReserve - gross);
            expect(after.curveJettonBalance).toEqual(before.curveJettonBalance + amount);
            expect(after.feeAccrued).toEqual(before.feeAccrued + protocolFee - reserveCut);
            expect(after.migrationReserve).toEqual(before.migrationReserve + reserveCut);
            expect(curve.getLaunchProgress().creatorAccrued).toEqual(creatorBefore + creatorFee);
            curve.sendClaimCurveCreatorFees(creator, 4, { value: ton("0.05") });
            val manager = FeeSplitterV2.fromAddress(curve.getFeeManagerAddress());
            val claim = manager.sendClaimSplitFees(creator, 4, false, { value: ton("0.2") });
            if (creatorBefore + creatorFee > 0) {
                expect(
                    claim,
                ).toHaveSuccessfulTx<ReturnExcessesBack>({ from: manager.address, to: creator, value: creatorBefore +
                        creatorFee });
            }
            b += 1;
        }
        a += 1;
    }
}

get fun `test v2: migration reserve reaches cap without taking creator fees`() {
    val fees: array<uint16> = [0, 10, 50, 100, 200];
    var i = 0;
    repeat (5) {
        val fee = fees.get(i);
        val gross = ton("1500") - 1;
        val (_, curve, _, buyer) = coverageSetup(1000000000000000000, fee, gross, 2000 + i);
        expect(curve.getCurveData().migrationReserve).toEqual(MIGRATION_RESERVE_TARGET - 1);
        expect(curve.getLaunchProgress().creatorAccrued).toEqual(gross * fee / 10000);
        val before = curve.getCurveData();
        curve.sendBuyJettons(buyer, 2, 0, { value: ton("1.05") });
        val atCap = curve.getCurveData();
        expect(atCap.migrationReserve).toEqual(MIGRATION_RESERVE_TARGET);
        expect(atCap.feeAccrued - before.feeAccrued).toEqual(ton("0.01") - 1);
        curve.sendBuyJettons(buyer, 3, 0, { value: ton("1.05") });
        expect(curve.getCurveData().migrationReserve).toEqual(MIGRATION_RESERVE_TARGET);
        expect(curve.getCurveData().feeAccrued - atCap.feeAccrued).toEqual(ton("0.01"));
        expect(curve.getLaunchProgress().creatorAccrued).toEqual(
            gross * fee / 10000 + 2 * ton("1") * fee / 10000,
        );
        i += 1;
    }
}

get fun `test v2: dev buy one nanoton below at and above migration threshold`() {
    val fees: array<uint16> = [0, 10, 50, 100, 200];
    val supplies: array<coins> = [100000000000000000, 1000000000000000000, 10000000000000000000];
    val creator = testing.treasury("boundary-creator").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: creator, nextAdmin: null, treasury: creator, totalLaunches: 0, feesBalance: 0 });
    master.deploy(creator, { value: ton("2") });
    var a = 0;
    var salt: uint64 = 3000;
    repeat (3) {
        var b = 0;
        repeat (5) {
            var delta = -1;
            repeat (3) {
                val fee = fees.get(b);
                val target = GRADUATION_THRESHOLD_TON + delta;
                var gross = target * 10000 / (9900 - fee);
                while (gross - gross / 100 - gross * fee / 10000 > target) {
                    gross -= 1;
                }
                while (gross - gross / 100 - gross * fee / 10000 < target) {
                    gross += 1;
                }
                val options = LaunchOptions {
                    supply: supplies.get(a),
                    creatorFeeBps: fee,
                    devBuyAmount: gross,
                    minDevTokens: 0,
                };
                val curve = BondingCurveV2.fromAddress(
                    master.getLaunchAddress(creator, salt, options),
                );
                val cursor = testing.createTraceIterationCursor(
                    creator,
                    createMessage({ bounce: true, dest: master.address, value: gross +
                            ton("1"), body: CreateLaunch {
                            queryId: 1,
                            metadata: beginCell().endCell(),
                            salt,
                            options: options.toCell(),
                        } }),
                );
                cursor.executeTill<InitializeCurve>({ to: curve.address });
                while (curve.getState() == CURVE_STATE_INITIALIZING) {
                    cursor.executeTill<MintDelivered>({ to: curve.address });
                }
                expect(curve.getCurveData().realTonReserve).toEqual(target);
                expect(curve.getState()).toEqual(
                    delta < 0 ? CURVE_STATE_TRADING : CURVE_STATE_FROZEN,
                );
                expect(curve.getCurveData().migrationReserve).toEqual(MIGRATION_RESERVE_TARGET);
                // Check the threshold before the queued migration executes.
                cursor.close();
                salt += 1;
                delta += 1;
            }
            b += 1;
        }
        a += 1;
    }
}
