import { BondingCurveV2 as Curve } from '../generated/BondingCurveV2.gen.js';
import { BuybackBurnV2 as Burner } from '../generated/BuybackBurnV2.gen.js';
import { queryOperation } from '../transport.js';

export const prepareBuyback = queryOperation(150_000_000n, Curve.createCellOfPrepareBuyback);
export const claimBuybackFees = queryOperation(500_000_000n, Burner.createCellOfClaimBuybackFees);
export const executeBuyback = queryOperation(800_000_000n, Burner.createCellOfExecuteBuyback);
export const burnAvailable = queryOperation(200_000_000n, Burner.createCellOfBurnAvailable);
