// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a BondingCurveV2 contract in Tolk.
/* eslint-disable */

import * as c from '@ton/core';
import { beginCell, ContractProvider, Sender, SendMode } from '@ton/core';

// ————————————————————————————————————————————
//   predefined types and functions
//

type RemainingBitsAndRefs = c.Slice

type StoreCallback<T> = (obj: T, b: c.Builder) => void
type LoadCallback<T> = (s: c.Slice) => T

export type CellRef<T> = {
    ref: T
}

function makeCellFrom<T>(self: T, storeFn_T: StoreCallback<T>): c.Cell {
    let b = beginCell();
    storeFn_T(self, b);
    return b.endCell();
}

function loadAndCheckPrefix32(s: c.Slice, expected: number, structName: string): void {
    let prefix = s.loadUint(32);
    if (prefix !== expected) {
        throw new Error(`Incorrect prefix for '${structName}': expected 0x${expected.toString(16).padStart(8, '0')}, got 0x${prefix.toString(16).padStart(8, '0')}`);
    }
}

function formatPrefix(prefixNum: number, prefixLen: number): string {
    return prefixLen % 4 ? `0b${prefixNum.toString(2).padStart(prefixLen, '0')}` : `0x${prefixNum.toString(16).padStart(prefixLen / 4, '0')}`;
}

function loadAndCheckPrefix(s: c.Slice, expected: number, prefixLen: number, structName: string): void {
    let prefix = s.loadUint(prefixLen);
    if (prefix !== expected) {
        throw new Error(`Incorrect prefix for '${structName}': expected ${formatPrefix(expected, prefixLen)}, got ${formatPrefix(prefix, prefixLen)}`);
    }
}

function lookupPrefix(s: c.Slice, expected: number, prefixLen: number): boolean {
    return s.remainingBits >= prefixLen && s.preloadUint(prefixLen) === expected;
}

function throwNonePrefixMatch(fieldPath: string): never {
    throw new Error(`Incorrect prefix for '${fieldPath}': none of variants matched`);
}

function storeCellRef<T>(cell: CellRef<T>, b: c.Builder, storeFn_T: StoreCallback<T>): void {
    let b_ref = c.beginCell();
    storeFn_T(cell.ref, b_ref);
    b.storeRef(b_ref.endCell());
}

function loadCellRef<T>(s: c.Slice, loadFn_T: LoadCallback<T>): CellRef<T> {
    let s_ref = s.loadRef().beginParse();
    return { ref: loadFn_T(s_ref) };
}

function storeTolkRemaining(v: RemainingBitsAndRefs, b: c.Builder): void {
    b.storeSlice(v);
}

function loadTolkRemaining(s: c.Slice): RemainingBitsAndRefs {
    let rest = s.clone();
    s.loadBits(s.remainingBits);
    while (s.remainingRefs) {
        s.loadRef();
    }
    return rest;
}

function storeTolkNullable<T>(v: T | null, b: c.Builder, storeFn_T: StoreCallback<T>): void {
    if (v === null) {
        b.storeUint(0, 1);
    } else {
        b.storeUint(1, 1);
        storeFn_T(v, b);
    }
}

// ————————————————————————————————————————————
//   parse get methods result from a TVM stack
//

class StackReader {
    constructor(private tuple: c.TupleItem[]) {
    }

    static fromGetMethod(expectedN: number, getMethodResult: { stack: c.TupleReader }): StackReader {
        let tuple = [] as c.TupleItem[];
        while (getMethodResult.stack.remaining) {
            tuple.push(getMethodResult.stack.pop());
        }
        if (tuple.length !== expectedN) {
            throw new Error(`expected ${expectedN} stack width, got ${tuple.length}`);
        }
        return new StackReader(tuple);
    }

    private popExpecting<ItemT>(itemType: string): ItemT {
        const item = this.tuple.shift();
        if (item?.type === itemType) {
            return item as ItemT;
        }
        throw new Error(`not '${itemType}' on a stack`);
    }

    private popCellLike(): c.Cell {
        const item = this.tuple.shift();
        if (item && (item.type === 'cell' || item.type === 'slice' || item.type === 'builder')) {
            return item.cell;
        }
        throw new Error(`not cell/slice on a stack`);
    }

    readBigInt(): bigint {
        return this.popExpecting<c.TupleItemInt>('int').value;
    }

    readBoolean(): boolean {
        return this.popExpecting<c.TupleItemInt>('int').value !== 0n;
    }

    readCell(): c.Cell {
        return this.popCellLike();
    }

    readSlice(): c.Slice {
        return this.popCellLike().beginParse();
    }

    readNullable<T>(readFn_T: (r: StackReader) => T): T | null {
        if (this.tuple[0].type === 'null') {
            this.tuple.shift();
            return null;
        }
        return readFn_T(this);
    }

    readWideNullable<T>(stackW: number, readFn_T: (r: StackReader) => T): T | null {
        const slotTypeId = this.tuple[stackW - 1];
        if (slotTypeId?.type !== 'int') {
            throw new Error(`not 'int' on a stack`);
        }
        if (slotTypeId.value === 0n) {
            this.tuple = this.tuple.slice(stackW);
            return null;
        }
        const valueT = readFn_T(this);
        this.tuple.shift();
        return valueT;
    }

    readCellRef<T>(loadFn_T: LoadCallback<T>): CellRef<T> {
        return { ref: loadFn_T(this.readCell().beginParse()) };
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type int32 = bigint

type uint8 = bigint
type uint16 = bigint
type uint64 = bigint

/**
 > struct (0xa0a0b006) DepositProtocolFees {
 >     queryId: uint64
 >     amount: coins
 >     creator: address
 >     salt: uint64
 >     options: Cell<LaunchOptions>
 > }
 */
export interface DepositProtocolFees {
    readonly $: 'DepositProtocolFees'
    queryId: uint64
    amount: coins
    creator: c.Address
    salt: uint64
    options: CellRef<LaunchOptions>
}

export const DepositProtocolFees = {
    PREFIX: 0xa0a0b006,

    create(args: {
        queryId: uint64
        amount: coins
        creator: c.Address
        salt: uint64
        options: CellRef<LaunchOptions>
    }): DepositProtocolFees {
        return {
            $: 'DepositProtocolFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): DepositProtocolFees {
        loadAndCheckPrefix32(s, 0xa0a0b006, 'DepositProtocolFees');
        return {
            $: 'DepositProtocolFees',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            creator: s.loadAddress(),
            salt: s.loadUintBig(64),
            options: loadCellRef<LaunchOptions>(s, LaunchOptions.fromSlice),
        }
    },
    store(self: DepositProtocolFees, b: c.Builder): void {
        b.storeUint(0xa0a0b006, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        b.storeAddress(self.creator);
        b.storeUint(self.salt, 64);
        storeCellRef<LaunchOptions>(self.options, b, LaunchOptions.store);
    },
    toCell(self: DepositProtocolFees): c.Cell {
        return makeCellFrom<DepositProtocolFees>(self, DepositProtocolFees.store);
    }
}

/**
 > struct (0xa0a0a010) InitializeCurve {
 >     queryId: uint64
 >     jettonMinter: address
 >     refundTo: address?
 >     protocolTreasury: address
 > }
 */
export interface InitializeCurve {
    readonly $: 'InitializeCurve'
    queryId: uint64
    jettonMinter: c.Address
    refundTo: c.Address | null
    protocolTreasury: c.Address
}

export const InitializeCurve = {
    PREFIX: 0xa0a0a010,

    create(args: {
        queryId: uint64
        jettonMinter: c.Address
        refundTo: c.Address | null
        protocolTreasury: c.Address
    }): InitializeCurve {
        return {
            $: 'InitializeCurve',
            ...args
        }
    },
    fromSlice(s: c.Slice): InitializeCurve {
        loadAndCheckPrefix32(s, 0xa0a0a010, 'InitializeCurve');
        return {
            $: 'InitializeCurve',
            queryId: s.loadUintBig(64),
            jettonMinter: s.loadAddress(),
            refundTo: s.loadMaybeAddress(),
            protocolTreasury: s.loadAddress(),
        }
    },
    store(self: InitializeCurve, b: c.Builder): void {
        b.storeUint(0xa0a0a010, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.jettonMinter);
        b.storeAddress(self.refundTo);
        b.storeAddress(self.protocolTreasury);
    },
    toCell(self: InitializeCurve): c.Cell {
        return makeCellFrom<InitializeCurve>(self, InitializeCurve.store);
    }
}

/**
 > struct (0xa0a0a011) BuyJettons {
 >     queryId: uint64
 >     minJettonsOut: coins
 > }
 */
export interface BuyJettons {
    readonly $: 'BuyJettons'
    queryId: uint64
    minJettonsOut: coins
}

export const BuyJettons = {
    PREFIX: 0xa0a0a011,

    create(args: {
        queryId: uint64
        minJettonsOut: coins
    }): BuyJettons {
        return {
            $: 'BuyJettons',
            ...args
        }
    },
    fromSlice(s: c.Slice): BuyJettons {
        loadAndCheckPrefix32(s, 0xa0a0a011, 'BuyJettons');
        return {
            $: 'BuyJettons',
            queryId: s.loadUintBig(64),
            minJettonsOut: s.loadCoins(),
        }
    },
    store(self: BuyJettons, b: c.Builder): void {
        b.storeUint(0xa0a0a011, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.minJettonsOut);
    },
    toCell(self: BuyJettons): c.Cell {
        return makeCellFrom<BuyJettons>(self, BuyJettons.store);
    }
}

/**
 > struct (0xa0a0a013) FlushFees {
 >     queryId: uint64
 > }
 */
export interface FlushFees {
    readonly $: 'FlushFees'
    queryId: uint64
}

export const FlushFees = {
    PREFIX: 0xa0a0a013,

    create(args: {
        queryId: uint64
    }): FlushFees {
        return {
            $: 'FlushFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): FlushFees {
        loadAndCheckPrefix32(s, 0xa0a0a013, 'FlushFees');
        return {
            $: 'FlushFees',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: FlushFees, b: c.Builder): void {
        b.storeUint(0xa0a0a013, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: FlushFees): c.Cell {
        return makeCellFrom<FlushFees>(self, FlushFees.store);
    }
}

/**
 > struct (0xa0a0a012) Graduate {
 >     queryId: uint64
 > }
 */
export interface Graduate {
    readonly $: 'Graduate'
    queryId: uint64
}

export const Graduate = {
    PREFIX: 0xa0a0a012,

    create(args: {
        queryId: uint64
    }): Graduate {
        return {
            $: 'Graduate',
            ...args
        }
    },
    fromSlice(s: c.Slice): Graduate {
        loadAndCheckPrefix32(s, 0xa0a0a012, 'Graduate');
        return {
            $: 'Graduate',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: Graduate, b: c.Builder): void {
        b.storeUint(0xa0a0a012, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: Graduate): c.Cell {
        return makeCellFrom<Graduate>(self, Graduate.store);
    }
}

/**
 > struct (0xce185bd7) InitPoolResultMessage {
 >     queryId: uint64
 >     exitCode: int32
 >     customPayload: cell?
 > }
 */
export interface InitPoolResultMessage {
    readonly $: 'InitPoolResultMessage'
    queryId: uint64
    exitCode: int32
    customPayload: c.Cell | null
}

export const InitPoolResultMessage = {
    PREFIX: 0xce185bd7,

    create(args: {
        queryId: uint64
        exitCode: int32
        customPayload: c.Cell | null
    }): InitPoolResultMessage {
        return {
            $: 'InitPoolResultMessage',
            ...args
        }
    },
    fromSlice(s: c.Slice): InitPoolResultMessage {
        loadAndCheckPrefix32(s, 0xce185bd7, 'InitPoolResultMessage');
        return {
            $: 'InitPoolResultMessage',
            queryId: s.loadUintBig(64),
            exitCode: s.loadIntBig(32),
            customPayload: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: InitPoolResultMessage, b: c.Builder): void {
        b.storeUint(0xce185bd7, 32);
        b.storeUint(self.queryId, 64);
        b.storeInt(self.exitCode, 32);
        storeTolkNullable<c.Cell>(self.customPayload, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: InitPoolResultMessage): c.Cell {
        return makeCellFrom<InitPoolResultMessage>(self, InitPoolResultMessage.store);
    }
}

/**
 > struct (0xde8402ce) DedustInit {
 >     queryId: uint64
 >     customPayload: cell?
 > }
 */
export interface DedustInit {
    readonly $: 'DedustInit'
    queryId: uint64
    customPayload: c.Cell | null
}

export const DedustInit = {
    PREFIX: 0xde8402ce,

    create(args: {
        queryId: uint64
        customPayload: c.Cell | null
    }): DedustInit {
        return {
            $: 'DedustInit',
            ...args
        }
    },
    fromSlice(s: c.Slice): DedustInit {
        loadAndCheckPrefix32(s, 0xde8402ce, 'DedustInit');
        return {
            $: 'DedustInit',
            queryId: s.loadUintBig(64),
            customPayload: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: DedustInit, b: c.Builder): void {
        b.storeUint(0xde8402ce, 32);
        b.storeUint(self.queryId, 64);
        storeTolkNullable<c.Cell>(self.customPayload, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: DedustInit): c.Cell {
        return makeCellFrom<DedustInit>(self, DedustInit.store);
    }
}

/**
 > struct (0xc9a015da) DedustDepositPayload {
 >     amountX: coins
 >     amountY: coins
 >     minimalLiquidity: coins
 >     lockedLiquidityShare: uint16
 > }
 */
export interface DedustDepositPayload {
    readonly $: 'DedustDepositPayload'
    amountX: coins
    amountY: coins
    minimalLiquidity: coins
    lockedLiquidityShare: uint16
}

export const DedustDepositPayload = {
    PREFIX: 0xc9a015da,

    create(args: {
        amountX: coins
        amountY: coins
        minimalLiquidity: coins
        lockedLiquidityShare: uint16
    }): DedustDepositPayload {
        return {
            $: 'DedustDepositPayload',
            ...args
        }
    },
    fromSlice(s: c.Slice): DedustDepositPayload {
        loadAndCheckPrefix32(s, 0xc9a015da, 'DedustDepositPayload');
        return {
            $: 'DedustDepositPayload',
            amountX: s.loadCoins(),
            amountY: s.loadCoins(),
            minimalLiquidity: s.loadCoins(),
            lockedLiquidityShare: s.loadUintBig(16),
        }
    },
    store(self: DedustDepositPayload, b: c.Builder): void {
        b.storeUint(0xc9a015da, 32);
        b.storeCoins(self.amountX);
        b.storeCoins(self.amountY);
        b.storeCoins(self.minimalLiquidity);
        b.storeUint(self.lockedLiquidityShare, 16);
    },
    toCell(self: DedustDepositPayload): c.Cell {
        return makeCellFrom<DedustDepositPayload>(self, DedustDepositPayload.store);
    }
}

/**
 > struct (0xa5a7cbf8) DedustPayNative {
 >     queryId: uint64
 >     amount: coins
 >     paymentPayload: Cell<DedustDepositPayload>
 >     payoutConfig: cell
 > }
 */
export interface DedustPayNative {
    readonly $: 'DedustPayNative'
    queryId: uint64
    amount: coins
    paymentPayload: CellRef<DedustDepositPayload>
    payoutConfig: c.Cell
}

export const DedustPayNative = {
    PREFIX: 0xa5a7cbf8,

    create(args: {
        queryId: uint64
        amount: coins
        paymentPayload: CellRef<DedustDepositPayload>
        payoutConfig: c.Cell
    }): DedustPayNative {
        return {
            $: 'DedustPayNative',
            ...args
        }
    },
    fromSlice(s: c.Slice): DedustPayNative {
        loadAndCheckPrefix32(s, 0xa5a7cbf8, 'DedustPayNative');
        return {
            $: 'DedustPayNative',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            paymentPayload: loadCellRef<DedustDepositPayload>(s, DedustDepositPayload.fromSlice),
            payoutConfig: s.loadRef(),
        }
    },
    store(self: DedustPayNative, b: c.Builder): void {
        b.storeUint(0xa5a7cbf8, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        storeCellRef<DedustDepositPayload>(self.paymentPayload, b, DedustDepositPayload.store);
        b.storeRef(self.payoutConfig);
    },
    toCell(self: DedustPayNative): c.Cell {
        return makeCellFrom<DedustPayNative>(self, DedustPayNative.store);
    }
}

/**
 > struct BuyEvent {
 >     buyer: address
 >     tonInNet: coins
 >     jettonsOut: coins
 >     feeAccrued: coins
 >     realTonReserve: coins
 >     curveJettonBalance: coins
 > }
 */
export interface BuyEvent {
    readonly $: 'BuyEvent'
    buyer: c.Address
    tonInNet: coins
    jettonsOut: coins
    feeAccrued: coins
    realTonReserve: coins
    curveJettonBalance: coins
}

export const BuyEvent = {
    create(args: {
        buyer: c.Address
        tonInNet: coins
        jettonsOut: coins
        feeAccrued: coins
        realTonReserve: coins
        curveJettonBalance: coins
    }): BuyEvent {
        return {
            $: 'BuyEvent',
            ...args
        }
    },
    fromSlice(s: c.Slice): BuyEvent {
        return {
            $: 'BuyEvent',
            buyer: s.loadAddress(),
            tonInNet: s.loadCoins(),
            jettonsOut: s.loadCoins(),
            feeAccrued: s.loadCoins(),
            realTonReserve: s.loadCoins(),
            curveJettonBalance: s.loadCoins(),
        }
    },
    store(self: BuyEvent, b: c.Builder): void {
        b.storeAddress(self.buyer);
        b.storeCoins(self.tonInNet);
        b.storeCoins(self.jettonsOut);
        b.storeCoins(self.feeAccrued);
        b.storeCoins(self.realTonReserve);
        b.storeCoins(self.curveJettonBalance);
    },
    toCell(self: BuyEvent): c.Cell {
        return makeCellFrom<BuyEvent>(self, BuyEvent.store);
    }
}

/**
 > struct SellEvent {
 >     seller: address
 >     jettonsIn: coins
 >     tonOut: coins
 >     feeAccrued: coins
 >     realTonReserve: coins
 >     curveJettonBalance: coins
 > }
 */
export interface SellEvent {
    readonly $: 'SellEvent'
    seller: c.Address
    jettonsIn: coins
    tonOut: coins
    feeAccrued: coins
    realTonReserve: coins
    curveJettonBalance: coins
}

export const SellEvent = {
    create(args: {
        seller: c.Address
        jettonsIn: coins
        tonOut: coins
        feeAccrued: coins
        realTonReserve: coins
        curveJettonBalance: coins
    }): SellEvent {
        return {
            $: 'SellEvent',
            ...args
        }
    },
    fromSlice(s: c.Slice): SellEvent {
        return {
            $: 'SellEvent',
            seller: s.loadAddress(),
            jettonsIn: s.loadCoins(),
            tonOut: s.loadCoins(),
            feeAccrued: s.loadCoins(),
            realTonReserve: s.loadCoins(),
            curveJettonBalance: s.loadCoins(),
        }
    },
    store(self: SellEvent, b: c.Builder): void {
        b.storeAddress(self.seller);
        b.storeCoins(self.jettonsIn);
        b.storeCoins(self.tonOut);
        b.storeCoins(self.feeAccrued);
        b.storeCoins(self.realTonReserve);
        b.storeCoins(self.curveJettonBalance);
    },
    toCell(self: SellEvent): c.Cell {
        return makeCellFrom<SellEvent>(self, SellEvent.store);
    }
}

/**
 > struct GraduateEvent {
 >     poolAddress: address
 >     poolSeedTon: coins
 >     poolSeedJettons: coins
 >     migrationFee: coins
 >     strandedJettons: coins
 > }
 */
export interface GraduateEvent {
    readonly $: 'GraduateEvent'
    poolAddress: c.Address
    poolSeedTon: coins
    poolSeedJettons: coins
    migrationFee: coins
    strandedJettons: coins
}

export const GraduateEvent = {
    create(args: {
        poolAddress: c.Address
        poolSeedTon: coins
        poolSeedJettons: coins
        migrationFee: coins
        strandedJettons: coins
    }): GraduateEvent {
        return {
            $: 'GraduateEvent',
            ...args
        }
    },
    fromSlice(s: c.Slice): GraduateEvent {
        return {
            $: 'GraduateEvent',
            poolAddress: s.loadAddress(),
            poolSeedTon: s.loadCoins(),
            poolSeedJettons: s.loadCoins(),
            migrationFee: s.loadCoins(),
            strandedJettons: s.loadCoins(),
        }
    },
    store(self: GraduateEvent, b: c.Builder): void {
        b.storeAddress(self.poolAddress);
        b.storeCoins(self.poolSeedTon);
        b.storeCoins(self.poolSeedJettons);
        b.storeCoins(self.migrationFee);
        b.storeCoins(self.strandedJettons);
    },
    toCell(self: GraduateEvent): c.Cell {
        return makeCellFrom<GraduateEvent>(self, GraduateEvent.store);
    }
}

/**
 > struct SlippageParseFailedEvent {
 >     seller: address
 >     jettonAmount: coins
 > }
 */
export interface SlippageParseFailedEvent {
    readonly $: 'SlippageParseFailedEvent'
    seller: c.Address
    jettonAmount: coins
}

export const SlippageParseFailedEvent = {
    create(args: {
        seller: c.Address
        jettonAmount: coins
    }): SlippageParseFailedEvent {
        return {
            $: 'SlippageParseFailedEvent',
            ...args
        }
    },
    fromSlice(s: c.Slice): SlippageParseFailedEvent {
        return {
            $: 'SlippageParseFailedEvent',
            seller: s.loadAddress(),
            jettonAmount: s.loadCoins(),
        }
    },
    store(self: SlippageParseFailedEvent, b: c.Builder): void {
        b.storeAddress(self.seller);
        b.storeCoins(self.jettonAmount);
    },
    toCell(self: SlippageParseFailedEvent): c.Cell {
        return makeCellFrom<SlippageParseFailedEvent>(self, SlippageParseFailedEvent.store);
    }
}

/**
 > struct (0xa0a0b030) LaunchMintFailed {
 >     queryId: uint64
 > }
 */
export interface LaunchMintFailed {
    readonly $: 'LaunchMintFailed'
    queryId: uint64
}

export const LaunchMintFailed = {
    PREFIX: 0xa0a0b030,

    create(args: {
        queryId: uint64
    }): LaunchMintFailed {
        return {
            $: 'LaunchMintFailed',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchMintFailed {
        loadAndCheckPrefix32(s, 0xa0a0b030, 'LaunchMintFailed');
        return {
            $: 'LaunchMintFailed',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: LaunchMintFailed, b: c.Builder): void {
        b.storeUint(0xa0a0b030, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: LaunchMintFailed): c.Cell {
        return makeCellFrom<LaunchMintFailed>(self, LaunchMintFailed.store);
    }
}

/**
 > struct (0xa0a0b031) ClaimCurveCreatorFees {
 >     queryId: uint64
 > }
 */
export interface ClaimCurveCreatorFees {
    readonly $: 'ClaimCurveCreatorFees'
    queryId: uint64
}

export const ClaimCurveCreatorFees = {
    PREFIX: 0xa0a0b031,

    create(args: {
        queryId: uint64
    }): ClaimCurveCreatorFees {
        return {
            $: 'ClaimCurveCreatorFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): ClaimCurveCreatorFees {
        loadAndCheckPrefix32(s, 0xa0a0b031, 'ClaimCurveCreatorFees');
        return {
            $: 'ClaimCurveCreatorFees',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ClaimCurveCreatorFees, b: c.Builder): void {
        b.storeUint(0xa0a0b031, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ClaimCurveCreatorFees): c.Cell {
        return makeCellFrom<ClaimCurveCreatorFees>(self, ClaimCurveCreatorFees.store);
    }
}

/**
 > struct (0xa0a0b034) FlushCreatorFees {
 >     queryId: uint64
 > }
 */
export interface FlushCreatorFees {
    readonly $: 'FlushCreatorFees'
    queryId: uint64
}

export const FlushCreatorFees = {
    PREFIX: 0xa0a0b034,

    create(args: {
        queryId: uint64
    }): FlushCreatorFees {
        return {
            $: 'FlushCreatorFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): FlushCreatorFees {
        loadAndCheckPrefix32(s, 0xa0a0b034, 'FlushCreatorFees');
        return {
            $: 'FlushCreatorFees',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: FlushCreatorFees, b: c.Builder): void {
        b.storeUint(0xa0a0b034, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: FlushCreatorFees): c.Cell {
        return makeCellFrom<FlushCreatorFees>(self, FlushCreatorFees.store);
    }
}

/**
 > struct (0xa0a0b032) CancelLaunchFees {
 >     queryId: uint64
 >     creator: address
 >     salt: uint64
 >     options: Cell<LaunchOptions>
 > }
 */
export interface CancelLaunchFees {
    readonly $: 'CancelLaunchFees'
    queryId: uint64
    creator: c.Address
    salt: uint64
    options: CellRef<LaunchOptions>
}

export const CancelLaunchFees = {
    PREFIX: 0xa0a0b032,

    create(args: {
        queryId: uint64
        creator: c.Address
        salt: uint64
        options: CellRef<LaunchOptions>
    }): CancelLaunchFees {
        return {
            $: 'CancelLaunchFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): CancelLaunchFees {
        loadAndCheckPrefix32(s, 0xa0a0b032, 'CancelLaunchFees');
        return {
            $: 'CancelLaunchFees',
            queryId: s.loadUintBig(64),
            creator: s.loadAddress(),
            salt: s.loadUintBig(64),
            options: loadCellRef<LaunchOptions>(s, LaunchOptions.fromSlice),
        }
    },
    store(self: CancelLaunchFees, b: c.Builder): void {
        b.storeUint(0xa0a0b032, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.creator);
        b.storeUint(self.salt, 64);
        storeCellRef<LaunchOptions>(self.options, b, LaunchOptions.store);
    },
    toCell(self: CancelLaunchFees): c.Cell {
        return makeCellFrom<CancelLaunchFees>(self, CancelLaunchFees.store);
    }
}

/**
 > struct (0xa0a0b033) ConfirmLaunch {
 >     queryId: uint64
 >     creator: address
 >     salt: uint64
 >     options: Cell<LaunchOptions>
 > }
 */
export interface ConfirmLaunch {
    readonly $: 'ConfirmLaunch'
    queryId: uint64
    creator: c.Address
    salt: uint64
    options: CellRef<LaunchOptions>
}

export const ConfirmLaunch = {
    PREFIX: 0xa0a0b033,

    create(args: {
        queryId: uint64
        creator: c.Address
        salt: uint64
        options: CellRef<LaunchOptions>
    }): ConfirmLaunch {
        return {
            $: 'ConfirmLaunch',
            ...args
        }
    },
    fromSlice(s: c.Slice): ConfirmLaunch {
        loadAndCheckPrefix32(s, 0xa0a0b033, 'ConfirmLaunch');
        return {
            $: 'ConfirmLaunch',
            queryId: s.loadUintBig(64),
            creator: s.loadAddress(),
            salt: s.loadUintBig(64),
            options: loadCellRef<LaunchOptions>(s, LaunchOptions.fromSlice),
        }
    },
    store(self: ConfirmLaunch, b: c.Builder): void {
        b.storeUint(0xa0a0b033, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.creator);
        b.storeUint(self.salt, 64);
        storeCellRef<LaunchOptions>(self.options, b, LaunchOptions.store);
    },
    toCell(self: ConfirmLaunch): c.Cell {
        return makeCellFrom<ConfirmLaunch>(self, ConfirmLaunch.store);
    }
}

/**
 > struct (0xa0a0b060) RetryMigration {
 >     queryId: uint64
 > }
 */
export interface RetryMigration {
    readonly $: 'RetryMigration'
    queryId: uint64
}

export const RetryMigration = {
    PREFIX: 0xa0a0b060,

    create(args: {
        queryId: uint64
    }): RetryMigration {
        return {
            $: 'RetryMigration',
            ...args
        }
    },
    fromSlice(s: c.Slice): RetryMigration {
        loadAndCheckPrefix32(s, 0xa0a0b060, 'RetryMigration');
        return {
            $: 'RetryMigration',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: RetryMigration, b: c.Builder): void {
        b.storeUint(0xa0a0b060, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: RetryMigration): c.Cell {
        return makeCellFrom<RetryMigration>(self, RetryMigration.store);
    }
}

/**
 > struct (0xa0a0b061) ConfirmMigration {
 >     queryId: uint64
 > }
 */
export interface ConfirmMigration {
    readonly $: 'ConfirmMigration'
    queryId: uint64
}

export const ConfirmMigration = {
    PREFIX: 0xa0a0b061,

    create(args: {
        queryId: uint64
    }): ConfirmMigration {
        return {
            $: 'ConfirmMigration',
            ...args
        }
    },
    fromSlice(s: c.Slice): ConfirmMigration {
        loadAndCheckPrefix32(s, 0xa0a0b061, 'ConfirmMigration');
        return {
            $: 'ConfirmMigration',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ConfirmMigration, b: c.Builder): void {
        b.storeUint(0xa0a0b061, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ConfirmMigration): c.Cell {
        return makeCellFrom<ConfirmMigration>(self, ConfirmMigration.store);
    }
}

/**
 > struct (0x63554160) DepositNotification {
 >     queryId: uint64
 >     liquidity: coins
 >     lockedLiquidity: coins
 >     payload: cell?
 > }
 */
export interface DepositNotification {
    readonly $: 'DepositNotification'
    queryId: uint64
    liquidity: coins
    lockedLiquidity: coins
    payload: c.Cell | null
}

export const DepositNotification = {
    PREFIX: 0x63554160,

    create(args: {
        queryId: uint64
        liquidity: coins
        lockedLiquidity: coins
        payload: c.Cell | null
    }): DepositNotification {
        return {
            $: 'DepositNotification',
            ...args
        }
    },
    fromSlice(s: c.Slice): DepositNotification {
        loadAndCheckPrefix32(s, 0x63554160, 'DepositNotification');
        return {
            $: 'DepositNotification',
            queryId: s.loadUintBig(64),
            liquidity: s.loadCoins(),
            lockedLiquidity: s.loadCoins(),
            payload: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: DepositNotification, b: c.Builder): void {
        b.storeUint(0x63554160, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.liquidity);
        b.storeCoins(self.lockedLiquidity);
        storeTolkNullable<c.Cell>(self.payload, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: DepositNotification): c.Cell {
        return makeCellFrom<DepositNotification>(self, DepositNotification.store);
    }
}

/**
 > struct (0x9e0c2428) ProvidePositionState {
 >     queryId: uint64
 >     includePoolAddress: bool
 >     includeOwnerAddress: bool
 >     includeFees: bool
 >     includeRewards: bool
 > }
 */
export interface ProvidePositionState {
    readonly $: 'ProvidePositionState'
    queryId: uint64
    includePoolAddress: boolean
    includeOwnerAddress: boolean
    includeFees: boolean
    includeRewards: boolean
}

export const ProvidePositionState = {
    PREFIX: 0x9e0c2428,

    create(args: {
        queryId: uint64
        includePoolAddress: boolean
        includeOwnerAddress: boolean
        includeFees: boolean
        includeRewards: boolean
    }): ProvidePositionState {
        return {
            $: 'ProvidePositionState',
            ...args
        }
    },
    fromSlice(s: c.Slice): ProvidePositionState {
        loadAndCheckPrefix32(s, 0x9e0c2428, 'ProvidePositionState');
        return {
            $: 'ProvidePositionState',
            queryId: s.loadUintBig(64),
            includePoolAddress: s.loadBoolean(),
            includeOwnerAddress: s.loadBoolean(),
            includeFees: s.loadBoolean(),
            includeRewards: s.loadBoolean(),
        }
    },
    store(self: ProvidePositionState, b: c.Builder): void {
        b.storeUint(0x9e0c2428, 32);
        b.storeUint(self.queryId, 64);
        b.storeBit(self.includePoolAddress);
        b.storeBit(self.includeOwnerAddress);
        b.storeBit(self.includeFees);
        b.storeBit(self.includeRewards);
    },
    toCell(self: ProvidePositionState): c.Cell {
        return makeCellFrom<ProvidePositionState>(self, ProvidePositionState.store);
    }
}

/**
 > struct (0x52e659c0) TakePositionState {
 >     queryId: uint64
 >     liquidity: coins
 >     lockedLiquidity: coins
 >     rest: RemainingBitsAndRefs
 > }
 */
export interface TakePositionState {
    readonly $: 'TakePositionState'
    queryId: uint64
    liquidity: coins
    lockedLiquidity: coins
    rest: RemainingBitsAndRefs
}

export const TakePositionState = {
    PREFIX: 0x52e659c0,

    create(args: {
        queryId: uint64
        liquidity: coins
        lockedLiquidity: coins
        rest: RemainingBitsAndRefs
    }): TakePositionState {
        return {
            $: 'TakePositionState',
            ...args
        }
    },
    fromSlice(s: c.Slice): TakePositionState {
        loadAndCheckPrefix32(s, 0x52e659c0, 'TakePositionState');
        return {
            $: 'TakePositionState',
            queryId: s.loadUintBig(64),
            liquidity: s.loadCoins(),
            lockedLiquidity: s.loadCoins(),
            rest: loadTolkRemaining(s),
        }
    },
    store(self: TakePositionState, b: c.Builder): void {
        b.storeUint(0x52e659c0, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.liquidity);
        b.storeCoins(self.lockedLiquidity);
        storeTolkRemaining(self.rest, b);
    },
    toCell(self: TakePositionState): c.Cell {
        return makeCellFrom<TakePositionState>(self, TakePositionState.store);
    }
}

/**
 > struct MigrationProgress {
 >     nativeQueryId: uint64
 >     jettonQueryId: uint64
 >     tonAmount: coins
 >     jettonAmount: coins
 >     nativeRetry: bool
 >     jettonRetry: bool
 > }
 */
export interface MigrationProgress {
    readonly $: 'MigrationProgress'
    nativeQueryId: uint64
    jettonQueryId: uint64
    tonAmount: coins
    jettonAmount: coins
    nativeRetry: boolean
    jettonRetry: boolean
}

export const MigrationProgress = {
    create(args: {
        nativeQueryId: uint64
        jettonQueryId: uint64
        tonAmount: coins
        jettonAmount: coins
        nativeRetry: boolean
        jettonRetry: boolean
    }): MigrationProgress {
        return {
            $: 'MigrationProgress',
            ...args
        }
    },
    fromSlice(s: c.Slice): MigrationProgress {
        return {
            $: 'MigrationProgress',
            nativeQueryId: s.loadUintBig(64),
            jettonQueryId: s.loadUintBig(64),
            tonAmount: s.loadCoins(),
            jettonAmount: s.loadCoins(),
            nativeRetry: s.loadBoolean(),
            jettonRetry: s.loadBoolean(),
        }
    },
    store(self: MigrationProgress, b: c.Builder): void {
        b.storeUint(self.nativeQueryId, 64);
        b.storeUint(self.jettonQueryId, 64);
        b.storeCoins(self.tonAmount);
        b.storeCoins(self.jettonAmount);
        b.storeBit(self.nativeRetry);
        b.storeBit(self.jettonRetry);
    },
    toCell(self: MigrationProgress): c.Cell {
        return makeCellFrom<MigrationProgress>(self, MigrationProgress.store);
    }
}

/**
 > struct LaunchOptions {
 >     supply: coins
 >     creatorFeeBps: uint16
 >     devBuyAmount: coins
 >     minDevTokens: coins
 >     graduationThreshold: coins
 >     reserveRatio: uint8
 >     minBuyBps: uint16
 >     maxBuyBps: uint16
 >     beneficiaries: Cell<FeeBeneficiaries>?
 >     buybackBurn: bool
 > }
 */
export interface LaunchOptions {
    readonly $: 'LaunchOptions'
    supply: coins
    creatorFeeBps: uint16
    devBuyAmount: coins
    minDevTokens: coins
    graduationThreshold: coins /* = 2000000000000 as coins */
    reserveRatio: uint8 /* = 5 */
    minBuyBps: uint16 /* = 0 */
    maxBuyBps: uint16 /* = 0 */
    beneficiaries: CellRef<FeeBeneficiaries> | null /* = null */
    buybackBurn: boolean /* = false */
}

export const LaunchOptions = {
    create(args: {
        supply: coins
        creatorFeeBps: uint16
        devBuyAmount: coins
        minDevTokens: coins
        graduationThreshold?: coins /* = 2000000000000 as coins */
        reserveRatio?: uint8 /* = 5 */
        minBuyBps?: uint16 /* = 0 */
        maxBuyBps?: uint16 /* = 0 */
        beneficiaries?: CellRef<FeeBeneficiaries> | null /* = null */
        buybackBurn?: boolean /* = false */
    }): LaunchOptions {
        return {
            $: 'LaunchOptions',
            graduationThreshold: 2000000000000n,
            reserveRatio: 5n,
            minBuyBps: 0n,
            maxBuyBps: 0n,
            beneficiaries: null,
            buybackBurn: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchOptions {
        return {
            $: 'LaunchOptions',
            supply: s.loadCoins(),
            creatorFeeBps: s.loadUintBig(16),
            devBuyAmount: s.loadCoins(),
            minDevTokens: s.loadCoins(),
            graduationThreshold: s.loadCoins(),
            reserveRatio: s.loadUintBig(8),
            minBuyBps: s.loadUintBig(16),
            maxBuyBps: s.loadUintBig(16),
            beneficiaries: s.loadBoolean() ? loadCellRef<FeeBeneficiaries>(s, FeeBeneficiaries.fromSlice) : null,
            buybackBurn: s.loadBoolean(),
        }
    },
    store(self: LaunchOptions, b: c.Builder): void {
        b.storeCoins(self.supply);
        b.storeUint(self.creatorFeeBps, 16);
        b.storeCoins(self.devBuyAmount);
        b.storeCoins(self.minDevTokens);
        b.storeCoins(self.graduationThreshold);
        b.storeUint(self.reserveRatio, 8);
        b.storeUint(self.minBuyBps, 16);
        b.storeUint(self.maxBuyBps, 16);
        storeTolkNullable<CellRef<FeeBeneficiaries>>(self.beneficiaries, b,
            (v,b) => storeCellRef<FeeBeneficiaries>(v, b, FeeBeneficiaries.store)
        );
        b.storeBit(self.buybackBurn);
    },
    toCell(self: LaunchOptions): c.Cell {
        return makeCellFrom<LaunchOptions>(self, LaunchOptions.store);
    }
}

/**
 > struct LaunchProgress {
 >     protocolTreasury: address?
 >     curveReceived: bool
 >     devReceived: bool
 >     devTokens: coins
 >     creatorAccrued: coins
 > }
 */
export interface LaunchProgress {
    readonly $: 'LaunchProgress'
    protocolTreasury: c.Address | null
    curveReceived: boolean
    devReceived: boolean
    devTokens: coins
    creatorAccrued: coins
}

export const LaunchProgress = {
    create(args: {
        protocolTreasury: c.Address | null
        curveReceived: boolean
        devReceived: boolean
        devTokens: coins
        creatorAccrued: coins
    }): LaunchProgress {
        return {
            $: 'LaunchProgress',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchProgress {
        return {
            $: 'LaunchProgress',
            protocolTreasury: s.loadMaybeAddress(),
            curveReceived: s.loadBoolean(),
            devReceived: s.loadBoolean(),
            devTokens: s.loadCoins(),
            creatorAccrued: s.loadCoins(),
        }
    },
    store(self: LaunchProgress, b: c.Builder): void {
        b.storeAddress(self.protocolTreasury);
        b.storeBit(self.curveReceived);
        b.storeBit(self.devReceived);
        b.storeCoins(self.devTokens);
        b.storeCoins(self.creatorAccrued);
    },
    toCell(self: LaunchProgress): c.Cell {
        return makeCellFrom<LaunchProgress>(self, LaunchProgress.store);
    }
}

/**
 > struct LaunchConfig {
 >     master: address
 >     creator: address
 >     salt: uint64
 >     curveSupply: coins
 >     dexReserveSupply: coins
 >     graduationThreshold: coins
 >     options: Cell<LaunchOptions>
 > }
 */
export interface LaunchConfig {
    readonly $: 'LaunchConfig'
    master: c.Address
    creator: c.Address
    salt: uint64
    curveSupply: coins
    dexReserveSupply: coins
    graduationThreshold: coins
    options: CellRef<LaunchOptions>
}

export const LaunchConfig = {
    create(args: {
        master: c.Address
        creator: c.Address
        salt: uint64
        curveSupply: coins
        dexReserveSupply: coins
        graduationThreshold: coins
        options: CellRef<LaunchOptions>
    }): LaunchConfig {
        return {
            $: 'LaunchConfig',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchConfig {
        return {
            $: 'LaunchConfig',
            master: s.loadAddress(),
            creator: s.loadAddress(),
            salt: s.loadUintBig(64),
            curveSupply: s.loadCoins(),
            dexReserveSupply: s.loadCoins(),
            graduationThreshold: s.loadCoins(),
            options: loadCellRef<LaunchOptions>(s, LaunchOptions.fromSlice),
        }
    },
    store(self: LaunchConfig, b: c.Builder): void {
        b.storeAddress(self.master);
        b.storeAddress(self.creator);
        b.storeUint(self.salt, 64);
        b.storeCoins(self.curveSupply);
        b.storeCoins(self.dexReserveSupply);
        b.storeCoins(self.graduationThreshold);
        storeCellRef<LaunchOptions>(self.options, b, LaunchOptions.store);
    },
    toCell(self: LaunchConfig): c.Cell {
        return makeCellFrom<LaunchConfig>(self, LaunchConfig.store);
    }
}

/**
 > struct BondingCurveStorage {
 >     state: uint8
 >     jettonMinter: address?
 >     virtualTonReserve: coins
 >     realTonReserve: coins
 >     curveJettonBalance: coins
 >     feeAccrued: coins
 >     migrationReserve: coins
 >     config: Cell<LaunchConfig>
 >     dropAdminPending: bool
 >     pendingBuyTonInNet: coins
 >     progress: Cell<LaunchProgress>
 >     migration: Cell<MigrationProgress>?
 > }
 */
export interface BondingCurveStorage {
    readonly $: 'BondingCurveStorage'
    state: uint8
    jettonMinter: c.Address | null
    virtualTonReserve: coins
    realTonReserve: coins
    curveJettonBalance: coins
    feeAccrued: coins
    migrationReserve: coins
    config: CellRef<LaunchConfig>
    dropAdminPending: boolean
    pendingBuyTonInNet: coins
    progress: CellRef<LaunchProgress>
    migration: CellRef<MigrationProgress> | null /* = null */
}

export const BondingCurveStorage = {
    create(args: {
        state: uint8
        jettonMinter: c.Address | null
        virtualTonReserve: coins
        realTonReserve: coins
        curveJettonBalance: coins
        feeAccrued: coins
        migrationReserve: coins
        config: CellRef<LaunchConfig>
        dropAdminPending: boolean
        pendingBuyTonInNet: coins
        progress: CellRef<LaunchProgress>
        migration?: CellRef<MigrationProgress> | null /* = null */
    }): BondingCurveStorage {
        return {
            $: 'BondingCurveStorage',
            migration: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): BondingCurveStorage {
        return {
            $: 'BondingCurveStorage',
            state: s.loadUintBig(8),
            jettonMinter: s.loadMaybeAddress(),
            virtualTonReserve: s.loadCoins(),
            realTonReserve: s.loadCoins(),
            curveJettonBalance: s.loadCoins(),
            feeAccrued: s.loadCoins(),
            migrationReserve: s.loadCoins(),
            config: loadCellRef<LaunchConfig>(s, LaunchConfig.fromSlice),
            dropAdminPending: s.loadBoolean(),
            pendingBuyTonInNet: s.loadCoins(),
            progress: loadCellRef<LaunchProgress>(s, LaunchProgress.fromSlice),
            migration: s.loadBoolean() ? loadCellRef<MigrationProgress>(s, MigrationProgress.fromSlice) : null,
        }
    },
    store(self: BondingCurveStorage, b: c.Builder): void {
        b.storeUint(self.state, 8);
        b.storeAddress(self.jettonMinter);
        b.storeCoins(self.virtualTonReserve);
        b.storeCoins(self.realTonReserve);
        b.storeCoins(self.curveJettonBalance);
        b.storeCoins(self.feeAccrued);
        b.storeCoins(self.migrationReserve);
        storeCellRef<LaunchConfig>(self.config, b, LaunchConfig.store);
        b.storeBit(self.dropAdminPending);
        b.storeCoins(self.pendingBuyTonInNet);
        storeCellRef<LaunchProgress>(self.progress, b, LaunchProgress.store);
        storeTolkNullable<CellRef<MigrationProgress>>(self.migration, b,
            (v,b) => storeCellRef<MigrationProgress>(v, b, MigrationProgress.store)
        );
    },
    toCell(self: BondingCurveStorage): c.Cell {
        return makeCellFrom<BondingCurveStorage>(self, BondingCurveStorage.store);
    }
}

/**
 > struct BondingCurveDataReply {
 >     state: uint8
 >     creator: address
 >     salt: uint64
 >     jettonMinter: address?
 >     virtualTonReserve: coins
 >     realTonReserve: coins
 >     curveJettonBalance: coins
 >     curveSupply: coins
 >     dexReserveSupply: coins
 >     graduationThreshold: coins
 >     feeAccrued: coins
 >     migrationReserve: coins
 >     dropAdminPending: bool
 >     pendingBuyTonInNet: coins
 > }
 */
export interface BondingCurveDataReply {
    readonly $: 'BondingCurveDataReply'
    state: uint8
    creator: c.Address
    salt: uint64
    jettonMinter: c.Address | null
    virtualTonReserve: coins
    realTonReserve: coins
    curveJettonBalance: coins
    curveSupply: coins
    dexReserveSupply: coins
    graduationThreshold: coins
    feeAccrued: coins
    migrationReserve: coins
    dropAdminPending: boolean
    pendingBuyTonInNet: coins
}

export const BondingCurveDataReply = {
    create(args: {
        state: uint8
        creator: c.Address
        salt: uint64
        jettonMinter: c.Address | null
        virtualTonReserve: coins
        realTonReserve: coins
        curveJettonBalance: coins
        curveSupply: coins
        dexReserveSupply: coins
        graduationThreshold: coins
        feeAccrued: coins
        migrationReserve: coins
        dropAdminPending: boolean
        pendingBuyTonInNet: coins
    }): BondingCurveDataReply {
        return {
            $: 'BondingCurveDataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): BondingCurveDataReply {
        return {
            $: 'BondingCurveDataReply',
            state: s.loadUintBig(8),
            creator: s.loadAddress(),
            salt: s.loadUintBig(64),
            jettonMinter: s.loadMaybeAddress(),
            virtualTonReserve: s.loadCoins(),
            realTonReserve: s.loadCoins(),
            curveJettonBalance: s.loadCoins(),
            curveSupply: s.loadCoins(),
            dexReserveSupply: s.loadCoins(),
            graduationThreshold: s.loadCoins(),
            feeAccrued: s.loadCoins(),
            migrationReserve: s.loadCoins(),
            dropAdminPending: s.loadBoolean(),
            pendingBuyTonInNet: s.loadCoins(),
        }
    },
    store(self: BondingCurveDataReply, b: c.Builder): void {
        b.storeUint(self.state, 8);
        b.storeAddress(self.creator);
        b.storeUint(self.salt, 64);
        b.storeAddress(self.jettonMinter);
        b.storeCoins(self.virtualTonReserve);
        b.storeCoins(self.realTonReserve);
        b.storeCoins(self.curveJettonBalance);
        b.storeCoins(self.curveSupply);
        b.storeCoins(self.dexReserveSupply);
        b.storeCoins(self.graduationThreshold);
        b.storeCoins(self.feeAccrued);
        b.storeCoins(self.migrationReserve);
        b.storeBit(self.dropAdminPending);
        b.storeCoins(self.pendingBuyTonInNet);
    },
    toCell(self: BondingCurveDataReply): c.Cell {
        return makeCellFrom<BondingCurveDataReply>(self, BondingCurveDataReply.store);
    }
}

/**
 > struct FeeRatesReply {
 >     curveProtocolBps: int
 >     curveCreatorBps: int
 >     poolBaseFeeBps: int
 >     poolCreatorAllocationBps: int
 >     poolProtocolPpb: int
 >     poolCreatorPpb: int
 >     poolLpPpb: int
 >     dedustPpb: int
 > }
 */
export interface FeeRatesReply {
    readonly $: 'FeeRatesReply'
    curveProtocolBps: bigint
    curveCreatorBps: bigint
    poolBaseFeeBps: bigint
    poolCreatorAllocationBps: bigint
    poolProtocolPpb: bigint
    poolCreatorPpb: bigint
    poolLpPpb: bigint
    dedustPpb: bigint
}

export const FeeRatesReply = {
    create(args: {
        curveProtocolBps: bigint
        curveCreatorBps: bigint
        poolBaseFeeBps: bigint
        poolCreatorAllocationBps: bigint
        poolProtocolPpb: bigint
        poolCreatorPpb: bigint
        poolLpPpb: bigint
        dedustPpb: bigint
    }): FeeRatesReply {
        return {
            $: 'FeeRatesReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): FeeRatesReply {
        throw new Error(`Can't unpack 'FeeRatesReply' from cell, because 'FeeRatesReply.curveProtocolBps' is 'int' (not int32/uint64/etc.)`);
    },
    store(self: FeeRatesReply, b: c.Builder): void {
        throw new Error(`Can't pack 'FeeRatesReply' to cell, because 'self.curveProtocolBps' is 'int' (not int32/uint64/etc.)`);
    },
    toCell(self: FeeRatesReply): c.Cell {
        return makeCellFrom<FeeRatesReply>(self, FeeRatesReply.store);
    }
}

/**
 > struct LaunchPreview {
 >     minBuyTokens: coins
 >     maxBuyTokens: coins
 >     virtualTonReserve: coins
 >     graduationThreshold: coins
 >     soldTokens: coins
 >     poolTon: coins
 >     poolTokens: coins
 >     remainingTokens: coins
 >     initialPriceNanoPerBillion: int
 >     graduationPriceNanoPerBillion: int
 > }
 */
export interface LaunchPreview {
    readonly $: 'LaunchPreview'
    minBuyTokens: coins
    maxBuyTokens: coins
    virtualTonReserve: coins
    graduationThreshold: coins
    soldTokens: coins
    poolTon: coins
    poolTokens: coins
    remainingTokens: coins
    initialPriceNanoPerBillion: bigint
    graduationPriceNanoPerBillion: bigint
}

export const LaunchPreview = {
    create(args: {
        minBuyTokens: coins
        maxBuyTokens: coins
        virtualTonReserve: coins
        graduationThreshold: coins
        soldTokens: coins
        poolTon: coins
        poolTokens: coins
        remainingTokens: coins
        initialPriceNanoPerBillion: bigint
        graduationPriceNanoPerBillion: bigint
    }): LaunchPreview {
        return {
            $: 'LaunchPreview',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchPreview {
        throw new Error(`Can't unpack 'LaunchPreview' from cell, because 'LaunchPreview.initialPriceNanoPerBillion' is 'int' (not int32/uint64/etc.)`);
    },
    store(self: LaunchPreview, b: c.Builder): void {
        throw new Error(`Can't pack 'LaunchPreview' to cell, because 'self.initialPriceNanoPerBillion' is 'int' (not int32/uint64/etc.)`);
    },
    toCell(self: LaunchPreview): c.Cell {
        return makeCellFrom<LaunchPreview>(self, LaunchPreview.store);
    }
}

/**
 > struct (0xa0a0b060) InitBuyback {
 >     queryId: uint64
 >     config: Cell<BuybackConfig>
 >     active: bool
 > }
 */
export interface InitBuyback {
    readonly $: 'InitBuyback'
    queryId: uint64
    config: CellRef<BuybackConfig>
    active: boolean
}

export const InitBuyback = {
    PREFIX: 0xa0a0b060,

    create(args: {
        queryId: uint64
        config: CellRef<BuybackConfig>
        active: boolean
    }): InitBuyback {
        return {
            $: 'InitBuyback',
            ...args
        }
    },
    fromSlice(s: c.Slice): InitBuyback {
        loadAndCheckPrefix32(s, 0xa0a0b060, 'InitBuyback');
        return {
            $: 'InitBuyback',
            queryId: s.loadUintBig(64),
            config: loadCellRef<BuybackConfig>(s, BuybackConfig.fromSlice),
            active: s.loadBoolean(),
        }
    },
    store(self: InitBuyback, b: c.Builder): void {
        b.storeUint(0xa0a0b060, 32);
        b.storeUint(self.queryId, 64);
        storeCellRef<BuybackConfig>(self.config, b, BuybackConfig.store);
        b.storeBit(self.active);
    },
    toCell(self: InitBuyback): c.Cell {
        return makeCellFrom<InitBuyback>(self, InitBuyback.store);
    }
}

/**
 > struct (0xa0a0b065) PrepareBuyback {
 >     queryId: uint64
 > }
 */
export interface PrepareBuyback {
    readonly $: 'PrepareBuyback'
    queryId: uint64
}

export const PrepareBuyback = {
    PREFIX: 0xa0a0b065,

    create(args: {
        queryId: uint64
    }): PrepareBuyback {
        return {
            $: 'PrepareBuyback',
            ...args
        }
    },
    fromSlice(s: c.Slice): PrepareBuyback {
        loadAndCheckPrefix32(s, 0xa0a0b065, 'PrepareBuyback');
        return {
            $: 'PrepareBuyback',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: PrepareBuyback, b: c.Builder): void {
        b.storeUint(0xa0a0b065, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: PrepareBuyback): c.Cell {
        return makeCellFrom<PrepareBuyback>(self, PrepareBuyback.store);
    }
}

/**
 > struct BuybackConfig {
 >     minter: address
 >     collector: address
 >     splitter: address
 >     creatorFeeBps: uint16
 > }
 */
export interface BuybackConfig {
    readonly $: 'BuybackConfig'
    minter: c.Address
    collector: c.Address
    splitter: c.Address
    creatorFeeBps: uint16
}

export const BuybackConfig = {
    create(args: {
        minter: c.Address
        collector: c.Address
        splitter: c.Address
        creatorFeeBps: uint16
    }): BuybackConfig {
        return {
            $: 'BuybackConfig',
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackConfig {
        return {
            $: 'BuybackConfig',
            minter: s.loadAddress(),
            collector: s.loadAddress(),
            splitter: s.loadAddress(),
            creatorFeeBps: s.loadUintBig(16),
        }
    },
    store(self: BuybackConfig, b: c.Builder): void {
        b.storeAddress(self.minter);
        b.storeAddress(self.collector);
        b.storeAddress(self.splitter);
        b.storeUint(self.creatorFeeBps, 16);
    },
    toCell(self: BuybackConfig): c.Cell {
        return makeCellFrom<BuybackConfig>(self, BuybackConfig.store);
    }
}

/**
 > struct FeeBeneficiaries {
 >     shares: map<address, uint16>
 > }
 */
export interface FeeBeneficiaries {
    readonly $: 'FeeBeneficiaries'
    shares: c.Dictionary<c.Address, uint16>
}

export const FeeBeneficiaries = {
    create(args: {
        shares: c.Dictionary<c.Address, uint16>
    }): FeeBeneficiaries {
        return {
            $: 'FeeBeneficiaries',
            ...args
        }
    },
    fromSlice(s: c.Slice): FeeBeneficiaries {
        return {
            $: 'FeeBeneficiaries',
            shares: c.Dictionary.load<c.Address, uint16>(c.Dictionary.Keys.Address(), c.Dictionary.Values.BigUint(16), s),
        }
    },
    store(self: FeeBeneficiaries, b: c.Builder): void {
        b.storeDict<c.Address, uint16>(self.shares, c.Dictionary.Keys.Address(), c.Dictionary.Values.BigUint(16));
    },
    toCell(self: FeeBeneficiaries): c.Cell {
        return makeCellFrom<FeeBeneficiaries>(self, FeeBeneficiaries.store);
    }
}

/**
 > struct (0xa0a0b044) CreditCurveFees {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface CreditCurveFees {
    readonly $: 'CreditCurveFees'
    queryId: uint64
    amount: coins
}

export const CreditCurveFees = {
    PREFIX: 0xa0a0b044,

    create(args: {
        queryId: uint64
        amount: coins
    }): CreditCurveFees {
        return {
            $: 'CreditCurveFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): CreditCurveFees {
        loadAndCheckPrefix32(s, 0xa0a0b044, 'CreditCurveFees');
        return {
            $: 'CreditCurveFees',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: CreditCurveFees, b: c.Builder): void {
        b.storeUint(0xa0a0b044, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: CreditCurveFees): c.Cell {
        return makeCellFrom<CreditCurveFees>(self, CreditCurveFees.store);
    }
}

/**
 > struct (0xa0a0b055) MintCurveWallet {
 >     queryId: uint64
 >     jettonAmount: coins
 >     tonAmount: coins
 > }
 */
export interface MintCurveWallet {
    readonly $: 'MintCurveWallet'
    queryId: uint64
    jettonAmount: coins
    tonAmount: coins
}

export const MintCurveWallet = {
    PREFIX: 0xa0a0b055,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        tonAmount: coins
    }): MintCurveWallet {
        return {
            $: 'MintCurveWallet',
            ...args
        }
    },
    fromSlice(s: c.Slice): MintCurveWallet {
        loadAndCheckPrefix32(s, 0xa0a0b055, 'MintCurveWallet');
        return {
            $: 'MintCurveWallet',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            tonAmount: s.loadCoins(),
        }
    },
    store(self: MintCurveWallet, b: c.Builder): void {
        b.storeUint(0xa0a0b055, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeCoins(self.tonAmount);
    },
    toCell(self: MintCurveWallet): c.Cell {
        return makeCellFrom<MintCurveWallet>(self, MintCurveWallet.store);
    }
}

/**
 > struct (0xa0a0b050) MintDelivered {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface MintDelivered {
    readonly $: 'MintDelivered'
    queryId: uint64
    amount: coins
}

export const MintDelivered = {
    PREFIX: 0xa0a0b050,

    create(args: {
        queryId: uint64
        amount: coins
    }): MintDelivered {
        return {
            $: 'MintDelivered',
            ...args
        }
    },
    fromSlice(s: c.Slice): MintDelivered {
        loadAndCheckPrefix32(s, 0xa0a0b050, 'MintDelivered');
        return {
            $: 'MintDelivered',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: MintDelivered, b: c.Builder): void {
        b.storeUint(0xa0a0b050, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: MintDelivered): c.Cell {
        return makeCellFrom<MintDelivered>(self, MintDelivered.store);
    }
}

/**
 > struct (0xa0a0b051) TransferDelivered {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface TransferDelivered {
    readonly $: 'TransferDelivered'
    queryId: uint64
    amount: coins
}

export const TransferDelivered = {
    PREFIX: 0xa0a0b051,

    create(args: {
        queryId: uint64
        amount: coins
    }): TransferDelivered {
        return {
            $: 'TransferDelivered',
            ...args
        }
    },
    fromSlice(s: c.Slice): TransferDelivered {
        loadAndCheckPrefix32(s, 0xa0a0b051, 'TransferDelivered');
        return {
            $: 'TransferDelivered',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: TransferDelivered, b: c.Builder): void {
        b.storeUint(0xa0a0b051, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: TransferDelivered): c.Cell {
        return makeCellFrom<TransferDelivered>(self, TransferDelivered.store);
    }
}

/**
 > struct (0xa0a0b052) TransferFailed {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface TransferFailed {
    readonly $: 'TransferFailed'
    queryId: uint64
    amount: coins
}

export const TransferFailed = {
    PREFIX: 0xa0a0b052,

    create(args: {
        queryId: uint64
        amount: coins
    }): TransferFailed {
        return {
            $: 'TransferFailed',
            ...args
        }
    },
    fromSlice(s: c.Slice): TransferFailed {
        loadAndCheckPrefix32(s, 0xa0a0b052, 'TransferFailed');
        return {
            $: 'TransferFailed',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: TransferFailed, b: c.Builder): void {
        b.storeUint(0xa0a0b052, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: TransferFailed): c.Cell {
        return makeCellFrom<TransferFailed>(self, TransferFailed.store);
    }
}

/**
 > struct (0xa0a0b053) AskToTransferTracked {
 >     queryId: uint64
 >     jettonAmount: coins
 >     transferRecipient: address
 >     sendExcessesTo: address?
 >     customPayload: cell?
 >     forwardTonAmount: coins
 >     forwardPayload: ForwardPayloadRemainder
 > }
 */
export interface AskToTransferTracked {
    readonly $: 'AskToTransferTracked'
    queryId: uint64
    jettonAmount: coins
    transferRecipient: c.Address
    sendExcessesTo: c.Address | null
    customPayload: c.Cell | null
    forwardTonAmount: coins
    forwardPayload: ForwardPayloadRemainder
}

export const AskToTransferTracked = {
    PREFIX: 0xa0a0b053,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
        forwardTonAmount: coins
        forwardPayload: ForwardPayloadRemainder
    }): AskToTransferTracked {
        return {
            $: 'AskToTransferTracked',
            ...args
        }
    },
    fromSlice(s: c.Slice): AskToTransferTracked {
        loadAndCheckPrefix32(s, 0xa0a0b053, 'AskToTransferTracked');
        return {
            $: 'AskToTransferTracked',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            transferRecipient: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
            customPayload: s.loadBoolean() ? s.loadRef() : null,
            forwardTonAmount: s.loadCoins(),
            forwardPayload: ForwardPayloadRemainder.fromSlice(s),
        }
    },
    store(self: AskToTransferTracked, b: c.Builder): void {
        b.storeUint(0xa0a0b053, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.transferRecipient);
        b.storeAddress(self.sendExcessesTo);
        storeTolkNullable<c.Cell>(self.customPayload, b,
            (v,b) => b.storeRef(v)
        );
        b.storeCoins(self.forwardTonAmount);
        ForwardPayloadRemainder.store(self.forwardPayload, b);
    },
    toCell(self: AskToTransferTracked): c.Cell {
        return makeCellFrom<AskToTransferTracked>(self, AskToTransferTracked.store);
    }
}

/**
 > type ForwardPayloadRemainder = RemainingBitsAndRefs
 */
export type ForwardPayloadRemainder = RemainingBitsAndRefs

export const ForwardPayloadRemainder = {
    fromSlice(s: c.Slice): ForwardPayloadRemainder {
        return loadTolkRemaining(s);
    },
    store(self: ForwardPayloadRemainder, b: c.Builder): void {
        storeTolkRemaining(self, b);
    },
    toCell(self: ForwardPayloadRemainder): c.Cell {
        return makeCellFrom<ForwardPayloadRemainder>(self, ForwardPayloadRemainder.store);
    }
}

/**
 > struct (0b0) PayloadInline {
 >     value: RemainingBitsAndRefs
 > }
 */
export interface PayloadInline {
    readonly $: 'PayloadInline'
    value: RemainingBitsAndRefs
}

export const PayloadInline = {
    PREFIX: 0b0,

    create(args: {
        value: RemainingBitsAndRefs
    }): PayloadInline {
        return {
            $: 'PayloadInline',
            ...args
        }
    },
    fromSlice(s: c.Slice): PayloadInline {
        loadAndCheckPrefix(s, 0b0, 1, 'PayloadInline');
        return {
            $: 'PayloadInline',
            value: loadTolkRemaining(s),
        }
    },
    store(self: PayloadInline, b: c.Builder): void {
        b.storeUint(0b0, 1);
        storeTolkRemaining(self.value, b);
    },
    toCell(self: PayloadInline): c.Cell {
        return makeCellFrom<PayloadInline>(self, PayloadInline.store);
    }
}

/**
 > struct (0b1) PayloadInRef {
 >     value: Cell<RemainingBitsAndRefs>
 > }
 */
export interface PayloadInRef {
    readonly $: 'PayloadInRef'
    value: CellRef<RemainingBitsAndRefs>
}

export const PayloadInRef = {
    PREFIX: 0b1,

    create(args: {
        value: CellRef<RemainingBitsAndRefs>
    }): PayloadInRef {
        return {
            $: 'PayloadInRef',
            ...args
        }
    },
    fromSlice(s: c.Slice): PayloadInRef {
        loadAndCheckPrefix(s, 0b1, 1, 'PayloadInRef');
        return {
            $: 'PayloadInRef',
            value: loadCellRef<RemainingBitsAndRefs>(s, loadTolkRemaining),
        }
    },
    store(self: PayloadInRef, b: c.Builder): void {
        b.storeUint(0b1, 1);
        storeCellRef<RemainingBitsAndRefs>(self.value, b, storeTolkRemaining);
    },
    toCell(self: PayloadInRef): c.Cell {
        return makeCellFrom<PayloadInRef>(self, PayloadInRef.store);
    }
}

/**
 > struct (0x0f8a7ea5) AskToTransfer {
 >     queryId: uint64
 >     jettonAmount: coins
 >     transferRecipient: address
 >     sendExcessesTo: address?
 >     customPayload: cell?
 >     forwardTonAmount: coins
 >     forwardPayload: ForwardPayloadRemainder
 > }
 */
export interface AskToTransfer {
    readonly $: 'AskToTransfer'
    queryId: uint64
    jettonAmount: coins
    transferRecipient: c.Address
    sendExcessesTo: c.Address | null
    customPayload: c.Cell | null
    forwardTonAmount: coins
    forwardPayload: PayloadInline | PayloadInRef
}

export const AskToTransfer = {
    PREFIX: 0x0f8a7ea5,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }): AskToTransfer {
        return {
            $: 'AskToTransfer',
            ...args
        }
    },
    fromSlice(s: c.Slice): AskToTransfer {
        loadAndCheckPrefix32(s, 0x0f8a7ea5, 'AskToTransfer');
        return {
            $: 'AskToTransfer',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            transferRecipient: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
            customPayload: s.loadBoolean() ? s.loadRef() : null,
            forwardTonAmount: s.loadCoins(),
            forwardPayload: lookupPrefix(s, 0b0, 1) ? PayloadInline.fromSlice(s) :
                lookupPrefix(s, 0b1, 1) ? PayloadInRef.fromSlice(s) :
                throwNonePrefixMatch('AskToTransfer.forwardPayload'),
        }
    },
    store(self: AskToTransfer, b: c.Builder): void {
        b.storeUint(0x0f8a7ea5, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.transferRecipient);
        b.storeAddress(self.sendExcessesTo);
        storeTolkNullable<c.Cell>(self.customPayload, b,
            (v,b) => b.storeRef(v)
        );
        b.storeCoins(self.forwardTonAmount);
        switch (self.forwardPayload.$) {
            case 'PayloadInline':
                PayloadInline.store(self.forwardPayload, b);
                break;
            case 'PayloadInRef':
                PayloadInRef.store(self.forwardPayload, b);
                break;
        }
    },
    toCell(self: AskToTransfer): c.Cell {
        return makeCellFrom<AskToTransfer>(self, AskToTransfer.store);
    }
}

/**
 > struct (0x7362d09c) TransferNotificationForRecipient {
 >     queryId: uint64
 >     jettonAmount: coins
 >     transferInitiator: address?
 >     forwardPayload: ForwardPayloadRemainder
 > }
 */
export interface TransferNotificationForRecipient {
    readonly $: 'TransferNotificationForRecipient'
    queryId: uint64
    jettonAmount: coins
    transferInitiator: c.Address | null
    forwardPayload: PayloadInline | PayloadInRef
}

export const TransferNotificationForRecipient = {
    PREFIX: 0x7362d09c,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address | null
        forwardPayload: PayloadInline | PayloadInRef
    }): TransferNotificationForRecipient {
        return {
            $: 'TransferNotificationForRecipient',
            ...args
        }
    },
    fromSlice(s: c.Slice): TransferNotificationForRecipient {
        loadAndCheckPrefix32(s, 0x7362d09c, 'TransferNotificationForRecipient');
        return {
            $: 'TransferNotificationForRecipient',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            transferInitiator: s.loadMaybeAddress(),
            forwardPayload: lookupPrefix(s, 0b0, 1) ? PayloadInline.fromSlice(s) :
                lookupPrefix(s, 0b1, 1) ? PayloadInRef.fromSlice(s) :
                throwNonePrefixMatch('TransferNotificationForRecipient.forwardPayload'),
        }
    },
    store(self: TransferNotificationForRecipient, b: c.Builder): void {
        b.storeUint(0x7362d09c, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.transferInitiator);
        switch (self.forwardPayload.$) {
            case 'PayloadInline':
                PayloadInline.store(self.forwardPayload, b);
                break;
            case 'PayloadInRef':
                PayloadInRef.store(self.forwardPayload, b);
                break;
        }
    },
    toCell(self: TransferNotificationForRecipient): c.Cell {
        return makeCellFrom<TransferNotificationForRecipient>(self, TransferNotificationForRecipient.store);
    }
}

/**
 > struct (0x178d4519) InternalTransferStep {
 >     queryId: uint64
 >     jettonAmount: coins
 >     transferInitiator: address?
 >     sendExcessesTo: address?
 >     forwardTonAmount: coins
 >     forwardPayload: ForwardPayloadRemainder
 > }
 */
export interface InternalTransferStep {
    readonly $: 'InternalTransferStep'
    queryId: uint64
    jettonAmount: coins
    transferInitiator: c.Address | null
    sendExcessesTo: c.Address | null
    forwardTonAmount: coins
    forwardPayload: PayloadInline | PayloadInRef
}

export const InternalTransferStep = {
    PREFIX: 0x178d4519,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address | null
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }): InternalTransferStep {
        return {
            $: 'InternalTransferStep',
            ...args
        }
    },
    fromSlice(s: c.Slice): InternalTransferStep {
        loadAndCheckPrefix32(s, 0x178d4519, 'InternalTransferStep');
        return {
            $: 'InternalTransferStep',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            transferInitiator: s.loadMaybeAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
            forwardTonAmount: s.loadCoins(),
            forwardPayload: lookupPrefix(s, 0b0, 1) ? PayloadInline.fromSlice(s) :
                lookupPrefix(s, 0b1, 1) ? PayloadInRef.fromSlice(s) :
                throwNonePrefixMatch('InternalTransferStep.forwardPayload'),
        }
    },
    store(self: InternalTransferStep, b: c.Builder): void {
        b.storeUint(0x178d4519, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.transferInitiator);
        b.storeAddress(self.sendExcessesTo);
        b.storeCoins(self.forwardTonAmount);
        switch (self.forwardPayload.$) {
            case 'PayloadInline':
                PayloadInline.store(self.forwardPayload, b);
                break;
            case 'PayloadInRef':
                PayloadInRef.store(self.forwardPayload, b);
                break;
        }
    },
    toCell(self: InternalTransferStep): c.Cell {
        return makeCellFrom<InternalTransferStep>(self, InternalTransferStep.store);
    }
}

/**
 > struct (0xd53276db) ReturnExcessesBack {
 >     queryId: uint64
 > }
 */
export interface ReturnExcessesBack {
    readonly $: 'ReturnExcessesBack'
    queryId: uint64
}

export const ReturnExcessesBack = {
    PREFIX: 0xd53276db,

    create(args: {
        queryId: uint64
    }): ReturnExcessesBack {
        return {
            $: 'ReturnExcessesBack',
            ...args
        }
    },
    fromSlice(s: c.Slice): ReturnExcessesBack {
        loadAndCheckPrefix32(s, 0xd53276db, 'ReturnExcessesBack');
        return {
            $: 'ReturnExcessesBack',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ReturnExcessesBack, b: c.Builder): void {
        b.storeUint(0xd53276db, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ReturnExcessesBack): c.Cell {
        return makeCellFrom<ReturnExcessesBack>(self, ReturnExcessesBack.store);
    }
}

/**
 > struct (0x642b7d07) MintNewJettons {
 >     queryId: uint64
 >     mintRecipient: address
 >     tonAmount: coins
 >     internalTransferMsg: Cell<InternalTransferStep>
 > }
 */
export interface MintNewJettons {
    readonly $: 'MintNewJettons'
    queryId: uint64
    mintRecipient: c.Address
    tonAmount: coins
    internalTransferMsg: CellRef<InternalTransferStep>
}

export const MintNewJettons = {
    PREFIX: 0x642b7d07,

    create(args: {
        queryId: uint64
        mintRecipient: c.Address
        tonAmount: coins
        internalTransferMsg: CellRef<InternalTransferStep>
    }): MintNewJettons {
        return {
            $: 'MintNewJettons',
            ...args
        }
    },
    fromSlice(s: c.Slice): MintNewJettons {
        loadAndCheckPrefix32(s, 0x642b7d07, 'MintNewJettons');
        return {
            $: 'MintNewJettons',
            queryId: s.loadUintBig(64),
            mintRecipient: s.loadAddress(),
            tonAmount: s.loadCoins(),
            internalTransferMsg: loadCellRef<InternalTransferStep>(s, InternalTransferStep.fromSlice),
        }
    },
    store(self: MintNewJettons, b: c.Builder): void {
        b.storeUint(0x642b7d07, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.mintRecipient);
        b.storeCoins(self.tonAmount);
        storeCellRef<InternalTransferStep>(self.internalTransferMsg, b, InternalTransferStep.store);
    },
    toCell(self: MintNewJettons): c.Cell {
        return makeCellFrom<MintNewJettons>(self, MintNewJettons.store);
    }
}

/**
 > struct (0x7431f221) DropMinterAdmin {
 >     queryId: uint64
 > }
 */
export interface DropMinterAdmin {
    readonly $: 'DropMinterAdmin'
    queryId: uint64
}

export const DropMinterAdmin = {
    PREFIX: 0x7431f221,

    create(args: {
        queryId: uint64
    }): DropMinterAdmin {
        return {
            $: 'DropMinterAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): DropMinterAdmin {
        loadAndCheckPrefix32(s, 0x7431f221, 'DropMinterAdmin');
        return {
            $: 'DropMinterAdmin',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: DropMinterAdmin, b: c.Builder): void {
        b.storeUint(0x7431f221, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: DropMinterAdmin): c.Cell {
        return makeCellFrom<DropMinterAdmin>(self, DropMinterAdmin.store);
    }
}

/**
 > struct (0xd372158c) TopUpTons {
 > }
 */
export interface TopUpTons {
    readonly $: 'TopUpTons'
}

export const TopUpTons = {
    PREFIX: 0xd372158c,

    create(): TopUpTons {
        return {
            $: 'TopUpTons',
        }
    },
    fromSlice(s: c.Slice): TopUpTons {
        loadAndCheckPrefix32(s, 0xd372158c, 'TopUpTons');
        return {
            $: 'TopUpTons',
        }
    },
    store(self: TopUpTons, b: c.Builder): void {
        b.storeUint(0xd372158c, 32);
    },
    toCell(self: TopUpTons): c.Cell {
        return makeCellFrom<TopUpTons>(self, TopUpTons.store);
    }
}

// ————————————————————————————————————————————
//    class BondingCurveV2
//

interface ExtraSendOptions {
    bounce?: boolean                    // default: false
    sendMode?: SendMode                 // default: SendMode.PAY_GAS_SEPARATELY
    extraCurrencies?: c.ExtraCurrency   // default: empty dict
}

interface DeployedAddrOptions {
    workchain?: number                  // default: 0 (basechain)
    toShard?: { fixedPrefixLength: number; closeTo: c.Address }
    overrideContractCode?: c.Cell
}

function calculateDeployedAddress(code: c.Cell, data: c.Cell, options: DeployedAddrOptions): c.Address {
    const stateInitCell = beginCell().store(c.storeStateInit({
        code,
        data,
        splitDepth: options.toShard?.fixedPrefixLength,
        special: null,
        libraries: null,
    })).endCell();

    let addrHash = stateInitCell.hash();
    if (options.toShard) {
        const shardDepth = options.toShard.fixedPrefixLength;
        addrHash = beginCell()
            .storeBits(new c.BitString(options.toShard.closeTo.hash, 0, shardDepth))
            .storeBits(new c.BitString(stateInitCell.hash(), shardDepth, 256 - shardDepth))
            .endCell()
            .beginParse().loadBuffer(32);
    }

    return new c.Address(options.workchain ?? 0, addrHash);
}

export class BondingCurveV2 implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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');

    static Errors = {
        'Errors.BalanceError': 47,
        'Errors.NotEnoughGas': 48,
        'Errors.InvalidMessage': 49,
        'Errors.InvalidOp': 72,
        'Errors.NotOwner': 73,
        'Errors.NotValidWallet': 74,
        'Errors.WrongWorkchain': 333,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new BondingCurveV2(address);
    }

    static fromStorage(emptyStorage: {
        state: uint8
        jettonMinter: c.Address | null
        virtualTonReserve: coins
        realTonReserve: coins
        curveJettonBalance: coins
        feeAccrued: coins
        migrationReserve: coins
        config: CellRef<LaunchConfig>
        dropAdminPending: boolean
        pendingBuyTonInNet: coins
        progress: CellRef<LaunchProgress>
        migration?: CellRef<MigrationProgress> | null /* = null */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? BondingCurveV2.CodeCell,
            data: BondingCurveStorage.toCell(BondingCurveStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new BondingCurveV2(address, initialState);
    }

    static createCellOfInitializeCurve(body: {
        queryId: uint64
        jettonMinter: c.Address
        refundTo: c.Address | null
        protocolTreasury: c.Address
    }) {
        return InitializeCurve.toCell(InitializeCurve.create(body));
    }

    static createCellOfMintDelivered(body: {
        queryId: uint64
        amount: coins
    }) {
        return MintDelivered.toCell(MintDelivered.create(body));
    }

    static createCellOfReturnExcessesBack(body: {
        queryId: uint64
    }) {
        return ReturnExcessesBack.toCell(ReturnExcessesBack.create(body));
    }

    static createCellOfLaunchMintFailed(body: {
        queryId: uint64
    }) {
        return LaunchMintFailed.toCell(LaunchMintFailed.create(body));
    }

    static createCellOfClaimCurveCreatorFees(body: {
        queryId: uint64
    }) {
        return ClaimCurveCreatorFees.toCell(ClaimCurveCreatorFees.create(body));
    }

    static createCellOfFlushCreatorFees(body: {
        queryId: uint64
    }) {
        return FlushCreatorFees.toCell(FlushCreatorFees.create(body));
    }

    static createCellOfBuyJettons(body: {
        queryId: uint64
        minJettonsOut: coins
    }) {
        return BuyJettons.toCell(BuyJettons.create(body));
    }

    static createCellOfFlushFees(body: {
        queryId: uint64
    }) {
        return FlushFees.toCell(FlushFees.create(body));
    }

    static createCellOfGraduate(body: {
        queryId: uint64
    }) {
        return Graduate.toCell(Graduate.create(body));
    }

    static createCellOfRetryMigration(body: {
        queryId: uint64
    }) {
        return RetryMigration.toCell(RetryMigration.create(body));
    }

    static createCellOfConfirmMigration(body: {
        queryId: uint64
    }) {
        return ConfirmMigration.toCell(ConfirmMigration.create(body));
    }

    static createCellOfPrepareBuyback(body: {
        queryId: uint64
    }) {
        return PrepareBuyback.toCell(PrepareBuyback.create(body));
    }

    static createCellOfDepositNotification(body: {
        queryId: uint64
        liquidity: coins
        lockedLiquidity: coins
        payload: c.Cell | null
    }) {
        return DepositNotification.toCell(DepositNotification.create(body));
    }

    static createCellOfTakePositionState(body: {
        queryId: uint64
        liquidity: coins
        lockedLiquidity: coins
        rest: RemainingBitsAndRefs
    }) {
        return TakePositionState.toCell(TakePositionState.create(body));
    }

    static createCellOfTransferFailed(body: {
        queryId: uint64
        amount: coins
    }) {
        return TransferFailed.toCell(TransferFailed.create(body));
    }

    static createCellOfTransferDelivered(body: {
        queryId: uint64
        amount: coins
    }) {
        return TransferDelivered.toCell(TransferDelivered.create(body));
    }

    static createCellOfInitPoolResultMessage(body: {
        queryId: uint64
        exitCode: int32
        customPayload: c.Cell | null
    }) {
        return InitPoolResultMessage.toCell(InitPoolResultMessage.create(body));
    }

    static createCellOfTransferNotificationForRecipient(body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address | null
        forwardPayload: PayloadInline | PayloadInRef
    }) {
        return TransferNotificationForRecipient.toCell(TransferNotificationForRecipient.create(body));
    }

    static createCellOfTopUpTons(body: {
    }) {
        return TopUpTons.toCell(TopUpTons.create());
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendInitializeCurve(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonMinter: c.Address
        refundTo: c.Address | null
        protocolTreasury: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InitializeCurve.toCell(InitializeCurve.create(body)),
            ...extraOptions
        });
    }

    async sendMintDelivered(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: MintDelivered.toCell(MintDelivered.create(body)),
            ...extraOptions
        });
    }

    async sendReturnExcessesBack(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ReturnExcessesBack.toCell(ReturnExcessesBack.create(body)),
            ...extraOptions
        });
    }

    async sendLaunchMintFailed(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: LaunchMintFailed.toCell(LaunchMintFailed.create(body)),
            ...extraOptions
        });
    }

    async sendClaimCurveCreatorFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ClaimCurveCreatorFees.toCell(ClaimCurveCreatorFees.create(body)),
            ...extraOptions
        });
    }

    async sendFlushCreatorFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: FlushCreatorFees.toCell(FlushCreatorFees.create(body)),
            ...extraOptions
        });
    }

    async sendBuyJettons(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        minJettonsOut: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: BuyJettons.toCell(BuyJettons.create(body)),
            ...extraOptions
        });
    }

    async sendFlushFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: FlushFees.toCell(FlushFees.create(body)),
            ...extraOptions
        });
    }

    async sendGraduate(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: Graduate.toCell(Graduate.create(body)),
            ...extraOptions
        });
    }

    async sendRetryMigration(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RetryMigration.toCell(RetryMigration.create(body)),
            ...extraOptions
        });
    }

    async sendConfirmMigration(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ConfirmMigration.toCell(ConfirmMigration.create(body)),
            ...extraOptions
        });
    }

    async sendPrepareBuyback(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: PrepareBuyback.toCell(PrepareBuyback.create(body)),
            ...extraOptions
        });
    }

    async sendDepositNotification(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        liquidity: coins
        lockedLiquidity: coins
        payload: c.Cell | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DepositNotification.toCell(DepositNotification.create(body)),
            ...extraOptions
        });
    }

    async sendTakePositionState(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        liquidity: coins
        lockedLiquidity: coins
        rest: RemainingBitsAndRefs
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TakePositionState.toCell(TakePositionState.create(body)),
            ...extraOptions
        });
    }

    async sendTransferFailed(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TransferFailed.toCell(TransferFailed.create(body)),
            ...extraOptions
        });
    }

    async sendTransferDelivered(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TransferDelivered.toCell(TransferDelivered.create(body)),
            ...extraOptions
        });
    }

    async sendInitPoolResultMessage(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        exitCode: int32
        customPayload: c.Cell | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InitPoolResultMessage.toCell(InitPoolResultMessage.create(body)),
            ...extraOptions
        });
    }

    async sendTransferNotificationForRecipient(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address | null
        forwardPayload: PayloadInline | PayloadInRef
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TransferNotificationForRecipient.toCell(TransferNotificationForRecipient.create(body)),
            ...extraOptions
        });
    }

    async sendTopUpTons(provider: ContractProvider, via: Sender, msgValue: coins, body: {
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TopUpTons.toCell(TopUpTons.create()),
            ...extraOptions
        });
    }

    async getCurveData(provider: ContractProvider): Promise<BondingCurveDataReply> {
        const r = StackReader.fromGetMethod(14, await provider.get('get_curve_data', []));
        return ({
            $: 'BondingCurveDataReply',
            state: r.readBigInt(),
            creator: r.readSlice().loadAddress(),
            salt: r.readBigInt(),
            jettonMinter: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            virtualTonReserve: r.readBigInt(),
            realTonReserve: r.readBigInt(),
            curveJettonBalance: r.readBigInt(),
            curveSupply: r.readBigInt(),
            dexReserveSupply: r.readBigInt(),
            graduationThreshold: r.readBigInt(),
            feeAccrued: r.readBigInt(),
            migrationReserve: r.readBigInt(),
            dropAdminPending: r.readBoolean(),
            pendingBuyTonInNet: r.readBigInt(),
        });
    }

    async getState(provider: ContractProvider): Promise<uint8> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_state', []));
        return r.readBigInt();
    }

    async getQuoteBuy(provider: ContractProvider, tonIn: coins): Promise<coins> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_quote_buy', [
            { type: 'int', value: tonIn },
        ]));
        return r.readBigInt();
    }

    async getQuoteSell(provider: ContractProvider, jettonIn: coins): Promise<coins> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_quote_sell', [
            { type: 'int', value: jettonIn },
        ]));
        return r.readBigInt();
    }

    async getMaxSafeSell(provider: ContractProvider): Promise<coins> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_max_safe_sell', []));
        return r.readBigInt();
    }

    async getVersion(provider: ContractProvider): Promise<bigint> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_version', []));
        return r.readBigInt();
    }

    async getProgressBps(provider: ContractProvider): Promise<bigint> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_progress_bps', []));
        return r.readBigInt();
    }

    async getLaunchOptions(provider: ContractProvider): Promise<LaunchOptions> {
        const r = StackReader.fromGetMethod(10, await provider.get('get_launch_options', []));
        return ({
            $: 'LaunchOptions',
            supply: r.readBigInt(),
            creatorFeeBps: r.readBigInt(),
            devBuyAmount: r.readBigInt(),
            minDevTokens: r.readBigInt(),
            graduationThreshold: r.readBigInt(),
            reserveRatio: r.readBigInt(),
            minBuyBps: r.readBigInt(),
            maxBuyBps: r.readBigInt(),
            beneficiaries: r.readNullable<CellRef<FeeBeneficiaries>>(
                (r) => r.readCellRef<FeeBeneficiaries>(FeeBeneficiaries.fromSlice)
            ),
            buybackBurn: r.readBoolean(),
        });
    }

    async getLaunchProgress(provider: ContractProvider): Promise<LaunchProgress> {
        const r = StackReader.fromGetMethod(5, await provider.get('get_launch_progress', []));
        return ({
            $: 'LaunchProgress',
            protocolTreasury: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            curveReceived: r.readBoolean(),
            devReceived: r.readBoolean(),
            devTokens: r.readBigInt(),
            creatorAccrued: r.readBigInt(),
        });
    }

    async getCollectorAddress(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_collector_address', []));
        return r.readSlice().loadAddress();
    }

    async getFeeManagerAddress(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_fee_manager_address', []));
        return r.readSlice().loadAddress();
    }

    async getLaunchPreview(provider: ContractProvider): Promise<LaunchPreview> {
        const r = StackReader.fromGetMethod(10, await provider.get('get_launch_preview', []));
        return ({
            $: 'LaunchPreview',
            minBuyTokens: r.readBigInt(),
            maxBuyTokens: r.readBigInt(),
            virtualTonReserve: r.readBigInt(),
            graduationThreshold: r.readBigInt(),
            soldTokens: r.readBigInt(),
            poolTon: r.readBigInt(),
            poolTokens: r.readBigInt(),
            remainingTokens: r.readBigInt(),
            initialPriceNanoPerBillion: r.readBigInt(),
            graduationPriceNanoPerBillion: r.readBigInt(),
        });
    }

    async getPoolAddress(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_pool_address', []));
        return r.readSlice().loadAddress();
    }

    async getFeeRates(provider: ContractProvider): Promise<FeeRatesReply> {
        const r = StackReader.fromGetMethod(8, await provider.get('get_fee_rates', []));
        return ({
            $: 'FeeRatesReply',
            curveProtocolBps: r.readBigInt(),
            curveCreatorBps: r.readBigInt(),
            poolBaseFeeBps: r.readBigInt(),
            poolCreatorAllocationBps: r.readBigInt(),
            poolProtocolPpb: r.readBigInt(),
            poolCreatorPpb: r.readBigInt(),
            poolLpPpb: r.readBigInt(),
            dedustPpb: r.readBigInt(),
        });
    }

    async getMigrationData(provider: ContractProvider): Promise<MigrationProgress | null> {
        const r = StackReader.fromGetMethod(7, await provider.get('get_migration_data', []));
        return r.readWideNullable<MigrationProgress>(7,
            (r) => ({
                $: 'MigrationProgress',
                nativeQueryId: r.readBigInt(),
                jettonQueryId: r.readBigInt(),
                tonAmount: r.readBigInt(),
                jettonAmount: r.readBigInt(),
                nativeRetry: r.readBoolean(),
                jettonRetry: r.readBoolean(),
            })
        );
    }

    async getBuybackAddress(provider: ContractProvider): Promise<c.Address | null> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_buyback_address', []));
        return r.readNullable<c.Address>(
            (r) => r.readSlice().loadAddress()
        );
    }
}
