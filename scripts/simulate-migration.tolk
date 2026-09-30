import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@contracts/bonding-config"
import "@contracts/bonding-dedust"
import "@contracts/bonding-messages"
import "@contracts/bonding-storage"
import "@contracts/messages"
import "@wrappers/BondingCurve.gen"
import "@wrappers/BondingCurveMaster.gen"
import "@wrappers/JettonMinter.gen"
import "@wrappers/JettonWallet.gen"
import "@wrappers/utils"
import "@tests/simulation/dedust"
import "utils/common"

// Run with Acton 1.2.0: acton script scripts/simulate-migration.tolk --fork-net mainnet
// Register the real library so the pool handshake executes rather than bouncing.
fun main() {
    assert (!net.isBroadcasting()) throw 1000;
    expect(
        testing.loadAndRegisterLibrary(
            "6045e67b617e73486aac445cfcad0dbead6d315ccc8f4aede3f2e23ad14da4b0",
        ),
    ).toEqual(true);
    expect(
        testing.loadAndRegisterLibrary(
            "2cac3fddd30969d08df036067108c6e7d69780a9459d931d2eb63d95d5ff6825",
        ),
    ).toEqual(true);

    expect(
        testing.loadAndRegisterLibrary(
            "dd82f24db614798ee7c579f8b3f07f0645d06d65cede368d80d0d74b180d2dd6",
        ),
    ).toEqual(true);

    val admin = testing.treasury("migration-admin");
    val creator = testing.treasury("migration-creator");
    val buyer = testing.treasury("migration-buyer");
    val master = BondingCurveMaster.fromStorage({
        admin: admin.address,
        nextAdmin: null,
        treasury: admin.address,
        totalLaunches: 0,
        feesBalance: 0,
    });
    expect(
        master.sendDeploy(admin.address, { value: ton("1") }),
    ).toHaveSuccessfulDeploy({ to: master.address });
    val metadata = buildJettonMetadataCell({
        name: "Migration Simulation",
        symbol: "SIM",
        description: "Emulated token, never broadcast",
        image: "",
        decimals: "9",
    });
    master.sendCreateLaunch(
        creator.address,
        1,
        metadata,
        20260930,
        { value: ton("0.6"), bounce: false },
    );
    val curve = BondingCurve.fromAddress(master.getLaunchAddress(creator.address, 20260930));
    val initial = curve.getCurveData();
    expect(initial.state).toEqual(CURVE_STATE_TRADING);
    val minter = JettonMinter.fromAddress(initial.jettonMinter!);
    expect(minter.getJettonData().totalSupply).toEqual(TOTAL_SUPPLY);
    expect(minter.getJettonData().adminAddress).toEqual(null);
    println("CREATED master={} curve={} minter={}", master.address, curve.address, minter.address);

    val quote = curve.getQuoteBuy(ton("100") - CURVE_TRANSFER_VALUE);
    val buy = curve.sendBuyJettons(buyer.address, 2, quote, { value: ton("100") });
    expect(buy).toHaveSuccessfulTx<BuyJettons>({ to: curve.address });
    val wallet = JettonWallet.fromAddress(minter.getWalletAddress(buyer.address));
    expect(wallet.getWalletData().jettonBalance).toEqual(quote);
    val sellAmount = quote / 2;
    val sellQuote = curve.getQuoteSell(sellAmount);
    val sell = net.send(
        buyer.address,
        createMessage({
            bounce: true,
            value: ton("0.3"),
            dest: wallet.address,
            body: AskToTransfer {
                queryId: 3,
                jettonAmount: sellAmount,
                transferRecipient: curve.address,
                sendExcessesTo: buyer.address,
                customPayload: null,
                forwardTonAmount: ton("0.1"),
                forwardPayload: beginCell()
                    .storeUint(1, 1)
                    .storeRef(
                        SellPayload {
                            queryId: 3,
                            minTonOut: sellQuote,
                        }.toCell(),
                    )
                    .toSlice(),
            },
        }),
    );
    expect(sell).toHaveSuccessfulTx<TransferNotificationForRecipient>({ to: curve.address });
    expect(sell).toHaveSuccessfulTx<ReturnExcessesBack>({
        from: curve.address,
        to: buyer.address,
        value: sellQuote,
    });
    expect(wallet.getWalletData().jettonBalance).toEqual(quote - sellAmount);
    println(
        "BUY_AND_SELL_OK tokensBought={} tokensSold={} tonReceived={}",
        quote,
        sellAmount,
        sellQuote,
    );

    val before = curve.getCurveData();
    val finalValue = ton("2100");
    val gross = finalValue - CURVE_TRANSFER_VALUE;
    val netTon = gross - gross * PROTOCOL_FEE_BPS / BPS_DENOMINATOR;
    val finalQuote = curve.getQuoteBuy(gross);
    val expectedTon = before.realTonReserve + netTon - MIGRATION_FEE;
    val inventory = before.curveJettonBalance - finalQuote;
    val expectedJettons = expectedTon * inventory /
        (before.virtualTonReserve + expectedTon + MIGRATION_FEE);
    val migration = curve.sendBuyJettons(buyer.address, 4, finalQuote, { value: finalValue });
    println(migration);
    val after = curve.getCurveData();
    println("AFTER_GRADUATION {}", after);
    expect(after.state).toEqual(CURVE_STATE_MIGRATED);
    expect(after.realTonReserve).toEqual(0);
    expect(after.migrationReserve).toEqual(0);
    val pool = calcDeployedCpmmV2Pool(minter.address, creator.address).calculateAddress();
    expect(migration).toHaveSuccessfulTx<InitPoolResultMessage>({ from: pool, to: curve.address });
    val poolWallet = JettonWallet.fromAddress(minter.getWalletAddress(pool));
    expect(poolWallet.getWalletData().jettonBalance).toEqual(expectedJettons);
    val poolData = net.runGetMethod<SimulationPoolData>(pool, "get_pool_data");
    println("POOL {} DATA {}", pool, poolData);
    expect(poolData.status).toEqual(2);
    expect(poolData.reserveX).toEqual(expectedTon);
    expect(poolData.reserveY).toEqual(expectedJettons);
    expect(poolData.liquidity > 0).toEqual(true);
    val positionAddress = net.runGetMethod<address>(pool, "get_position_address", [curve.address]);
    val position = net.runGetMethod<SimulationPositionData>(positionAddress, "get_position_data");
    expect(position.poolAddress).toEqual(pool);
    expect(position.ownerAddress).toEqual(curve.address);
    expect(position.liquidity).toEqual(poolData.liquidity);
    expect(position.lockedLiquidity).toEqual(position.liquidity);
    println(
        "LP_LOCK_VERIFIED position={} liquidity={} locked={}",
        positionAddress,
        position.liquidity,
        position.lockedLiquidity,
    );
    val curveWallet = JettonWallet.fromAddress(minter.getWalletAddress(curve.address));
    expect(curveWallet.getWalletData().jettonBalance).toEqual(after.curveJettonBalance);
    expect(
        wallet.getWalletData().jettonBalance + poolWallet.getWalletData().jettonBalance +
            curveWallet.getWalletData().jettonBalance,
    ).toEqual(TOTAL_SUPPLY);
    println(
        "MIGRATION_VERIFIED pool={} ton={} jettons={} stranded={}",
        pool,
        expectedTon,
        expectedJettons,
        after.curveJettonBalance,
    );
}
