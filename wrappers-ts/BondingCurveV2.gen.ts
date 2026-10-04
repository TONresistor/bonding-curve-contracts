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
 > struct LaunchInitializedEvent {
 >     status: LaunchStatus
 >     realTonReserve: coins
 >     curveJettonBalance: coins
 > }
 */
export interface LaunchInitializedEvent {
    readonly $: 'LaunchInitializedEvent'
    status: LaunchStatus
    realTonReserve: coins
    curveJettonBalance: coins
}

export const LaunchInitializedEvent = {
    create(args: {
        status: LaunchStatus
        realTonReserve: coins
        curveJettonBalance: coins
    }): LaunchInitializedEvent {
        return {
            $: 'LaunchInitializedEvent',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchInitializedEvent {
        return {
            $: 'LaunchInitializedEvent',
            status: LaunchStatus.fromSlice(s),
            realTonReserve: s.loadCoins(),
            curveJettonBalance: s.loadCoins(),
        }
    },
    store(self: LaunchInitializedEvent, b: c.Builder): void {
        LaunchStatus.store(self.status, b);
        b.storeCoins(self.realTonReserve);
        b.storeCoins(self.curveJettonBalance);
    },
    toCell(self: LaunchInitializedEvent): c.Cell {
        return makeCellFrom<LaunchInitializedEvent>(self, LaunchInitializedEvent.store);
    }
}

/**
 > struct BuyEvent {
 >     buyer: address
 >     tonInNet: coins
 >     jettonsOut: coins
 >     feeTon: coins
 >     realTonReserve: coins
 >     curveJettonBalance: coins
 >     tonInGross: coins
 >     migrationStarted: bool
 > }
 */
export interface BuyEvent {
    readonly $: 'BuyEvent'
    buyer: c.Address
    tonInNet: coins
    jettonsOut: coins
    feeTon: coins
    realTonReserve: coins
    curveJettonBalance: coins
    tonInGross: coins
    migrationStarted: boolean
}

export const BuyEvent = {
    create(args: {
        buyer: c.Address
        tonInNet: coins
        jettonsOut: coins
        feeTon: coins
        realTonReserve: coins
        curveJettonBalance: coins
        tonInGross: coins
        migrationStarted: boolean
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
            feeTon: s.loadCoins(),
            realTonReserve: s.loadCoins(),
            curveJettonBalance: s.loadCoins(),
            tonInGross: s.loadCoins(),
            migrationStarted: s.loadBoolean(),
        }
    },
    store(self: BuyEvent, b: c.Builder): void {
        b.storeAddress(self.buyer);
        b.storeCoins(self.tonInNet);
        b.storeCoins(self.jettonsOut);
        b.storeCoins(self.feeTon);
        b.storeCoins(self.realTonReserve);
        b.storeCoins(self.curveJettonBalance);
        b.storeCoins(self.tonInGross);
        b.storeBit(self.migrationStarted);
    },
    toCell(self: BuyEvent): c.Cell {
        return makeCellFrom<BuyEvent>(self, BuyEvent.store);
    }
}

/**
 > struct SellEvent {
 >     seller: address
 >     jettonsIn: coins
 >     tonOutNet: coins
 >     feeTon: coins
 >     realTonReserve: coins
 >     curveJettonBalance: coins
 >     tonOutGross: coins
 > }
 */
export interface SellEvent {
    readonly $: 'SellEvent'
    seller: c.Address
    jettonsIn: coins
    tonOutNet: coins
    feeTon: coins
    realTonReserve: coins
    curveJettonBalance: coins
    tonOutGross: coins
}

export const SellEvent = {
    create(args: {
        seller: c.Address
        jettonsIn: coins
        tonOutNet: coins
        feeTon: coins
        realTonReserve: coins
        curveJettonBalance: coins
        tonOutGross: coins
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
            tonOutNet: s.loadCoins(),
            feeTon: s.loadCoins(),
            realTonReserve: s.loadCoins(),
            curveJettonBalance: s.loadCoins(),
            tonOutGross: s.loadCoins(),
        }
    },
    store(self: SellEvent, b: c.Builder): void {
        b.storeAddress(self.seller);
        b.storeCoins(self.jettonsIn);
        b.storeCoins(self.tonOutNet);
        b.storeCoins(self.feeTon);
        b.storeCoins(self.realTonReserve);
        b.storeCoins(self.curveJettonBalance);
        b.storeCoins(self.tonOutGross);
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
 > enum LaunchStatus { 5 variants }
 */
export type LaunchStatus = bigint

export const LaunchStatus = {
    Initializing: 0n,
    Trading: 1n,
    Migrating: 2n,
    Migrated: 3n,
    Cancelled: 4n,

    fromSlice(s: c.Slice): LaunchStatus {
        return s.loadUintBig(8);
    },
    store(self: LaunchStatus, b: c.Builder): void {
        b.storeUint(self, 8);
    },
    toCell(self: LaunchStatus): c.Cell {
        return makeCellFrom<LaunchStatus>(self, LaunchStatus.store);
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
 > struct (0xa0a0b05b) MinterAdminDropped {
 >     queryId: uint64
 > }
 */
export interface MinterAdminDropped {
    readonly $: 'MinterAdminDropped'
    queryId: uint64
}

export const MinterAdminDropped = {
    PREFIX: 0xa0a0b05b,

    create(args: {
        queryId: uint64
    }): MinterAdminDropped {
        return {
            $: 'MinterAdminDropped',
            ...args
        }
    },
    fromSlice(s: c.Slice): MinterAdminDropped {
        loadAndCheckPrefix32(s, 0xa0a0b05b, 'MinterAdminDropped');
        return {
            $: 'MinterAdminDropped',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: MinterAdminDropped, b: c.Builder): void {
        b.storeUint(0xa0a0b05b, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: MinterAdminDropped): c.Cell {
        return makeCellFrom<MinterAdminDropped>(self, MinterAdminDropped.store);
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

    static createCellOfMinterAdminDropped(body: {
        queryId: uint64
    }) {
        return MinterAdminDropped.toCell(MinterAdminDropped.create(body));
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

    async sendMinterAdminDropped(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: MinterAdminDropped.toCell(MinterAdminDropped.create(body)),
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

    async getLaunchStatus(provider: ContractProvider): Promise<LaunchStatus> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_launch_status', []));
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
