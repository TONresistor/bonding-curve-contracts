import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@tests/v2/migration"
import "@tests/v2/migration-finalization"

fun main() {
    assert (!net.isBroadcasting()) throw 1000;
    testing.setNow(V2_TIME);
    loadV2Libraries();
    simulateFinalization(0);
    simulateFinalization(1);
}
