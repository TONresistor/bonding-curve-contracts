import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurveMasterV2.gen"
import "@contracts/v1/errors"
import "arguments"

fun main(walletName: string, treasury: address) {
    assert (treasury.getWorkchain() == 0) throw Errors.WrongWorkchain;
    val wallet = scripts.wallet(scriptString(walletName));
    val master = BondingCurveMasterV2.fromStorage({ admin: wallet.address, nextAdmin: null, treasury, totalLaunches: 0, feesBalance: 0 });
    master.deploy(wallet.address, { value: ton("2") }).waitForFirstTransaction();
    println("V2 master={}", master.address);
}
