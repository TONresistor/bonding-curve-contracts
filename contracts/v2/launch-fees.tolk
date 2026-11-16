import "@stdlib/gas-payments"
import "@gen/JettonWalletV2.code"
import "bonding-messages"
import "bonding-storage"
import "wallet-fees"
import "wallet-messages"
import "../v1/bonding-config"
import "../v1/jetton-utils"
import "../v1/messages"

// Each launch bound is 125% of its maximum measured gas, rounded up to 100 units.
const LAUNCH_MASTER_CREATE_GAS = 228000
const LAUNCH_MASTER_CONFIRM_GAS = 12200
const LAUNCH_CURVE_INIT_GAS = 50700
const LAUNCH_CURVE_RECEIPT_GAS = 36600
const LAUNCH_CURVE_SERVICE_GAS = 32800
const LAUNCH_CURVE_FINALIZE_GAS = 22000
const LAUNCH_MINTER_MINT_GAS = 23600
const LAUNCH_MINTER_DROP_GAS = 5800
const LAUNCH_WALLET_MINT_GAS = 9900
const LAUNCH_MINTER_DEPLOY_GAS = 2400
const LAUNCH_RECOVERY_GAS = 61100
const LAUNCH_PROBE_GAS = 24000
const LAUNCH_PROBE_RECEIPT_GAS = 45100
const LAUNCH_MINTER_RESERVE: coins = ton("0.01")
const LAUNCH_COLLECTOR_VALUE: coins = ton("0.15")

fun launchGas(units: int): coins {
    return calculateGasFee(0, units);
}

fun launchMinterDeployValue(reserve: coins = LAUNCH_MINTER_RESERVE): coins {
    return reserve + launchGas(LAUNCH_MINTER_DEPLOY_GAS);
}

fun launchMintFunding(
    curve: address,
    minter: address,
    recipient: address,
    id: uint64,
    amount: coins,
    protect: bool,
): coins {
    val receipt = createMessage({ bounce: false, dest: curve, value: (1 << 120) -
            1 as coins, body: MintDelivered {
            queryId: id,
            amount,
        } });
    val walletValue = walletStorageReserve() + launchGas(LAUNCH_WALLET_MINT_GAS) +
        receipt.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY) +
        launchGas(LAUNCH_CURVE_RECEIPT_GAS);
    val delivery = createMessage({ bounce: true, dest: calcDeployedJettonWallet(
            recipient,
            minter,
            jettonWalletV2CompiledCode(),
        ), value: walletValue, body: InternalLaunchMint {
            queryId: id,
            jettonAmount: amount,
            curve,
            protect,
        } });
    return walletValue + delivery.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY) +
        launchGas(LAUNCH_MINTER_MINT_GAS);
}

fun launchDropValue(curve: address, id: uint64): coins {
    val ack = createMessage({ bounce: false, dest: curve, value: (1 << 120) -
            1 as coins, body: MinterAdminDropped { queryId: id } });
    return max(
        ton("0.01"),
        launchGas(LAUNCH_MINTER_DROP_GAS) +
            ack.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY) +
            launchGas(LAUNCH_CURVE_SERVICE_GAS),
    );
}

fun launchConfirmValue(curve: address, id: uint64): coins {
    val ack = createMessage({ bounce: false, dest: curve, value: (1 << 120) -
            1 as coins, body: LaunchConfirmed { queryId: id } });
    return launchGas(LAUNCH_MASTER_CONFIRM_GAS) +
        ack.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY) +
        launchGas(LAUNCH_CURVE_SERVICE_GAS);
}

fun launchFinalizeMinimum(curve: address, creator: address, id: uint64): coins {
    val refund = createMessage({ bounce: false, dest: creator, value: (1 << 120) -
            1 as coins, body: ReturnExcessesBack { queryId: id } });
    val finalize = createMessage({ bounce: true, dest: curve, value: (1 << 120) -
            1 as coins, body: FinalizeLaunch { queryId: id } });
    val event = createExternalLogMessage({ dest: ExtOutLogBucket {
            topic: TOPIC_LAUNCH_INITIALIZED,
        }, body: LaunchInitializedEvent {
            status: LaunchStatus.Trading,
            realTonReserve: (1 << 120) - 1 as coins,
            curveJettonBalance: (1 << 120) - 1 as coins,
        } });
    return launchGas(LAUNCH_CURVE_FINALIZE_GAS) + launchGas(LAUNCH_CURVE_SERVICE_GAS) +
        refund.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY) +
        finalize.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY) +
        event.estimateFeeWithoutSending(SEND_MODE_REGULAR);
}

fun launchProbeValue(curve: address, id: uint64, leg: uint3): coins {
    val reply = createMessage({ bounce: false, dest: curve, value: (1 << 120) -
            1 as coins, body: LaunchSettlementState {
            queryId: id,
            leg,
            completed: true,
            amount: (1 << 120) - 1 as coins,
        } });
    return launchGas(LAUNCH_PROBE_GAS) + launchGas(LAUNCH_PROBE_RECEIPT_GAS) +
        reply.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY);
}

fun launchMintResolveValue(
    curve: address,
    minter: address,
    recipient: address,
    id: uint64,
    leg: uint3,
): coins {
    val inspection = createMessage({ bounce: true, dest: calcDeployedJettonWallet(
            recipient,
            minter,
            jettonWalletV2CompiledCode(),
        ), value: (1 << 120) - 1 as coins, body: InspectLaunchMint {
            queryId: id,
            leg,
            curve,
        } });
    val inspected = createMessage({ bounce: false, dest: minter, value: (1 << 120) -
            1 as coins, body: LaunchMintInspection {
            queryId: id,
            leg,
            delivered: true,
            amount: (1 << 120) - 1 as coins,
        } });
    val reply = createMessage({ bounce: false, dest: curve, value: (1 << 120) -
            1 as coins, body: LaunchMintResolved {
            queryId: id,
            leg,
            delivered: true,
            failed: false,
            amount: (1 << 120) - 1 as coins,
        } });
    return launchGas(3 * LAUNCH_PROBE_GAS) + launchGas(LAUNCH_PROBE_RECEIPT_GAS) +
        inspection.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY) +
        inspected.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY) +
        reply.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY);
}
