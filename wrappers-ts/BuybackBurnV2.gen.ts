// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a BuybackBurnV2 contract in Tolk.
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

    readCellRef<T>(loadFn_T: LoadCallback<T>): CellRef<T> {
        return { ref: loadFn_T(this.readCell().beginParse()) };
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint16 = bigint
type uint40 = bigint
type uint64 = bigint

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
 > struct (0xa0a0b061) ExecuteBuyback {
 >     queryId: uint64
 > }
 */
export interface ExecuteBuyback {
    readonly $: 'ExecuteBuyback'
    queryId: uint64
}

export const ExecuteBuyback = {
    PREFIX: 0xa0a0b061,

    create(args: {
        queryId: uint64
    }): ExecuteBuyback {
        return {
            $: 'ExecuteBuyback',
            ...args
        }
    },
    fromSlice(s: c.Slice): ExecuteBuyback {
        loadAndCheckPrefix32(s, 0xa0a0b061, 'ExecuteBuyback');
        return {
            $: 'ExecuteBuyback',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ExecuteBuyback, b: c.Builder): void {
        b.storeUint(0xa0a0b061, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ExecuteBuyback): c.Cell {
        return makeCellFrom<ExecuteBuyback>(self, ExecuteBuyback.store);
    }
}

/**
 > struct (0xa0a0b062) ClaimBuybackFees {
 >     queryId: uint64
 > }
 */
export interface ClaimBuybackFees {
    readonly $: 'ClaimBuybackFees'
    queryId: uint64
}

export const ClaimBuybackFees = {
    PREFIX: 0xa0a0b062,

    create(args: {
        queryId: uint64
    }): ClaimBuybackFees {
        return {
            $: 'ClaimBuybackFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): ClaimBuybackFees {
        loadAndCheckPrefix32(s, 0xa0a0b062, 'ClaimBuybackFees');
        return {
            $: 'ClaimBuybackFees',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ClaimBuybackFees, b: c.Builder): void {
        b.storeUint(0xa0a0b062, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ClaimBuybackFees): c.Cell {
        return makeCellFrom<ClaimBuybackFees>(self, ClaimBuybackFees.store);
    }
}

/**
 > struct (0xa0a0b063) BurnAvailable {
 >     queryId: uint64
 > }
 */
export interface BurnAvailable {
    readonly $: 'BurnAvailable'
    queryId: uint64
}

export const BurnAvailable = {
    PREFIX: 0xa0a0b063,

    create(args: {
        queryId: uint64
    }): BurnAvailable {
        return {
            $: 'BurnAvailable',
            ...args
        }
    },
    fromSlice(s: c.Slice): BurnAvailable {
        loadAndCheckPrefix32(s, 0xa0a0b063, 'BurnAvailable');
        return {
            $: 'BurnAvailable',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: BurnAvailable, b: c.Builder): void {
        b.storeUint(0xa0a0b063, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: BurnAvailable): c.Cell {
        return makeCellFrom<BurnAvailable>(self, BurnAvailable.store);
    }
}

/**
 > struct (0xa0a0b064) BuybackRefund {
 >     queryId: uint64
 > }
 */
export interface BuybackRefund {
    readonly $: 'BuybackRefund'
    queryId: uint64
}

export const BuybackRefund = {
    PREFIX: 0xa0a0b064,

    create(args: {
        queryId: uint64
    }): BuybackRefund {
        return {
            $: 'BuybackRefund',
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackRefund {
        loadAndCheckPrefix32(s, 0xa0a0b064, 'BuybackRefund');
        return {
            $: 'BuybackRefund',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: BuybackRefund, b: c.Builder): void {
        b.storeUint(0xa0a0b064, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: BuybackRefund): c.Cell {
        return makeCellFrom<BuybackRefund>(self, BuybackRefund.store);
    }
}

/**
 > struct (0x00d8d379) BuybackProvidePoolState {
 >     queryId: uint64
 >     includeConfig: bool
 >     includeFees: bool
 >     includeCodeHash: bool
 >     includeRewards: bool
 > }
 */
export interface BuybackProvidePoolState {
    readonly $: 'BuybackProvidePoolState'
    queryId: uint64
    includeConfig: boolean /* = false */
    includeFees: boolean /* = false */
    includeCodeHash: boolean /* = false */
    includeRewards: boolean /* = false */
}

export const BuybackProvidePoolState = {
    PREFIX: 0x00d8d379,

    create(args: {
        queryId: uint64
        includeConfig?: boolean /* = false */
        includeFees?: boolean /* = false */
        includeCodeHash?: boolean /* = false */
        includeRewards?: boolean /* = false */
    }): BuybackProvidePoolState {
        return {
            $: 'BuybackProvidePoolState',
            includeConfig: false,
            includeFees: false,
            includeCodeHash: false,
            includeRewards: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackProvidePoolState {
        loadAndCheckPrefix32(s, 0x00d8d379, 'BuybackProvidePoolState');
        return {
            $: 'BuybackProvidePoolState',
            queryId: s.loadUintBig(64),
            includeConfig: s.loadBoolean(),
            includeFees: s.loadBoolean(),
            includeCodeHash: s.loadBoolean(),
            includeRewards: s.loadBoolean(),
        }
    },
    store(self: BuybackProvidePoolState, b: c.Builder): void {
        b.storeUint(0x00d8d379, 32);
        b.storeUint(self.queryId, 64);
        b.storeBit(self.includeConfig);
        b.storeBit(self.includeFees);
        b.storeBit(self.includeCodeHash);
        b.storeBit(self.includeRewards);
    },
    toCell(self: BuybackProvidePoolState): c.Cell {
        return makeCellFrom<BuybackProvidePoolState>(self, BuybackProvidePoolState.store);
    }
}

/**
 > struct (0b00) BuybackPoolUninitialized {
 > }
 */
export interface BuybackPoolUninitialized {
    readonly $: 'BuybackPoolUninitialized'
}

export const BuybackPoolUninitialized = {
    PREFIX: 0b00,

    create(): BuybackPoolUninitialized {
        return {
            $: 'BuybackPoolUninitialized',
        }
    },
    fromSlice(s: c.Slice): BuybackPoolUninitialized {
        loadAndCheckPrefix(s, 0b00, 2, 'BuybackPoolUninitialized');
        return {
            $: 'BuybackPoolUninitialized',
        }
    },
    store(self: BuybackPoolUninitialized, b: c.Builder): void {
        b.storeUint(0b00, 2);
    },
    toCell(self: BuybackPoolUninitialized): c.Cell {
        return makeCellFrom<BuybackPoolUninitialized>(self, BuybackPoolUninitialized.store);
    }
}

/**
 > struct (0b01) BuybackPoolInitializing {
 >     initiatorAddress: address
 > }
 */
export interface BuybackPoolInitializing {
    readonly $: 'BuybackPoolInitializing'
    initiatorAddress: c.Address
}

export const BuybackPoolInitializing = {
    PREFIX: 0b01,

    create(args: {
        initiatorAddress: c.Address
    }): BuybackPoolInitializing {
        return {
            $: 'BuybackPoolInitializing',
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackPoolInitializing {
        loadAndCheckPrefix(s, 0b01, 2, 'BuybackPoolInitializing');
        return {
            $: 'BuybackPoolInitializing',
            initiatorAddress: s.loadAddress(),
        }
    },
    store(self: BuybackPoolInitializing, b: c.Builder): void {
        b.storeUint(0b01, 2);
        b.storeAddress(self.initiatorAddress);
    },
    toCell(self: BuybackPoolInitializing): c.Cell {
        return makeCellFrom<BuybackPoolInitializing>(self, BuybackPoolInitializing.store);
    }
}

/**
 > struct (0b10) BuybackPoolInitialized {
 > }
 */
export interface BuybackPoolInitialized {
    readonly $: 'BuybackPoolInitialized'
}

export const BuybackPoolInitialized = {
    PREFIX: 0b10,

    create(): BuybackPoolInitialized {
        return {
            $: 'BuybackPoolInitialized',
        }
    },
    fromSlice(s: c.Slice): BuybackPoolInitialized {
        loadAndCheckPrefix(s, 0b10, 2, 'BuybackPoolInitialized');
        return {
            $: 'BuybackPoolInitialized',
        }
    },
    store(self: BuybackPoolInitialized, b: c.Builder): void {
        b.storeUint(0b10, 2);
    },
    toCell(self: BuybackPoolInitialized): c.Cell {
        return makeCellFrom<BuybackPoolInitialized>(self, BuybackPoolInitialized.store);
    }
}

/**
 > type BuybackPoolStatus = BuybackPoolUninitialized | BuybackPoolInitializing | BuybackPoolInitialized
 */
export type BuybackPoolStatus =
    | BuybackPoolUninitialized
    | BuybackPoolInitializing
    | BuybackPoolInitialized

export const BuybackPoolStatus = {
    fromSlice(s: c.Slice): BuybackPoolStatus {
        return lookupPrefix(s, 0b00, 2) ? BuybackPoolUninitialized.fromSlice(s) :
            lookupPrefix(s, 0b01, 2) ? BuybackPoolInitializing.fromSlice(s) :
            lookupPrefix(s, 0b10, 2) ? BuybackPoolInitialized.fromSlice(s) :
            throwNonePrefixMatch('BuybackPoolStatus');
    },
    store(self: BuybackPoolStatus, b: c.Builder): void {
        switch (self.$) {
            case 'BuybackPoolUninitialized':
                BuybackPoolUninitialized.store(self, b);
                break;
            case 'BuybackPoolInitializing':
                BuybackPoolInitializing.store(self, b);
                break;
            case 'BuybackPoolInitialized':
                BuybackPoolInitialized.store(self, b);
                break;
        }
    },
    toCell(self: BuybackPoolStatus): c.Cell {
        return makeCellFrom<BuybackPoolStatus>(self, BuybackPoolStatus.store);
    }
}

/**
 > struct (0x870a9579) BuybackTakePoolState {
 >     queryId: uint64
 >     status: BuybackPoolStatus
 >     depositActive: bool
 >     swapActive: bool
 >     liquidity: coins
 >     reserveX: coins
 >     reserveY: coins
 >     rest: RemainingBitsAndRefs
 > }
 */
export interface BuybackTakePoolState {
    readonly $: 'BuybackTakePoolState'
    queryId: uint64
    status: BuybackPoolStatus
    depositActive: boolean
    swapActive: boolean
    liquidity: coins
    reserveX: coins
    reserveY: coins
    rest: RemainingBitsAndRefs
}

export const BuybackTakePoolState = {
    PREFIX: 0x870a9579,

    create(args: {
        queryId: uint64
        status: BuybackPoolStatus
        depositActive: boolean
        swapActive: boolean
        liquidity: coins
        reserveX: coins
        reserveY: coins
        rest: RemainingBitsAndRefs
    }): BuybackTakePoolState {
        return {
            $: 'BuybackTakePoolState',
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackTakePoolState {
        loadAndCheckPrefix32(s, 0x870a9579, 'BuybackTakePoolState');
        return {
            $: 'BuybackTakePoolState',
            queryId: s.loadUintBig(64),
            status: BuybackPoolStatus.fromSlice(s),
            depositActive: s.loadBoolean(),
            swapActive: s.loadBoolean(),
            liquidity: s.loadCoins(),
            reserveX: s.loadCoins(),
            reserveY: s.loadCoins(),
            rest: loadTolkRemaining(s),
        }
    },
    store(self: BuybackTakePoolState, b: c.Builder): void {
        b.storeUint(0x870a9579, 32);
        b.storeUint(self.queryId, 64);
        BuybackPoolStatus.store(self.status, b);
        b.storeBit(self.depositActive);
        b.storeBit(self.swapActive);
        b.storeCoins(self.liquidity);
        b.storeCoins(self.reserveX);
        b.storeCoins(self.reserveY);
        storeTolkRemaining(self.rest, b);
    },
    toCell(self: BuybackTakePoolState): c.Cell {
        return makeCellFrom<BuybackTakePoolState>(self, BuybackTakePoolState.store);
    }
}

/**
 > struct (0xc442500f) BuybackSwap {
 >     minimalAmountOut: coins
 >     deadline: uint40
 >     next: cell?
 >     partnerAbsent: bool
 >     referrerAbsent: bool
 > }
 */
export interface BuybackSwap {
    readonly $: 'BuybackSwap'
    minimalAmountOut: coins
    deadline: uint40
    next: c.Cell | null /* = null */
    partnerAbsent: boolean /* = false */
    referrerAbsent: boolean /* = false */
}

export const BuybackSwap = {
    PREFIX: 0xc442500f,

    create(args: {
        minimalAmountOut: coins
        deadline: uint40
        next?: c.Cell | null /* = null */
        partnerAbsent?: boolean /* = false */
        referrerAbsent?: boolean /* = false */
    }): BuybackSwap {
        return {
            $: 'BuybackSwap',
            next: null,
            partnerAbsent: false,
            referrerAbsent: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackSwap {
        loadAndCheckPrefix32(s, 0xc442500f, 'BuybackSwap');
        return {
            $: 'BuybackSwap',
            minimalAmountOut: s.loadCoins(),
            deadline: s.loadUintBig(40),
            next: s.loadBoolean() ? s.loadRef() : null,
            partnerAbsent: s.loadBoolean(),
            referrerAbsent: s.loadBoolean(),
        }
    },
    store(self: BuybackSwap, b: c.Builder): void {
        b.storeUint(0xc442500f, 32);
        b.storeCoins(self.minimalAmountOut);
        b.storeUint(self.deadline, 40);
        storeTolkNullable<c.Cell>(self.next, b,
            (v,b) => b.storeRef(v)
        );
        b.storeBit(self.partnerAbsent);
        b.storeBit(self.referrerAbsent);
    },
    toCell(self: BuybackSwap): c.Cell {
        return makeCellFrom<BuybackSwap>(self, BuybackSwap.store);
    }
}

/**
 > struct BuybackPayoutOptions {
 >     destination: address
 >     extraGas: coins
 >     payload: cell?
 >     wrapPayload: bool
 > }
 */
export interface BuybackPayoutOptions {
    readonly $: 'BuybackPayoutOptions'
    destination: c.Address
    extraGas: coins
    payload: c.Cell | null
    wrapPayload: boolean /* = false */
}

export const BuybackPayoutOptions = {
    create(args: {
        destination: c.Address
        extraGas: coins
        payload: c.Cell | null
        wrapPayload?: boolean /* = false */
    }): BuybackPayoutOptions {
        return {
            $: 'BuybackPayoutOptions',
            wrapPayload: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackPayoutOptions {
        return {
            $: 'BuybackPayoutOptions',
            destination: s.loadAddress(),
            extraGas: s.loadCoins(),
            payload: s.loadBoolean() ? s.loadRef() : null,
            wrapPayload: s.loadBoolean(),
        }
    },
    store(self: BuybackPayoutOptions, b: c.Builder): void {
        b.storeAddress(self.destination);
        b.storeCoins(self.extraGas);
        storeTolkNullable<c.Cell>(self.payload, b,
            (v,b) => b.storeRef(v)
        );
        b.storeBit(self.wrapPayload);
    },
    toCell(self: BuybackPayoutOptions): c.Cell {
        return makeCellFrom<BuybackPayoutOptions>(self, BuybackPayoutOptions.store);
    }
}

/**
 > struct BuybackPayoutConfig {
 >     fulfill: BuybackPayoutOptions
 >     reject: BuybackPayoutOptions
 >     excessesTo: address
 > }
 */
export interface BuybackPayoutConfig {
    readonly $: 'BuybackPayoutConfig'
    fulfill: BuybackPayoutOptions
    reject: BuybackPayoutOptions
    excessesTo: c.Address
}

export const BuybackPayoutConfig = {
    create(args: {
        fulfill: BuybackPayoutOptions
        reject: BuybackPayoutOptions
        excessesTo: c.Address
    }): BuybackPayoutConfig {
        return {
            $: 'BuybackPayoutConfig',
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackPayoutConfig {
        return {
            $: 'BuybackPayoutConfig',
            fulfill: BuybackPayoutOptions.fromSlice(s),
            reject: BuybackPayoutOptions.fromSlice(s),
            excessesTo: s.loadAddress(),
        }
    },
    store(self: BuybackPayoutConfig, b: c.Builder): void {
        BuybackPayoutOptions.store(self.fulfill, b);
        BuybackPayoutOptions.store(self.reject, b);
        b.storeAddress(self.excessesTo);
    },
    toCell(self: BuybackPayoutConfig): c.Cell {
        return makeCellFrom<BuybackPayoutConfig>(self, BuybackPayoutConfig.store);
    }
}

/**
 > struct (0xa5a7cbf8) BuybackPayNative {
 >     queryId: uint64
 >     amount: coins
 >     paymentPayload: Cell<BuybackSwap>
 >     payoutConfig: Cell<BuybackPayoutConfig>
 > }
 */
export interface BuybackPayNative {
    readonly $: 'BuybackPayNative'
    queryId: uint64
    amount: coins
    paymentPayload: CellRef<BuybackSwap>
    payoutConfig: CellRef<BuybackPayoutConfig>
}

export const BuybackPayNative = {
    PREFIX: 0xa5a7cbf8,

    create(args: {
        queryId: uint64
        amount: coins
        paymentPayload: CellRef<BuybackSwap>
        payoutConfig: CellRef<BuybackPayoutConfig>
    }): BuybackPayNative {
        return {
            $: 'BuybackPayNative',
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackPayNative {
        loadAndCheckPrefix32(s, 0xa5a7cbf8, 'BuybackPayNative');
        return {
            $: 'BuybackPayNative',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            paymentPayload: loadCellRef<BuybackSwap>(s, BuybackSwap.fromSlice),
            payoutConfig: loadCellRef<BuybackPayoutConfig>(s, BuybackPayoutConfig.fromSlice),
        }
    },
    store(self: BuybackPayNative, b: c.Builder): void {
        b.storeUint(0xa5a7cbf8, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        storeCellRef<BuybackSwap>(self.paymentPayload, b, BuybackSwap.store);
        storeCellRef<BuybackPayoutConfig>(self.payoutConfig, b, BuybackPayoutConfig.store);
    },
    toCell(self: BuybackPayNative): c.Cell {
        return makeCellFrom<BuybackPayNative>(self, BuybackPayNative.store);
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
 > struct BuybackPendingSwap {
 >     id: uint64
 >     amount: coins
 >     minimumTokens: coins
 > }
 */
export interface BuybackPendingSwap {
    readonly $: 'BuybackPendingSwap'
    id: uint64
    amount: coins
    minimumTokens: coins
}

export const BuybackPendingSwap = {
    create(args: {
        id: uint64
        amount: coins
        minimumTokens: coins
    }): BuybackPendingSwap {
        return {
            $: 'BuybackPendingSwap',
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackPendingSwap {
        return {
            $: 'BuybackPendingSwap',
            id: s.loadUintBig(64),
            amount: s.loadCoins(),
            minimumTokens: s.loadCoins(),
        }
    },
    store(self: BuybackPendingSwap, b: c.Builder): void {
        b.storeUint(self.id, 64);
        b.storeCoins(self.amount);
        b.storeCoins(self.minimumTokens);
    },
    toCell(self: BuybackPendingSwap): c.Cell {
        return makeCellFrom<BuybackPendingSwap>(self, BuybackPendingSwap.store);
    }
}

/**
 > struct BuybackIdentity {
 >     curve: address
 > }
 */
export interface BuybackIdentity {
    readonly $: 'BuybackIdentity'
    curve: c.Address
}

export const BuybackIdentity = {
    create(args: {
        curve: c.Address
    }): BuybackIdentity {
        return {
            $: 'BuybackIdentity',
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackIdentity {
        return {
            $: 'BuybackIdentity',
            curve: s.loadAddress(),
        }
    },
    store(self: BuybackIdentity, b: c.Builder): void {
        b.storeAddress(self.curve);
    },
    toCell(self: BuybackIdentity): c.Cell {
        return makeCellFrom<BuybackIdentity>(self, BuybackIdentity.store);
    }
}

/**
 > struct BuybackStorage {
 >     identity: Cell<BuybackIdentity>
 >     config: Cell<BuybackConfig>?
 >     active: bool
 >     availableTon: coins
 >     availableTokens: coins
 >     nextId: uint64
 >     quoteId: uint64
 >     quoteDeadline: uint40
 >     swap: Cell<BuybackPendingSwap>?
 >     burnId: uint64
 >     burnAmount: coins
 >     burned: coins
 > }
 */
export interface BuybackStorage {
    readonly $: 'BuybackStorage'
    identity: CellRef<BuybackIdentity>
    config: CellRef<BuybackConfig> | null /* = null */
    active: boolean /* = false */
    availableTon: coins /* = 0 */
    availableTokens: coins /* = 0 */
    nextId: uint64 /* = 1 */
    quoteId: uint64 /* = 0 */
    quoteDeadline: uint40 /* = 0 */
    swap: CellRef<BuybackPendingSwap> | null /* = null */
    burnId: uint64 /* = 0 */
    burnAmount: coins /* = 0 */
    burned: coins /* = 0 */
}

export const BuybackStorage = {
    create(args: {
        identity: CellRef<BuybackIdentity>
        config?: CellRef<BuybackConfig> | null /* = null */
        active?: boolean /* = false */
        availableTon?: coins /* = 0 */
        availableTokens?: coins /* = 0 */
        nextId?: uint64 /* = 1 */
        quoteId?: uint64 /* = 0 */
        quoteDeadline?: uint40 /* = 0 */
        swap?: CellRef<BuybackPendingSwap> | null /* = null */
        burnId?: uint64 /* = 0 */
        burnAmount?: coins /* = 0 */
        burned?: coins /* = 0 */
    }): BuybackStorage {
        return {
            $: 'BuybackStorage',
            config: null,
            active: false,
            availableTon: 0n,
            availableTokens: 0n,
            nextId: 1n,
            quoteId: 0n,
            quoteDeadline: 0n,
            swap: null,
            burnId: 0n,
            burnAmount: 0n,
            burned: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): BuybackStorage {
        return {
            $: 'BuybackStorage',
            identity: loadCellRef<BuybackIdentity>(s, BuybackIdentity.fromSlice),
            config: s.loadBoolean() ? loadCellRef<BuybackConfig>(s, BuybackConfig.fromSlice) : null,
            active: s.loadBoolean(),
            availableTon: s.loadCoins(),
            availableTokens: s.loadCoins(),
            nextId: s.loadUintBig(64),
            quoteId: s.loadUintBig(64),
            quoteDeadline: s.loadUintBig(40),
            swap: s.loadBoolean() ? loadCellRef<BuybackPendingSwap>(s, BuybackPendingSwap.fromSlice) : null,
            burnId: s.loadUintBig(64),
            burnAmount: s.loadCoins(),
            burned: s.loadCoins(),
        }
    },
    store(self: BuybackStorage, b: c.Builder): void {
        storeCellRef<BuybackIdentity>(self.identity, b, BuybackIdentity.store);
        storeTolkNullable<CellRef<BuybackConfig>>(self.config, b,
            (v,b) => storeCellRef<BuybackConfig>(v, b, BuybackConfig.store)
        );
        b.storeBit(self.active);
        b.storeCoins(self.availableTon);
        b.storeCoins(self.availableTokens);
        b.storeUint(self.nextId, 64);
        b.storeUint(self.quoteId, 64);
        b.storeUint(self.quoteDeadline, 40);
        storeTolkNullable<CellRef<BuybackPendingSwap>>(self.swap, b,
            (v,b) => storeCellRef<BuybackPendingSwap>(v, b, BuybackPendingSwap.store)
        );
        b.storeUint(self.burnId, 64);
        b.storeCoins(self.burnAmount);
        b.storeCoins(self.burned);
    },
    toCell(self: BuybackStorage): c.Cell {
        return makeCellFrom<BuybackStorage>(self, BuybackStorage.store);
    }
}

/**
 > struct (0xa0a0b043) ClaimSplitFees {
 >     queryId: uint64
 >     protocol: bool
 > }
 */
export interface ClaimSplitFees {
    readonly $: 'ClaimSplitFees'
    queryId: uint64
    protocol: boolean
}

export const ClaimSplitFees = {
    PREFIX: 0xa0a0b043,

    create(args: {
        queryId: uint64
        protocol: boolean
    }): ClaimSplitFees {
        return {
            $: 'ClaimSplitFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): ClaimSplitFees {
        loadAndCheckPrefix32(s, 0xa0a0b043, 'ClaimSplitFees');
        return {
            $: 'ClaimSplitFees',
            queryId: s.loadUintBig(64),
            protocol: s.loadBoolean(),
        }
    },
    store(self: ClaimSplitFees, b: c.Builder): void {
        b.storeUint(0xa0a0b043, 32);
        b.storeUint(self.queryId, 64);
        b.storeBit(self.protocol);
    },
    toCell(self: ClaimSplitFees): c.Cell {
        return makeCellFrom<ClaimSplitFees>(self, ClaimSplitFees.store);
    }
}

/**
 > struct (0x3216ca09) DedustNativePayout {
 >     queryId: uint64
 >     rest: RemainingBitsAndRefs
 > }
 */
export interface DedustNativePayout {
    readonly $: 'DedustNativePayout'
    queryId: uint64
    rest: RemainingBitsAndRefs
}

export const DedustNativePayout = {
    PREFIX: 0x3216ca09,

    create(args: {
        queryId: uint64
        rest: RemainingBitsAndRefs
    }): DedustNativePayout {
        return {
            $: 'DedustNativePayout',
            ...args
        }
    },
    fromSlice(s: c.Slice): DedustNativePayout {
        loadAndCheckPrefix32(s, 0x3216ca09, 'DedustNativePayout');
        return {
            $: 'DedustNativePayout',
            queryId: s.loadUintBig(64),
            rest: loadTolkRemaining(s),
        }
    },
    store(self: DedustNativePayout, b: c.Builder): void {
        b.storeUint(0x3216ca09, 32);
        b.storeUint(self.queryId, 64);
        storeTolkRemaining(self.rest, b);
    },
    toCell(self: DedustNativePayout): c.Cell {
        return makeCellFrom<DedustNativePayout>(self, DedustNativePayout.store);
    }
}

/**
 > struct (0xa0a0b057) AskToBurnTracked {
 >     queryId: uint64
 >     jettonAmount: coins
 > }
 */
export interface AskToBurnTracked {
    readonly $: 'AskToBurnTracked'
    queryId: uint64
    jettonAmount: coins
}

export const AskToBurnTracked = {
    PREFIX: 0xa0a0b057,

    create(args: {
        queryId: uint64
        jettonAmount: coins
    }): AskToBurnTracked {
        return {
            $: 'AskToBurnTracked',
            ...args
        }
    },
    fromSlice(s: c.Slice): AskToBurnTracked {
        loadAndCheckPrefix32(s, 0xa0a0b057, 'AskToBurnTracked');
        return {
            $: 'AskToBurnTracked',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
        }
    },
    store(self: AskToBurnTracked, b: c.Builder): void {
        b.storeUint(0xa0a0b057, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
    },
    toCell(self: AskToBurnTracked): c.Cell {
        return makeCellFrom<AskToBurnTracked>(self, AskToBurnTracked.store);
    }
}

/**
 > struct (0xa0a0b059) BurnDelivered {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface BurnDelivered {
    readonly $: 'BurnDelivered'
    queryId: uint64
    amount: coins
}

export const BurnDelivered = {
    PREFIX: 0xa0a0b059,

    create(args: {
        queryId: uint64
        amount: coins
    }): BurnDelivered {
        return {
            $: 'BurnDelivered',
            ...args
        }
    },
    fromSlice(s: c.Slice): BurnDelivered {
        loadAndCheckPrefix32(s, 0xa0a0b059, 'BurnDelivered');
        return {
            $: 'BurnDelivered',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: BurnDelivered, b: c.Builder): void {
        b.storeUint(0xa0a0b059, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: BurnDelivered): c.Cell {
        return makeCellFrom<BurnDelivered>(self, BurnDelivered.store);
    }
}

/**
 > struct (0xa0a0b05a) BurnFailed {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface BurnFailed {
    readonly $: 'BurnFailed'
    queryId: uint64
    amount: coins
}

export const BurnFailed = {
    PREFIX: 0xa0a0b05a,

    create(args: {
        queryId: uint64
        amount: coins
    }): BurnFailed {
        return {
            $: 'BurnFailed',
            ...args
        }
    },
    fromSlice(s: c.Slice): BurnFailed {
        loadAndCheckPrefix32(s, 0xa0a0b05a, 'BurnFailed');
        return {
            $: 'BurnFailed',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: BurnFailed, b: c.Builder): void {
        b.storeUint(0xa0a0b05a, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: BurnFailed): c.Cell {
        return makeCellFrom<BurnFailed>(self, BurnFailed.store);
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
//    class BuybackBurnV2
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

export class BuybackBurnV2 implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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');

    static Errors = {
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new BuybackBurnV2(address);
    }

    static fromStorage(emptyStorage: {
        identity: CellRef<BuybackIdentity>
        config?: CellRef<BuybackConfig> | null /* = null */
        active?: boolean /* = false */
        availableTon?: coins /* = 0 */
        availableTokens?: coins /* = 0 */
        nextId?: uint64 /* = 1 */
        quoteId?: uint64 /* = 0 */
        quoteDeadline?: uint40 /* = 0 */
        swap?: CellRef<BuybackPendingSwap> | null /* = null */
        burnId?: uint64 /* = 0 */
        burnAmount?: coins /* = 0 */
        burned?: coins /* = 0 */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? BuybackBurnV2.CodeCell,
            data: BuybackStorage.toCell(BuybackStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new BuybackBurnV2(address, initialState);
    }

    static createCellOfInitBuyback(body: {
        queryId: uint64
        config: CellRef<BuybackConfig>
        active: boolean
    }) {
        return InitBuyback.toCell(InitBuyback.create(body));
    }

    static createCellOfExecuteBuyback(body: {
        queryId: uint64
    }) {
        return ExecuteBuyback.toCell(ExecuteBuyback.create(body));
    }

    static createCellOfClaimBuybackFees(body: {
        queryId: uint64
    }) {
        return ClaimBuybackFees.toCell(ClaimBuybackFees.create(body));
    }

    static createCellOfBurnAvailable(body: {
        queryId: uint64
    }) {
        return BurnAvailable.toCell(BurnAvailable.create(body));
    }

    static createCellOfBuybackTakePoolState(body: {
        queryId: uint64
        status: BuybackPoolStatus
        depositActive: boolean
        swapActive: boolean
        liquidity: coins
        reserveX: coins
        reserveY: coins
        rest: RemainingBitsAndRefs
    }) {
        return BuybackTakePoolState.toCell(BuybackTakePoolState.create(body));
    }

    static createCellOfBuybackRefund(body: {
        queryId: uint64
    }) {
        return BuybackRefund.toCell(BuybackRefund.create(body));
    }

    static createCellOfDedustNativePayout(body: {
        queryId: uint64
        rest: RemainingBitsAndRefs
    }) {
        return DedustNativePayout.toCell(DedustNativePayout.create(body));
    }

    static createCellOfTransferNotificationForRecipient(body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address | null
        forwardPayload: PayloadInline | PayloadInRef
    }) {
        return TransferNotificationForRecipient.toCell(TransferNotificationForRecipient.create(body));
    }

    static createCellOfReturnExcessesBack(body: {
        queryId: uint64
    }) {
        return ReturnExcessesBack.toCell(ReturnExcessesBack.create(body));
    }

    static createCellOfBurnDelivered(body: {
        queryId: uint64
        amount: coins
    }) {
        return BurnDelivered.toCell(BurnDelivered.create(body));
    }

    static createCellOfBurnFailed(body: {
        queryId: uint64
        amount: coins
    }) {
        return BurnFailed.toCell(BurnFailed.create(body));
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

    async sendInitBuyback(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        config: CellRef<BuybackConfig>
        active: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InitBuyback.toCell(InitBuyback.create(body)),
            ...extraOptions
        });
    }

    async sendExecuteBuyback(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ExecuteBuyback.toCell(ExecuteBuyback.create(body)),
            ...extraOptions
        });
    }

    async sendClaimBuybackFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ClaimBuybackFees.toCell(ClaimBuybackFees.create(body)),
            ...extraOptions
        });
    }

    async sendBurnAvailable(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: BurnAvailable.toCell(BurnAvailable.create(body)),
            ...extraOptions
        });
    }

    async sendBuybackTakePoolState(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        status: BuybackPoolStatus
        depositActive: boolean
        swapActive: boolean
        liquidity: coins
        reserveX: coins
        reserveY: coins
        rest: RemainingBitsAndRefs
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: BuybackTakePoolState.toCell(BuybackTakePoolState.create(body)),
            ...extraOptions
        });
    }

    async sendBuybackRefund(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: BuybackRefund.toCell(BuybackRefund.create(body)),
            ...extraOptions
        });
    }

    async sendDedustNativePayout(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        rest: RemainingBitsAndRefs
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DedustNativePayout.toCell(DedustNativePayout.create(body)),
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

    async sendReturnExcessesBack(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ReturnExcessesBack.toCell(ReturnExcessesBack.create(body)),
            ...extraOptions
        });
    }

    async sendBurnDelivered(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: BurnDelivered.toCell(BurnDelivered.create(body)),
            ...extraOptions
        });
    }

    async sendBurnFailed(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: BurnFailed.toCell(BurnFailed.create(body)),
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

    async getBuybackData(provider: ContractProvider): Promise<BuybackStorage> {
        const r = StackReader.fromGetMethod(12, await provider.get('get_buyback_data', []));
        return ({
            $: 'BuybackStorage',
            identity: r.readCellRef<BuybackIdentity>(BuybackIdentity.fromSlice),
            config: r.readNullable<CellRef<BuybackConfig>>(
                (r) => r.readCellRef<BuybackConfig>(BuybackConfig.fromSlice)
            ),
            active: r.readBoolean(),
            availableTon: r.readBigInt(),
            availableTokens: r.readBigInt(),
            nextId: r.readBigInt(),
            quoteId: r.readBigInt(),
            quoteDeadline: r.readBigInt(),
            swap: r.readNullable<CellRef<BuybackPendingSwap>>(
                (r) => r.readCellRef<BuybackPendingSwap>(BuybackPendingSwap.fromSlice)
            ),
            burnId: r.readBigInt(),
            burnAmount: r.readBigInt(),
            burned: r.readBigInt(),
        });
    }
}
