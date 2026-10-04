import "@acton/emulation/config"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/big_array"
import "@acton/types/message"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/wallet-messages"
import "migration"

fun SendResultList.findTopicEvent<T>(self, params: ExternalOutSearchParams): TlbMessage<
    T,
    TlbExternalOutMessageInfo,
>? {
    var i = 0;
    repeat (self.size()) {
        val logs = self.at(i).externals;
        var j = 0;
        repeat (logs.size()) {
            val raw = logs.get(j) as cell;
            val msg = TlbMessage<RemainingBitsAndRefs, TlbExternalOutMessageInfo>.fromCell(raw);
            if (msg.info.src == params.from! && msg.info.dest == params.to!) {
                return TlbMessage<T, TlbExternalOutMessageInfo>.fromCell(raw);
            }
            j += 1;
        }
        i += 1;
    }
    return null;
}

fun eventTopic(topic: uint248): any_address {
    // addr_extern$01, 256-bit ExtOutLogBucket payload.
    return beginCell()
        .storeUint(1, 2)
        .storeUint(256, 9)
        .storeUint(0, 8)
        .storeUint(topic, 248)
        .toSlice() as any_address;
}

fun eventMaster(owner: address): BondingCurveMasterV2 {
    val master = BondingCurveMasterV2.fromStorage({ admin: owner, nextAdmin: null, treasury: owner, totalLaunches: 0, feesBalance: 0 });
    master.deploy(owner, { value: ton("2") });
    return master;
}

fun eventOptions(dev: coins): LaunchOptions {
    return {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: dev,
        minDevTokens: 0,
    };
}

fun eventLaunch(master: BondingCurveMasterV2, owner: address, options: LaunchOptions): TxCursor {
    return testing.createTraceIterationCursor(
        owner,
        createMessage({
            bounce: true,
            dest: master.address,
            value: options.devBuyAmount + ton("1"),
            body: CreateLaunch {
                queryId: 1,
                metadata: beginCell().endCell(),
                salt: 7,
                options: options.toCell(),
            },
        }),
    );
}

get fun `test v2: launch discovery precedes initialization and dev delivery gates its event`() {
    val owner = testing.treasury("event-owner").address;
    val buyer = testing.treasury("event-buyer").address;
    val master = eventMaster(owner);
    val options = eventOptions(ton("100"));
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner, 7, options));
    val cursor = eventLaunch(master, owner, options);
    val early = cursor.executeTill<InitializeCurve>({ to: curve.address });
    val created = early.findTopicEvent<LaunchCreatedEvent>({ from: master.address, to: eventTopic(
            TOPIC_LAUNCH_CREATED,
        ) });
    expect(created != null).toEqual(true);
    expect(created!.loadBody().curveAddress).toEqual(curve.address);
    expect(
        early.findTopicEvent<LaunchInitializedEvent>({ from: curve.address, to: eventTopic(
                TOPIC_LAUNCH_INITIALIZED,
            ) }) ==
            null,
    ).toEqual(true);
    expect(curve.getLaunchStatus()).toEqual(LaunchStatus.Initializing);
    val mintedCurve = cursor.executeTill<TransferNotificationForRecipient>({ to: curve.address });
    expect(
        mintedCurve.findTopicEvent<LaunchInitializedEvent>({ from: curve.address, to: eventTopic(
                TOPIC_LAUNCH_INITIALIZED,
            ) }) ==
            null,
    ).toEqual(true);
    expect(curve.getLaunchProgress().curveReceived).toEqual(true);
    expect(curve.getLaunchProgress().devReceived).toEqual(false);
    expect(
        curve.sendBuyJettons(buyer, 2, 0, { value: ton("10.05") }),
    ).toHaveFailedTx<BuyJettons>({ to: curve.address, exitCode: 72 });
    val devWallet = JettonMinterV2
        .fromAddress(created!.loadBody().minterAddress)
        .getWalletAddress(owner);
    val delivered = cursor.executeTill<MintDelivered>({ from: devWallet, to: curve.address });
    val event = delivered.findTopicEvent<LaunchInitializedEvent>({ from: curve.address, to: eventTopic(
            TOPIC_LAUNCH_INITIALIZED,
        ) });
    expect(event != null).toEqual(true);
    val payload = event!.loadBody();
    expect(payload.status).toEqual(LaunchStatus.Trading);
    expect(payload.realTonReserve).toEqual(ton("98"));
    expect(payload.curveJettonBalance).toEqual(curve.getCurveData().curveJettonBalance);
    val minter = JettonMinterV2.fromAddress(created!.loadBody().minterAddress);
    expect(v2Tokens(minter, owner)).toEqual(curve.getLaunchProgress().devTokens);
    val rest = cursor.executeAllRemaining();
    cursor.close();
    expect(
        rest.findTopicEvent<LaunchInitializedEvent>({ from: curve.address, to: eventTopic(
                TOPIC_LAUNCH_INITIALIZED,
            ) }) ==
            null,
    ).toEqual(true);
    val duplicate = curve.sendMintDelivered(
        minter.getWalletAddress(owner),
        2,
        curve.getLaunchProgress().devTokens,
        { value: ton("0.05") },
    );
    expect(
        duplicate.findTopicEvent<LaunchInitializedEvent>({ from: curve.address, to: eventTopic(
                TOPIC_LAUNCH_INITIALIZED,
            ) }) ==
            null,
    ).toEqual(true);
}

get fun `test v2: initialization event distinguishes public trading from immediate migration`() {
    loadV2Libraries();
    testing.setNow(V2_TIME);
    val owner = testing.treasury("event-migration").address;
    val master = eventMaster(owner);
    val devs: array<coins> = [0, ton("3000")];
    var i = 0;
    repeat (2) {
        val options = eventOptions(devs.get(i));
        val trace = master.sendCreateLaunch(
            owner,
            i,
            beginCell().endCell(),
            i,
            options,
            { value: options.devBuyAmount + ton("1") },
        );
        val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner, i, options));
        val event = trace.findTopicEvent<LaunchInitializedEvent>({ from: curve.address, to: eventTopic(
                TOPIC_LAUNCH_INITIALIZED,
            ) });
        expect(event != null).toEqual(true);
        expect(event!.loadBody().status).toEqual(
            i == 0 ? LaunchStatus.Trading : LaunchStatus.Migrating,
        );
        expect(event!.loadBody().realTonReserve).toEqual(options.devBuyAmount * 98 / 100);
        expect(curve.getLaunchStatus()).toEqual(
            i == 0 ? LaunchStatus.Trading : LaunchStatus.Migrated,
        );
        if (i == 1) {
            expect(
                trace.findTopicEvent<GraduateEvent>({ from: curve.address, to: eventTopic(
                        TOPIC_GRADUATE,
                    ) }) !=
                    null,
            ).toEqual(true);
        }
        i += 1;
    }
}

get fun `test v2: failed dev mint cancels without emitting initialized`() {
    val owner = testing.treasury("event-cancel").address;
    val master = eventMaster(owner);
    val options = eventOptions(ton("100"));
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner, 7, options));
    val cursor = eventLaunch(master, owner, options);
    cursor.executeTill<TransferNotificationForRecipient>({ to: curve.address });
    val original = testing.getConfig();
    var expensive = original;
    var prices = expensive.getGasPrices(BASECHAIN);
    var other = prices.other;
    other.gasPrice *= 1000;
    prices.other = other;
    expensive.setGasPrices(prices, BASECHAIN);
    testing.setConfig(expensive);
    val failed = cursor.executeTill<MintNewJettons>({ to: curve.getCurveData().jettonMinter! });
    expect(failed).toHaveFailedTx<MintNewJettons>({ to: curve
            .getCurveData()
            .jettonMinter!, exitCode: 48 });
    testing.setConfig(original);
    val recovery = cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getLaunchStatus()).toEqual(LaunchStatus.Cancelled);
    expect(
        recovery.findTopicEvent<LaunchInitializedEvent>({ from: curve.address, to: eventTopic(
                TOPIC_LAUNCH_INITIALIZED,
            ) }) ==
            null,
    ).toEqual(true);
}

get fun `test v2: buy and sell logs expose gross net fees and reserves for every fee preset`() {
    val owner = testing.treasury("event-reserves").address;
    val master = eventMaster(owner);
    val rates: array<uint16> = [0, 10, 50, 100, 200];
    var i = 0;
    repeat (5) {
        var options = eventOptions(ton("100"));
        options.creatorFeeBps = rates.get(i);
        master.sendCreateLaunch(
            owner,
            1,
            beginCell().endCell(),
            i,
            options,
            { value: ton("101") },
        );
        val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner, i, options));
        val beforeBuy = curve.getCurveData();
        val creatorBeforeBuy = curve.getLaunchProgress().creatorAccrued;
        val gross = ton("10") + 101;
        val bought = curve.sendBuyJettons(owner, 2, 1, { value: gross + ton("0.05") });
        val buyLog = bought.findTopicEvent<BuyEvent>({ from: curve.address, to: eventTopic(
                TOPIC_BUY,
            ) });
        expect(buyLog != null).toEqual(true);
        val buy = buyLog!.loadBody();
        val afterBuy = curve.getCurveData();
        expect(buy.tonInGross).toEqual(gross);
        expect(buy.tonInNet + buy.feeTon).toEqual(gross);
        expect(buy.migrationStarted).toEqual(false);
        expect(buy.realTonReserve).toEqual(afterBuy.realTonReserve);
        expect(buy.curveJettonBalance).toEqual(afterBuy.curveJettonBalance);
        expect(afterBuy.realTonReserve - beforeBuy.realTonReserve).toEqual(buy.tonInNet);
        expect(
            afterBuy.feeAccrued + afterBuy.migrationReserve - beforeBuy.feeAccrued -
                beforeBuy.migrationReserve,
        ).toEqual(gross / 100);
        expect(buy.feeTon - gross / 100).toEqual(
            curve.getLaunchProgress().creatorAccrued - creatorBeforeBuy,
        );
        expect(buy.feeTon - gross / 100).toEqual(gross * rates.get(i) / 10000);
        val minter = JettonMinterV2.fromAddress(afterBuy.jettonMinter!);
        val creatorBeforeSell = curve.getLaunchProgress().creatorAccrued;
        val amount = buy.jettonsOut / 2;
        val sold = net.send(
            owner,
            createMessage({ bounce: true, dest: minter.getWalletAddress(
                    owner,
                ), value: ton("0.4"), body: v2Transfer(
                    3,
                    amount,
                    curve.address,
                    owner,
                    SellPayload {
                        queryId: 3,
                        minTonOut: 1,
                    }.toCell(),
                ) }),
        );
        val sellLog = sold.findTopicEvent<SellEvent>({ from: curve.address, to: eventTopic(
                TOPIC_SELL,
            ) });
        expect(sellLog != null).toEqual(true);
        val sell = sellLog!.loadBody();
        val afterSell = curve.getCurveData();
        expect(sell.jettonsIn).toEqual(amount);
        expect(sell.tonOutGross).toEqual(sell.tonOutNet + sell.feeTon);
        expect(sell.tonOutGross).toEqual(afterBuy.realTonReserve - afterSell.realTonReserve);
        expect(sell.realTonReserve).toEqual(afterSell.realTonReserve);
        expect(sell.curveJettonBalance).toEqual(afterSell.curveJettonBalance);
        expect(
            afterSell.feeAccrued + afterSell.migrationReserve - afterBuy.feeAccrued -
                afterBuy.migrationReserve,
        ).toEqual(sell.tonOutGross / 100);
        expect(sell.feeTon - sell.tonOutGross / 100).toEqual(
            curve.getLaunchProgress().creatorAccrued - creatorBeforeSell,
        );
        expect(sell.feeTon - sell.tonOutGross / 100).toEqual(
            sell.tonOutGross * rates.get(i) / 10000,
        );
        expect(
            sold,
        ).toHaveSuccessfulTx<ReturnExcessesBack>({ from: curve.address, to: owner, value: sell.tonOutNet });
        i += 1;
    }
}

get fun `test v2: buy log marks migration start before liquidity confirmation`() {
    loadV2Libraries();
    testing.setNow(V2_TIME);
    val owner = testing.treasury("event-crossing").address;
    val master = eventMaster(owner);
    val options = eventOptions(ton("100"));
    master.sendCreateLaunch(
        owner,
        1,
        beginCell().endCell(),
        7,
        options,
        { value: ton("101") },
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner, 7, options));
    val cursor = v2Cursor(
        owner,
        curve.address,
        ton("2500.05"),
        BuyJettons {
            queryId: 2,
            minJettonsOut: 1,
        },
    );
    val started = cursor.executeTill<BuyJettons>({ to: curve.address });
    val log = started.findTopicEvent<BuyEvent>({ from: curve.address, to: eventTopic(TOPIC_BUY) });
    expect(log != null).toEqual(true);
    expect(log!.loadBody().migrationStarted).toEqual(true);
    expect(log!.loadBody().tonInGross).toEqual(ton("2500"));
    expect(log!.loadBody().realTonReserve).toEqual(curve.getCurveData().realTonReserve);
    expect(log!.loadBody().curveJettonBalance).toEqual(curve.getCurveData().curveJettonBalance);
    expect(curve.getLaunchStatus()).toEqual(LaunchStatus.Migrating);
    expect(
        started.findTopicEvent<GraduateEvent>({ from: curve.address, to: eventTopic(
                TOPIC_GRADUATE,
            ) }) ==
            null,
    ).toEqual(true);
    val completed = cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getLaunchStatus()).toEqual(LaunchStatus.Migrated);
    expect(
        completed.findTopicEvent<GraduateEvent>({ from: curve.address, to: eventTopic(
                TOPIC_GRADUATE,
            ) }) !=
            null,
    ).toEqual(true);
}

get fun `test v2: public launch statuses cover every internal state`() {
    val expected: array<LaunchStatus> = [
        LaunchStatus.Initializing,
        LaunchStatus.Trading,
        LaunchStatus.Migrating,
        LaunchStatus.Migrated,
        LaunchStatus.Migrating,
        LaunchStatus.Cancelled,
        LaunchStatus.Migrating,
        LaunchStatus.Migrating,
    ];
    var i = 0;
    repeat (8) {
        expect(launchStatus(i)).toEqual(expected.get(i));
        i += 1;
    }
}
