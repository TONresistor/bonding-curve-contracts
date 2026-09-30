import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMaster.gen"
import "@wrappers/utils"
import "test-utils"

fun setupMaster(): (BondingCurveMaster, Treasury, Treasury) {
    val deployer = testing.treasury("m8-deployer");
    val treasury = testing.treasury("m8-treasury");

    val master = BondingCurveMaster.fromStorage({
        admin: deployer.address,
        nextAdmin: null,
        treasury: treasury.address,
        totalLaunches: 0,
        feesBalance: 0,
    });
    val res = master.sendDeploy(deployer.address, { value: ton("1") });
    expect(res).toHaveSuccessfulDeploy({ to: master.address });
    return (master, deployer, treasury);
}

get fun `test BUG M8: duplicate CreateLaunch inflates totalLaunches counter`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("m8-creator");
    val saltUsed = 8888 as uint64;
    val metadata = buildTestMetadata("ipfs://m8");

    master.sendCreateLaunch(
        creator.address,
        0,
        metadata,
        saltUsed,
        { value: ton("3"), bounce: false },
    );
    val data1 = master.getMasterData();
    expect(data1.totalLaunches).toEqual(1);

    master.sendCreateLaunch(
        creator.address,
        1,
        metadata,
        saltUsed,
        { value: ton("3"), bounce: false },
    );
    val data2 = master.getMasterData();

    expect(data2.totalLaunches).toEqual(1);
}
