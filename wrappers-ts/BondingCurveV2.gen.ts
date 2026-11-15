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
 > struct (0x00d8d379) ProvideMigrationPoolState {
 >     queryId: uint64
 >     includeConfig: bool
 >     includeFees: bool
 >     includeCodeHash: bool
 >     includeRewards: bool
 > }
 */
export interface ProvideMigrationPoolState {
    readonly $: 'ProvideMigrationPoolState'
    queryId: uint64
    includeConfig: boolean /* = false */
    includeFees: boolean /* = false */
    includeCodeHash: boolean /* = false */
    includeRewards: boolean /* = false */
}

export const ProvideMigrationPoolState = {
    PREFIX: 0x00d8d379,

    create(args: {
        queryId: uint64
        includeConfig?: boolean /* = false */
        includeFees?: boolean /* = false */
        includeCodeHash?: boolean /* = false */
        includeRewards?: boolean /* = false */
    }): ProvideMigrationPoolState {
        return {
            $: 'ProvideMigrationPoolState',
            includeConfig: false,
            includeFees: false,
            includeCodeHash: false,
            includeRewards: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): ProvideMigrationPoolState {
        loadAndCheckPrefix32(s, 0x00d8d379, 'ProvideMigrationPoolState');
        return {
            $: 'ProvideMigrationPoolState',
            queryId: s.loadUintBig(64),
            includeConfig: s.loadBoolean(),
            includeFees: s.loadBoolean(),
            includeCodeHash: s.loadBoolean(),
            includeRewards: s.loadBoolean(),
        }
    },
    store(self: ProvideMigrationPoolState, b: c.Builder): void {
        b.storeUint(0x00d8d379, 32);
        b.storeUint(self.queryId, 64);
        b.storeBit(self.includeConfig);
        b.storeBit(self.includeFees);
        b.storeBit(self.includeCodeHash);
        b.storeBit(self.includeRewards);
    },
    toCell(self: ProvideMigrationPoolState): c.Cell {
        return makeCellFrom<ProvideMigrationPoolState>(self, ProvideMigrationPoolState.store);
    }
}

/**
 > struct (0b00) MigrationPoolUninitialized {
 > }
 */
export interface MigrationPoolUninitialized {
    readonly $: 'MigrationPoolUninitialized'
}

export const MigrationPoolUninitialized = {
    PREFIX: 0b00,

    create(): MigrationPoolUninitialized {
        return {
            $: 'MigrationPoolUninitialized',
        }
    },
    fromSlice(s: c.Slice): MigrationPoolUninitialized {
        loadAndCheckPrefix(s, 0b00, 2, 'MigrationPoolUninitialized');
        return {
            $: 'MigrationPoolUninitialized',
        }
    },
    store(self: MigrationPoolUninitialized, b: c.Builder): void {
        b.storeUint(0b00, 2);
    },
    toCell(self: MigrationPoolUninitialized): c.Cell {
        return makeCellFrom<MigrationPoolUninitialized>(self, MigrationPoolUninitialized.store);
    }
}

/**
 > struct (0b01) MigrationPoolInitializing {
 >     initiatorAddress: address
 > }
 */
export interface MigrationPoolInitializing {
    readonly $: 'MigrationPoolInitializing'
    initiatorAddress: c.Address
}

export const MigrationPoolInitializing = {
    PREFIX: 0b01,

    create(args: {
        initiatorAddress: c.Address
    }): MigrationPoolInitializing {
        return {
            $: 'MigrationPoolInitializing',
            ...args
        }
    },
    fromSlice(s: c.Slice): MigrationPoolInitializing {
        loadAndCheckPrefix(s, 0b01, 2, 'MigrationPoolInitializing');
        return {
            $: 'MigrationPoolInitializing',
            initiatorAddress: s.loadAddress(),
        }
    },
    store(self: MigrationPoolInitializing, b: c.Builder): void {
        b.storeUint(0b01, 2);
        b.storeAddress(self.initiatorAddress);
    },
    toCell(self: MigrationPoolInitializing): c.Cell {
        return makeCellFrom<MigrationPoolInitializing>(self, MigrationPoolInitializing.store);
    }
}

/**
 > struct (0b10) MigrationPoolInitialized {
 > }
 */
export interface MigrationPoolInitialized {
    readonly $: 'MigrationPoolInitialized'
}

export const MigrationPoolInitialized = {
    PREFIX: 0b10,

    create(): MigrationPoolInitialized {
        return {
            $: 'MigrationPoolInitialized',
        }
    },
    fromSlice(s: c.Slice): MigrationPoolInitialized {
        loadAndCheckPrefix(s, 0b10, 2, 'MigrationPoolInitialized');
        return {
            $: 'MigrationPoolInitialized',
        }
    },
    store(self: MigrationPoolInitialized, b: c.Builder): void {
        b.storeUint(0b10, 2);
    },
    toCell(self: MigrationPoolInitialized): c.Cell {
        return makeCellFrom<MigrationPoolInitialized>(self, MigrationPoolInitialized.store);
    }
}

/**
 > type MigrationPoolStatus = MigrationPoolUninitialized | MigrationPoolInitializing | MigrationPoolInitialized
 */
export type MigrationPoolStatus =
    | MigrationPoolUninitialized
    | MigrationPoolInitializing
    | MigrationPoolInitialized

export const MigrationPoolStatus = {
    fromSlice(s: c.Slice): MigrationPoolStatus {
        return lookupPrefix(s, 0b00, 2) ? MigrationPoolUninitialized.fromSlice(s) :
            lookupPrefix(s, 0b01, 2) ? MigrationPoolInitializing.fromSlice(s) :
            lookupPrefix(s, 0b10, 2) ? MigrationPoolInitialized.fromSlice(s) :
            throwNonePrefixMatch('MigrationPoolStatus');
    },
    store(self: MigrationPoolStatus, b: c.Builder): void {
        switch (self.$) {
            case 'MigrationPoolUninitialized':
                MigrationPoolUninitialized.store(self, b);
                break;
            case 'MigrationPoolInitializing':
                MigrationPoolInitializing.store(self, b);
                break;
            case 'MigrationPoolInitialized':
                MigrationPoolInitialized.store(self, b);
                break;
        }
    },
    toCell(self: MigrationPoolStatus): c.Cell {
        return makeCellFrom<MigrationPoolStatus>(self, MigrationPoolStatus.store);
    }
}

/**
 > struct (0x870a9579) TakeMigrationPoolState {
 >     queryId: uint64
 >     status: MigrationPoolStatus
 >     depositActive: bool
 >     swapActive: bool
 >     liquidity: coins
 >     reserveX: coins
 >     reserveY: coins
 >     rest: RemainingBitsAndRefs
 > }
 */
export interface TakeMigrationPoolState {
    readonly $: 'TakeMigrationPoolState'
    queryId: uint64
    status: MigrationPoolStatus
    depositActive: boolean
    swapActive: boolean
    liquidity: coins
    reserveX: coins
    reserveY: coins
    rest: RemainingBitsAndRefs
}

export const TakeMigrationPoolState = {
    PREFIX: 0x870a9579,

    create(args: {
        queryId: uint64
        status: MigrationPoolStatus
        depositActive: boolean
        swapActive: boolean
        liquidity: coins
        reserveX: coins
        reserveY: coins
        rest: RemainingBitsAndRefs
    }): TakeMigrationPoolState {
        return {
            $: 'TakeMigrationPoolState',
            ...args
        }
    },
    fromSlice(s: c.Slice): TakeMigrationPoolState {
        loadAndCheckPrefix32(s, 0x870a9579, 'TakeMigrationPoolState');
        return {
            $: 'TakeMigrationPoolState',
            queryId: s.loadUintBig(64),
            status: MigrationPoolStatus.fromSlice(s),
            depositActive: s.loadBoolean(),
            swapActive: s.loadBoolean(),
            liquidity: s.loadCoins(),
            reserveX: s.loadCoins(),
            reserveY: s.loadCoins(),
            rest: loadTolkRemaining(s),
        }
    },
    store(self: TakeMigrationPoolState, b: c.Builder): void {
        b.storeUint(0x870a9579, 32);
        b.storeUint(self.queryId, 64);
        MigrationPoolStatus.store(self.status, b);
        b.storeBit(self.depositActive);
        b.storeBit(self.swapActive);
        b.storeCoins(self.liquidity);
        b.storeCoins(self.reserveX);
        b.storeCoins(self.reserveY);
        storeTolkRemaining(self.rest, b);
    },
    toCell(self: TakeMigrationPoolState): c.Cell {
        return makeCellFrom<TakeMigrationPoolState>(self, TakeMigrationPoolState.store);
    }
}

/**
 > struct (0x3216ca09) MigrationNativeRefund {
 >     queryId: uint64
 >     amount: coins
 >     code: int32
 >     payload: cell?
 > }
 */
export interface MigrationNativeRefund {
    readonly $: 'MigrationNativeRefund'
    queryId: uint64
    amount: coins
    code: int32
    payload: c.Cell | null
}

export const MigrationNativeRefund = {
    PREFIX: 0x3216ca09,

    create(args: {
        queryId: uint64
        amount: coins
        code: int32
        payload: c.Cell | null
    }): MigrationNativeRefund {
        return {
            $: 'MigrationNativeRefund',
            ...args
        }
    },
    fromSlice(s: c.Slice): MigrationNativeRefund {
        loadAndCheckPrefix32(s, 0x3216ca09, 'MigrationNativeRefund');
        return {
            $: 'MigrationNativeRefund',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            code: s.loadIntBig(32),
            payload: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: MigrationNativeRefund, b: c.Builder): void {
        b.storeUint(0x3216ca09, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        b.storeInt(self.code, 32);
        storeTolkNullable<c.Cell>(self.payload, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: MigrationNativeRefund): c.Cell {
        return makeCellFrom<MigrationNativeRefund>(self, MigrationNativeRefund.store);
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
 >     depositGeneration: uint64
 >     closingDeposit: bool
 >     refundCheckId: uint64
 >     pendingNativeRefund: bool
 >     pendingJettonRefund: bool
 >     pendingDepositClose: bool
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
    depositGeneration: uint64 /* = 1 */
    closingDeposit: boolean /* = false */
    refundCheckId: uint64 /* = 0 */
    pendingNativeRefund: boolean /* = false */
    pendingJettonRefund: boolean /* = false */
    pendingDepositClose: boolean /* = false */
}

export const MigrationProgress = {
    create(args: {
        nativeQueryId: uint64
        jettonQueryId: uint64
        tonAmount: coins
        jettonAmount: coins
        nativeRetry: boolean
        jettonRetry: boolean
        depositGeneration?: uint64 /* = 1 */
        closingDeposit?: boolean /* = false */
        refundCheckId?: uint64 /* = 0 */
        pendingNativeRefund?: boolean /* = false */
        pendingJettonRefund?: boolean /* = false */
        pendingDepositClose?: boolean /* = false */
    }): MigrationProgress {
        return {
            $: 'MigrationProgress',
            depositGeneration: 1n,
            closingDeposit: false,
            refundCheckId: 0n,
            pendingNativeRefund: false,
            pendingJettonRefund: false,
            pendingDepositClose: false,
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
            depositGeneration: s.loadUintBig(64),
            closingDeposit: s.loadBoolean(),
            refundCheckId: s.loadUintBig(64),
            pendingNativeRefund: s.loadBoolean(),
            pendingJettonRefund: s.loadBoolean(),
            pendingDepositClose: s.loadBoolean(),
        }
    },
    store(self: MigrationProgress, b: c.Builder): void {
        b.storeUint(self.nativeQueryId, 64);
        b.storeUint(self.jettonQueryId, 64);
        b.storeCoins(self.tonAmount);
        b.storeCoins(self.jettonAmount);
        b.storeBit(self.nativeRetry);
        b.storeBit(self.jettonRetry);
        b.storeUint(self.depositGeneration, 64);
        b.storeBit(self.closingDeposit);
        b.storeUint(self.refundCheckId, 64);
        b.storeBit(self.pendingNativeRefund);
        b.storeBit(self.pendingJettonRefund);
        b.storeBit(self.pendingDepositClose);
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
 >     soldSupplyBps: uint16
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
    soldSupplyBps: uint16 /* = 8333 */
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
        soldSupplyBps?: uint16 /* = 8333 */
        minBuyBps?: uint16 /* = 0 */
        maxBuyBps?: uint16 /* = 0 */
        beneficiaries?: CellRef<FeeBeneficiaries> | null /* = null */
        buybackBurn?: boolean /* = false */
    }): LaunchOptions {
        return {
            $: 'LaunchOptions',
            graduationThreshold: 2000000000000n,
            soldSupplyBps: 8333n,
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
            soldSupplyBps: s.loadUintBig(16),
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
        b.storeUint(self.soldSupplyBps, 16);
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
 >     minimumCreateValue: coins
 >     migrationPrefund: coins
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
    minimumCreateValue: coins
    migrationPrefund: coins
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
        minimumCreateValue: coins
        migrationPrefund: coins
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
 > struct (0xa0a0b067) MigrationJettonRefund {
 >     queryId: uint64
 >     depositGeneration: uint64
 >     amount: coins
 >     closingDeposit: bool
 > }
 */
export interface MigrationJettonRefund {
    readonly $: 'MigrationJettonRefund'
    queryId: uint64
    depositGeneration: uint64
    amount: coins
    closingDeposit: boolean /* = true */
}

export const MigrationJettonRefund = {
    PREFIX: 0xa0a0b067,

    create(args: {
        queryId: uint64
        depositGeneration: uint64
        amount: coins
        closingDeposit?: boolean /* = true */
    }): MigrationJettonRefund {
        return {
            $: 'MigrationJettonRefund',
            closingDeposit: true,
            ...args
        }
    },
    fromSlice(s: c.Slice): MigrationJettonRefund {
        loadAndCheckPrefix32(s, 0xa0a0b067, 'MigrationJettonRefund');
        return {
            $: 'MigrationJettonRefund',
            queryId: s.loadUintBig(64),
            depositGeneration: s.loadUintBig(64),
            amount: s.loadCoins(),
            closingDeposit: s.loadBoolean(),
        }
    },
    store(self: MigrationJettonRefund, b: c.Builder): void {
        b.storeUint(0xa0a0b067, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.depositGeneration, 64);
        b.storeCoins(self.amount);
        b.storeBit(self.closingDeposit);
    },
    toCell(self: MigrationJettonRefund): c.Cell {
        return makeCellFrom<MigrationJettonRefund>(self, MigrationJettonRefund.store);
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
 > struct (0x2c76b973) RequestWalletAddress {
 >     queryId: uint64
 >     ownerAddress: address
 >     includeOwnerAddress: bool
 > }
 */
export interface RequestWalletAddress {
    readonly $: 'RequestWalletAddress'
    queryId: uint64
    ownerAddress: c.Address
    includeOwnerAddress: boolean
}

export const RequestWalletAddress = {
    PREFIX: 0x2c76b973,

    create(args: {
        queryId: uint64
        ownerAddress: c.Address
        includeOwnerAddress: boolean
    }): RequestWalletAddress {
        return {
            $: 'RequestWalletAddress',
            ...args
        }
    },
    fromSlice(s: c.Slice): RequestWalletAddress {
        loadAndCheckPrefix32(s, 0x2c76b973, 'RequestWalletAddress');
        return {
            $: 'RequestWalletAddress',
            queryId: s.loadUintBig(64),
            ownerAddress: s.loadAddress(),
            includeOwnerAddress: s.loadBoolean(),
        }
    },
    store(self: RequestWalletAddress, b: c.Builder): void {
        b.storeUint(0x2c76b973, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.ownerAddress);
        b.storeBit(self.includeOwnerAddress);
    },
    toCell(self: RequestWalletAddress): c.Cell {
        return makeCellFrom<RequestWalletAddress>(self, RequestWalletAddress.store);
    }
}

/**
 > struct (0xd1735400) ResponseWalletAddress {
 >     queryId: uint64
 >     jettonWalletAddress: address?
 >     ownerAddress: Cell<address>?
 > }
 */
export interface ResponseWalletAddress {
    readonly $: 'ResponseWalletAddress'
    queryId: uint64
    jettonWalletAddress: c.Address | null
    ownerAddress: CellRef<c.Address> | null
}

export const ResponseWalletAddress = {
    PREFIX: 0xd1735400,

    create(args: {
        queryId: uint64
        jettonWalletAddress: c.Address | null
        ownerAddress: CellRef<c.Address> | null
    }): ResponseWalletAddress {
        return {
            $: 'ResponseWalletAddress',
            ...args
        }
    },
    fromSlice(s: c.Slice): ResponseWalletAddress {
        loadAndCheckPrefix32(s, 0xd1735400, 'ResponseWalletAddress');
        return {
            $: 'ResponseWalletAddress',
            queryId: s.loadUintBig(64),
            jettonWalletAddress: s.loadMaybeAddress(),
            ownerAddress: s.loadBoolean() ? loadCellRef<c.Address>(s,
                (s) => s.loadAddress()
            ) : null,
        }
    },
    store(self: ResponseWalletAddress, b: c.Builder): void {
        b.storeUint(0xd1735400, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.jettonWalletAddress);
        storeTolkNullable<CellRef<c.Address>>(self.ownerAddress, b,
            (v,b) => { storeCellRef<c.Address>(v, b,
                (v,b) => b.storeAddress(v)
            ); }
        );
    },
    toCell(self: ResponseWalletAddress): c.Cell {
        return makeCellFrom<ResponseWalletAddress>(self, ResponseWalletAddress.store);
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

    static createCellOfRequestWalletAddress(body: {
        queryId: uint64
        ownerAddress: c.Address
        includeOwnerAddress: boolean
    }) {
        return RequestWalletAddress.toCell(RequestWalletAddress.create(body));
    }

    static createCellOfTakeMigrationPoolState(body: {
        queryId: uint64
        status: MigrationPoolStatus
        depositActive: boolean
        swapActive: boolean
        liquidity: coins
        reserveX: coins
        reserveY: coins
        rest: RemainingBitsAndRefs
    }) {
        return TakeMigrationPoolState.toCell(TakeMigrationPoolState.create(body));
    }

    static createCellOfMigrationNativeRefund(body: {
        queryId: uint64
        amount: coins
        code: int32
        payload: c.Cell | null
    }) {
        return MigrationNativeRefund.toCell(MigrationNativeRefund.create(body));
    }

    static createCellOfMigrationJettonRefund(body: {
        queryId: uint64
        depositGeneration: uint64
        amount: coins
        closingDeposit?: boolean /* = true */
    }) {
        return MigrationJettonRefund.toCell(MigrationJettonRefund.create(body));
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

    async sendRequestWalletAddress(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        ownerAddress: c.Address
        includeOwnerAddress: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RequestWalletAddress.toCell(RequestWalletAddress.create(body)),
            ...extraOptions
        });
    }

    async sendTakeMigrationPoolState(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        status: MigrationPoolStatus
        depositActive: boolean
        swapActive: boolean
        liquidity: coins
        reserveX: coins
        reserveY: coins
        rest: RemainingBitsAndRefs
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: TakeMigrationPoolState.toCell(TakeMigrationPoolState.create(body)),
            ...extraOptions
        });
    }

    async sendMigrationNativeRefund(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
        code: int32
        payload: c.Cell | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: MigrationNativeRefund.toCell(MigrationNativeRefund.create(body)),
            ...extraOptions
        });
    }

    async sendMigrationJettonRefund(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        depositGeneration: uint64
        amount: coins
        closingDeposit?: boolean /* = true */
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: MigrationJettonRefund.toCell(MigrationJettonRefund.create(body)),
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
            soldSupplyBps: r.readBigInt(),
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
        const r = StackReader.fromGetMethod(12, await provider.get('get_launch_preview', []));
        return ({
            $: 'LaunchPreview',
            minimumCreateValue: r.readBigInt(),
            migrationPrefund: r.readBigInt(),
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
        const r = StackReader.fromGetMethod(13, await provider.get('get_migration_data', []));
        return r.readWideNullable<MigrationProgress>(13,
            (r) => ({
                $: 'MigrationProgress',
                nativeQueryId: r.readBigInt(),
                jettonQueryId: r.readBigInt(),
                tonAmount: r.readBigInt(),
                jettonAmount: r.readBigInt(),
                nativeRetry: r.readBoolean(),
                jettonRetry: r.readBoolean(),
                depositGeneration: r.readBigInt(),
                closingDeposit: r.readBoolean(),
                refundCheckId: r.readBigInt(),
                pendingNativeRefund: r.readBoolean(),
                pendingJettonRefund: r.readBoolean(),
                pendingDepositClose: r.readBoolean(),
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
