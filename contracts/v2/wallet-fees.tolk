import "@stdlib/gas-payments"
import "../v1/errors"
import "../v1/fees-management"
import "../v1/sharding"

// Bounds include the V2 bytecode, maximum wallet data and account overhead.
// Tests check them against the compiled code and deployed wallet storage.
const V2_WALLET_STORAGE_BITS = 16384
const V2_WALLET_STORAGE_CELLS = 32

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
    val senderGas = precompiled == null ? GAS_CONSUMPTION_JETTON_TRANSFER : precompiled;
    val receiverGas = precompiled == null ? GAS_CONSUMPTION_JETTON_RECEIVE : precompiled;
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
