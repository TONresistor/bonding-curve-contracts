import "@stdlib/gas-payments"
import "../v1/errors"
import "../v1/fees-management"
import "../v1/sharding"

// Bounds include the V2 bytecode, maximum wallet data and account overhead.
// Tests check them against the compiled code and deployed wallet storage.
const V2_WALLET_STORAGE_BITS = 16384
const V2_WALLET_STORAGE_CELLS = 32
const V2_TRANSFER_GAS = 9000
const V2_RECEIVE_GAS = 12000
const V2_BURN_GAS = 6000
const V2_BURN_NOTIFICATION_GAS = 5500

fun walletStorageReserve(): coins {
    return calculateStorageFee(
        MY_WORKCHAIN,
        MIN_STORAGE_DURATION,
        V2_WALLET_STORAGE_BITS,
        V2_WALLET_STORAGE_CELLS,
    );
}

fun minimumWalletTransferValue(forwardTonAmount: coins, fwdFee: coins): coins {
    val count = forwardTonAmount != 0 ? 2 : 1;
    val precompiled = getPrecompiledGasConsumption();
    val senderGas = precompiled == null ? V2_TRANSFER_GAS : precompiled;
    val receiverGas = precompiled == null ? V2_RECEIVE_GAS : precompiled;
    return forwardTonAmount + count * fwdFee +
        calculateForwardFeeWithoutLumpPrice(
            MY_WORKCHAIN,
            V2_WALLET_STORAGE_BITS,
            V2_WALLET_STORAGE_CELLS,
        ) +
        calculateGasFee(MY_WORKCHAIN, senderGas) +
        calculateGasFee(MY_WORKCHAIN, receiverGas) +
        walletStorageReserve();
}

fun checkWalletTransferBudget(value: coins, forwardTonAmount: coins, fwdFee: coins) {
    assert (value > minimumWalletTransferValue(forwardTonAmount, fwdFee)) throw Errors.NotEnoughGas;
}

fun minimumCurveSellNotification(fwdFee: coins = 0): coins {
    val fee = max(fwdFee, calculateForwardFee(MY_WORKCHAIN, 2048, 3));
    return max(
        ton("0.05"),
        minimumWalletTransferValue(ton("0.01"), fee) + calculateGasFee(MY_WORKCHAIN, 60000) +
            2 * fee +
            ton("0.005"),
    );
}

fun checkWalletBurnBudget(value: coins) {
    val precompiled = getPrecompiledGasConsumption();
    val senderGas = precompiled == null ? V2_BURN_GAS : precompiled;
    val required = calculateForwardFee(
        MY_WORKCHAIN,
        MESSAGE_SIZE_BURN_NOTIFICATION_BITS,
        MESSAGE_SIZE_BURN_NOTIFICATION_CELLS,
    ) +
        calculateGasFee(MY_WORKCHAIN, senderGas) +
        calculateGasFee(MY_WORKCHAIN, V2_BURN_NOTIFICATION_GAS);
    assert (value > required) throw Errors.NotEnoughGas;
}
