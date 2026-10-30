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
