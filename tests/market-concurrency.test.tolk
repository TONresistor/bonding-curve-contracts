import "simulation/market"

get fun `test market: deterministic interleaved buys and sells across ten wallets`() {
    runMarket(20260930, 200, 10, false);
}
