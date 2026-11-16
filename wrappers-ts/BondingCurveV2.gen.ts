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

type uint2 = bigint
type uint3 = bigint
type uint5 = bigint
type uint8 = bigint
type uint16 = bigint
type uint64 = bigint

/**
 > struct (0xa0a0b082) LaunchConfirmed {
 >     queryId: uint64
 > }
 */
export interface LaunchConfirmed {
    readonly $: 'LaunchConfirmed'
    queryId: uint64
}

export const LaunchConfirmed = {
    PREFIX: 0xa0a0b082,

    create(args: {
        queryId: uint64
    }): LaunchConfirmed {
        return {
            $: 'LaunchConfirmed',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchConfirmed {
        loadAndCheckPrefix32(s, 0xa0a0b082, 'LaunchConfirmed');
        return {
            $: 'LaunchConfirmed',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: LaunchConfirmed, b: c.Builder): void {
        b.storeUint(0xa0a0b082, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: LaunchConfirmed): c.Cell {
        return makeCellFrom<LaunchConfirmed>(self, LaunchConfirmed.store);
    }
}

/**
 > struct (0xa0a0b083) RetryLaunchSettlement {
 >     queryId: uint64
 > }
 */
export interface RetryLaunchSettlement {
    readonly $: 'RetryLaunchSettlement'
    queryId: uint64
}

export const RetryLaunchSettlement = {
    PREFIX: 0xa0a0b083,

    create(args: {
        queryId: uint64
    }): RetryLaunchSettlement {
        return {
            $: 'RetryLaunchSettlement',
            ...args
        }
    },
    fromSlice(s: c.Slice): RetryLaunchSettlement {
        loadAndCheckPrefix32(s, 0xa0a0b083, 'RetryLaunchSettlement');
        return {
            $: 'RetryLaunchSettlement',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: RetryLaunchSettlement, b: c.Builder): void {
        b.storeUint(0xa0a0b083, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: RetryLaunchSettlement): c.Cell {
        return makeCellFrom<RetryLaunchSettlement>(self, RetryLaunchSettlement.store);
    }
}

/**
 > struct (0xa0a0b084) FinalizeLaunch {
 >     queryId: uint64
 > }
 */
export interface FinalizeLaunch {
    readonly $: 'FinalizeLaunch'
    queryId: uint64
}

export const FinalizeLaunch = {
    PREFIX: 0xa0a0b084,

    create(args: {
        queryId: uint64
    }): FinalizeLaunch {
        return {
            $: 'FinalizeLaunch',
            ...args
        }
    },
    fromSlice(s: c.Slice): FinalizeLaunch {
        loadAndCheckPrefix32(s, 0xa0a0b084, 'FinalizeLaunch');
        return {
            $: 'FinalizeLaunch',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: FinalizeLaunch, b: c.Builder): void {
        b.storeUint(0xa0a0b084, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: FinalizeLaunch): c.Cell {
        return makeCellFrom<FinalizeLaunch>(self, FinalizeLaunch.store);
    }
}

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
 > enum LaunchSettlementPhase { 6 variants }
 */
export type LaunchSettlementPhase = bigint

export const LaunchSettlementPhase = {
    WaitingMints: 0n,
    WaitingServices: 1n,
    Ready: 2n,
    Finalizing: 3n,
    Complete: 4n,
    Cancelled: 5n,

    fromSlice(s: c.Slice): LaunchSettlementPhase {
        return s.loadUintBig(8);
    },
    store(self: LaunchSettlementPhase, b: c.Builder): void {
        b.storeUint(self, 8);
    },
    toCell(self: LaunchSettlementPhase): c.Cell {
        return makeCellFrom<LaunchSettlementPhase>(self, LaunchSettlementPhase.store);
    }
}

/**
 > struct LaunchSettlement {
 >     queryId: uint64
 >     preExistingBalance: coins
 >     phase: LaunchSettlementPhase
 >     factoryConfirmed: bool
 >     confirmInFlight: bool
 >     dropInFlight: bool
 >     retainedBufferLimit: coins
 >     recoveryId: uint64
 >     recoveryPending: uint5
 >     mintResolving: uint2
 > }
 */
export interface LaunchSettlement {
    readonly $: 'LaunchSettlement'
    queryId: uint64
    preExistingBalance: coins
    phase: LaunchSettlementPhase
    factoryConfirmed: boolean /* = false */
    confirmInFlight: boolean /* = false */
    dropInFlight: boolean /* = false */
    retainedBufferLimit: coins /* = 0 */
    recoveryId: uint64 /* = 0 */
    recoveryPending: uint5 /* = 0 */
    mintResolving: uint2 /* = 0 */
}

export const LaunchSettlement = {
    create(args: {
        queryId: uint64
        preExistingBalance: coins
        phase: LaunchSettlementPhase
        factoryConfirmed?: boolean /* = false */
        confirmInFlight?: boolean /* = false */
        dropInFlight?: boolean /* = false */
        retainedBufferLimit?: coins /* = 0 */
        recoveryId?: uint64 /* = 0 */
        recoveryPending?: uint5 /* = 0 */
        mintResolving?: uint2 /* = 0 */
    }): LaunchSettlement {
        return {
            $: 'LaunchSettlement',
            factoryConfirmed: false,
            confirmInFlight: false,
            dropInFlight: false,
            retainedBufferLimit: 0n,
            recoveryId: 0n,
            recoveryPending: 0n,
            mintResolving: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchSettlement {
        return {
            $: 'LaunchSettlement',
            queryId: s.loadUintBig(64),
            preExistingBalance: s.loadCoins(),
            phase: LaunchSettlementPhase.fromSlice(s),
            factoryConfirmed: s.loadBoolean(),
            confirmInFlight: s.loadBoolean(),
            dropInFlight: s.loadBoolean(),
            retainedBufferLimit: s.loadCoins(),
            recoveryId: s.loadUintBig(64),
            recoveryPending: s.loadUintBig(5),
            mintResolving: s.loadUintBig(2),
        }
    },
    store(self: LaunchSettlement, b: c.Builder): void {
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.preExistingBalance);
        LaunchSettlementPhase.store(self.phase, b);
        b.storeBit(self.factoryConfirmed);
        b.storeBit(self.confirmInFlight);
        b.storeBit(self.dropInFlight);
        b.storeCoins(self.retainedBufferLimit);
        b.storeUint(self.recoveryId, 64);
        b.storeUint(self.recoveryPending, 5);
        b.storeUint(self.mintResolving, 2);
    },
    toCell(self: LaunchSettlement): c.Cell {
        return makeCellFrom<LaunchSettlement>(self, LaunchSettlement.store);
    }
}

/**
 > struct LaunchSettlementReply {
 >     settlement: LaunchSettlement?
 >     curveReceived: bool
 >     devReceived: bool
 >     adminDropped: bool
 >     minimumRetryValue: coins
 >     retainedBuffer: coins
 > }
 */
export interface LaunchSettlementReply {
    readonly $: 'LaunchSettlementReply'
    settlement: LaunchSettlement | null
    curveReceived: boolean
    devReceived: boolean
    adminDropped: boolean
    minimumRetryValue: coins
    retainedBuffer: coins
}

export const LaunchSettlementReply = {
    create(args: {
        settlement: LaunchSettlement | null
        curveReceived: boolean
        devReceived: boolean
        adminDropped: boolean
        minimumRetryValue: coins
        retainedBuffer: coins
    }): LaunchSettlementReply {
        return {
            $: 'LaunchSettlementReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchSettlementReply {
        return {
            $: 'LaunchSettlementReply',
            settlement: s.loadBoolean() ? LaunchSettlement.fromSlice(s) : null,
            curveReceived: s.loadBoolean(),
            devReceived: s.loadBoolean(),
            adminDropped: s.loadBoolean(),
            minimumRetryValue: s.loadCoins(),
            retainedBuffer: s.loadCoins(),
        }
    },
    store(self: LaunchSettlementReply, b: c.Builder): void {
        storeTolkNullable<LaunchSettlement>(self.settlement, b, LaunchSettlement.store);
        b.storeBit(self.curveReceived);
        b.storeBit(self.devReceived);
        b.storeBit(self.adminDropped);
        b.storeCoins(self.minimumRetryValue);
        b.storeCoins(self.retainedBuffer);
    },
    toCell(self: LaunchSettlementReply): c.Cell {
        return makeCellFrom<LaunchSettlementReply>(self, LaunchSettlementReply.store);
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
 >     settlement: Cell<LaunchSettlement>?
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
    settlement: CellRef<LaunchSettlement> | null /* = null */
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
        settlement?: CellRef<LaunchSettlement> | null /* = null */
    }): BondingCurveStorage {
        return {
            $: 'BondingCurveStorage',
            migration: null,
            settlement: null,
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
            settlement: s.loadBoolean() ? loadCellRef<LaunchSettlement>(s, LaunchSettlement.fromSlice) : null,
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
        storeTolkNullable<CellRef<LaunchSettlement>>(self.settlement, b,
            (v,b) => storeCellRef<LaunchSettlement>(v, b, LaunchSettlement.store)
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
 > struct (0xa0a0b087) ResolveLaunchMint {
 >     queryId: uint64
 >     leg: uint3
 > }
 */
export interface ResolveLaunchMint {
    readonly $: 'ResolveLaunchMint'
    queryId: uint64
    leg: uint3
}

export const ResolveLaunchMint = {
    PREFIX: 0xa0a0b087,

    create(args: {
        queryId: uint64
        leg: uint3
    }): ResolveLaunchMint {
        return {
            $: 'ResolveLaunchMint',
            ...args
        }
    },
    fromSlice(s: c.Slice): ResolveLaunchMint {
        loadAndCheckPrefix32(s, 0xa0a0b087, 'ResolveLaunchMint');
        return {
            $: 'ResolveLaunchMint',
            queryId: s.loadUintBig(64),
            leg: s.loadUintBig(3),
        }
    },
    store(self: ResolveLaunchMint, b: c.Builder): void {
        b.storeUint(0xa0a0b087, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.leg, 3);
    },
    toCell(self: ResolveLaunchMint): c.Cell {
        return makeCellFrom<ResolveLaunchMint>(self, ResolveLaunchMint.store);
    }
}

/**
 > struct (0xa0a0b088) InspectLaunchMint {
 >     queryId: uint64
 >     leg: uint3
 >     curve: address
 > }
 */
export interface InspectLaunchMint {
    readonly $: 'InspectLaunchMint'
    queryId: uint64
    leg: uint3
    curve: c.Address
}

export const InspectLaunchMint = {
    PREFIX: 0xa0a0b088,

    create(args: {
        queryId: uint64
        leg: uint3
        curve: c.Address
    }): InspectLaunchMint {
        return {
            $: 'InspectLaunchMint',
            ...args
        }
    },
    fromSlice(s: c.Slice): InspectLaunchMint {
        loadAndCheckPrefix32(s, 0xa0a0b088, 'InspectLaunchMint');
        return {
            $: 'InspectLaunchMint',
            queryId: s.loadUintBig(64),
            leg: s.loadUintBig(3),
            curve: s.loadAddress(),
        }
    },
    store(self: InspectLaunchMint, b: c.Builder): void {
        b.storeUint(0xa0a0b088, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.leg, 3);
        b.storeAddress(self.curve);
    },
    toCell(self: InspectLaunchMint): c.Cell {
        return makeCellFrom<InspectLaunchMint>(self, InspectLaunchMint.store);
    }
}

/**
 > struct (0xa0a0b089) LaunchMintInspection {
 >     queryId: uint64
 >     leg: uint3
 >     delivered: bool
 >     amount: coins
 > }
 */
export interface LaunchMintInspection {
    readonly $: 'LaunchMintInspection'
    queryId: uint64
    leg: uint3
    delivered: boolean
    amount: coins
}

export const LaunchMintInspection = {
    PREFIX: 0xa0a0b089,

    create(args: {
        queryId: uint64
        leg: uint3
        delivered: boolean
        amount: coins
    }): LaunchMintInspection {
        return {
            $: 'LaunchMintInspection',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchMintInspection {
        loadAndCheckPrefix32(s, 0xa0a0b089, 'LaunchMintInspection');
        return {
            $: 'LaunchMintInspection',
            queryId: s.loadUintBig(64),
            leg: s.loadUintBig(3),
            delivered: s.loadBoolean(),
            amount: s.loadCoins(),
        }
    },
    store(self: LaunchMintInspection, b: c.Builder): void {
        b.storeUint(0xa0a0b089, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.leg, 3);
        b.storeBit(self.delivered);
        b.storeCoins(self.amount);
    },
    toCell(self: LaunchMintInspection): c.Cell {
        return makeCellFrom<LaunchMintInspection>(self, LaunchMintInspection.store);
    }
}

/**
 > struct (0xa0a0b08a) LaunchMintResolved {
 >     queryId: uint64
 >     leg: uint3
 >     delivered: bool
 >     failed: bool
 >     amount: coins
 > }
 */
export interface LaunchMintResolved {
    readonly $: 'LaunchMintResolved'
    queryId: uint64
    leg: uint3
    delivered: boolean
    failed: boolean
    amount: coins
}

export const LaunchMintResolved = {
    PREFIX: 0xa0a0b08a,

    create(args: {
        queryId: uint64
        leg: uint3
        delivered: boolean
        failed: boolean
        amount: coins
    }): LaunchMintResolved {
        return {
            $: 'LaunchMintResolved',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchMintResolved {
        loadAndCheckPrefix32(s, 0xa0a0b08a, 'LaunchMintResolved');
        return {
            $: 'LaunchMintResolved',
            queryId: s.loadUintBig(64),
            leg: s.loadUintBig(3),
            delivered: s.loadBoolean(),
            failed: s.loadBoolean(),
            amount: s.loadCoins(),
        }
    },
    store(self: LaunchMintResolved, b: c.Builder): void {
        b.storeUint(0xa0a0b08a, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.leg, 3);
        b.storeBit(self.delivered);
        b.storeBit(self.failed);
        b.storeCoins(self.amount);
    },
    toCell(self: LaunchMintResolved): c.Cell {
        return makeCellFrom<LaunchMintResolved>(self, LaunchMintResolved.store);
    }
}

/**
 > struct (0xa0a0b085) ProbeLaunchSettlement {
 >     queryId: uint64
 >     leg: uint3
 > }
 */
export interface ProbeLaunchSettlement {
    readonly $: 'ProbeLaunchSettlement'
    queryId: uint64
    leg: uint3
}

export const ProbeLaunchSettlement = {
    PREFIX: 0xa0a0b085,

    create(args: {
        queryId: uint64
        leg: uint3
    }): ProbeLaunchSettlement {
        return {
            $: 'ProbeLaunchSettlement',
            ...args
        }
    },
    fromSlice(s: c.Slice): ProbeLaunchSettlement {
        loadAndCheckPrefix32(s, 0xa0a0b085, 'ProbeLaunchSettlement');
        return {
            $: 'ProbeLaunchSettlement',
            queryId: s.loadUintBig(64),
            leg: s.loadUintBig(3),
        }
    },
    store(self: ProbeLaunchSettlement, b: c.Builder): void {
        b.storeUint(0xa0a0b085, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.leg, 3);
    },
    toCell(self: ProbeLaunchSettlement): c.Cell {
        return makeCellFrom<ProbeLaunchSettlement>(self, ProbeLaunchSettlement.store);
    }
}

/**
 > struct (0xa0a0b086) LaunchSettlementState {
 >     queryId: uint64
 >     leg: uint3
 >     completed: bool
 >     amount: coins
 > }
 */
export interface LaunchSettlementState {
    readonly $: 'LaunchSettlementState'
    queryId: uint64
    leg: uint3
    completed: boolean
    amount: coins
}

export const LaunchSettlementState = {
    PREFIX: 0xa0a0b086,

    create(args: {
        queryId: uint64
        leg: uint3
        completed: boolean
        amount: coins
    }): LaunchSettlementState {
        return {
            $: 'LaunchSettlementState',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchSettlementState {
        loadAndCheckPrefix32(s, 0xa0a0b086, 'LaunchSettlementState');
        return {
            $: 'LaunchSettlementState',
            queryId: s.loadUintBig(64),
            leg: s.loadUintBig(3),
            completed: s.loadBoolean(),
            amount: s.loadCoins(),
        }
    },
    store(self: LaunchSettlementState, b: c.Builder): void {
        b.storeUint(0xa0a0b086, 32);
        b.storeUint(self.queryId, 64);
        b.storeUint(self.leg, 3);
        b.storeBit(self.completed);
        b.storeCoins(self.amount);
    },
    toCell(self: LaunchSettlementState): c.Cell {
        return makeCellFrom<LaunchSettlementState>(self, LaunchSettlementState.store);
    }
}

/**
 > struct (0xa0a0b080) MintLaunchTokens {
 >     queryId: uint64
 >     jettonAmount: coins
 >     mintRecipient: address
 > }
 */
export interface MintLaunchTokens {
    readonly $: 'MintLaunchTokens'
    queryId: uint64
    jettonAmount: coins
    mintRecipient: c.Address
}

export const MintLaunchTokens = {
    PREFIX: 0xa0a0b080,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        mintRecipient: c.Address
    }): MintLaunchTokens {
        return {
            $: 'MintLaunchTokens',
            ...args
        }
    },
    fromSlice(s: c.Slice): MintLaunchTokens {
        loadAndCheckPrefix32(s, 0xa0a0b080, 'MintLaunchTokens');
        return {
            $: 'MintLaunchTokens',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            mintRecipient: s.loadAddress(),
        }
    },
    store(self: MintLaunchTokens, b: c.Builder): void {
        b.storeUint(0xa0a0b080, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.mintRecipient);
    },
    toCell(self: MintLaunchTokens): c.Cell {
        return makeCellFrom<MintLaunchTokens>(self, MintLaunchTokens.store);
    }
}

/**
 > struct (0xa0a0b081) InternalLaunchMint {
 >     queryId: uint64
 >     jettonAmount: coins
 >     curve: address
 >     protect: bool
 > }
 */
export interface InternalLaunchMint {
    readonly $: 'InternalLaunchMint'
    queryId: uint64
    jettonAmount: coins
    curve: c.Address
    protect: boolean
}

export const InternalLaunchMint = {
    PREFIX: 0xa0a0b081,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        curve: c.Address
        protect: boolean
    }): InternalLaunchMint {
        return {
            $: 'InternalLaunchMint',
            ...args
        }
    },
    fromSlice(s: c.Slice): InternalLaunchMint {
        loadAndCheckPrefix32(s, 0xa0a0b081, 'InternalLaunchMint');
        return {
            $: 'InternalLaunchMint',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            curve: s.loadAddress(),
            protect: s.loadBoolean(),
        }
    },
    store(self: InternalLaunchMint, b: c.Builder): void {
        b.storeUint(0xa0a0b081, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.curve);
        b.storeBit(self.protect);
    },
    toCell(self: InternalLaunchMint): c.Cell {
        return makeCellFrom<InternalLaunchMint>(self, InternalLaunchMint.store);
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
    static CodeCell = c.Cell.fromBase64('te6ccgICAgwAAQAAqz4AAAEU/wD0pBP0vPLICwABAgFiAAIAAwICywAEAAUCASAABgAHAgEgAA8AEAIBIAEjASQCASAACAAJAgEgAWQBZQIBWAAKAAsCASABWgFbAgFuAAwADQB3sUu7UTQ0wf6UPoA+gD6APoA+gDU0gD6ADAC0PpIMfpI0z/6APoA+gDUMdEQTBA7EEoQORBIEDdGFENTgAfel+9qJoaYOY/Sh9ABj9ABj9ABj9ABj9ABjqaQAY/QAY6noCGPoCGOiA6H0kGP0kaZ+Y/QAY/QAY/QAY6miBaH0oaQAY6QAY/QAY/QAY6JFofQAY6Yf9ABj9ABj9ABjph5jph5jph5j6AhjpABjo/BQSaH0AaYf9AH0AfQBAA4At6dd2omhpg5j9KBj9ABj9ABj9ABj9ABj9ABjqGOkAGP0AGOoY+gJ6AhjokDdZxw7oaZ/pn/0AfQBpAGkAaZ/pAGmf6QBpAGkAaMCARc8YNra2tra2tra2tra2uHFAbjTD9MP0w/0BNIA0fAZBdD6ADHTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDHSANEEyPpSE/pSyw/6VBL0AMoAyYgCyPpSzIAQzwtEyQHIz4TQzMz5FsjPigBAy//PUAFuAgEgABEAEgIBIAD/AQACASAAEwAUAgEgANUA1gIBIAAVABYCASAALwHpBNU7aLt+/iRkvAH4NcsJQUFAITjAtcsJqmTttyRMODXLCUFBYLcjrPtRNDTB/pQ+gD6APoA+gD6ANTSAPoA1PQE9ATRK26zl/iSLMcFwwCRcOLy4EkEkl8N4w3g1ywlBQWChOMC1ywlBQWBhIAAXABgAGQAaAKsIG6RMODQ9ATRIIEBC/SCb6VwIJECjiwD0w/RI8EIlSDCAMMAkXDimCL6RDDAAMMAkXDi8rGgAqRRE4EBC/R0b6VANOhsMsIAloEnELrDAJIwcOLysYAH+7UTQ0wf6UPoA+gD6APoA+gAx1NIA+gDU9AUk0PpI+kgx0z8x+gAx+gAx+gAx1NH4kljHBfLgSQzTP/pI+lAx+kgwIPpEMPLRTS3y0EgMbvLgSA3Q+gDTD/oA+gD6ANMP0w/TD/QE0gDRKVFZUVlRWVFZBfAF+CdvEPiXoXC2CQAbAf4jbrOOKSPQ0z8x+gAx0wchwgXyRdIAMdIAMdIAMfoAMdM/MdMEMdMBMdHAAcMAkXDijkIM1ws/wAPysQLQ0z/6ANMHIcIF8kXSANIA0gAx+gDTP9ME0wHRCMjLP1AH+gIVywcTygDKAM+BAfoCyz/LBMsByQKRPOJwK8jLB1KwAB8D/O1E0NMH+lD6APoA+gD6APoA1NIA+gDU9AT0BNEskX+UK27DAOKSXw7gJdD6SDH6SNM/MfoAMfoAMfoAMdQx0Q7TP/oAMCJu4wOIVhAvyM+EIBL6UvpSyXhRIsjPg8sEz4WgzMz5FoT3sAEREQGACwEREtckyM+KAEDOAREQAQAgAeAAIQS6jjgw7UTQ0wf6UPoA+gD6APoA+gDU0gD6ANT0BPQE0Stus5f4kizHBcMAkXDi8uBJLJJfDZTwE18N4uDXLCUFBYGM4wLXLCUFBYGk4wLXLCUFBQCM4wLXLCObFoTkACUAJgAnACgC/AbIyz9QBvoCcM8LVckFp2SBJxCpBHqpBIIQL68IAKJwtgkH0PpQMdIA0gD6APoA0SXCAJcybDMQLH8L4w0PyPpUHcoAGsoAK/oCUAn6AskNyMsHUuD6VFAL+gJQB/oCUAf6AlAJ+gJQCPoCEszKAFAF+gIVzBT0ABL0AMntVAAcAB0Arls8PSGnZIEnEKkEUyOogScQqQSgUyChVH/1A6BREqgBqQShIMIAlVIDvsMAkjJw4vKxIqJSJKiBJxCpBAKnZIEnEKkEIHqpBIIQWWgvACmhtghRiKAIoQL++CgCofgohHfIz4UIUiD6UgH6Ao0GQAAAAAAAAAAAAAAAAAUFBYKAAAAAAAAAAAzPFiL6AsmAMIFoAIIQCWYBgHD4N4EmrHD4NqABcYMJsfsIoIIAjvhw+DagiFNFyM+EIBL6UvpSyXhUdjXIz4mIAVR1ZMjPg8sEz4WgzMz5FgHgAB4A6oT3sASACybXJDUUzhLL9wH6AoEVDM8LdRPMzIvKCgsIEAAAAAAAAAAYzxYB+gIS+lLPg8lxgwmx+wiggVwwcPg2oMjPhYgU+lJQA/oCjQZAAAAAAAAAAAAAAAAABQUFhAAAAAAAAAAADM8WWPoC+lLJgBH7AAB6+lQq+gIp+gIo+gIn+gIm+gIlzxTPgSP6AiLPFFLQ9ABSQPQAye1UELwQqxCaEIkQeBBnEFYEQVUD8BBfDQT+ItDTPzH6ADHTByHCBfJF0gAx0gAx0gAx+gAx0z8x0wQx0wEx0ZNfDzDgIcABjrmIVhAvyM+EIBL6UvpSyXhRIsjPg8sEz4WgzMz5FoT3sAEREQGACwEREtckyM+KAEDOAREQAcv3z1DjDSHDAZUhwwLDAJFw4pIwf+MOkl8P4AHgACIAIwAkALbL989Q+JLHBbOSMH+UwwLDAOKSXw7gAtD6UNIA0gAx+gD6ANERECG6lSDCAMMAkXDi8rECyPpUygDPgwH6AlAN+gLJELwQqxCaEIkQeBBnEFYQRRA0QDPwEl8NAWY/+CiIUx7Iz4QgEvpS+lLJeFEiyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1AB4AAO+JLHBbPDAAAQVQ3wCPAQXw0A3O1E0NMH+lD6APoA+gD6APoA1NIA+gDU9AT0BNEl0PpIMfpI0z8x+gAx+gAx+gAx1DHR+JLHBfLgSSyVLMMFwwCRcOLy4Ej4l4IK+vCAvvKwDdcLPxDNELwQqxCaEIkQeBBnEFYQRRA0QTDwFF8NAKLtRNDTB/pQ+gD6APoA+gD6ANTSAPoA1PQE9ATRLJUswwXDAJFw4vLgSPiXggr68IC+8rAN1ws/EM0QvBCrEJoQiRB4EGcQVhBFEDRBMPAUXw0B/u1E0PiS+kQw8tFN0wf6UPoA+gD6APoA+gDU1gD6ANQk0PpIMfpIMdM/MfoAMfoAMfoA1NEtwAHy4Ej4l4ILk4cAvvKw+JeCCvrwgKEB0PoA0w/6ADH6ADH6ADHTDzHTD9MP9AQx0gAx0SSnZIEnEKkEU1OogScQqQSgU1ChVhEAKQQ24wLXLCUFBQCc4wLXLCUFBQCU4wLXLCUFBYMEADAAMQAyADMB/lYRoFYQUhOgURKoAakEoSDCAPKvUlSogScQoKWBJxCpBFFSqIEnEKkEUja+8rEBlVIUu8MAkjN/4vKxERHTP/oAMFYSu/KxU9OgI6EtVhOhVhBUEifwBvKvBtD6UNIA0gD6APoA0VJ2qIEnEKkEJ6dkgScQqQQGoATI+lQTygAAKgP8ygAB+gIB+gLJXaFR7qANVhKhghBZaC8ALKEgwgCcI4ED6KiBJxCpBLYIkjBw4lHMoFA8oRygUsW+IJN0VxHeERDIywdS8PpUUA76Aiv6Ai36AlAD+gJQCPoCFswUzlj6AhXMzsntVPgoiCHIz4Qg+lIZ+lLJeFGZyM+DywSJAeAAKwAsAAFoAf7PFszM+RaE97CAC1AJ1yTIz4oAQM4Xy/fPUPiS+JJtggiYloCLBFN9ggr68IDIz5A+KfqWE8s/AfoCFvpSFPpUEvQAAfoCzsnIz4WIE/pSAfoCcc8LaszJggr68ICCCJiWgCJxgwmx+why+DkgboEjKCLjBCFugVFAWAPjBFAjAC0B0qgToIAwgWgAcPg8oAJw+DYSoAFw+DaggDCBaACCEAlmAYBw+DegvPKwgBH7APiSyPpSUAT6AlAH+gJQBPoCUAP6AgH6AgH6AiHPCgDJyM+PGAAEghCgoKARzwv3cc8LYczJcPsAkTDjDQAuAECCEC+vCAD4KMjPhYj6UgH6AoIQoKCgEs8Liss/yXH7AAB3CCSMHDhIMABkjBx4CDAA5Iwc+AgwAWSMHTgIMAEkX+VIMACwwDikX+VIMAGwwDikjB/lMAHwwDi8rFygAvztRNDTB/pQ+gD6APoA+gD6ANTSAPoA1PQE9AUl0PpIMfpI0z8x+gAx+gAx+gAx1NEtbpNfDzDg+CiIUx/Iz4QgEvpS+lLJeFEiyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1D4kiHHBZNfD1vhERDTP/oA+lAnbrMB4ABLAvztRNDTB/pQ+gD6APoA+gAg+gDU0gD6ANT0BPQFJdD6SPpI0z/6ADH6ADH6ADHU0fiXggr68IC+8rBWEZZWEcMFwwCRcOLy4EglbrOOKCXQ0z8x0z8x+gAx+gAx0gAx0gAx0z8x0gAx0z8x0gDSADHSADHRwwCRcOKRcOMN+CcANAA1AfztRNDTByD6UPoAMfoA+gD6ADH6ANTSADH6ADHXTCHQ+kgx+kgx0z8x+gAx+gAx+gDU0SnAAZI5f5UJwATDAOLy4Eglu/LgSAKCEC+vCAC+8rACwgDyryNu8tBIAoIYBKgXyAC88q9SIND6SDH6SNM/MfoAMfoAMfoAMdTRA9AAOQL+jv0w7UTQ0wf6UPoA+gD6APoA+gDU0gD6ANT0BPQE0SzABpF/lSzAB8MA4pUhbrPDAJFw4vLgSPiXghAdzWUAvvKwIdDTP9M/+gD6ANIA0gDTP9IA0z/SANIA0gDRIpF/kyHDAOKWXwzwFV8N4D0RF8AG8uBIVHVFkX+TIMMA4gA9AD4ATCXQ0z8x0z8x+gD6ADHSADHSADHTPzHSADHTPzHSADHSADHSADHRA+hvEPiXIbmT+JehkjBw4lYQL6AtoCnQ+lAx0gAx0gAx+gAx+gDRoFigJm6zmTY2NjY4NloVcOMNE6CCCvrwgKBTMLyVE6EXoAaSMDLiJsIAA5UqbrPDAJFw4iORf5MgwwDi8q8N1ws/A5RbOV8H4w0CkVvjDQA2ADcAOACiJtDTPzH6ANMHAcIF8kXSADHSADHSADH6ADHTPzHTBDHTATHRVhQGVhQGVhQGVhQGVhQGVhQGBRETBQQREgRWEQQDEREDAhEQAlD+VhHwDhOgAJALyMsHUqD6VFAJ+gJQB/oCUAX6As+EIBLOye1UUzHIz5KCgsAaEss/AfoC+lISyz8VzMnIz4WIE/pSUAT6AnHPC2rMyYAR+wAAPIIK+vCAyM+FiBP6Ulj6AoIQdDHyIc8Liss/yXH7AAL++lDSADHSADH6ADH6ADHRI9D6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KCXQ+gDTD/oA+gD6ANMP0w/TD/QE0gDR8BkG0PoAMdMPMfoAMfoAMfoAMdMPMdMPMdMPMfQEMdIA0QTI+lIT+lLLD/pUE/QAEsoAyYgDyAFuADoB/PpSzIAQzwtEyVjIz4TQzMz5FsjPigBAy//PUAPQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+CjIz4QKjQgYEXme2F+c0hqrERc/K0Nvq1tMVzMj0rt4/LiOtFNpLCDPFn/PI8jIz4QKUjD6Uskl+kQxbQXI+lJAFQA7Af6DB/RDyM+EgBb6Uhf6UgOmCqoAgScQIaiBH0CgIaGlgR9AWKGpBFADyw/PiE4i9ADPhEAS9ADPgclQA8zIz5AAAACAyc8UjQhgAZsyfMCfBf7JtYmZmxd63Ulv4FsArI0rBFdGa3wtgHWkyPpSz4RAyc8Uz4gAAcnIz4QKEs7JADwAeO1UAtcLP22CEBHhowDIz4mIAVNUyM+E0MzM+RbPC/8B+gKBAIzPC3ATzBPMz5N6EAs6Ess/9ADJgBH7AAH+8uBIJLORf5ohkyDDAJFw4sMA4vLgSIQ/IrORf5VTwLnDAOKdIbORf5VTsLnDAOLDAJFw4o4UIpMhwwCRcOKzkjB/lCa8wwDiwwCSMHDi8uBIIZMgwwCRcOKWNASkBHAE3iGcNwqkcBEVKaERFVC33iCcNgmkcBEUKKERFFCm3gA/BEbg1ywlBQWDLOMC1ywlBQWDDOMC1ywjGqoLBOMC1ywilzLOBABeAF8AaABgAroLyMs/Gss/UAj6AlAG+gIUygASygDLP8oAyz/KAB/KABPKAMnIz4QeUtD6VFAM+gJQCvoCUAj6AlAG+gJQBPoCIs8UygBY+gIizxRSUPQAFPQAye1UBeMAkl8E4w0AQABBAf4i0NM/0z8x+gD6ANIAMdIAMdM/0gAx0z8x0gAx0gAx0gAx0SXQ+kgx+kjTPzH6ADH6ADH6ADHU0SrQ+lDSADHSADH6ADH6ADHRIdD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KCPQ+gDTD/oA+gD6ANMP0w/TD/QEAEIB/AHQ0z8x0z/6APoA0gAx0gAx0z/SADHTPzHSADHSADHSADHRyM+TLwzlJiLIz5MmgFdqUAX6AlAE+gLPjAnEIMlQA8wk0PpI+kgx0z8x+gAx+gAx+gAx1DHRI5zIz5KCgsGaJM8LP8mRbeLIz4SAggnJw4D6Am0B9ADPhARSEABGAv7SANHwGQTQ+gAx0w8x+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gDRBcj6UhP6UssP+lT0AMoAySiIAcj6UhLMgBDPC0TJAcjPhNDMzPkWyM+KAEDL/89QJtD6SDH6SDHTPzH6ADH6ADH6ADHU0dD6ADHTD/oAMfoAMfoAMdMPMdMPAW4AQwH8MdMPMfQEMdIAMdH4KMjPhAqNCBgReZ7YX5zSGqsRFz8rQ2+rW0xXMyPSu3j8uI60U2ksIM8Wf88jyMjPhApSMPpSyS36RDFtBcj6UkAVgwf0Q8jPhIBS4PpSFvpSBKYKqgCBJxAhqIEfQKAhoaWBH0BYoakEUATLD8+ITiISAEQB/vQAz4RAE/QAz4HJzxTIz5AAAACAyc8UjQhgAZsyfMCfBf7JtYmZmxd63Ulv4FsArI0rBFdGa3wtgHWkyPpSz4RAyc8Uz4gAAckByM+E0MzM+RbIz4oAQMv/z1AjghAI8NGAoCTIz5MmgFdqAfoCUAT6As+MCcQgySfQ+kj6SDEARQDM0z8x+gAx+gAx+gAx1DHRI5vIz5KCgsGaFMs/yZIzbeLIz4SAggnJw4D6Am0B9ADPhARSEPQAAW6zzwoAE/pSycjPkpafL+IWyz9QBPoCzBPMycjPhYgS+lJY+gJxzwtqzMmAEfsAAv70AAFus88KAPpSyc8UyfgoiFMXyM+EIBL6UvpSyXhRIsjPg8sEz4WgzMz5FoT3sBKAC1AD1yTIz4oAQM7L989QghAO5rKAJtD6SDH6SNM/MfoAMfoAMfoAMdTRCtD6UNIAMdIAMfoAMfoAMdEq0PoAMdMP+gAx+gAx+gAx0w8xAeAARwL+0w8x0w8x9AQx0gAx0fgoLND6ANMP+gD6APoA0w/TD9MP9ATSANHwGQ3Q+gAx0w8x+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gDRBMj6UhP6UssP+lQa9AAZygDJJ4gByPpSEsyAEM8LRMkByM+E0MzM+RbIz4oAQMv/z1Am0PpIMQFuAEgB/vpIMdM/MfoAMfoAMfoAMdTR0PoAMdMP+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gAx0fgoyM+ECo0IGBF5nthfnNIaqxEXPytDb6tbTFczI9K7ePy4jrRTaSwgzxZ/zyPIyM+EClIw+lLJLPpEMW0FyPpSQBWDB/RDyM+EgB36UhUASQH++lIDpgqqAIEnECGogR9AoCGhpYEfQFihqQRQA8sPz4hOIvQAz4RAGfQAz4HJzxTIz5AAAACAyc8UjQhgAZsyfMCfBf7JtYmZmxd63Ulv4FsArI0rBFdGa3wtgHWkyPpSz4RAyc8Uz4gAAclQB8jPhNDMzPkWyM+KAEDL/89QBQBKALjQ+kj6SDHTPzH6ADH6ADH6ADHUMdHIz5KCgsGaFMs/yYIQC+vCAMjPgxPMz1DIz5KCgsFOFss/UAP6AhX6UhL6VPQAWPoCzsnIz4WIEvpSWPoCcc8LaszJgBH7AAT+lSFus8MAkXDikXDjDZRfD18F4FYSkXCVIW6zwwDil/goIscFwwCRcOLjAjVWEcAFlSBus8MAkXDil/goIccFwwCRcOKUXw9fBOBWEcMBjpVswzM0NCBus5UiwgDDAJFw4uMCXwTgIG6UXw9fBOBUf+3wBFMgu1Iy4wRTIKFwcABMAE0ATgBPAfwr0PpIMfpI0z8x+gAx+gAx+gAx1NEq0PpQ0gAx0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+Cgj0PoA0w/6APoA+gDTD9MP0w/0BNIA0fAZBND6ADHTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDEAUAHiWzxXECJuk18PMOEE0PpQ0gDSAPoA+gDRA5NXEn+WERLDAcMA4pRfD18D4AbQ+gDTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHRVhGhLLrysQHI+lTPgxXKAC/6AlAE+gLJLsIAkjM94w1VC/ASXw0AUwL4+CiIIcjPhCD6UhT6Usl4UUTIz4PLBM+FoMzM+RaE97CAC1AE1yTIz4oAQM4Sy/fPUG2CCJiWgIsEU0H4k3D4OnL4OSBugSMoIuMEIW6BUUBYA+MEUCOoE6CAMIFoAHD4PKACcPg2EqABcPg2oIAwgWgAghAJZgGAcPg3oAHgAFQD/FNlVhdWF1YXVhdWF1YXVhdWF1YXVhdWF1YXVhdWFlYmVhVWFVYVVhWSW3/t47qAFX/tEYrtQe3xAfL/IJF/kXDijh/Iz48YAASCEKCgoAjPC/dwzwthUlD6UlYV+gLJcPsA3iPCAJ1bAxESAwIREQJXEF8P4w0gwgCSXwTjDQBVAFYAVwP+0gDRBcj6UhP6UssP+lT0AMoAyVYSiAHI+lISzIAQzwtEyQHIz4TQzMz5FsjPigBAy//PUCzQ+kgx+kgx0z8x+gAx+gAx+gAx1NHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+CjIz4QKic8Wf88jyMjPhApSMPpSyQFuAcoAUQH+Vhf6RDFtBcj6UkAVgwf0Q8jPhIBWGAH6Uhb6UgSmCqoAgScQIaiBH0CgIaGlgR9AWKGpBFAEyw/PiE4iEvQAz4RAE/QAz4HJzxTIz5AAAACAyc8UjQhgAZsyfMCfBf7JtYmZmxd63Ulv4FsArI0rBFdGa3wtgHWkyPpSz4RAyQBSADzPFM+IAAHJAcjPhNDMzPkWyM+KAEDL/89QIscFwwAA2oIQDRzvAIIQC+vCAPgo+CiLBMiLwXjUUZAAAAAAAAAAKM8WAREU+gIS+lT6VM+EIAEREQHOyS7Iz4WI+lJY+gKNBkAAAAAAAAAAAAAAAAADIVvoOAAAAAAAAAAUzxYV+lJQD/oCE8zJgBH7ABwAaoIITEtAoMjPkD4p+pYZyz9QB/oCFvpSFPpU9ABY+gISzsnIz4WIEvpSWPoCcc8LaszJcfsAAfpTiNdJwgCOGDAI0wABwAGXINdKwgDDAJEh4pPXTNDeCJE54ijXScABlyjXSsABwwCRIeKcCNMAAcABk9dM0N4I3ijXScIfnSjXCx+CEKCgoCC6wwCRIeKOETEH1ywlBQUBBPK/0z8x+gDRkTjiBREVBQQRFAQEERMEBBESBABYAvom0PoAMdMP+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gAx0VYSVhKgVhFTBqBTIaghqQQjoiCnZIEnEKkEBaiBJxCpBBSgUiKoUAOpBKEhoQKSMn+VUhO5wwDi4wJXFFYTIaBWELuWVhPCAMMAkXDinTADERIDAhERAlcQXw/jDQBZAFoA/m2CCJiWgIsEU0H4k3D4OnL4OSBugSMoIuMEIW6BUUBYA+MEUCOoE6CAMIFoAHD4PKACcPg2EqABcPg2oIAwgWgAghAJZgGAcPg3oIIITEtAoMjPkD4p+pYZyz9QBfoCFPpSFPpU9ABY+gLOycjPhYgS+lJY+gJxzwtqzMlx+wAAOAQREQQEERAEEE8QThBNEEwQSxBKEEkQSBBHVQMB/l8EbOJtggiYloCLBFMx+JNw+Dpy+DkgboEjKCLjBCFugVFAWAPjBFAjqBOggDCBaABw+DygAnD4NhKgAXD4NqCAMIFoAIIQCWYBgHD4N6CCCExLQKDIz5A+KfqWGcs/UAf6Ahb6UhP6VPQAAfoCEs7JyM+FiBL6Ulj6AnHPC2oAWwH+UeKgVhMvoAEREAGhCND6UNIA0gD6APoA0VYXVhOgCtD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdEaqIEnEKkEVhIhoQqgBMj6VBPKAMoAAfoCAfoCyYIQWWgvAC2hIMIAnCaBA+iogScQqQS2CJIwcOJR3aBQbaEdoABcAA7MyXH7ANsxAf4REcjLBwEREAH6VFAO+gIl+gIs+gJQD/oCUAj6AhbMFMoAWPoCFMz0APQAye1UyM+FCFJQ+lIo+gKCENUydtvPC4opzws/yXH7AFNyoCXI+lJQB/oCUAj6Alj6AlAG+gIB+gJY+gLJyM+PGAAEghCgoKAgzwv3cc8LYczJcPsAAF0AAlgB9O1E0NMH+lD6ADH6ADH6ADH6ADH6ADHU0gAx+gAx1PQEMfQEMdEh0PpIMfpIMdM/MfoAMfoAMfoAMdTR0PoAMdMPMfoAMfoAMfoAMdMPMdMPMdMPMfQEMdIA0ZUibrPDAJFw4pUjwwDDAJFw4pUjwwXDAJFw4vLgSPiXAHMC/u1E0NMH+lD6APoA+gD6APoA1NIA+gDU9AT0BNEswAeRf5UswAbDAOLy4Ej4l4IQBfXhAL7ysCFus5Fw4w2WbB3wFV8N4BAkXwRQhl8GItD6SDH6SNM/MfoAMfoAMfoAMdTRAtD6UNIAMdIAMfoAMfoAMdEi0PoAMdMP+gAx+gAAYQBiBErjAtcsJQUFgpTjAtcsJQUFgoyRMODXLCUFBYM84wLXLCFjtcucAGgAaQBqAGsAqiHQ0z8x0z8x+gAx+gAx0gAx0gAx0z8x0gAx0z8x0gDSADHSADHRkX+OKCHQ0z8x0z8x+gAx+gAx0gAx0gAx0z8x0gAx0z8x0gAx0gDSADHRwwDiwwAC/DH6ADHTDzHTDzHTDzH0BDHSADHR+Cgk0PoA0w/6APoA+gDTD9MP0w/0BNIA0fAZBdD6ADHTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDHSANEEyPpSE/pSyw/6VBL0AMoAySGIAcj6UhLMgBDPC0TJAcjPhNDMzPkWyM+KAEDL/wFuAGMB/s9QAtD6SDH6SDHTPzH6ADH6ADH6ADHU0dD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KMjPhAqNCBgReZ7YX5zSGqsRFz8rQ2+rW0xXMyPSu3j8uI60U2ksIM8Wf88jyMjPhApSMPpSySX6RDFtBcj6UkAVgwf0Q8gAZAP+ic8WFvpSFvpSA6YKqgCBJxAhqIEfQKAhoaWBH0BYoakEUAPLD8+ITiL0AM+EQBL0AM+ByVjMyM+QAAAAgMnPFI0IYAGbMnzAnwX+ybWJmZsXet1Jb+BbAKyNKwRXRmt8LYB1pMj6Us+EQMnPFM+IAAHJAcjPhNDMzPkWyInPFgBlAQkAZgABIAH+y//PUPgoyM+ECo0IN2C8k22FHmO58V5+LPwfwZF0G1lzt42jYDQ10sYDS3WgzxZ/zyPIz5AAAACAySPI+lIT+lLPhAISzG0B9ADJeFEiyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1AB1ws/ghAELB2AyM+FiBP6UgBnACpY+gKCEJ4MJCjPC4rLP8+EIMlx+wAB/O1E0NMH+lD6APoA+gD6APoA1NIA+gDU9AT0BNEswweVLMMGwwCRcOKSXw7g+JIm0PpIMfpI0z8x+gAx+gAx+gAx1NEl0PpQ0gAx0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+Cgj0PoA0w/6AABsAfrtRNDTB/pQ+gD6APoA+gD6ANTSAPoA1PQE9ATRK26SXw7g+CiIUx3Iz4QgEvpS+lLJeFEiyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1D4kscF8uBKDdM/+gAwEN4QzRC8EKsQmhCJEHgQZxBWEEUQNBAj8BZfDQHgAv7tRNDTB/pQ+gD6APoA+gD6ANTSAPoA1PQE9ATRK26zjrj4kvgoiFMeyM+EIBL6UvpSyXhRIsjPg8sEz4WgzMz5FoT3sBKAC1AD1yTIz4oAQM7L989QxwXDAJFw4vLgSiFukX+eLMMHlSzDBsMAkXDiwwDikl8O4AHQ0z/TP/oAAeAAcQQ24wLXLCZwwt684wLXLCGQtlBM4wLXLCQ4VKvMAHkAegB7AHwC/voA+gDTD9MP0w/0BNIA0fAZBND6ADHTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDHSANEFyPpSE/pSyw/6VPQAygDJLYgByPpSEsyAEM8LRMkByM+E0MzM+RbIz4oAQMv/z1An0PpIMfpIMdM/MfoAMfoAMfoAMdTR0PoAMdMP+gABbgBtAf4x+gAx+gAx0w8x0w8x0w8x9AQx0gAx0fgoyM+ECo0IGBF5nthfnNIaqxEXPytDb6tbTFczI9K7ePy4jrRTaSwgzxZ/zyPIyM+EClIw+lLJVhL6RDFtBcj6UkAVgwf0Q8jPhIBWEwH6Uhb6UgSmCqoAgScQIaiBH0CgIaGlgR9AAG4C/FihqQRQBMsPz4hOIhL0AM+EQBP0AM+Byc8UyM+QAAAAgMnPFI0IYAGbMnzAnwX+ybWJmZsXet1Jb+BbAKyNKwRXRmt8LYB1pMj6Us+EQMnPFM+IAAHJAcjPhNDMzPkWyM+KAEDL/89Q+CjIz4QKic8Wf88jyM+QAAAAgMkjyABvAHAAQN2C8k22FHmO58V5+LPwfwZF0G1lzt42jYDQ10sYDS3WALb6UhP6Us+EAhLMbQH0AMl4USLIz4PLBM+FoMzM+RaE97ASgAtQA9ckyM+KAEDOy/fPUMcF8uBKDdM/+gD6ADAQ7xDeEM0QvBCrEJoQiRB4EGcQVhBFEDTwGF8NAZr6ANIA0gDTP9IA0z/SANIA0gDRERjTP9M/+gDXCgAps5Qks8MAkXDilVEousMAkjJw4pVRLLrDAJIycOKVURm6wwCSMXDilF8PXwrjDQByAf4ikjF/kwHDAOIRGJIwf5LDAOIKyMs/Gcs/UAf6AlAF+gITygDKAMs/ygDLP8oAz4PKAMksyMsHUsD6VCv6Air6Ain6Aij6Aif6AibPFCXPCgAk+gIjzxRSEPQAUiD0AMntVA2OGBC8EKsQmhCJEHgQZxBWEEUQNEEw8BVfDeMNALMC/oIQCPDRgL7ysATXCz/4KIgByPpSyW1tAsjM9ACNBYAAAAAAAAAAACAAAAAAAAAAAAAAAAAQzxb0AHDPC0fJghAF9eEAJND6SDH6SNM/MfoAMfoAMfoAMdTRKdD6UNIAMdIAMfoAMfoAMdEh0PoAMdMP+gAx+gAx+gAx0w8x0w8BhAB0Av4x0w8x9AQx0gAx0fgoI9D6ANMP+gD6APoA0w/TD9MP9ATSANHwGQTQ+gAx0w8x+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gDRBcj6UhP6UssP+lT0AMoAySaIAcj6UhLMgBDPC0TJAcjPhNDMzPkWyM+KAEDL/89QJdD6SDH6SNM/AW4AdQH+MfoAMfoAMfoAMdTR0PoA0w/6APoA+gDTD9MP0w/0BNIA0VYT0PpQ0gAx0gAx+gAx+gAx0fgoKhCMBxBqEFkQTEoTVBnM8BkFyPpSEvpSEssP+lQS9ADKAMkm0PpIMfpI0z8x+gAx+gAx+gAx1NEL0PpQ0gAx0gAx+gAx+gAx0QB2A/wr0PoAMdMP+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gAx0fgoLdD6ANMP+gD6APoA0w/TD9MP9ATSANHwGQ7Q+gAx0w8x+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gDRBMj6UhP6UssP+lQb9AAaygDJJ4gByPpSEsyAEM8LRMkByIkBbgHZAHcC/s8WzMz5FsjPigBAy//PUMj6UlJw+lIZzMltbYgDyMxxzwtPEvQA9ADJAcjPhNDMzPkWyM+KAEDL/89QBdD6SDH6SDHTPzH6ADH6ADH6ADHU0dD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdEGyPpSGPpSFPpSFMsPyQQBowB4AGDAA8jPiYgBUzTIz4TQzMz5Fs8L/1AG+gKBAIzPC3ATzMzPkoKCwYLLP8zKAMlx+wAB/O1E0NMH+lD6ADH6ADH6ADH6ADH6ADHU0gAx+gAx1PQEMfQEMdEjlQPABcMAkjN/4pF/lCFuwwDikl8E4CDQ+kgx+kjTPzH6ADH6ADH6ADHU0STQ+lDSADHSADH6ADH6ADHRIdD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMQB9Af7tRNDTB/pQ+gD6APoA+gD6ANTSAPoA1PQE9ATRDMMCkX+UKm7DAOKSXw3g+JIl0PpIMfpI0z8x+gAx+gAx+gAx1NEk0PpQ0gAx0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+Cgj0PoA0w/6APoAAIQDvO1E0NMH+lD6APoA+gD6APoA1NIA+gDU9AT0BNErbrORcOMN8uBJDdM/+gDSH/QFIZFwlSRus8MA4p4vwAeRf5UvwAbDAOLDAJFw4uMCMCCVI26zwwCRcOKTXw8w4w0AjQCOAI8ENuMC1ywlBQWEFOMC1ywlBQWEHOMC1ywlBQWELACVAJYAlwCYAv7SADHR+Cgj0PoA0w/6APoA+gDTD9MP0w/0BNIA0fAZBND6ADHTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDHSANEFyPpSE/pSyw/6VPQAygDJIogByPpSEsyAEM8LRMkByM+E0MzM+RbIz4oAQMv/z1Ah0PpIMfpIMdM/MfoAMfoAAW4AfgH+MfoAMdTR0PoAMdMP+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gAx0fgoyM+ECo0IGBF5nthfnNIaqxEXPytDb6tbTFczI9K7ePy4jrRTaSwgzxZ/zyPIyM+EClIw+lLJJ/pEMW0FyPpSQBWDB/RDyM+EgFKA+lIW+lIEpgqqAIEnEAB/Af4hqIEfQKAhoaWBH0BYoakEUATLD8+ITiIS9ADPhEAT9ADPgcnPFMjPkAAAAIDJzxSNCGABmzJ8wJ8F/sm1iZmbF3rdSW/gWwCsjSsEV0ZrfC2AdaTI+lLPhEDJzxTPiAAByQHIz4TQzMz5FsjPigBAy//PUATTP/pIMPiSJscFAIAB/JZQBccFwwCTMDRw4vLgSSDQ+kgx+kjTPzH6ADH6ADH6ADHU0QTQ+lDSADHSADH6ADH6ADHRJND6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KCbQ+gDTD/oA+gD6ANMP0w/TD/QE0gDR8BkH0PoAMdMPMfoAMfoAMQCBAv76ADHTDzHTDzHTDzH0BDHSANEEyPpSE/pSyw/6VBT0ABPKAMkhiAHI+lISzIAQzwtEyQHIz4TQzMz5FsjPigBAy//PUALQ+kgx+kgx0z8x+gAx+gAx+gAx1NHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+CjIz4QKAW4AggP+ic8Wf88jyMjPhApSMPpSySX6RDFtBcj6UkAVgwf0Q8jPhIBSYPpSF/pSBKYKqgCBJxAhqIEfQKAhoaWBH0BYoakEUATLD8+ITiIS9ADPhEAU9ADPgcnPFMjPkAAAAIDJzxSJyPpSz4RAyc8Uz4gAAclYyM+E0MzM+RbIz4oAQAHKATsAgwG+y//PUIIK+vCAiCLIz4Qg+lIU+lLJeCNUElLIz4PLBM+FoMzM+RaE97AUgAtQBdckyM+KAEDOE8v3z1AhyPpSycjPhYgT+lJQA/oCghDRc1QAzwuKE8s/+lT0AMlx+wAB4AL8+gDTD9MP0w/0BNIA0fAZBND6ADHTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDHSANEFyPpSE/pSyw/6VPQAygDJLIgByPpSEsyAEM8LRMkByM+E0MzM+RbIz4oAQMv/z1Am0PpIMfpIMdM/MfoAMfoAMfoAMdTR0PoAMdMP+gAxAW4AhQH++gAx+gAx0w8x0w8x0w8x9AQx0gAx0fgoyM+ECo0IGBF5nthfnNIaqxEXPytDb6tbTFczI9K7ePy4jrRTaSwgzxZ/zyPIyM+EClIw+lLJVhH6RDFtBcj6UkAVgwf0Q8jPhIBWEgH6Uhb6UgSmCqoAgScQIaiBH0CgIaGlgR9AWACGAv6hqQRQBMsPz4hOIhL0AM+EQBP0AM+Byc8UyM+QAAAAgMnPFI0IYAGbMnzAnwX+ybWJmZsXet1Jb+BbAKyNKwRXRmt8LYB1pMj6Us+EQMnPFM+IAAHJAcjPhNDMzPkWyM+KAEDL/89QxwXy4EkM0z8x1wofIJTDFMMAkjBw4uMCAIcAiABQyM+EEhr6VFAI+gJQBvoCUAT6Alj6AgH6AszKAAH6AswS9AD0AMntVAH8NFtQh18GIdD6SDH6SNM/MfoAMfoAMfoAMdTRBND6UNIAMdIAMfoAMfoAMdEk0PoAMdMP+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gAx0fgoJtD6ANMP+gD6APoA0w/TD9MP9ATSANHwGQfQ+gAx0w8x+gAx+gAx+gAx0w8x0w8xAIkE/tMPMfQEMdIA0QTI+lIT+lLLD/pUFPQAE8oAySKIAcj6UhLMgBDPC0TJAcjPhNDMzPkWyM+KAEDL/89QAdD6SDH6SDHTPzH6ADH6ADH6ADHU0dD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KMjPhAqJzxZ/zyPIyIkBbgHKAPkAigL+zxZSMPpSySb6RDFtBcj6UkAVgwf0Q8jPhIAX+lIV+lIDpgqqAIEnECGogR9AoCGhpYEfQFihqQRQA8sPz4hOIvQAz4RAE/QAz4HJzxTIz5AAAACAyc8UjQhgAZsyfMCfBf7JtYmZmxd63Ulv4FsArI0rBFdGa3wtgHWkyPpSiQCLAIwAARAAnM8Wyc8Uz4gAAckByM+E0MzM+RbIz4oAQMv/z1CCCvrwgMjPhYgS+lIB+gKNBoAAAAAAAAAAAAAAAAAABsabyAAAAAAAAAAAQM8WyXH7AAH++JIm0PpIMfpI0z8x+gAx+gAx+gAx1NEl0PpQ0gAx0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+Cgj0PoA0w/6APoA+gDTD9MP0w/0BNIA0fAZBND6ADHTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BACQAbQxMgLQ0z/TP/oA+gDSANIA0z/SANM/0gDSANIAMdEL8YAD2iEms5Qhs8MAkXDilSBus8MAkXDilCS6wwCSMHDilVG3usMAkjtw4pb4lye+wwCRcOLjAl8PXwgAkgGYI9DTPzHTPzH6APoAMdIAMdIAMdM/MdIAMdM/MdIAMdIAMdIAMdH4lyG+jhYiupJbf53AGZTAAMMAkjBw4sMA4sMAk18DcOKSXw7jDQCTA/4x0gDRBcj6UhP6UssP+lT0AMoAyS2IAcj6UhLMgBDPC0TJAcjPhNDMzPkWyM+KAEDL/89QJ9D6SDH6SDHTPzH6ADH6ADH6ADHU0dD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KMjPhAqJzxZ/zyPIyM+EClIw+lLJAW4BygCRAf5WEvpEMW0FyPpSQBWDB/RDyM+EgFYTAfpSFvpSBKYKqgCBJxAhqIEfQKAhoaWBH0BYoakEUATLD8+ITiIS9ADPhEAT9ADPgcnPFMjPkAAAAIDJzxSNCGABmzJ8wJ8F/sm1iZmbF3rdSW/gWwCsjSsEV0ZrfC2AdaTI+lLPhEDJAPcAyAqRf5MowwDiCMjLPxfLP1AF+gJQA/oCygDKAMs/ygATyz/Pg8oAz4PJLMjLB1LA+lQr+gIq+gIp+gIo+gIn+gImzxQlzwoAJPoCI88UUhD0AFLg9ADJ7VQBkl8NllUL8BVfDeIBlgHQ0z/TP/oA+gDSANIA0z/SANM/0gDSANIA0SezlCKzwwCRcOKVUcu6wwCSPHDijhBWFsAHkX+WVhbABsMA4sMAkXDilF8PXwnjDQCUAMoBkX+TIMMA4grIyz8Zyz9QB/oCUAX6AhPKAMoAyz/KAMs/z4PKABLKAMksyMsHUsD6VCv6Air6Ain6Aij6Aif6AibPFCXPCgAk+gIjzxRSEPQAUuD0AMntVAGSXw2WVQvwFV8N4gL87UTQ0wf6UPoA+gD6APoA+gDU0gD6ANT0BPQFJdD6SDH6SDHTPzH6ADH6ADH6ADHU0Q7TP9csAZOBAIeOFtcsA5b6SDGBAIia1ywFkvI/4YEAieLiAdMBMfoA+gD6ADBWEcMC4wI0ERDDApNfD1vgLm6TXw9b4FPo0PpIMfpIAJkAmgL+7UTQ0wf6UPoA+gD6APoA+gDU0gD6ANT0BPQE0fiSJtD6SPpIMdM/MfoAMfoAMfoAMdQx0ccF8uBJIG6Rf5UswwDDAOKSXw7g0NM/+gDTByHCBfJF0gDSADHSAPoA0z/TBNMB0REV1ws/JsMBkjB/lCi9wwDikjR/kwTDAOLjAgCkAKUE/DDtRNDTB/pQ+gD6APoA+gD6ANTSAPoA1PQE9ATRIG7y0Egg0NM/MfoAMdMHIcIF8kXSADHSADHSADH6ADHTPzHTBNMBMdEhwASRf5UhwAXDAOKSXw/g+JIo0PpIMfpI0z8x+gAx+gAx+gAx1DHRxwWRcOMN4wKRf+MOkl8O4ACmAKcAqACpBDbjAtcsJQUFhDTjAtcsJQUFhFTjAtcsJQUFhCQAqgCrAKwArQP+M1cRJG6Rf+MOk18PW+AE0NM/0z/6APoA0gDSANM/0gDTP9IA0gDSANFR072Rf5whs5Qgs8MAkXDiwwDilF8PXwzgDpNXGXCWERnAAMMA4pUJwADDAJI5cOKOEFYWwAeRf5ZWFsAGwwDiwwCRcOIBmyCTCcMAkjlw4sMA4w0nyACbAJwAnQH+0z8x+gAx+gAx+gAx1NEo0PpQ0gAx0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+Cgj0PoA0w/6APoA+gDTD9MP0w/0BNIA0fAZBND6ADHTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDHSANEFyPpSEwCiAf74kinQ+kgx+kjTPzH6ADH6ADH6ADHU0SjQ+lDSADHSADH6ADH6ADHRIdD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KCPQ+gDTD/oA+gD6ANMP0w/TD/QE0gDR8BkE0PoAMdMPMfoAMfoAMfoAMdMPMdMPMdMPMfQEAJ4ABDl/Aa7LPyfPCz8m+gIl+gIUygASygDLP8oAFcs/z4RAyVYSyMsHVhIB+lRWEfoCVhD6Ai/6Ai76Ai36AizPFCvPCgAq+gIpzxRSEPQAUnD0AMntVAXjAl8PXwQAoQP+MdIA0QXI+lIT+lLLD/pU9ADKAMlWEIgByPpSEsyAEM8LRMkByM+E0MzM+RbIz4oAQMv/z1Aq0PpIMfpIMdM/MfoAMfoAMfoAMdTR0PoAMdMP+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gAx0fgoyM+EConPFn/PI8jIz4QKUjD6UgFuAcoAnwH+yVYV+kQxbQXI+lJAFYMH9EPIz4SAVhYB+lIW+lIEpgqqAIEnECGogR9AoCGhpYEfQFihqQRQBMsPz4hOIhL0AM+EQBP0AM+Byc8UyM+QAAAAgMnPFI0IYAGbMnzAnwX+ybWJmZsXet1Jb+BbAKyNKwRXRmt8LYB1pMj6Us+EQACgAD7JzxTPiAAByQHIz4TQzMz5FsjPigBAy//PUMcFs8MAAM4REo48DhEQDl48EL8KERAKEJ8IERAIEH8GERAGEF8EERAEAhEQAhER8BcQzhC9EKwQmxCKEHkQaBBXEEYQNUAUk1cRMOIDjhsQ3hDNELwQqxCaEIkQeBBnEFYQRQNBRPAWXw2SXw/iA/z6UssP+lT0AMoAyVYQiAHI+lISzIAQzwtEyQHIz4TQzMz5FsjPigBAy//PUBES0PoAMdMP+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gAx0fgoyM+ECo0IGBF5nthfnNIaqxEXPytDb6tbTFczI9K7ePy4jrRTaSwgzxZ/zyPIyIkBbgD5AKMC/s8WUjD6Uskl+kQxbQXI+lJAFYMH9EPIz4SAFvpSAREWAfpSA6YKqgCBJxAhqIEfQKAhoaWBH0BYoakEUAPLD8+ITiL0AM+EQBL0AM+ByQEREszIz5AAAACAyc8Uicj6Us+EQMnPFM+IAAHJARERyM+E0MzM+RbIz4oAQMv/z1ABOwC/AAhfD18FAMgGyMs/UAX6AhPLB8+GgBLKAFj6AhLLP8sEHcsBySvIywdSsPpUKvoCKfoCKPoCJ/oCJvoCJc8UJM8KACP6AiLPFFLQ9ABSEPQAye1UELwQqxCaEIkQeBBnEFYQRRA0QTDwEF8NABwhwwKRf5UgwwDDAOLDAAAyW/iXVH3LVH3LVH3LVH3LLfANvvKw8AxfDQAcIMMBlSDDAsMAkXDiwwAAPPiXVH7cVH7cVH7cVH7cLvANvvKwwAGS8A/e8BBfDQH80z/XCwL4kvgoxwWUwATDAJIwcOLy4EntRNDTB/pQ+gD6APoA+gD6ANTSAPoA1PQE9ATRIG6Rf5UswwDDAOKSXw7g0NM/+gDTByHCBWwS8kXSANIA0gD6ANM/0wTTAdERFSK9kX+YIIAQsMAAwwDilF8PXwbggO+wB8jLP1AGAK4B/O1E0NMH+lD6APoA+gD6APoA1NIA+gDU9AT0BNEN0z/TAtIA+gAwIsEEjiT4klYQVhBWEFYQVhBWEFYQVhBWEFYQVhBWEFYdVhDwCccFwwCRcOLy4ElWEG6Rf5UvwwDDAOKTXw9b4FYQ0NM/+gDTByHCBfJF0gDSANIA+gDTPwCvAv7tRNDTB/pQ+gD6APoA+gD6ANTSAPoA1PQE9ATRDdM/0wLSANcKAPiSL8cFlSLBAsMAkXDi8uBJVhBukX+VL8MAwwDik18PW+BWENDTP/oA0wchwgXyRdIA0gDSAPoA0z/TBNMB0SyuUeO9kX+XUx2wwADDAOKRf+MOlF8PXwzgALQAtQEe4wLXLCabkKxkMdyED/LwALcAvvoCz4QKFMoAEsoAygAB+gLLP8sEHcsBySvIywdSsPpUKvoCKfoCKPoCJ/oCJvoCJc8UJM8KACP6AiLPFFLQ9ABSEPQAye1UELwQqxCaEIkQeBBnEFYQRRA0QTDwEF8NAv7TBNMB0SyuUeO9kX+XUx2wwADDAOKUXw9fDOAswQKUK7PDAJFw4uMCVxoMsxywKsACnDMDkX+TJ8MA4gNwA94qwAOYMiiScD/ecALeB8jLP1AG+gIUywcSygDKAMoAAfoCFcs/FMsEAREQAcsByS7IywdS4PpULfoCLPoCK/oCALAAsQH8EM1fDQ3Q0z/6ANMHIcIF8kXSANIA0gD6ANM/0wTTAdFWFq6xCcjLP1AI+gIWywcUygASygDKAAH6AiHPCz8SywQSywHJLcjLBz5SzvpUK/oCO1Gp+gI5UYf6AjdRZfoCNVFD+gIzUhPMIs8KAGwSIvoCMlIizDJSIvQAMlJCAO4C/ir6Ain6AijPFCfPCgAm+gIlzxRSQPQAUhD0AMntVCHBApMPwwCSP3Dijh2kEN4QzRC8EKsQmhCJEHgQZxBWEEUQNEMA8AhVsJFb4izQ0z8x+gAx0wcBwgXyRdIAMdIAMdIAMfoAMdM/MdME0wEx0ZFw4w6WVQvwD1Ww3lUL8BAAsgCzAFIs0NM/MfoAMdMHIcIF8kXSADHSADHSADH6ADHTPzHTBDHTATHRwAHDAAAEXw0ADlMNsMAAwwAB/AqOHxC8Xwwi0PpQMdIA0gD6ADH6ADHRAeME8nFVC/ATXw3gVxkJlF8PXwnhCrMXsAXIyz9QBPoCEssHygDKABLKAFAE+gIhzws/AREQAcsEEssByS3IywdS0PpULPoCK/oCKvoCKfoCKPoCJ88UJs8KACX6AiTPFFIw9ABSEAC2ANz0AMntVB0cGxoZGBcWFRRDMC3wCfgohHeEd8jPhQgT+lIB+gKCEKCgsIbPC4okzws/I88LAs+DAfoCyYFdwHD4NoIAsCxw+DagAXGDCbH7CKDIz4WIEvpSAfoCghCgoLCFzwuKEss/ywLJgBH7AAL87UTQ0wf6UPoA+gD6APoA+gDU0gD6ANT0BPQE0fiS+CjHBfLgSSBukX+VLMMAwwDikl8O4CDQ0z/6ANMHIcIF8kXSANIA0gD6ANM/0wTTAdERF9cLPyfDAzgHkjZ/lVFovcMA4pRfD18H4CXjAl8IPDwq0NM/+gDTByHCBWwSALgAuQCQOAbIyz9QBfoCz4QKEsoAygASygBY+gISyz/LBB3LAckLyMsHGvpUUAj6AlAG+gJQBPoCWPoCAfoCzMoAAfoCzBL0APQAye1UAf7yRdIA0gDSAPoA0z/TBNMB0SzQ+kgx+kjTPzH6ADH6ADH6ANQx0VYSuyCWghAvrwgAkXDiIbORf5ZWECG+wwDi8rBWE1YSoFYRoC3Q+lAx0gAx0gAx+gAx+gDRoIIK+vCAoBEX0NM/MfoA0wcBwgXyRdIAMdIAMdIAMfoAMdM/ALoB/jHTBDHTATHRAREXAaBWFqEggBD7AivIyz8r+gLPhBIqzwoAKc8KACjPCgBQB/oCJc8LPyTPCwQjzwsBySF0ceMEIMjLB1YXAfpUVhb6AlYV+gJWFPoCVhP6AlYS+gJWEc8UVhDPCgAv+gIuzxRWGQH0AFIg9ABsEsntVCDwAsgAuwL+ic8WghCgoLBwzwv3cM8LYcsHVhT6AlYT+gLJIHD7AHCDCbH7CAKOOfgoyM+FiPpSVhf6Ao0GQAAAAAAAAAAAAAAAAAUFBQCQAAAAAAAAACTPFskgcYMJsfsIE6ACgBH7AN7Iz4UIE/pSghDVMnbbzwuOK88LP8n4J28QUAehAQC8AL0ABcYAAQFGERahgVXwcPg2VhagJnCDCbH7CKC8mxBPXw9sYYEAkPsA4w4AvgDkgVXwcPg2AREVoARwgwmx+wgUoAjIyz9QB/oCz4QSFcoAE8oAygBQBPoCyz/LBMsBySvIywc8Uqz6VDpRmPoCOFF2+gI2UVT6AjRRMvoCbBIh+gIxIc8UMSHPCgAxIfoCMSHPFDFSIPQAMlIC9AAxye1UAvz4kscFk18PMOGBAIghuuMCgQCJuo4rMDw8yM+EEhr6VFAI+gJQBvoCUAT6Alj6AgH6AszKAAH6AswS9AD0AMntVOEyDZI7cJULwADDAOKVCsAAwwCSOnDi8uBIBoIYBKgXyAChU3CgghgEqBfIAKBTFqgBqQRRZqEmwgDyryEAwADBAf4QRl8GUIlfByHQ+kgx+kjTPzH6ADH6ADH6ADHU0STQ+lDSADHSADH6ADH6ADHRIdD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KCPQ+gDTD/oA+gD6ANMP0w/TD/QE0gDR8BkE0PoAMdMPMfoAMfoAMfoAMdMPMdMPAMIB/sIA8q+CCvrwgHD7AiSCEC+vCAC8mASCEC+vCAChkjRw4hWgyI0EAAAAAAAAAABAAAAAAAAAAGDPFlAF+gJQBfoCjQRAAAAAAAAAABAAAAAAAAAAAIDPFsmCGASoF8gAyM+EHlKQ+lRQCPoCUAf6Alj6Alj6As+EICHPFBLKAFgAygT8MdMPMfQEMdIA0QXI+lIT+lLLD/pU9ADKAMkhiAHI+lISzIAQzwtEyQHIz4TQzMz5FsjPigBAy//PUCLQ+kgx+kgx0z8x+gAx+gAx+gAx1NHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+CjIz4QKic8Wf88jyMiJAW4BygD5AMMB/M8WUjD6Uskm+kQxbQXI+lJAFYMH9EPIz4SAUnD6Uhb6UgSmCqoAgScQIaiBH0CgIaGlgR9AWKGpBFAEyw/PiE4iEvQAz4RAE/QAz4HJzxTIz5AAAACAyc8UjQhgAZsyfMCfBf7JtYmZmxd63Ulv4FsArI0rBFdGa3wtgHWkyADEA/76Us+EQMnPFM+IAAHJAcjPhNDMzPkWyM+KAEDL/89Qggr68ICIUyPIz4QgEvpS+lLJeCRUEjLIz4PLBM+FoMzM+RaE97ASgAtQA9ckyM+KAEDOy/fPUCLI+lLJyM+FiBT6Ulj6AonPFvpU9ADJcfsAIdD6SDH6SNM/MfoAMfoAAeAAxQDGADMAAAAAAAAAAAAAAAAAGi5qgAAAAAAAAAAAEAH8MfoAMdTRBND6UNIAMdIAMfoAMfoAMdEk0PoAMdMP+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gAx0fgoJtD6ANMP+gD6APoA0w/TD9MP9ATSANHwGQfQ+gAx0w8x+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gDRBMj6UhP6UssP+lQUAMcD/PQAE8oAySKIAcj6UhLMgBDPC0TJAcjPhNDMzPkWyM+KAEDL/89QAdD6SDH6SDHTPzH6ADH6ADH6ADHU0dD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KMjPhAqJzxZ/zyPIyM+EClIw+lLJJvpEMW0FyPpSQBWDBwFuAcoAyAH+9EPIz4SAF/pSFfpSA6YKqgCBJxAhqIEfQKAhoaWBH0BYoakEUAPLD8+ITiL0AM+EQBP0AM+Byc8UyM+QAAAAgMnPFI0IYAGbMnzAnwX+ybWJmZsXet1Jb+BbAKyNKwRXRmt8LYB1pMj6Us+EQMnPFM+IAAHJAcjPhNDMzPkWyADJAXKJzxbL/89Qggr68IDIz4WIEvpSAfoCjQaAAAAAAAAAAAAAAAAAAAbGm8gAAAAAAAAAAEDPFslx+wABCQH8+gIkzxRSIPQAFfQAye1UINDTP9M/MfoA+gDSADHSADHTP9IAMdM/MdIAMdIAMdIAMdEn0PpIMfpI0z8x+gAx+gAx+gAx1NEo0PpQ0gAx0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+Cgj0PoAAMsC/tMP+gD6APoA0w/TD9MP9ATSANHwGQTQ+gAx0w8x+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gDRBcj6UhP6UssP+lT0AMoAySaIAcj6UhLMgBDPC0TJAcjPhNDMzPkWyM+KAEDL/89QKND6SDH6SDHTPzH6ADH6ADH6ADHU0dD6ADEBbgDMAfzTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KMjPhAqNCBgReZ7YX5zSGqsRFz8rQ2+rW0xXMyPSu3j8uI60U2ksIM8Wf88jyMjPhApSMPpSySv6RDFtBcj6UkAVgwf0Q8jPhIBSwPpSFvpSBKYKqgCBJxAhqIEfQKAhoaUAzQH8gR9AWKGpBFAEyw/PiE4iEvQAz4RAE/QAz4HJzxTIz5AAAACAyc8UjQhgAZsyfMCfBf7JtYmZmxd63Ulv4FsArI0rBFdGa3wtgHWkyPpSz4RAyc8Uz4gAAckByM+E0MzM+RbIz4oAQMv/z1AjghAI8NGAoCTIz5MmgFdqAfoCAM4B/lAE+gLPjAnEIMkp0PpI+kgx0z8x+gAx+gAx+gAx1DHRI5vIz5KCgsGaFMs/yZIzbeLIz4SAggnJw4D6Am0B9ADPhARSEPQAAW6zzwoAE/pSycjPkpafL+IWyz9QBPoCzBPMycjPhYgS+lJY+gJxzwtqzMmAEfsA0NM/MdM/+gAAzwH++gDSADHSADHTP9IAMdM/MdIAMdIAMdIAMdHIz5MvDOUmIsjPkyaAV2pQBfoCUAT6As+MCcQgyVADzCbQ+kj6SDHTPzH6ADH6ADH6ADHUMdEjnMjPkoKCwZokzws/yZFt4sjPhICCCcnDgPoCbQH0AM+EBFIQ9AABbrPPCgD6UgDQAvzJzxTJ+CiIUxbIz4QgEvpS+lLJeFEiyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1CCEA7msoAo0PpIMfpI0z8x+gAx+gAx+gAx1NEJ0PpQ0gAx0gAx+gAx+gAx0SnQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDEB4ADRAv7SADHR+Cgr0PoA0w/6APoA+gDTD9MP0w/0BNIA0fAZDND6ADHTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDHSANEEyPpSE/pSyw/6VBn0ABjKAMkmiAHI+lISzIAQzwtEyQHIz4TQzMz5FsjPigBAy//PUCjQ+kgx+kgx0z8x+gAxAW4A0gH6+gAx+gAx1NHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+CjIz4QKjQgYEXme2F+c0hqrERc/K0Nvq1tMVzMj0rt4/LiOtFNpLCDPFn/PI8jIz4QKUjD6Uskr+kQxbQXI+lJAFYMH9EPIz4SAHPpSFfpSA6YKqgAA0wH8gScQIaiBH0CgIaGlgR9AWKGpBFADyw/PiE4i9ADPhEAY9ADPgcnPFMjPkAAAAIDJzxSNCGABmzJ8wJ8F/sm1iZmbF3rdSW/gWwCsjSsEV0ZrfC2AdaTI+lLPhEDJzxTPiAAByVAGyM+E0MzM+RbIz4oAQMv/z1AH0PpI+kgxANQAsNM/MfoAMfoAMfoAMdQx0cjPkoKCwZoUyz/JghAL68IAyM+DE8zPUMjPkoKCwU4Wyz9QA/oCF/pSEvpU9ABQBPoCE87JyM+FiBP6UgH6AnHPC2rMyYAR+wACASAA1wDYAgEgAN4A3wAnFIioAKkUSGoWKkEUwG7kltw4KKAB9yEdyrCAJVToLvDAJFw4vKxJoIYdGpSiAC+nCaCIAkYTnKgALvDAJFw4vKxJcIAlyWBJxC5wwCRcOLysSnC/5cpgQPou8MAkXDimCl6qQjAAMMAkXDi8rEkwv+VI8L/wwCRcOKXJIEnELvDAJFw4pcjgScQu8MAkXDi8rGAA2QH8I5VTQ7vDAJF/4vKxgScQJqEnqFAGqQRTBqAhwgCVUwa7wwCRcOLysVMbqCGpBCiCGASoF8gAoSGoWKkEAcIAlMIAwwCSMHDi8rFSpaiBJxCgpYEnEKkEU6OogScQqQRTG7nysSSUXLvDAJF/4vKxJJUgwgDDAJF/4vKxcFPKANoB8sIAjksxKqdkgScQqQRTvKiBJxCpBKBTsKFUeI4DoFESqAGpBKEgwgCVUg+5wwCSPnDilVLbvsMAkjpw4vKxUKmhUIuhVHSgKfAG8rEQigeVEC06OjDiU4a5lTBQeV8H4w0Cs5Iwf50hbpTCAMMAkjBw4sMA4vKx8AEA2wL8ggiYloCCAYagUxuogScQqQSgZqExU1mgUwkDoFESqAGpBKG2CSDCAJVTB7nDAJFw4vKxU0igUwioUpOhpBKpBKSigSasKqGCCJiWgCKBJxCoIqClWKkEtgkgcHSK5BAjXwNSBrvysSSnZIEnEKkEU1mogScQqQSgU1ChU1mgANwA3QBSpFyhIIIImJaAvo4aIKdkgScQqQQholMeqIEnEKkEoSW+kTORMOKRMOIATlMJA6BREqgBqQShBJVSO7vDAJI6f+LysVB0oFAIoVBHoUYG8AbysQBbCHBAZNfBHDgUyC2CVNAoFJDuZdQQ6CoIqkEkjMz4gGCGASoF8gAoagBqQTCAIAT3NMfMe1E0NMH+lD6APoA+gD6APoA1NIA+gDU9AT0BQ3XLCB8U/UsjjDTPzH6ADAYoAvIywca+lRQCPoCUAb6AlAI+gJY+gIB+gIVzMoAAfoCzPQA9ADJ7VTg1ywlBQWCnOMC1ywjIVvoPOMC1ywlBQWCrOMC1ywlBQWANIADgAOEA4QDiAcArbpJfDuD4KIhTHcjPhCAS+lL6Usl4USLIz4PLBM+FoMzM+RaE97ASgAtQA9ckyM+KAEDOy/fPUPiSxwXy4ErTP/oAMBDeEM0QvBCrEJoQiRB4EGcQVhBFEDQQI/AWXw0B4ABCMCuRcJUqbrPDAOKX+JIrxwXDAJFw4pZVC/ATXw2SXw3iBPyOMdM/MfoAMBegC8jLBxr6VFAI+gJQBvoCUAT6AlAH+gJQBvoCzMoAAfoCzPQA9ADJ7VTg1ywlBQWCJOMC1ywjoY+RDOMC1ywlBQWBnI6u+JIm0PpI+kgx0z8x+gAx+gAx+gAx1DHRxwXy4EktbrOVLMAAwwCRcOKSXw7jDeAA4wDkAOUA5gH++JIm0PpIMfpI0z8x+gAx+gAx+gAx1NHQ+gDTD/oA+gD6ANMP0w/TD/QE0gDRLtD6UNIAMdIAMfoAMfoAMdH4KCoQjAcQahBZEExKE1QZzPAZBcj6UhL6UhLLD/pUEvQAygDJJ9D6SDH6SNM/MfoAMfoAMfoAMdTRJtD6UNIAMQD8AZ4tbrOVLMAAwwCRcOKOvfiSLMcF8uBJDdDTP/oA0wchwgXyRdIA0gDSADH6ANM/0wTTAdERFdcLPybAAZTAA8MAkjBw4pRfD18G4w2SXw7iAOcA9g3Q0z/6ANMHIcIF8kXSANIAMdIA+gDTP9ME0wHRERXXCz8mwAGUKLrDAJIwcOKORQfIyz9QBvoCFMsHEsoAz4HKAAH6Ass/ywQdywHJC8jLBxr6VFAI+gJQBvoCUAT6Alj6AgH6AszKAAH6AswS9AD0AMntVJRfD18G4gTKidcnjpr4kvgoxwXy4EktbrOVLMAAwwCRcOKSXw7jDeDXLCUFBYQs4wLXLCUFBYQEjhUw+JIrxwXy4Ekrkl8NllUL8BNfDeLg1ywk8GEhRJJfDuDXLCaLmqAEkl8O4NcsIAbGm8wA6ADpAOoA6wCKB8jLP1AG+gIUywcSygDKAM+BAfoCyz/LBB3LAckLyMsHGvpUUAj6AlAG+gJQBPoCWPoCAfoCzMoAAfoCzBL0APQAye1UAAigoLCEAPgN0NM/+gDTByHCBfJF0gDSANIA+gDTP9ME0wHRERbXCz8HwAOVUWi6wwCSNnDijkYHyMs/UAb6As+EChPKAMoAygBY+gISyz/LBB3LAckLyMsHGvpUUAj6AlAG+gJQBPoCWPoCAfoCzMoAAfoCzBL0APQAye1UlF8PXwbiAvwtbpF/lSzDAMMA4pJfDuDTP9cLAiDBBY4X+JJUftxUftxUftxUftxWGy7wCccFwwCRcOLy4Eku0NM/+gDTByHCBfJF0gDSANIA+gDTP9ME0wHRUbK9lF8PXwngKcEC4wJXFwiuswERFgGwBsjLP1AF+gITywfKAMoAygABERAA7ADtBPyOuzAqbrORcOMN8uBJC8ACjifIz4QSGvpUUAj6AlAG+gJQBPoCWPoCAfoCzMoAAfoCzPQA9ADJ7VSSXwzi4NcsJvQgFnSOMTALwAKOJ8jPhBIa+lRQCPoCUAb6AlAE+gJY+gIB+gLMygAB+gLM9AD0AMntVJJfDOLgidcn4wIA8QDyAPMA9AH8EJpfCg3Q0z/6ANMHIcIF8kXSANIA0gD6ANM/0wTTAdFWFq6xCcjLP1AI+gIWywcUygASygDKAAH6AiHPCz8SywQSywHJLcjLBz5SzvpUK/oCO1Gp+gI5UYf6AjdRZfoCNVFD+gIzUhPMIs8KAGwSIvoCMlIizDJSIvQAMlJCAO4ApPoCyz8eywQdywHJK8jLB1Kw+lQq+gIp+gIo+gIn+gIm+gIlzxQkzwoAI/oCIs8UUtD0AFIQ9ADJ7VQQvBCrEJoQiRB4EGcQVhBFEDRBMPAQXw0C/vQANAPJ7VT4KCSOGCPQNAP6SDH6SNM/MfoAMfoAMfoAMdQx0ZMz+CjiiFMTyM+EIBL6UvpSyXiEd1R1h8jPiYgBVHZ1yM+DywTPhaDMzPkWhPewCYALJ9ckNhXOF8v3WPoCgRUMzwt1FMwSzM+SgoLCIhLLPxLLAvpSyYR3hHcB4ADvAfrIz4UIUlD6Ulj6AoIQoKCwic8LiiPPCz8mzwsCz4MB+gLJhHeEd8jPhQgX+lIB+gKCEKCgsIrPC4ojzws/Js8LAs+GgFAF+gLJggEZQHD4NoIAsCxw+DagAnGDCbH7CBKgBHGDCbH7CBSgA3GDCbH7CBOgyM+FiBL6UgH6AgDwACSCEKCgsIfPC4rLP8sCyYAR+wAB/viSJdD6SDH6SNM/MfoAMfoAMfoAMdTRJND6UNIAMdIAMfoAMfoAMdEh0PoAMdMP+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gAx0fgoI9D6ANMP+gD6APoA0w/TD9MP9ATSANHwGQTQ+gAx0w8x+gAx+gAx+gAx0w8x0w8x0w8x9AQA9QAIpafL+AH+IW6SXw7g+JIm0PpIMfpI0z8x+gAx+gAx+gAx1NEl0PpQ0gAx0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+Cgj0PoA0w/6APoA+gDTD9MP0w/0BNIA0fAZBND6ADHTDzH6ADH6ADH6ADHTDzHTDwD4AARfDgP+MdIA0QXI+lIT+lLLD/pU9ADKAMksiAHI+lISzIAQzwtEyQHIz4TQzMz5FsjPigBAy//PUCbQ+kgx+kgx0z8x+gAx+gAx+gAx1NHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+CjIz4QKic8Wf88jyMjPhApSMPpSyQFuAcoA9gH+VhH6RDFtBcj6UkAVgwf0Q8jPhIBWEgH6Uhb6UgSmCqoAgScQIaiBH0CgIaGlgR9AWKGpBFAEyw/PiE4iEvQAz4RAE/QAz4HJzxTIz5AAAACAyc8UjQhgAZsyfMCfBf7JtYmZmxd63Ulv4FsArI0rBFdGa3wtgHWkyPpSz4RAyQD3ADrPFM+IAAHJAcjPhNDMzPkWyM+KAEDL/89QxwXDAAT8MdMPMfQEMdIA0QXI+lIT+lLLD/pU9ADKAMktiAHI+lISzIAQzwtEyQHIz4TQzMz5FsjPigBAy//PUCfQ+kgx+kgx0z8x+gAx+gAx+gAx1NHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+CjIz4QKic8Wf88jyMiJAW4BygD5APoAAgIB/s8WUjD6UslWEvpEMW0FyPpSQBWDB/RDyM+EgFYTAfpSFvpSBKYKqgCBJxAhqIEfQKAhoaWBH0BYoakEUATLD8+ITiIS9ADPhEAT9ADPgcnPFMjPkAAAAIDJzxSNCGABmzJ8wJ8F/sm1iZmbF3rdSW/gWwCsjSsEV0ZrfC2AdaQA+wCYyPpSz4RAyc8Uz4gAAckByM+E0MzM+RbIz4oAQMv/z1DHBfLgStM/+gAw+JchvvKvEN4QzRC8EKsQmhCJEHgQZxBWEEUQNBAj8BdfDQL+0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+Cgj0PoA0w/6APoA+gDTD9MP0w/0BNIA0fAZBND6ADHTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDHSANEFyPpSE/pSyw/6VPQAygDJLogByPpSEsyAEAFuAP0C/M8LRMkByM+E0MzM+RbIz4oAQMv/z1DI+lJS4PpSzMltbYgDyMxxzwtPEvQA9ADJAcjPhNDMzPkWyM+KAEDL/89QxwXy4EkC0PpQ0gDSAPoA+gDRBtM/MfoAMBagA8j6VBLKAMoAUAP6Alj6AskLyMsHGvpUUAj6AlAG+gJQBAGjAP4ALvoCWPoCAfoCzMoAAfoCEsz0APQAye1UAgEgAQEBAgIBIAETARQCASABAwEEAgEgAQsBDAKzCLQ0z8x+gAx0wchwgXyRdIAMdIAMdIAMfoAMdM/MdMEMdMBMdGRW+Ak0PpQ0gDSAPoA+gDRLND6SDH6SNM/MfoAMfoAMfoAMdTRKMABlCWzwwCRcOLjDxAogAQUBBgP3DdfBVBXXwUgwQXysSDAAo4WW9D6SPpIMdM/MfoAMfoAMfoAMdQx0eAgwAOSMDHgIMAElF8D+CjgjhYB0PpIMfpI0z8x+gAx+gAx+gAx1DHRkzH4KOKIIcjPhCD6UhP6Usl4UTPIz4PLBM+FoMzM+RaE97CAC1AD1yTIiYAHgAQkBCgHiNTc5PgHQ+gDTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHRLaEjuvKxAcj6VM+DygAr+gJQBfoCyS7IywdS4PpULfoCLPoCJfoCKvoCKfoCKM8UJ88KACb6AiHPFFJA9ABSMPQAye1UKsIAkjow4w0BBwDYWwbAApMiwwCRcOKUAbPDAJIxcOKOUDdTJrqVAsIAwwCSMnDi8rHI+lTKAM+DUAT6AlAD+gLJLMjLB1LA+lQr+gIq+gIp+gIo+gIn+gImzxQlzwoAJPoCIc8UUiD0AFIw9ADJ7VQCkl8F4hAoAv4t+CiEd8jPhQhSIPpSAfoCjQZAAAAAAAAAAAAAAAAABQUFgoAAAAAAAAAAFM8WLfoCyYAwgWgAghAJZgGAcPg3gSascPg2oAFxgwmx+wigggCO+HD4NqCIU1PIz4QgEvpS+lLJeFNzVhLIz4mIAVR1ZMjPg8sEz4WgzMz5FoT3AeABCADmsASACybXJDUUzhLL9wH6AoEVDM8LdRPMzIvKCgsIEAAAAAAAAAAozxYB+gIS+lLPgclxgwmx+wiggVwwcPg2oMjPhYgS+lIB+gKNBkAAAAAAAAAAAAAAAAAFBQWEAAAAAAAAAAAUzxZQC/oC+lLJgBH7AAADgBAADs8Wzsv3z1AA5wxMmxjMzMC0NM/MfoAMdMHIcIF8kXSANIAMdIAMfoAMdM/MdME0wEx0SKRM44pA9D6UDHSANIA+gD6ADHRAo4Qs5TCAMMAkjBw4pQCcrEC3pVbAnGxAuLiIcABm5QBdLEB3wKSeLHekjAy4gHAA5OAELHegAaEVHy6VHy6VHy6VHy6LPAKIJNfDnDhIdDTPzH6ADHTBwHCBfJF0gAx0gAx0gAx+gAx0z/TBDHTATHRggDurHD4NnB1jocgriSw4wCk5B9fDzGABDQP8IMECjj34KIR3hHfIz4UIE/pSAfoCghCgoLCGzwuKJM8LPyLPCwLPgwH6AsmBXcBw+DaCALAscPg2oAFxgwmx+wig4w0hwQLjAFYRVhFWEVYRVhFWEVYRVhFWEVYRVhFWEVYRLvAJVHFCyM+FiBT6Ulj6AoIQoKCwhc8Liss/AQ4BDwEQAv74KCGOFirQ+kgx+kjTPzH6ADH6ADH6ADHUMdGS+CjiiCFWE8jPhCAS+lL6Usl4hHdUeGXIz4mIAVR2dcjPg8sEz4WgzMz5FoT3sAmACyfXJDYVzhfL91j6AoEVDM8LdRTMEszPkoKCwiISyz8SywL6UsmEd4R3yM+FCFYUAfpSAeABEQD6VhFWEVYRVhFWEVYRVhFWEVYRVhFWEVYRVhEu8An4KIR3hHfIz4UIE/pSAfoCghCgoLCGzwuKJs8LPyTPCwLPgwH6AsmBXcBw+DaCALAscPg2oAFxgwmx+wigU1PIz4WIFPpSWPoCghCgoLCFzwuKyz/LAslxgwmx+wgToAIAGssCyXGDCbH7CKASoAEB9Fj6AoIQoKCwic8LiibPCz8kzwsCz4MB+gLJhHeEd8jPhQgV+lIB+gKCEKCgsIrPC4omzws/JM8LAs+GgFAD+gLJggEZQHD4NoIAsCxw+DagAnGDCbH7CBKgAnGDCbH7CBKgAXGDCbH7CKD4KIR3hHfIz4UIE/pSAfoCARIAXIIQoKCwhs8LiiXPCz8jzwsCz4MB+gLJgV3AcPg2ggCwLHD4NqABcYMJsfsIoKACASABFQEWAgEgARwBHQH3CDQ0z/6ANMHIcIF8kXSANIA0gD6ANM/0wQx0wEx0VYUVhRWFFYUVhRWFFYUVhRWFFYUVhRWFFYU8AoglF8J8BDhOSCEP7ny4EikU4hzsAnIyz9QCPoCFssHFMoAEsoAygAB+gIhzws/EssEEssByS7IywdS4PpULfoCLIAEXAKUIG6TXw1w4CDQ0z8x+gAx0wchwgXyRdIAMdIAMdIAMfoAMdM/MdMEMdMBMdEgwASSMH+UwAXDAOKTXw1w4FR8ulR8ulR8ulR8uizwEVXA8Au2CYAFU+gIr+gIq+gIp+gIozxQnzwoAJvoCJc8UUkD0AFIQ9ADJ7VRwdYrkE18DARgB9CCuJLCO8iDBAo5rVH/tVH/tVH/tVH/tU9zwCfgohHeEd8jPhQgT+lIB+gKCEKCgsIbPC4olzws/I88LAs+DAfoCyYFdwHD4NoIAsCxw+DagAXGDCbH7CKBTQsjPhYgU+lJY+gKCEKCgsIXPC4rLP8sCyYAR+wDjDd6kARkC/vgoIY4WKdD6SDH6SNM/MfoAMfoAMfoAMdQx0ZL4KOKIIVYSyM+EIBL6UvpSyXiEd1R4ZcjPiYgBVHZ1yM+DywTPhaDMzPkWhPewCYALJ9ckNhXOF8v3WPoCgRUMzwt1FMwSzM+SgoLCIhLLPxLLAvpSyYR3hHfIz4UIVhMB+lIB4AEaAfxY+gKCEKCgsInPC4omzws/JM8LAs+DAfoCyYR3hHfIz4UIFfpSAfoCghCgoLCKzwuKJs8LPyTPCwLPhoBQA/oCyYIBGUBw+DaCALAscPg2oAJxgwmx+wgSoAJxgwmx+wgSoAFxgwmx+wigVH8xyM+FiBP6UlAD+gKCEKCgsIcBGwAazwuKEss/ywLJgBH7AAL1DQ0NDY3NzclbpNfB3DgJdDTPzH6ADHTByHCBWwS8kXSADHSADHSADH6ANM/MdMEMdMBMdEgk18IcOEnbrOOKCfQ0z8x0z8x+gAx+gAx0gAx0gAx0z8x0gAx0z8x0gDSADHSADHRwwCRcOKSN3DjDVBCoFADoAHQ+lAxgAR4BHwP1NDTP/oA0wchwgXyRdIA0gDSAPoA0z/TBNMB0S7Q+kj6SNM/+gAx+gAx+gAx1NEqs5Qps8MAkXDikl8E4w0tlCSzwwCRcOLjAAnIyz9QCPoCFssHFMoAEsoAygAB+gLLP8sEywHJLMjLB1LA+lQr+gIq+gIp+gIo+gIngASABIQEiAEwH0NM/MdM/MfoA+gAx0gAx0gAx0z8x0gAx0z8x0gAx0gAx0gAx0QCC0gAx0gAx+gAx+gDRoIIK+vCAoAPQ0z8x+gDTBwHCBfJF0gAx0gAx0gAx+gAx0z8x0wQx0wEx0ROgWKChcLYJtggArjl/+CiEd8jPhQgS+lIB+gKCEKCgsILPC4ouzws/yYEvqHD4NgFxgwmx+wigggCAIHD4NqAuyM+FiBb6UgH6AoIQoKCwM88LihTLPxL6Uss/F8zJgBH7AAD4NH/4KIR3yM+FCBL6UgH6Ao0GQAAAAAAAAAAAAAAAAAUFBYLYAAAAAAAAABzPFsmCCJiWgIEWqHD4NgJxgwmx+wgSoIIAgCBw+DagtglWFcjPhYj6UgH6Ao0GQAAAAAAAAAAAAAAAAAOhj5EIAAAAAAAAABzPFsmAEfsABAA0+gImzxQlzwoAJPoCI88UUiD0AFIQ9ADJ7VQCASABJQEmAgHUATQBNQIBIAE9AT4CASABJwEoAgEgASkBKgIBIAEwATEB9Qj0PpQ0gDSAPoA+gDRIJJfBuE4A8j6VBLKAMoAAfoCz4QgyS7IywdS4PpULfoCLPoCK/oCKvoCKfoCKM8UJ88KACb6AiHPFFJA9ABSMPQAye1UJ9D6SDH6SNM/MfoAMfoAMfoAMdTR0PoA0w/6APoA+gDTD9MP0w/0BIAFXAfcAdDTP9M/+gD6ANIA0gDTP9IA0z/SANIA0gDRI4Q/ufLgSAOkC8jLPxrLP1AI+gJQBvoCFMoAEsoAyz/KACTPCz8SygASygDKAMktyMsHUtD6VCz6Aiv6Air6Ain6Aij6AifPFCbPCgAl+gIkzxRSEPQAUjD0AMntVCbQgASsB/vpIMfpI0z8x+gAx+gAx+gAx1NEl0PpQ0gAx0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+Cgj0PoA0w/6APoA+gDTD9MP0w/0BNIA0fAZBND6ADHTDzH6ADH6ADH6ADHTDzHTDzHTDzH0BDHSANEBLAP+Bcj6UhP6UssP+lT0AMoAyS2IAcj6UhLMgBDPC0TJAcjPhNDMzPkWyM+KAEDL/89QJ9D6SDH6SDHTPzH6ADH6ADH6ADHU0dD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KMjPhAqJzxZ/zyPIyM+EClIw+lLJVhL6RAFuAcoBLQL8MW0FyPpSQBWDB/RDyM+EgFYTAfpSFvpSBKYKqgCBJxAhqIEfQKAhoaWBH0BYoakEUATLD8+ITiIS9ADPhEAT9ADPgcnPFMjPkAAAAIDJzxSNCGABmzJ8wJ8F/sm1iZmbF3rdSW/gWwCsjSsEV0ZrfC2AdaTI+lLPhEDJzxSJAS4BLwAFAABAAG7PFskByM+E0MzM+RbIz4oAQMv/z1CCCvrwgMjPhYgS+lIB+gKCCNjTec8LihLLP8+EIMlx+wABAZkI26Rf54uwweVLsMGwwCRcOLDAOKRW+Aj0NM/0z/6APoA0gDSANM/0gDTP9IA0gDSANEGs5VRybrDAJI8cOKVU6a6wwCRcOKSXwzjDYAEyAZsI26Rf54uwweVLsMGwwCRcOLDAOKRW+Aj0NM/0z/6APoA0gDSANM/0gDTP9IA0gDSANEHs5VRyrrDAJI8cOKVUae6wwCSOnDikl8L4w2ABMwDEPVcXARESAQigdgfIyz8Wyz9QBPoCWPoCygDPgx7LPxPKAAEREAHLPxTKAMoAGcoAycjPhBpSwPpUK/oCKvoCIvoCKPoCJ/oCJs8UJc8KACT6AiPPFFIQ9ABSkPQAye1UUAgAwjxXFhESJKB2B8jLPxbLP1AE+gJY+gLPgxLKAB/LPwEREQHKABXLP8oAygAaygDJyM+EGlLA+lQr+gIt+gIp+gIo+gIn+gImzxQlzwoAJPoCI88UUhD0AFKg9ADJ7VRQDAkC9wkbpJfA+Ak0NM/0z/6APoA0gDSADHTP9IAMdM/0gAx0gAx0gAx0SjBAZI4f5VSeb3DAOKSNn+OHV2oUwCkqwCTUwG5mjFUcBCpBFigqwDoMDEXucMA4pJfCOA5VxMHmFHmoVHGoAwO3gHIyz/LPyX6AlYQ+gLPhIDLP4mABNgE3Aa0bILdMG34KIgByPpSyW1tAsjM9ACNBYAAAAAAAAAAACAAAAAAAAAAAAAAAAAQzxb0AHDPC0fJAcjPhNDMzPkWyM+KAEDL/89QiyJxCAKBAQv0Esj0AMmABhAABQAH+zxbLP8+EQMkn0PpI+kjTP/oAMfoAMfoAMdTRcxEQghgEqBfIAKHIz4QOVhMB+lRWEvoCIfoCVhD6Ai/6Ai76Ai3PFCzPCgAr+gIqzxRSYPQAUoD0AMntVIIYBKgXyAAgyM+SgoLAGhnLP1AI+gIU+lISyz/MycjPhYgT+lJQBAE4Afz6AnHPC2rMyYAR+wAn0PpIMfpI0z8x+gAx+gAx+gAx1NEm0PpQ0gAx0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+Cgj0PoA0w/6APoA+gDTD9MP0w/0BNIA0fAZBND6ADHTDzH6ADH6ADH6ADEBOQP80w8x0w8x0w8x9AQx0gDRBcj6UhP6UssP+lT0AMoAyS6IAcj6UhLMgBDPC0TJAcjPhNDMzPkWyM+KAEDL/89QKND6SDH6SDHTPzH6ADH6ADH6ADHU0dD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KMjPhAqJzxZ/AW4BygE6Av7PI8jIz4QKUjD6UslWE/pEMW0FyPpSQBWDB/RDyM+EgFYUAfpSFvpSBKYKqgCBJxAhqIEfQKAhoaWBH0BYoakEUATLD8+ITiIS9ADPhEAT9ADPgcnPFMjPkAAAAIDJzxSJyPpSz4RAyc8Uz4gAAckByM+E0MzM+RbIz4oAQMv/ATsBPABDgAZsyfMCfBf7JtYmZmxd63Ulv4FsArI0rBFdGa3wtgHWkABuz1CCGASoF8gAAcj6UlAF+gJQD/oCUAP6Ain6AsnIz48YAASCEKCgoBLPC/dxzwthzMlw+wAZHAIBIAE/AUACASABTQFOA9cIG6Rf5UswwDDAOLcINDTP/oA0wchwgXyRdIA0gDSAPoA0z/TBNMB0SGSXwrgLND6UDHSANIA+gAx+gAx0SmSMXCTAcMA4pLDAJIwcOLjAifAAZMmwwCRcOKULrPDAJFw4uMAB8ACkl8J4w2ABQQFCAUMD8Q2XwNsMzM0IG6TXwRw4NDTP/oAMdMHIcIF8kXSANIA0gD6ADHTPzHTBDHTATHRI8AC4wIDwwGTXwdw4CGRf5MgwwDimySzkX+TIsMA4sMAkXDik18HcOCCAIAgcPg2B9D6SPpI0z/6ADH6ADH6ADHU0QWzkjNw4w2ABSAFJAUoB/jc5PAbIyz9QBfoCz4QGEsoAygASygBY+gIWyz/LBBTLAcl/LMjLB1LA+lQr+gIq+gIp+gIo+gIn+gImzxTPgyT6AiPPFFJQ9ABSIPQAye1UJdD6SDH6SNM/MfoAMfoAMfoAMdTRJND6UNIAMdIAMfoAMfoAMdEh0PoAMdMP+gABRADGNzlyKMjLPyj6As+ECibPCgAlzwoAJM8KACP6AiLPCz8qzwsEJ88LAclWFsjLB1YWAfpUVhX6AlYU+gJWE/oCVhL6AlYR+gJWEM8UL88KAC76Ai3PFFLA9ABSEPQAye1UUKoHAfxWElYRoFYQoCzQ+lAx0gAx0gAx+gAx+gDRoIIK+vCAoCrQ0z8x+gDTBwHCBfJF0gAx0gAx0gAx+gAx0z8x0wQx0wEx0aD4J28QIaH4KFYR0PpIMfpI0z8x+gAx+gAx+gAx1DHRhHfIz4UIEvpSAfoCghDVMnbbzwuKLM8LP8kBRgP+MfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KCPQ+gDTD/oA+gD6ANMP0w/TD/QE0gDR8BkE0PoAMdMPMfoAMfoAMfoAMdMPMdMPMdMPMfQEMdIA0QXI+lIT+lLLD/pU9ADKAMksiAHI+lISzIAQzwtEyYIQCPDRgMjPiQgBUyPIiQFuAdkBRQBGzxbMzPkWzwv/AfoCgQCMzwtwEszMz5NNyFYyyXH7AFBE8A8ByoR3yM+FiBP6Ulj6AoIQoKCwhM8LiizPCz/JhHeEd8jPjxgABIIQoKCwcM8L93HPC2lY+gIB+gLJgVXwcPg2ggCAIHD4NqADcYMJsfsIE6ABcYMJsfsIoAFwgwmx+wigvpJfCuMNAUcA2DooyMs/UAj6As+EDhXKABPKAMoAAfoCyz8SywTLAckuyMsHUuD6VC36Aiz6Aiv6Air6Ain6AijPFCfPCgAm+gIlzxRSQPQAUhD0AMntVAKAEPsC+CjIz4WI+lKCEKCgsITPC47LP8mBAJD7AAH+EEZfBvgoAtD6SDH6SNM/MfoAMfoAMfoAMdQx0YR3yM+FCBL6UgH6AoIQ1TJ2288LiiHPCz/JhHfIz4WIFPpSUAP6AoIQoKCwhM8Liss/yYR3hHfIz48YAASCEKCgsHDPC/dxzwtpWPoCAfoCyYFV8HD4NoIAgCBw+DagA3GDCQFLAAgDs8MAAd6OWvgohHfIz4UIEvpSAfoCghCgoLCCzwuKJs8LP8mBL6hw+DYBcYMJsfsIoIIAgCBw+DagyM+FiBP6UiL6AoIQoKCwM88LihbLPxX6Uss/zMlxgwmx+wgSoBSgA5QQRV8F4gGTs8MAkjBw4pEw4w0BTAAqsfsIE6ABcYMJsfsIoAFwgwmx+wigAPj4KIR3yM+FCBL6UgH6Ao0GQAAAAAAAAAAAAAAAAAUFBYLYAAAAAAAAABzPFsmCCJiWgIEWqHD4NgJxgwmx+wgSoIIAgCBw+DagtgnIz4WIEvpSIfoCjQZAAAAAAAAAAAAAAAAAA6GPkQgAAAAAAAAAHM8WyXGDCbH7CKCgAZMItD6UDHSANIA+gAx+gAx0QGSwwCSMHDi4wAsyMsHUsD6VCv6Air6Ain6Aij6Aif6AibPFCXPCgAk+gIjzxRSIPQAUhD0AMntVIAFPAfcNjY3OSJujjwC0NM/+gDTByHCBWwS8kXSANIA0gD6ANM/0wQx0wEx0QbIyz9QBfoCz4QWE8oAygDKAAH6Ass/z4QEyQLfdXBUYAnQ+lDSANIA+gD6ADHRA8j6VBLKAMoAAfoCz4QgycjPhBZSwPpUK/oCz4QgKfoCz4QCgAVQB/jQ7I9D6SDH6SDHTPzH6ADH6ADH6ANQx0Si7dHHjBCDwAsjPjxgABIIQoKCwcM8L93DPC2HLByn6Aij6Aslw+wAk0PpIMfpI0z8x+gAx+gAx+gAx1NEj0PpQ0gAx0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzEBUAL89AQx0gAx0fgoI9D6ANMP+gD6APoA0w/TD9MP9ATSANHwGQTQ+gAx0w8x+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gDRBcj6UhP6UssP+lT0AMoAySuIAcj6UhLMgBDPC0TJghAI8NGAyM+JCAFTI8jPhNDMzPkWzwv/AfoCgQCMAW4BUQL0zwtwEszMz5NNyFYyyXH7ACTQ+kj6SNM/+gAx+gAx+gAx1NGCCJiWgMjPhQgV+lJQBPoCjQZAAAAAAAAAAAAAAAAABQUFgZgAAAAAAAAABM8WEvpSyz/MyXH7AH+CCvrwgMjPhYhS0PpSAfoCic8WyXH7ACHABOMAUMQBUgFTADMAAAAAAAAAAAAAAAAADoY+RCAAAAAAAAAAcABmghAvrwgA+CjIz4WI+lIB+gKNBkAAAAAAAAAAAAAAAAAFBQUAkAAAAAAAAAAkzxbJcfsAAv4mzxQlzwoALfoCIc8UUoD0AFJw9ADJ7VQl0PpI+kjTP/oAMfoAMfoAMdTRggnJw4DIz4UIFfpSUAT6Ao0GQAAAAAAAAAAAAAAAAAUFBYGQAAAAAAAAAATPFhL6Uss/zMlx+wCCCvrwgCdus5Ei4w2gcvsCJdD6SDH6SNM/MfoAAVUBVgBIJ9DTPzH6ANMHAcIF8kXSADHSADHSADH6ADHTPzHTBDHTATHRAHQx+gAx+gAx1DHRyM+FCPpSjQaAAAAAAAAAAAAAAAAAAGqZO22AAAAAAAAAAEDPFsmDBvsAEDxAGVB2Af7SANEr0PpQ0gAx0gAx+gAx+gAx0fgoKhCMBxBqEFkQTEoTVBnM8BkFyPpSEvpSEssP+lQS9ADKAMko0PpIMfpI0z8x+gAx+gAx+gAx1NEj0PpQ0gAx0gAx+gAx+gAx0SHQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHRAVgD/vgoI9D6ANMP+gD6APoA0w/TD9MP9ATSANHwGQTQ+gAx0w8x+gAx+gAx+gAx0w8x0w8x0w8x9AQx0gDRBcj6UhP6UssP+lT0AMoAyS+IAcj6UhLMgBDPC0TJAcjPhNDMzPkWyM+KAEDL/89QyPpSUvD6UszJbW2IA8jMcc8LTxIBbgGjAVkAePQA9ADJJoIJycOAoMjPiYgBUyPIz4TQzMz5Fs8L/wH6AoEAjM8LcBLMzM+SgoLBEhLLP1AE+gLJgBH7AAIBIAFcAV0CASABXgFfAA2wZCCAgEAgABGw63tRNDXCweAAbbBYO1E0NMHMfpQMfoAMfoAMfoAMfoAMfoAMdQx0gAx+gAx1PQEMfQEMdHQ+lDSANIA+gD6ANGACASABYAFhAHWuCPaiaGmDmP0oGP0AGP0Aa6YAwJOIVADofSQY/SQY6Z+Y/QAY/QAY/QBqGOjUghBAk4heQJOILHGCQAH5rpv2omhpg5j9KH0AGP0AGP0AGP0AGP0AGOppABj9ABjqegIY+gIY6JDofSQY/SRpn5j9ABj9ABj9ABjqaOh9AGmH/QB9AH0AaYfph+mH+gJpAGiV6H0oaQAY6QAY/QAY/QAY6PwUFQhGA4g1CCyIJiUJqgzmeAyC5H0pCUABYgH++lISyw/6VBL0AMoAyQLQ+kgx+kjTPzH6ADH6ADH6ADHU0QLQ+lDSADHSADH6ADH6ADHRItD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdH4KCTQ+gDTD/oA+gD6ANMP0w/TD/QE0gDR8BkF0PoAMdMPMfoAMfoAMfoAMQFjAtTTDzHTDzHTDzH0BDHSANEEyPpSE/pSyw/6VBL0AMoAySKIAcj6UhLMgBDPC0TJAcjPhNDMzPkWyM+KAEDL/89QyPpSEvpSzMltbYgDyMxxzwtPEvQA9ADJAcjPhNDMzPkWyM+KAEDL/89QAW4BowIBIAFmAWcCASABdwF4AgEgAWgBaQIBWAF0AXUCAVgBagFrACmzbztRNDTBzH6UDH6APoA+gAw8ASAB+qoY7UTQ0wcx+lAx+gAx+gAx+gAx+gAx+gAx1NIAMfoAMdQx9AQx9AQx0dD6SDH6SDHTPzH6ADH6ADH6ADHU0dD6ADHTD/oAMfoAMfoAMdMPMdMPMdMPMfQEMdIAMdEgpgqqAIEnECGogR9AoCGhpYEfQFihqQQgghAX14QAAWwB+Kmd7UTQ0wcx+lD6ADH6ADH6ADH6ADH6ADHU0gAx+gAx1PQEMfQEMdEh0PpIMfpI0z8x+gAx+gAx+gAx1NEC0PpQ0gAx0gAx+gAx+gAx0SLQ+gAx0w/6ADH6ADH6ADHTDzHTDzHTDzH0BDHSADHR+Cgk0PoA0w/6APoA+gABbQBeqIEnECKgqQQgpwojpgqpBIBkgROIXaElghAL68IAqIEnECegqQQQNxA2EDVBQBMC/tMP0w/TD/QE0gDR8BkF0PoAMdMPMfoAMfoAMfoAMdMPMdMPMdMPMfQEMdIA0QTI+lIT+lLLD/pUEvQAygDJIogByPpSEsyAEM8LRMkByM+E0MzM+RbIz4oAQMv/z1AB0PpIMfpIMdM/MfoAMfoAMfoAMdTR0PoAMdMP+gAx+gABbgFvART/APSkE/S88sgLAXAB/jH6ADHTDzHTDzHTDzH0BDHSADHR+CjIz4QKjQgYEXme2F+c0hqrERc/K0Nvq1tMVzMj0rt4/LiOtFNpLCDPFn/PI8jIz4QKUjD6Uskm+kQxbQXI+lJAFYMH9EPIz4SAF/pSFfpSA6YKqgCBJxAhqIEfQKAhoaWBH0BYoakEUAMBcwIBYgFxAXICAs4BkQGSAgFqAZ8BoADCyw/PiE4i9ADPhEAT9ADPgcnPFMjPkAAAAIDJzxSNCGABmzJ8wJ8F/sm1iZmbF3rdSW/gWwCsjSsEV0ZrfC2AdaTI+lLPhEDJzxTPiAAByQHIz4TQzMz5FsjPigBAy//PUACrrkR2omhpg5j9KBj9ABj9ABj9ABj9ABj9ABjqaQAY/QAY6hj6Ahj6Ahjo6H0kGP0kGOmfmP0AGP0AGP0AGOpo6H0AaYf9AH0AfQBph+mH6Yf6AmkAaMAB+6yedqJoaYOY/SgY/QB9AH0Aa6YqOZD4AimoXaAzcYIQSa+CuHCCaH0kGP0kGOmfmP0AGP0AGP0AGOpo6H0AGOmH/QAY/QAY/QAY6YeY6YeY6YeY+gIY6QAY6K1QKRJQLtQQ1IISURBTskCTiFSCAdRAk4hUgglQKRnUANSCQAF2AAoSoSGhMQIBSAF5AXoCAUgBfwGAAvmv9XaiaGmD/Sh9AH0AfQB9AH0AamkAfQBqegJ6AmiRaH0oGOkAaQB9ABj9ABjokTdZxw+RaGmf/QBpg5DhAvki6QBpAGkAfQBpn+mCaYDowIBFTba2tra2tra2tra4cRBhgEqUYYBhgEi4cUqUYYLhgEi4cUi4cYarDSsNQAF7AXwB9a7jdqJoaYOY/SgY/QAY/QAY/QAY/QAY/QAY6mkAGP0AGOoY+gIY+gIY6Oh9JBj9JBjpn5j9ABj9ABj9ABjqaOh9AGmH/QB9AH0AaYfph+mH+gJpAGiUqKQIJSQJk6ojmCo2EIZ4AsCTiBDQkVQA1IIpgNApi1QQ1IIRwAF9AApWEbPDAACoVhpWGlYaVhpWGlYaVhpWGlYaVhpWGvAN+CdvEA0RHA0MERsMCxEaCwoRGQoJERgJCBEXCAcRFgcGERUGBREUBQQREwQDERIDAhERAgEREAHwDkQwAf6CGASoF8gAoVMBqCOpBFKXqIEnEKClgScQqQRSmaiBJxCpBIIQO5rKACanZIEnEKkEeqkEghAvrwgAonC2CaBQCKAlp2SBJxCpBHqpBIIQL68IAKJwtglTo6FTSKEngjAN4Lazp2QAAKhQDakEBoIwDeC2s6dkAACoUAWpBEugAX4AEBkYEGcQRRMUAgFIAYEBggDRr212omhpg5j9KBj9AH0AfQBrpmh9JBj9JBjpn5j9ABj9ABj9ABjqaOh9ABjph/0AGP0AGP0AGOmHmOmHmOmHmPoCGOkAGOiSU7JAk4hUgikpVECTiFSCUCiiUJoBUCkB0CiQ1CxUglDAAcOk3dqJoaYOY/SgY/QAY/QAY/QAY/QAY/QAY6mkAGP0AGOoY+gIY+gIY6Oh9JBj9JBjpn5j9ABj9ABj9ABjqaOh9ABjph5j9ABj9ABj9ABjph5jph5jph5j6AhjpAGjItvGGwGDAFelYdqJoaYP9KBj9ABj9ABj9ABj9ABj9ABjqGOkAGP0AGOoY+gIY+gIY6PgBQGG+CiIAcj6UsltbQLIzPQAjQWAAAAAAAAAAAAgAAAAAAAAAAAAAAAAEM8W9ABwzwtHyQHIz4TQzMz5FsjPigBAy//PUAGEART/APSkE/S88sgLAYUCAWIBhgGHAgLOAYgBiQA7oVK/2omhqegJpAH0AfQBpn+mf6ZP6Ammf/QB9AGjAgEgAcEBwgIBIAGKAYsAfTtou37JW6RMY4iJdDTP/oA+gAx0QO6lVMBvsMAkXDimjA0UIOgB20D2zHgMeKCAMNQcPg2XLyUoRmgCJFb4oAP3O1E0NT0BNIA+gD6ANM/0z/TJ/QE0z/6APoA0Spukl8N4CrQ+kj6SPpIMdMP0Q/THzHTH9M/IoIQoKCwV7qOnDAhghClp8v4upF/mSGCCNjTebrDAOKTXwQ84w3jDQrIzBn0ABfKAFAF+gJQA/oCyz/LP8sn9ADLPwH6AoAGMAY0BjgH++JJWEND6SNHIz4QKjQgYEXme2F+c0hqrERc/K0Nvq1tMVzMj0rt4/LiOtFNpLCDPFn/PI8jIz4QKUjD6Usko+kQxbQXI+lJAFYMH9EPIz4SAGfpSF/pSERSmCqoAgScQIaiBH0CgIaGlgR9AWKGpBAERFMsPz4hOIvQAz4RAFQGPAcJsIj/4kvgoiCHIz4Qg+lIV+lLJeFFVyM+DywTPhaDMzPkWhPewgAtQBdckyM+KAEDOE8v3z1ASxwXy4EkN+gAwI5VR07rDAJI9cOKVU8G6wwCRcOKZbCFQWqBwVBUAkTziAeAADAH6AsntVAHg9ADPgclQA8zIz5AAAACAyc8UjQhgAZsyfMCfBf7JtYmZmxd63Ulv4FsArI0rBFdGa3wtgHWkyPpSz4RAyc8Uz4gAAckBERDIz4TQzMz5FsjPigBAy//PUBLHBfLgSQ2CEKWny/i6l1HFupJwNd7jDQGQAFwjbrOfI9DTP/oAMfoAMdEdusMAkjxw4o4UAtDTPzH6APoAMdH4l7YIF6AGbQLeAgEgAZMBlAG7RTAJEw4TEhpHD4KMj6UlJw+lImzxTJbW2IA8jMcc8LTxL0APQAySSCCcnDgKDIz4mIAVMjyM+E0MzM+RbPC/8B+gKBAIzPC3ASzMzPkoKCwQoUyz9Y+gLJgBH7AAGAGjAm87aLt+/iRkvAB4CDHAJEw4O1E0PpI1NIA0z/6ANEF1ywmm5CsZOMPA8j6UhLMygDLPwH6AsntVIAGVAZYB1TtRND6SNTSANM/+gDR+CjI+lJSUPpSJM8UyW1tiAPIzHHPC08S9AD0AMn4kgLIz4TQzMz5FsjPigBAy//PUMcFkl8G4QXTHzHXLCUFBYIU8r/TPzH6ADAVoAPI+lISzMoAEss/AfoCye1UgAaMByDAhlF8F2zHgIY7YMfiXghAF9eEAvvKwf/goyPpSUkD6UiPPFMltbYgDyMxxzwtPEvQA9ADJggr68IDIz4kIAVMjyM+E0MzM+RbPC/8B+gKBAIzPC3ASzMzPk03IVjLJcfsAAd8BowNi1ywlBQWCBI8m1ywhkLZQTI6Z1ywlBQWCLJ8w+JeCCvrwgL7ysFUD8ALjDuMNVTDjDQGXAZgBmQL81ywlBQWCDI4SbFHXLCapk7bcMZLbMeCED/Lw4dM/+gAwI5v4l4IQF9eEAL7DAJFw4pUgwgDDAJFw4vKw+CiIUxfIz4QgEvpS+lLJeFEiyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1CCEBHhowD4KMj6UlKA+lInAeABmgH8MPiS+Cgk0PpIMfpIMdMP+lAx9AQx0gAx0SXQ+kgx+kgx0w8x+lD0BDHSADHRyM+ECo0IGBF5nthfnNIaqxEXPytDb6tbTFczI9K7ePy4jrRTaSwgzxZ/zyPIyM+EClIw+lLJKvpEMW0FyPpSQBWDB/RDyM+EgFKw+lIW+lIEAZsB/DAhm/iXghAX14QAvsMAkXDi8rAgpPgoJND6SDH6SDHTD/pQMfQEMdIAMdEl0PpIMfpIMdMPMfpQ9AQx0gAx0cjPhAqNCBgReZ7YX5zSGqsRFz8rQ2+rW0xXMyPSu3j8uI60U2ksIM8Wf88jyMjPhApSMPpSySr6RDFtBcj6UgGdAcLPFMltbYgDyMxxzwtPEvQA9ADJAcjPhNDMzPkWyM+KAEDL/89Q+JJtghAI8NGAiwTIz5A+KfqWGcs/UAf6AhP6UvpU9ABQA/oCE87JyM+FiBP6UgH6AnHPC2rMyXH7AFUDAaMB+qYKqgCBJxAhqIEfQKAhoaWBH0BYoakEUATLD8+ITiIS9ADPhEAT9ADPgcnPFMjPkAAAAIDJzxSNCGABmzJ8wJ8F/sm1iZmbF3rdSW/gWwCsjSsEV0ZrfC2AdaTI+lLPhEDJzxTPiAAByQHIz4TQzMz5FsjPigBAy//PUMcFAZwAGvLgSfiXFaAQNEEw8AIC/EAVgwf0Q8jPhIBSsPpSFvpSBKYKqgCBJxAhqIEfQKAhoaWBH0BYoakEUATLD8+ITiIS9ADPhEAT9ADPgcnPFMjPkAAAAIDJzxSNCGABmzJ8wJ8F/sm1iZmbF3rdSW/gWwCsjSsEV0ZrfC2AdaTI+lLPhEDJzxTPiAAByQHIiQHZAZ4AfM8WzMz5FsjPigBAy//PUIIQEeGjAPgo+JLIz5L4+MXmFss/+lIU+lLJyM+FiBL6UlAD+gJxzwtqEszJcfsAAfu1s72omh9JGppABjpn5j9ABjo/BQQ6H0kGP0kGOmH/SgY+gIY6QAY6IFofSQY/SQY6YeY/Sh6AhjpABjo5GfCBUaEDAi8z2wvzmkNVYiLn5Wht9WtpiuZkeldvH5cR1optJYQZ4s/55HkZGfCBSkYfSlkk30iGLaC5H0pIArABoQF9tjgdqJofSRqaQAY6Z+Y/QAY6PwUZH0pCX0pZmS2tsQB5GY454WniXoAegBkgORnwmhmZnyLZGfFACBl/+eoQAaMB/IMH9EPIz4SAF/pSFPpSBKYKqgCBJxAhqIEfQKAhoaWBH0BYoakEUATLD8+ITiL0AM+EQBP0AM+ByVjMyM+QAAAAgMnPFI0IYAGbMnzAnwX+ybWJmZsXet1Jb+BbAKyNKwRXRmt8LYB1pMj6Us+EQMnPFM+IAAHJAcjPhNDMzAGiABb5FsjPigBAy//PUAEU/wD0pBP0vPLICwGkAgFiAaUBpgICzgGnAagCASABvQG+AgEgAakBqgIBIAG6AbsDuTtou37+JHjAiDHAJEw4O1E0NT6APoA+gD6ANM/9AT0BNEn0PpI+kjU0dD6SPpI0w/6UPQE0gDRERDXLCUFBYIU4w8HyMxQBvoCUAT6Alj6AgH6Ass/9AD0AMntVIAGrAawBrQAxBRfBCBulTHQ9ATR4TBtiyJxCFmBAQv0EoAL87UTQ1PoA+gD6APoA0z/0BPQE0SfQ+kgx+kjUMdH4kvgoiCHIz4Qg+lIU+lLJeFFEyM+DywTPhaDMzPkWhPewgAtQBNckyM+KAEDOEsv3z1DHBfLgSQjTHzHXLCUFBYKc8r/TP/oAMBCJEHgQZxBWEEUQNBAj8AIHyMxQBvoCAeABrgCENgXTPzH6ADD4klAHxwWW+JcmvsMAkXDi8uBJJacKIqYKqQRRzKBQbKEQ3hDNELwQqxCaEIkQeBBnEDZFQEEwcPADAqLXLCUFBYIkjjw2NgTTPzH6ADAkbrOX+JIlxwXDAJFw4pb4lyG+wwCRcOLy4EkQ3hDNELwQqxCaEIkQeBBnEDZFQBNw8AOPCdcsI5sWhOTjD+IBrwGwACZQBPoCWPoCAfoCyz/0APQAye1UAf7TPzH6APpQMPiS+CiIIcjPhCD6Uhv6Usl4UbvIz4PLBM+FoMzM+RaE97CAC1AL1yTIz4oAQM4Zy/fPUBjHBZUmbrPDAJFw4pZQZ8cFwwCTNzVw4vLgSSWnCiKmCqkEUaqgBnALoRDvEN4QzRC8EGsQmhCJEHgQRxA2RUAQI/ADAeADUjI2MdcsJQUFghyPGTRbOtcsJqmTttyUXwrbMeDXLCUFBYKM4w/jDVUGAbEBsgGzAcrTP/oAMFMTgED0Dm+hjtHSADH6APpI0YghyM+EIPpSHvpSyXhR7sjPg8sEz4WgzMz5FoT3sIALUA7XJMjPigBAzhzL989Q+JLHBZVQCrrDAJMwOXDil1CIgED0WzCROOKTXwM44gHgAdrXLCUFBYKUjhJskdcsJpuQrGQxktsx4IQP8vDh+JL4KIghyM+EIPpSHfpSyXhR3cjPg8sEz4WgzMz5FoT3sIALUA3XJMjPigBAzhvL989QGscF8uBJCNM/+gAwEIkQeBBnEFYQRRA0ECPwAlVgAeAE/viSAdM/1woAIJY0NVICxwWOHzMlbpU1UgPHBY4SMwTQ9ATRUkCBAQv0Cm+hMRAk4hLi8uBJ+JctlCKzwwCRcOKCEBfXhACCEAvrwgDjBL7ysFMEgQEL9ApvoZX6APoA0ZMwcCDiVGPD4wRUY6PjBCOUOTpwIOMOK8IA4w8nwgABtAG1AbYBtwAoUcGhUayhUieBAQv0WTAQrAYKULkAPMjPhQhSMPpSUAz6AoIQ1TJ2288LihXLP8lx+wAQOQAENToBDpRfAzQ44w0BuAL8LJQhs8MAkXDighAU3JOAghAF9eEA4wQNlCGzwwCRcOKCEAvrwgBw4wQnpAPIygAp+gJSIPpSVCCIgED0Q/goiCHIz4Qg+lIW+lLJeFFmyM+DywTPhaDMzPkWhPewgAtQBtckyM+KAEDOFMv3z1D4KG2LBFYQKsjPkoKCwU4dAeABuQDyyz9QDfoCFfpSEvpU9ABQCPoCzsnIz4WIF/pSUAf6AnHPC2oVzMkgcYMJsfsIJHJx4wT4OSBugSMoIuMEIW6BUUBYA+MEUCOoFqCAMIFoAHD4PKAFcPg2FaAEcPg2FKCAMIFoAIIQCWYBgHD4N6AavPKwAYAR+wBHdwCxFMTgED0Dm+hjkrSAPoA+kjRUTG68uBJAZMxFaCOLFF3oFMTgQEL9ApvoZX6APoA0ZMwcCDiUAmgyFAJ+gJQCPoCQBOBAQv0QVAE4lBCgED0WzBQA5JfA+KABuQybDMibo4wMlMjgQEL9ApvoZX6APoA0ZMwcCDiUROgURKgyFj6AgH6AkA0gQEL9EFQgqBQV6AE4DMB0PQE0SCBAQv0gm+lcFMAkQOK6BVfBYEnELrysQigUFegBIAG8AKIE0w/RoFNgqIEnEKkEU2GogScQqQRTSYEBC/QKb6GV+gD6ANGTMHAg4lI4oaBSFaEWoCTIUAX6AgH6AkA5gQEL9EFRJIEBC/R0b6UQSUUzRBQAa7zuh2omhqfQAY/QAY/QAY/QAY6Z+Y+gIY+gIY6Oh9JBj9JBjqaOh9JH0kaYf9KHoCaQBo+ADAIBbgG/AcAAK7Cme1E0NT6APoA+gD6ANM/9AT0BNGAAq7P3+1E0NT6ADH6APoAMfoA0z8x9AQx9ATRBI4kMwHQ+kgx+kgx1NHQ+kgx+kjTDzH6UDH0BDHSADHRE8cF8uBJ4F8DgQEL9ApvoZX6APoA0ZMwcCDigBPc7aLt+/iRkvAD4CDHAJEw4CDXCx/tRNDU9ATSAPoA+gDTP9M/0yf0BNM/+gD6ANEsghCgoLBguuMCDIIQ03IVjLqSXw3gKW7ycSnQ+kj6SPpI0w/RERDXLCUFBYMElIQP8vDg1ywmm5CsZJNfD1vg1ywlBQWDFOMPCcjMgAcMBxAHFAcYAdQjkX+VKMAAwwDikTDgbCIlpHCCEAjw0YDIz4WIFPpSUAP6AoIQoKCwV88LiifPCz8o+gLJgBH7AEZ2gALw8+JIr0PpI0ccF8uBJDNcsJQUFgwTyv9M/MdTXCgAqbpE6nCr5AAL5ABK68uBJCeIIkjh/kwjDAOIJyMwX9AAYygBQBPoCWPoCyz/LPxPLJxL0AMs/WPoCAfoCye1UAGpsIj74l4IQHc1lAL7ysA3XCz+CEBrSdIDIz4WIH/pSUA76AoIQoKCwQ88Lih3LP8+ByXH7AANw1ywmqZO23I4RE18DPfiSUA3HBZX4lxegBt6PmzHXLCObFoTkjw3XLCUFBYMM4w8QWxA04w0QW+IBxwHIAckAQBj0ABbKAFAE+gJY+gLLP8s/yyf0AMs/WPoCAfoCye1UAvwwKpQkbsMAkXDi8rEGl/gjUAW8wwCSNH/i8rEnggiYloC+8rH4l4IQL68IAL7ysCWk+COmPO1E0NT0BDHSADH6ADH6ADHTPzHTPzHTJzH0BDHTPzH6ADH6ADHR0PpI0cjPhAqJzxZ/zyPIyM+EClIw+lLJKfpEMW0FyPpSQBUBygHLAzDXLCQ4VKvMjwvXLCUFBYMk4w9VkeMNEDQB0AHNAc4D9viS+CiIUxXIz4QgEvpS+lLJeFEiyM+DywTPhaDMzPkWhPewEoALUAPXJMjPigBAzsv3z1DHBfLgSdM/+gD6UDBRsaAnbrOVK26zwwCRcOKWMzo/Dghw4w2OGyTQ0z/6ADH6ANEKupVQCL7DAJMwN3Dikm0z3pIwN+L4lwHgAdwB3QBAYEXme2F+c0hqrERc/K0Nvq1tMVzMj0rt4/LiOtFNpLAC/IMH9EPIz4SAGvpSGvpSERGmCqoAgScQIaiBH0CgIaGlgR9AWKGpBAEREcsPz4hOIvQAz4RAFvQAz4HJUAbMyM+QAAAAgMnPFI0IYAGbMnzAnwX+ybWJmZsXet1Jb+BbAKyNKwRXRmt8LYB1pMj6Us+EQMnPFM+IAAHJUA3IiQHZAcwAZM8WzMz5FsjPigBAy//PUIIQBfXhACbIz4WIE/pSAfoCggjY03nPC4rLP8+EIMmAEfsAA9TXLCGQtlBMj18xPg3XLCUFBYMcjtEw+JeCEAvrwgC+8rD4KIghyM+EIPpSH/pSyXhR/8jPg8sEz4WgzMz5FoT3sIALUA/XJMjPigBAzh3L989QEKwQmxCKEHkQaBBXEEYQNUQw8AHjDuMNAeABzwHQAf74ku1E0NT0BDHSADH6ADH6ADHTPzHTPzHTJzH0BDHTPzH6ADH6ADHR0PpI0cjPhAqNCBgReZ7YX5zSGqsRFz8rQ2+rW0xXMyPSu3j8uI60U2ksIM8Wf88jyMjPhApSMPpSySf6RDFtBcj6UkAVgwf0Q8jPhIBSgPpSUnD6UlYVAdQC/NcsJQUFgsyO8dcsJQUFgtSS8j/h+JL4KIghyM+EIPpSARERAfpSyXgREVYRyM+DywTPhaDMzPkWhPewgAsBERHXJMjPigBAzh/L989QHscF8uBJDNM/+gAwIpVRErrDAJIxcOKVUwy6wwCRcOKZMTtQSqBwVBSqkTDi4w1VGQHgAdEB/viS7UTQ1PQEMdIAMfoAMfoAMdM/MdM/MdMnMfQEMdM/MfoAMfoAMdHQ+kjRyM+ECo0IGBF5nthfnNIaqxEXPytDb6tbTFczI9K7ePy4jrRTaSwgzxZ/zyPIyM+EClIw+lLJJ/pEMW0FyPpSQBWDB/RDyM+EgBj6Uhb6UhETpgoB0gBa+JJQDscF8uBJDNM/+gAwIpVRErrDAJIxcOKULLrDAJIwcOKYMFCaoHBUGareAf6qAIEnECGogR9AoCGhpYEfQFihqQQBERPLD8+ITiL0AM+EQBT0AM+ByVjMyM+QAAAAgMnPFI0IYAGbMnzAnwX+ybWJmZsXet1Jb+BbAKyNKwRXRmt8LYB1pMj6Us+EQMnPFM+IAAHJUA/Iz4TQzMz5FsjPigBAy//PUMcF8uBJAdMAOAzXCz/4lxC9EKwQmxCKEHkQaBBXEEYQNRAk8AIB/qYKqgCBJxAhqIEfQKAhoaWBH0BYoakEzwsPz4hOIhT0AM+EQBP0AM+ByVjMyM+QAAAAgMnPFI0IYAGbMnzAnwX+ybWJmZsXet1Jb+BbAKyNKwRXRmt8LYB1pMj6Us+EQMnPFM+IAAHJAcjPhNDMzPkWyM+KAEDL/89QxwXy4EkB1QH00z/XLAGTgQCEjhbXLAOW+kgxgQCFmtcsBZLyP+GBAIbi4gHTADHSAPoAMfoA+gAwUUu9kjp/lQrAAMMA4pZfD18D2zHgcPgjKruYgQCGUAO6wwCSMiHiksMAkjAg4pUowgDDAJEg4pUhwgDDAJEg4pcEERAEOF8E4w0B1gGmU7uCCJiWgL6OvyCBJxCogScQVhOmCqoAXKiBH0CgIaGlgR9AWKGpBKCpBFEzqFCjoBKpBIEl5KiBJxCpBCDCAJYwED83XwPjDZgwBBEQBDhfBOIB1wH8NiikKcjLPyn6Aif6AslRyaH4KO1E0NT0BDHSADH6ADH6ADHTPzHTPzHTJzH0BDHTPzH6ADH6ADHR0PpI0cjPhAqNCBgReZ7YX5zSGqsRFz8rQ2+rW0xXMyPSu3j8uI60U2ksIM8Wf88jyMjPhApSMPpSySn6RDFtBcj6UkAVAdgC/oMH9EPIz4SAGvpSGPpSERWmCqoAgScQIaiBH0CgIaGlgR9AWKGpBAERFcsPz4hOIvQAz4RAFvQAz4HJUATMyM+QAAAAgMnPFI0IYAGbMnzAnwX+ybWJmZsXet1Jb+BbAKyNKwRXRmt8LYB1pMj6Us+EQMnPFM+IAAHJARERyIkB2QHaAAE0Af7PFszM+RbIz4oAQMv/z1AoghAdzWUAoG3Iz5MRCUA+UAn6AinPCycY9ADPhIDJghAL68IAbcjPkoKCwZItzws/ySfI+lJQA/oC9ADPgVJg+lLPhCD0AM+BFfpSycjPkpafL+Ibyz9QCfoCE8wYzMnIz4WIF/pSUAT6AnHPC2oVAdsAGMzJgBH7ABA7EEYTFAH87UTQ1PQEMdIAMfoAMfoAMdM/MdM/MdMnMfQEMdM/MfoAMfoAMdHQ+kjRyM+ECo0IGBF5nthfnNIaqxEXPytDb6tbTFczI9K7ePy4jrRTaSwgzxZ/zyPIyM+EClIw+lLJKPpEMW0FyPpSQBWDB/RDyM+EgFKQ+lIY+lIRFaYKAd4BsIIQC+vCAL6OzPgoiCHIz4Qg+lIZ+lLJeFGZyM+DywTPhaDMzPkWhPewgAtQCdckyM+KAEDOF8v3z1AQrBCbEIoQeRBXEEYQNUQw8AEQewoQeQgGVTGRNuIB4AH8qgCBJxAhqIEfQKAhoaWBH0BYoakEAREVyw/PiE4iEvQAz4RAFfQAz4HJARESzMjPkAAAAIDJzxSNCGABmzJ8wJ8F/sm1iZmbF3rdSW/gWwCsjSsEV0ZrfC2AdaTI+lLPhEDJzxTPiAAByVADyM+E0MzM+RbIz4oAQMv/z1AaAd8ACMcFwwABFP8A9KQT9LzyyAsB4QIBYgHiAeMCAs0B5AHlAgFIAgkCCgIBIAHmAecC99dqJofQB9JH0kEvGAKfDjgscc/BUp2WRnwhAJfSl9KWS8FqoJGWRnweWCZ8LQZmZ8i0J72AlABagB65JkZ8UAIGdl++eoF+OC+XAlb5BjgFnMEGuFgGGAYYBIuHFHC5BrpU6Qa6ZofShpn/0AaZ/oyja4KYBxSja4KYBxQCAAIBAgEgAegB6QIBIAH+Af8E9T4keMC1ywlBQWEROMC1ywlBQWELI7j0z/XCwIgwQLyse1E0PoA+kj6SPADIG6OSNDTP/oA+kjR+JLHBfLgSfiSI6QTuviXcPgnbxBYoSG2CbYJgBD7AsjPhQgT+lKCEKCgsIbPC44Uyz8SywLKAAH6AsmBAJD7AOMN4IAHqAesB7AHtAGU7aLt+yBukjBt4JVbbdsxMO3juo4W0NcsJQUFgzTyv9M/0SDCAAFt4wTbMe1B7fEB8v+AC/NMfMXBwcAPXLCC8aijMltM/MfoAMI4+1ywlBQWCpJhsItM/+gAwf44p1ywj3uy+9JbTPzH6ADCOFjFsEtcsJQUFgsSS8j/h0z/6ADASfwHiQwPiQDPi7UTQ+gD6SPpIUTSgJo4SI8cAs5gj1wsAwwDDAJFw4sMAkXDi4wDIAQHuAe8A+O1E0PoA+kj6SATTP9MC+kgw+JIkxwWVIcECwwCRcOLy4EoQNV5Q8ANwcCJukjI0jhlb0NM/+gD6SNEkpBO6lQTHBcMAkzEzcOID4vgnbxD4l6FwtgmAEPsC+JLIz4UI+lKCEKCgsInPC44Syz8SywISygAB+gLJgQCQ+wAAZDD4kviXcPgnbxBYoSG2CbYJgBD7AsjPhQj6UoIQoKCwhs8LjhLLP8sCz4QQyYEAkPsABNKJ1yfjAtcsJQUFgrSOH9M/+gAw+JL4l21tggr68ICLBHB/+JNw+DoQihB58ATg1ywgvGoozI4h0z/6APpQ+lD6APiS+JdwcPiTcPg6EEoQORBIXjMQNfAE4NcsJQUFgqTjAtcsIHxT9SwB8AHxAfIB8wCSI9dKnyPXTND6UDHTP/oA0z8x0ZJwIOJRGbqUJbrDAJIwcOKOI1RwIW0H8APIz4MFyPpUcM8Lg8lQBcwkbpE0kxTMA+IDz1AD3gCy+gJSIPpSUhD6UhPOye1UA44k+JLHBfLgSsjPhQhSIPpSghCgoLBazwuOJM8LPyH6AsmAQPsAkTDiAo4ayM+FCPpSghCgoLBSzwuOEss/AfoCyYBA+wDgXwMACKCgsIEC/O1E0PoA+kj6SPiSIscF8uBKBNM/+gD6SNcKACLCAPKxIHFy4wQkuvKxVHZUKvADbvLgSI4kU0DHBY4UJscAs5gG1wsAwwDDAJI2cOKzwwCSNnDi8uBIiwwG3lFRoMgnxwCzmCfXCwDDAMMAkXDizwoAJ9dKlTdtcFMA4w0DyAH0AfUAQtM/+gD6UPpQ+gD4kviXf3D4k3D4OhBKEDkQSF4zEDXwBAQ24wLXLCUFBYKc4wLXLCUFBYK84wLXLCLK+D3kAfYB9wH4AfkAGgfXTND6UNM/+gDTP9EA0PpUEss/AfoCyz/JUAfMIsjLPyL6AlJg+lLJzxTPUMhQB/oCFPpSEvpSFM7J7VT4J28Q+JehcLYJgDCBaACCEAlmAYBw+De2CYAQ+wLIz4UIEvpSghCgoLBQzwuOEss/AfoCyYEAkPsAAfzTP/oA+kj6UPQB+gAg9AQBbpEwkdHiI/pEMPLRTfiX+JNw+DojcnHjBPg5IG6BIygi4wQhboFRQFgD4wRQI6gloIAwgWgAcPg8oAFw+DagAXD4NqCAMIFoAIIQCWYBgHD4N6C88rDtRND6ACD6SPpIMPiSIscF8uBJUzi+8q8B+gH+0z/6APpI+lD0BPoAIPQEAW6RMJHR4iT6RDDy0U34lyKCCJiWgKD4k3D4OiFyceME+DkgboEjKCLjBCFugVFAWAPjBFAjqBOggDCBaABw+DygAnD4NhKgAXD4NqCAMIFoAIIQCWYBgHD4N6C88rDtRND6APpI+kj4kiPHBfLgSQH7AO74l/g5IG6BF3BY4wRxgQLycPg4AXD4NqCBFXxw+DagvPKw7UTQ+gD6SPpI+JIjxwXy4EkE0z/6ADAgwgCVU0C+wwCRcOLyr1FEocgB+gJSMPpSUiD6UhXOye1UyM+FiPpSghCgoLBYzwuOE8s/AfoC+lLJgFD7AAH8jnD4l/g5IG6BF3BY4wRxgQLycPg4AXD4NqCBFXxw+DagvPKw7UTQ+gAg+kj6SDD4kiLHBfLgSQTTP/oA+lAwU1G+8q9RUaHIAfoCFM7J7VTIz5Hvdl96yz9Y+gL6UvpUycjPhYgS+lJxzwtuzMmAUPsA4NcsJpuQrGQx3IQPAf0AxlE4ocgB+gISzsntVPgqJsjPhCD6UhP6Usl4yM+QXjUUZhrLP1AI+gL6VBT6VFj6As7JyM+JiAFUdCXIz4PLBM+FoMzM+RaE97AEgAsn1yQ2Fc4Sy/eBFQ3PC3nMzMzJgFD7AAH8Uzm+8q9ROaEjxwCzmCPXCwDDAMMAkXDijjMG8YAB2iEgbvJxVGYwUjbwA8jPgynI+lQszws/K/oCFcs/yVAEzCNukTOTE8wC4gLPUAKRNuLIUAb6AlIQ+lJSUPpSEs7J7VT4KibIz4Qg+lIV+lLJeMjPkoKCwVIayz9QCPoCAfwAePpUFPpUAfoCEs7JyM+JiAFUdCXIz4PLBM+FoMzM+RaE97AEgAsn1yQ2Fc4Sy/eBFQ3PC3nMzMzJgFD7AAAE8vAA4Ttou37mFt/cG3bMV8D7eO6jlf0BCFukTGS0dDiINdJkXCXINdKwADDAOKWMHBwbdsx4CDXCx+CEOjbRpa9ljB/cG3bMeDXLCdG2jS08r/SH/QE0SHAAAKVIG6zwwCRf+IB8YAB2iES2zHtQe3xAfL/gAB8bDEg10rBApIwbeDUMddMgAPxT4ccF8uBKIMcAs5gg1wsAwwDDAJFw4vLQSFRjMFIw8AOLDCFukTGOVAHQ0z/6APpI0cgkxwCzmCTXCwDDAMMAkXDizwoAJNdKnQTXTND6UNM/+gDTP9GVNG1wUwDiA8j6VBLLPwH6Ass/yVAEzALIyz8B+gIS+lLJzxTPUOIC/CNus5UubrPDAJFw4pZT48cFwwCRcOIlxwCzmCXXCwDDAMMAkXDikyDDAJFw4pYs8YAC2iOTcHBt4iBus5QkusMAkjBw4idus5ZWEm6zwwCRcOKYVhJQCMcFwwCSN3Dil1YSUAW6wwCSNHDikjVw4w0FksMAkjBw4pMj8rDeJAICAgMAPCCOEgWdIpF/llYRJLrDAOLDAJFw4pU1VhEkuuLDAAT2xwCzmCTXCwDDAMMAkXDimFYSJscFs8MAkXDilCOzwwCRcOKROOMNUW6gIo4jVHBUbQfwA8jPgwXI+lRwzwuDyVAFzCRukTSTFMwD4gPPUAPeyAH6AlJQ+lJSQPpSE87J7VRUZk3jBFQmO+MECuMPIZMwNn+VF8cFwwDiAgQCBQIGAgcA0HODCnD4OBm2CYIK+vCAggiYloBy+DkgboEjKCLjBCFugVFAWAPjBFElqBOggDCBaABw+DygAnD4NhKgAXD4NqCAMIFoAIIQCWYBgHD4N6CCAOpgcPg2oAKqABKggghMS0Cgtgksu/KwAFY2NoIImJaAyM+FCBf6UlAG+gKCEKCgsGfPC4oSyz/LPyb6AhPKAMmAEfsAAG5sIjIkjizIz5HNi0JyKc8LPyj6AlJg+lQUzsnIz4UIFPpSUAT6AnHPC2oSzMmAEfsAAZMwbCLiAfqVIG6zwwCRcOKVIsIAwwCRcOKOUAWOJYIImJaAyM+FCBb6UlAF+gKCEKCgsFHPC4oizws/AfoCyYAR+wCOJYIImJaAyM+FCBb6UlAF+gKCEKCgsFDPC4oizws/AfoCyYAR+wDikzA0MOIibpJfA+D4J28QWKH4L6CAMIFoAAIIAEyCEAlmAYBw+De2CXL7AsjPhQgS+lKCENUydtvPC47LP8mBAIL7AAFFuASe1E0PoAMfpIMfpIMSDHALOX1wsAwwDDAJIwcOKRcOMNgCCwAdu7Au1E0PoA+kj6SDD4KoAMhwc4MKIvg4tgmCCvrwgIIImJaAcvg5IG6BIygi4wQhboFRQFgD4wRRJagToIAwgWgAcPg8oAJw+DYSoAFw+DaggDCBaACCEAlmAYBw+DegggDqYHD4NqACqgASoIIITEtAoLYJ');

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
        settlement?: CellRef<LaunchSettlement> | null /* = null */
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

    static createCellOfLaunchConfirmed(body: {
        queryId: uint64
    }) {
        return LaunchConfirmed.toCell(LaunchConfirmed.create(body));
    }

    static createCellOfRetryLaunchSettlement(body: {
        queryId: uint64
    }) {
        return RetryLaunchSettlement.toCell(RetryLaunchSettlement.create(body));
    }

    static createCellOfFinalizeLaunch(body: {
        queryId: uint64
    }) {
        return FinalizeLaunch.toCell(FinalizeLaunch.create(body));
    }

    static createCellOfProbeLaunchSettlement(body: {
        queryId: uint64
        leg: uint3
    }) {
        return ProbeLaunchSettlement.toCell(ProbeLaunchSettlement.create(body));
    }

    static createCellOfLaunchSettlementState(body: {
        queryId: uint64
        leg: uint3
        completed: boolean
        amount: coins
    }) {
        return LaunchSettlementState.toCell(LaunchSettlementState.create(body));
    }

    static createCellOfLaunchMintResolved(body: {
        queryId: uint64
        leg: uint3
        delivered: boolean
        failed: boolean
        amount: coins
    }) {
        return LaunchMintResolved.toCell(LaunchMintResolved.create(body));
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

    async sendLaunchConfirmed(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: LaunchConfirmed.toCell(LaunchConfirmed.create(body)),
            ...extraOptions
        });
    }

    async sendRetryLaunchSettlement(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RetryLaunchSettlement.toCell(RetryLaunchSettlement.create(body)),
            ...extraOptions
        });
    }

    async sendFinalizeLaunch(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: FinalizeLaunch.toCell(FinalizeLaunch.create(body)),
            ...extraOptions
        });
    }

    async sendProbeLaunchSettlement(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        leg: uint3
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ProbeLaunchSettlement.toCell(ProbeLaunchSettlement.create(body)),
            ...extraOptions
        });
    }

    async sendLaunchSettlementState(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        leg: uint3
        completed: boolean
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: LaunchSettlementState.toCell(LaunchSettlementState.create(body)),
            ...extraOptions
        });
    }

    async sendLaunchMintResolved(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        leg: uint3
        delivered: boolean
        failed: boolean
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: LaunchMintResolved.toCell(LaunchMintResolved.create(body)),
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

    async getLaunchSettlement(provider: ContractProvider): Promise<LaunchSettlementReply> {
        const r = StackReader.fromGetMethod(16, await provider.get('get_launch_settlement', []));
        return ({
            $: 'LaunchSettlementReply',
            settlement: r.readWideNullable<LaunchSettlement>(11,
                (r) => ({
                    $: 'LaunchSettlement',
                    queryId: r.readBigInt(),
                    preExistingBalance: r.readBigInt(),
                    phase: r.readBigInt(),
                    factoryConfirmed: r.readBoolean(),
                    confirmInFlight: r.readBoolean(),
                    dropInFlight: r.readBoolean(),
                    retainedBufferLimit: r.readBigInt(),
                    recoveryId: r.readBigInt(),
                    recoveryPending: r.readBigInt(),
                    mintResolving: r.readBigInt(),
                })
            ),
            curveReceived: r.readBoolean(),
            devReceived: r.readBoolean(),
            adminDropped: r.readBoolean(),
            minimumRetryValue: r.readBigInt(),
            retainedBuffer: r.readBigInt(),
        });
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
