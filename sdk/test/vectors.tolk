import "@acton/io"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-math"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/buyback-messages"
import "@contracts/v2/fee-storage"

fun main() {
    val owner = address("0:1111111111111111111111111111111111111111111111111111111111111111");
    val curve = address("0:2222222222222222222222222222222222222222222222222222222222222222");
    println(
        "buy:{}",
        BuyJettons {
            queryId: 42,
            minJettonsOut: 123456789,
        }
        .toCell()
        .hash(),
    );
    println(
        "sell:{}",
        AskToTransfer {
            queryId: 42,
            jettonAmount: 123456789,
            transferRecipient: curve,
            sendExcessesTo: owner,
            customPayload: null,
            forwardTonAmount: ton("0.2"),
            forwardPayload: PayloadInline {
                value: SellPayload {
                    queryId: 42,
                    minTonOut: 987654321,
                }
                .toCell()
                .beginParse(),
            }
            .toCell()
            .beginParse(),
        }
        .toCell()
        .hash(),
    );
    println(
        "claim:{}",
        ClaimSplitFees {
            queryId: 42,
            protocol: false,
        }
        .toCell()
        .hash(),
    );
    println("execute:{}", ExecuteBuyback { queryId: 42 }.toCell().hash());
    println("flush:{}", FlushCreatorFees { queryId: 42 }.toCell().hash());
    println("collect:{}", CollectPoolFees { queryId: 42 }.toCell().hash());
    println(
        "sweep:{}",
        SweepCollectedTokens {
            queryId: 42,
            amount: 123,
        }
        .toCell()
        .hash(),
    );
    println("prepare:{}", PrepareBuyback { queryId: 42 }.toCell().hash());
    println("claimBurn:{}", ClaimBuybackFees { queryId: 42 }.toCell().hash());
    println("burnAvailable:{}", BurnAvailable { queryId: 42 }.toCell().hash());
    println("retry:{}", RetryMigration { queryId: 42 }.toCell().hash());
    println("confirm:{}", ConfirmMigration { queryId: 42 }.toCell().hash());
    println("flushProtocol:{}", FlushFees { queryId: 42 }.toCell().hash());
    println("graduate:{}", Graduate { queryId: 42 }.toCell().hash());
    println("retryCollected:{}", RetryCollectedFees { queryId: 42 }.toCell().hash());
    println(
        "changeAdmin:{}",
        ChangeMasterAdmin {
            queryId: 42,
            newAdmin: curve,
        }
        .toCell()
        .hash(),
    );
    println("claimAdmin:{}", ClaimMasterAdmin { queryId: 42 }.toCell().hash());
    println(
        "treasury:{}",
        ChangeTreasury {
            queryId: 42,
            newTreasury: curve,
        }
        .toCell()
        .hash(),
    );
    println(
        "withdraw:{}",
        WithdrawProtocolFees {
            queryId: 42,
            amount: 123,
        }
        .toCell()
        .hash(),
    );
    println(
        "burnTokens:{}",
        AskToBurn {
            queryId: 42,
            jettonAmount: 123,
            sendExcessesTo: curve,
            customPayload: null,
        }
        .toCell()
        .hash(),
    );
    println(
        "transferTokens:{}",
        AskToTransfer {
            queryId: 42,
            jettonAmount: 123,
            transferRecipient: curve,
            sendExcessesTo: owner,
            customPayload: null,
            forwardTonAmount: 1,
            forwardPayload: PayloadInRef { value: createEmptyCell() as Cell<RemainingBitsAndRefs> }
            .toCell()
            .beginParse(),
        }
        .toCell()
        .hash(),
    );
    val supplies = [100000000, 1000000000, 10000000000];
    val fees = [0, 10, 50, 100, 200];
    val thresholds = [1000, 2000, 3000];
    val ratios = [3, 5, 8];
    var count = 0;
    var i = 0;
    repeat (supplies.size()) {
        var j = 0;
        repeat (fees.size()) {
            var k = 0;
            repeat (thresholds.size()) {
                var l = 0;
                repeat (ratios.size()) {
                    val options = LaunchOptions {
                        supply: supplies.get(i) * 1000000000,
                        creatorFeeBps: fees.get(j),
                        devBuyAmount: ton("2"),
                        minDevTokens: 123,
                        graduationThreshold: thresholds.get(k) * 1000000000,
                        reserveRatio: ratios.get(l),
                    };
                    validateLaunchOptions(options);
                    println(
                        "launch{}:{}",
                        count,
                        CreateLaunch {
                            queryId: 42,
                            salt: 7,
                            metadata: beginCell()
                                .storeUint(1, 8)
                                .storeString("https://example.com/token.json")
                                .endCell(),
                            options: options.toCell(),
                        }
                        .toCell()
                        .hash(),
                    );
                    count += 1;
                    l += 1;
                }
                k += 1;
            }
            j += 1;
        }
        i += 1;
    }
    var shares: map<address, uint16> = [];
    shares.set(owner, 10000);
    val split = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: 0,
        minDevTokens: 0,
        beneficiaries: FeeBeneficiaries { shares }.toCell(),
    };
    println("split:{}", split.toCell().hash());
    val burn = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: 0,
        minDevTokens: 0,
        buybackBurn: true,
    };
    println("burn:{}", burn.toCell().hash());
    println(
        "reinitialize:{}",
        ReinitializeCurve {
            queryId: 42,
            creator: owner,
            salt: 7,
            metadata: beginCell()
                .storeUint(1, 8)
                .storeString("https://example.com/token.json")
                .endCell(),
            options: LaunchOptions {
                supply: 1000000000000000000,
                creatorFeeBps: 100,
                devBuyAmount: 0,
                minDevTokens: 0,
            }.toCell(),
        }
        .toCell()
        .hash(),
    );
}
