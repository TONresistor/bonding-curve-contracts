// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a JettonMinterV2 contract in Tolk.
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

function createDictionaryValue<V>(loadFn_V: LoadCallback<V>, storeFn_V: StoreCallback<V>): c.DictionaryValue<V> {
    return {
        serialize(self: V, b: c.Builder) {
            storeFn_V(self, b);
        },
        parse(s: c.Slice): V {
            const value = loadFn_V(s);
            s.endParse();
            return value;
        }
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

type uint3 = bigint
type uint64 = bigint
type uint256 = bigint

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
 > enum LaunchMintPhase { 3 variants }
 */
export type LaunchMintPhase = bigint

export const LaunchMintPhase = {
    Issued: 0n,
    Delivered: 1n,
    Failed: 2n,

    fromSlice(s: c.Slice): LaunchMintPhase {
        return s.loadUintBig(2);
    },
    store(self: LaunchMintPhase, b: c.Builder): void {
        b.storeUint(self, 2);
    },
    toCell(self: LaunchMintPhase): c.Cell {
        return makeCellFrom<LaunchMintPhase>(self, LaunchMintPhase.store);
    }
}

/**
 > struct LaunchMintAttempt {
 >     queryId: uint64
 >     amount: coins
 >     recipient: address
 >     phase: LaunchMintPhase
 > }
 */
export interface LaunchMintAttempt {
    readonly $: 'LaunchMintAttempt'
    queryId: uint64
    amount: coins
    recipient: c.Address
    phase: LaunchMintPhase
}

export const LaunchMintAttempt = {
    create(args: {
        queryId: uint64
        amount: coins
        recipient: c.Address
        phase: LaunchMintPhase
    }): LaunchMintAttempt {
        return {
            $: 'LaunchMintAttempt',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchMintAttempt {
        return {
            $: 'LaunchMintAttempt',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            recipient: s.loadAddress(),
            phase: LaunchMintPhase.fromSlice(s),
        }
    },
    store(self: LaunchMintAttempt, b: c.Builder): void {
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        b.storeAddress(self.recipient);
        LaunchMintPhase.store(self.phase, b);
    },
    toCell(self: LaunchMintAttempt): c.Cell {
        return makeCellFrom<LaunchMintAttempt>(self, LaunchMintAttempt.store);
    }
}

/**
 > struct LaunchMintJournal {
 >     curve: address
 >     attempts: map<uint64, Cell<LaunchMintAttempt>>
 > }
 */
export interface LaunchMintJournal {
    readonly $: 'LaunchMintJournal'
    curve: c.Address
    attempts: c.Dictionary<uint64, CellRef<LaunchMintAttempt>> /* = [] as map<uint64, Cell<LaunchMintAttempt>> */
}

export const LaunchMintJournal = {
    create(args: {
        curve: c.Address
        attempts: c.Dictionary<uint64, CellRef<LaunchMintAttempt>> /* = [] as map<uint64, Cell<LaunchMintAttempt>> */
    }): LaunchMintJournal {
        return {
            $: 'LaunchMintJournal',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchMintJournal {
        return {
            $: 'LaunchMintJournal',
            curve: s.loadAddress(),
            attempts: c.Dictionary.load<uint64, CellRef<LaunchMintAttempt>>(c.Dictionary.Keys.BigUint(64), createDictionaryValue<CellRef<LaunchMintAttempt>>(
                (s) => loadCellRef<LaunchMintAttempt>(s, LaunchMintAttempt.fromSlice),
                (v,b) => storeCellRef<LaunchMintAttempt>(v, b, LaunchMintAttempt.store)
            ), s),
        }
    },
    store(self: LaunchMintJournal, b: c.Builder): void {
        b.storeAddress(self.curve);
        b.storeDict<uint64, CellRef<LaunchMintAttempt>>(self.attempts, c.Dictionary.Keys.BigUint(64), createDictionaryValue<CellRef<LaunchMintAttempt>>(
            (s) => loadCellRef<LaunchMintAttempt>(s, LaunchMintAttempt.fromSlice),
            (v,b) => storeCellRef<LaunchMintAttempt>(v, b, LaunchMintAttempt.store)
        ));
    },
    toCell(self: LaunchMintJournal): c.Cell {
        return makeCellFrom<LaunchMintJournal>(self, LaunchMintJournal.store);
    }
}

/**
 > struct MinterStorageV2 {
 >     totalSupply: coins
 >     adminAddress: address?
 >     nextAdminAddress: address?
 >     metadata: cell
 >     launchJournal: Cell<LaunchMintJournal>?
 > }
 */
export interface MinterStorageV2 {
    readonly $: 'MinterStorageV2'
    totalSupply: coins
    adminAddress: c.Address | null
    nextAdminAddress: c.Address | null
    metadata: c.Cell
    launchJournal: CellRef<LaunchMintJournal> | null /* = null */
}

export const MinterStorageV2 = {
    create(args: {
        totalSupply: coins
        adminAddress: c.Address | null
        nextAdminAddress: c.Address | null
        metadata: c.Cell
        launchJournal?: CellRef<LaunchMintJournal> | null /* = null */
    }): MinterStorageV2 {
        return {
            $: 'MinterStorageV2',
            launchJournal: null,
            ...args
        }
    },
    fromSlice(s: c.Slice): MinterStorageV2 {
        return {
            $: 'MinterStorageV2',
            totalSupply: s.loadCoins(),
            adminAddress: s.loadMaybeAddress(),
            nextAdminAddress: s.loadMaybeAddress(),
            metadata: s.loadRef(),
            launchJournal: s.loadBoolean() ? loadCellRef<LaunchMintJournal>(s, LaunchMintJournal.fromSlice) : null,
        }
    },
    store(self: MinterStorageV2, b: c.Builder): void {
        b.storeCoins(self.totalSupply);
        b.storeAddress(self.adminAddress);
        b.storeAddress(self.nextAdminAddress);
        b.storeRef(self.metadata);
        storeTolkNullable<CellRef<LaunchMintJournal>>(self.launchJournal, b,
            (v,b) => storeCellRef<LaunchMintJournal>(v, b, LaunchMintJournal.store)
        );
    },
    toCell(self: MinterStorageV2): c.Cell {
        return makeCellFrom<MinterStorageV2>(self, MinterStorageV2.store);
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
 > struct (0xa0a0b056) InternalCurveMint {
 >     queryId: uint64
 >     jettonAmount: coins
 > }
 */
export interface InternalCurveMint {
    readonly $: 'InternalCurveMint'
    queryId: uint64
    jettonAmount: coins
}

export const InternalCurveMint = {
    PREFIX: 0xa0a0b056,

    create(args: {
        queryId: uint64
        jettonAmount: coins
    }): InternalCurveMint {
        return {
            $: 'InternalCurveMint',
            ...args
        }
    },
    fromSlice(s: c.Slice): InternalCurveMint {
        loadAndCheckPrefix32(s, 0xa0a0b056, 'InternalCurveMint');
        return {
            $: 'InternalCurveMint',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
        }
    },
    store(self: InternalCurveMint, b: c.Builder): void {
        b.storeUint(0xa0a0b056, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
    },
    toCell(self: InternalCurveMint): c.Cell {
        return makeCellFrom<InternalCurveMint>(self, InternalCurveMint.store);
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
 > struct (0xa0a0b058) BurnNotificationTracked {
 >     queryId: uint64
 >     jettonAmount: coins
 >     burnInitiator: address
 > }
 */
export interface BurnNotificationTracked {
    readonly $: 'BurnNotificationTracked'
    queryId: uint64
    jettonAmount: coins
    burnInitiator: c.Address
}

export const BurnNotificationTracked = {
    PREFIX: 0xa0a0b058,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
    }): BurnNotificationTracked {
        return {
            $: 'BurnNotificationTracked',
            ...args
        }
    },
    fromSlice(s: c.Slice): BurnNotificationTracked {
        loadAndCheckPrefix32(s, 0xa0a0b058, 'BurnNotificationTracked');
        return {
            $: 'BurnNotificationTracked',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            burnInitiator: s.loadAddress(),
        }
    },
    store(self: BurnNotificationTracked, b: c.Builder): void {
        b.storeUint(0xa0a0b058, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.burnInitiator);
    },
    toCell(self: BurnNotificationTracked): c.Cell {
        return makeCellFrom<BurnNotificationTracked>(self, BurnNotificationTracked.store);
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
 > struct (0x7bdd97de) BurnNotificationForMinter {
 >     queryId: uint64
 >     jettonAmount: coins
 >     burnInitiator: address
 >     sendExcessesTo: address?
 > }
 */
export interface BurnNotificationForMinter {
    readonly $: 'BurnNotificationForMinter'
    queryId: uint64
    jettonAmount: coins
    burnInitiator: c.Address
    sendExcessesTo: c.Address | null
}

export const BurnNotificationForMinter = {
    PREFIX: 0x7bdd97de,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
        sendExcessesTo: c.Address | null
    }): BurnNotificationForMinter {
        return {
            $: 'BurnNotificationForMinter',
            ...args
        }
    },
    fromSlice(s: c.Slice): BurnNotificationForMinter {
        loadAndCheckPrefix32(s, 0x7bdd97de, 'BurnNotificationForMinter');
        return {
            $: 'BurnNotificationForMinter',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            burnInitiator: s.loadAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
        }
    },
    store(self: BurnNotificationForMinter, b: c.Builder): void {
        b.storeUint(0x7bdd97de, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.burnInitiator);
        b.storeAddress(self.sendExcessesTo);
    },
    toCell(self: BurnNotificationForMinter): c.Cell {
        return makeCellFrom<BurnNotificationForMinter>(self, BurnNotificationForMinter.store);
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
 > struct (0x6501f354) ChangeMinterAdmin {
 >     queryId: uint64
 >     newAdminAddress: address
 > }
 */
export interface ChangeMinterAdmin {
    readonly $: 'ChangeMinterAdmin'
    queryId: uint64
    newAdminAddress: c.Address
}

export const ChangeMinterAdmin = {
    PREFIX: 0x6501f354,

    create(args: {
        queryId: uint64
        newAdminAddress: c.Address
    }): ChangeMinterAdmin {
        return {
            $: 'ChangeMinterAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeMinterAdmin {
        loadAndCheckPrefix32(s, 0x6501f354, 'ChangeMinterAdmin');
        return {
            $: 'ChangeMinterAdmin',
            queryId: s.loadUintBig(64),
            newAdminAddress: s.loadAddress(),
        }
    },
    store(self: ChangeMinterAdmin, b: c.Builder): void {
        b.storeUint(0x6501f354, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.newAdminAddress);
    },
    toCell(self: ChangeMinterAdmin): c.Cell {
        return makeCellFrom<ChangeMinterAdmin>(self, ChangeMinterAdmin.store);
    }
}

/**
 > struct (0xfb88e119) ClaimMinterAdmin {
 >     queryId: uint64
 > }
 */
export interface ClaimMinterAdmin {
    readonly $: 'ClaimMinterAdmin'
    queryId: uint64
}

export const ClaimMinterAdmin = {
    PREFIX: 0xfb88e119,

    create(args: {
        queryId: uint64
    }): ClaimMinterAdmin {
        return {
            $: 'ClaimMinterAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): ClaimMinterAdmin {
        loadAndCheckPrefix32(s, 0xfb88e119, 'ClaimMinterAdmin');
        return {
            $: 'ClaimMinterAdmin',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ClaimMinterAdmin, b: c.Builder): void {
        b.storeUint(0xfb88e119, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ClaimMinterAdmin): c.Cell {
        return makeCellFrom<ClaimMinterAdmin>(self, ClaimMinterAdmin.store);
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
 > struct (0xcb862902) ChangeMinterMetadata {
 >     queryId: uint64
 >     newMetadata: cell
 > }
 */
export interface ChangeMinterMetadata {
    readonly $: 'ChangeMinterMetadata'
    queryId: uint64
    newMetadata: c.Cell
}

export const ChangeMinterMetadata = {
    PREFIX: 0xcb862902,

    create(args: {
        queryId: uint64
        newMetadata: c.Cell
    }): ChangeMinterMetadata {
        return {
            $: 'ChangeMinterMetadata',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeMinterMetadata {
        loadAndCheckPrefix32(s, 0xcb862902, 'ChangeMinterMetadata');
        return {
            $: 'ChangeMinterMetadata',
            queryId: s.loadUintBig(64),
            newMetadata: s.loadRef(),
        }
    },
    store(self: ChangeMinterMetadata, b: c.Builder): void {
        b.storeUint(0xcb862902, 32);
        b.storeUint(self.queryId, 64);
        b.storeRef(self.newMetadata);
    },
    toCell(self: ChangeMinterMetadata): c.Cell {
        return makeCellFrom<ChangeMinterMetadata>(self, ChangeMinterMetadata.store);
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

/**
 > struct JettonDataReply {
 >     totalSupply: int
 >     mintable: bool
 >     adminAddress: address?
 >     jettonContent: Cell<OnchainMetadataReply>
 >     jettonWalletCode: cell
 > }
 */
export interface JettonDataReply {
    readonly $: 'JettonDataReply'
    totalSupply: bigint
    mintable: boolean
    adminAddress: c.Address | null
    jettonContent: CellRef<OnchainMetadataReply>
    jettonWalletCode: c.Cell
}

export const JettonDataReply = {
    create(args: {
        totalSupply: bigint
        mintable: boolean
        adminAddress: c.Address | null
        jettonContent: CellRef<OnchainMetadataReply>
        jettonWalletCode: c.Cell
    }): JettonDataReply {
        return {
            $: 'JettonDataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): JettonDataReply {
        throw new Error(`Can't unpack 'JettonDataReply' from cell, because 'JettonDataReply.totalSupply' is 'int' (not int32/uint64/etc.)`);
    },
    store(self: JettonDataReply, b: c.Builder): void {
        throw new Error(`Can't pack 'JettonDataReply' to cell, because 'self.totalSupply' is 'int' (not int32/uint64/etc.)`);
    },
    toCell(self: JettonDataReply): c.Cell {
        return makeCellFrom<JettonDataReply>(self, JettonDataReply.store);
    }
}

/**
 > struct (0x00) OnchainMetadataReply {
 >     contentDict: map<uint256, string_prefixed0x>
 > }
 */
export interface OnchainMetadataReply {
    readonly $: 'OnchainMetadataReply'
    contentDict: c.Dictionary<uint256, string_prefixed0x>
}

export const OnchainMetadataReply = {
    PREFIX: 0x00,

    create(args: {
        contentDict: c.Dictionary<uint256, string_prefixed0x>
    }): OnchainMetadataReply {
        return {
            $: 'OnchainMetadataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): OnchainMetadataReply {
        loadAndCheckPrefix(s, 0x00, 8, 'OnchainMetadataReply');
        return {
            $: 'OnchainMetadataReply',
            contentDict: c.Dictionary.load<uint256, string_prefixed0x>(c.Dictionary.Keys.BigUint(256), createDictionaryValue<string_prefixed0x>(string_prefixed0x.fromSlice, string_prefixed0x.store), s),
        }
    },
    store(self: OnchainMetadataReply, b: c.Builder): void {
        b.storeUint(0x00, 8);
        b.storeDict<uint256, string_prefixed0x>(self.contentDict, c.Dictionary.Keys.BigUint(256), createDictionaryValue<string_prefixed0x>(string_prefixed0x.fromSlice, string_prefixed0x.store));
    },
    toCell(self: OnchainMetadataReply): c.Cell {
        return makeCellFrom<OnchainMetadataReply>(self, OnchainMetadataReply.store);
    }
}

/**
 > type string_prefixed0x = string
 */
export type string_prefixed0x = string

export const string_prefixed0x = {
    fromSlice(s: c.Slice): string_prefixed0x {
        return s.loadStringRefTail();
    },
    store(self: string_prefixed0x, b: c.Builder): void {
        b.storeStringRefTail(self);
    },
    toCell(self: string_prefixed0x): c.Cell {
        return makeCellFrom<string_prefixed0x>(self, string_prefixed0x.store);
    }
}

// ————————————————————————————————————————————
//    class JettonMinterV2
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

export class JettonMinterV2 implements c.Contract {
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
        return new JettonMinterV2(address);
    }

    static fromStorage(emptyStorage: {
        totalSupply: coins
        adminAddress: c.Address | null
        nextAdminAddress: c.Address | null
        metadata: c.Cell
        launchJournal?: CellRef<LaunchMintJournal> | null /* = null */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? JettonMinterV2.CodeCell,
            data: MinterStorageV2.toCell(MinterStorageV2.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new JettonMinterV2(address, initialState);
    }

    static createCellOfMintNewJettons(body: {
        queryId: uint64
        mintRecipient: c.Address
        tonAmount: coins
        internalTransferMsg: CellRef<InternalTransferStep>
    }) {
        return MintNewJettons.toCell(MintNewJettons.create(body));
    }

    static createCellOfMintCurveWallet(body: {
        queryId: uint64
        jettonAmount: coins
        tonAmount: coins
    }) {
        return MintCurveWallet.toCell(MintCurveWallet.create(body));
    }

    static createCellOfMintLaunchTokens(body: {
        queryId: uint64
        jettonAmount: coins
        mintRecipient: c.Address
    }) {
        return MintLaunchTokens.toCell(MintLaunchTokens.create(body));
    }

    static createCellOfProbeLaunchSettlement(body: {
        queryId: uint64
        leg: uint3
    }) {
        return ProbeLaunchSettlement.toCell(ProbeLaunchSettlement.create(body));
    }

    static createCellOfResolveLaunchMint(body: {
        queryId: uint64
        leg: uint3
    }) {
        return ResolveLaunchMint.toCell(ResolveLaunchMint.create(body));
    }

    static createCellOfLaunchMintInspection(body: {
        queryId: uint64
        leg: uint3
        delivered: boolean
        amount: coins
    }) {
        return LaunchMintInspection.toCell(LaunchMintInspection.create(body));
    }

    static createCellOfBurnNotificationForMinter(body: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
        sendExcessesTo: c.Address | null
    }) {
        return BurnNotificationForMinter.toCell(BurnNotificationForMinter.create(body));
    }

    static createCellOfBurnNotificationTracked(body: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
    }) {
        return BurnNotificationTracked.toCell(BurnNotificationTracked.create(body));
    }

    static createCellOfRequestWalletAddress(body: {
        queryId: uint64
        ownerAddress: c.Address
        includeOwnerAddress: boolean
    }) {
        return RequestWalletAddress.toCell(RequestWalletAddress.create(body));
    }

    static createCellOfChangeMinterAdmin(body: {
        queryId: uint64
        newAdminAddress: c.Address
    }) {
        return ChangeMinterAdmin.toCell(ChangeMinterAdmin.create(body));
    }

    static createCellOfClaimMinterAdmin(body: {
        queryId: uint64
    }) {
        return ClaimMinterAdmin.toCell(ClaimMinterAdmin.create(body));
    }

    static createCellOfDropMinterAdmin(body: {
        queryId: uint64
    }) {
        return DropMinterAdmin.toCell(DropMinterAdmin.create(body));
    }

    static createCellOfChangeMinterMetadata(body: {
        queryId: uint64
        newMetadata: c.Cell
    }) {
        return ChangeMinterMetadata.toCell(ChangeMinterMetadata.create(body));
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

    async sendMintNewJettons(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        mintRecipient: c.Address
        tonAmount: coins
        internalTransferMsg: CellRef<InternalTransferStep>
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: MintNewJettons.toCell(MintNewJettons.create(body)),
            ...extraOptions
        });
    }

    async sendMintCurveWallet(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        tonAmount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: MintCurveWallet.toCell(MintCurveWallet.create(body)),
            ...extraOptions
        });
    }

    async sendMintLaunchTokens(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        mintRecipient: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: MintLaunchTokens.toCell(MintLaunchTokens.create(body)),
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

    async sendResolveLaunchMint(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        leg: uint3
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ResolveLaunchMint.toCell(ResolveLaunchMint.create(body)),
            ...extraOptions
        });
    }

    async sendLaunchMintInspection(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        leg: uint3
        delivered: boolean
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: LaunchMintInspection.toCell(LaunchMintInspection.create(body)),
            ...extraOptions
        });
    }

    async sendBurnNotificationForMinter(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
        sendExcessesTo: c.Address | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: BurnNotificationForMinter.toCell(BurnNotificationForMinter.create(body)),
            ...extraOptions
        });
    }

    async sendBurnNotificationTracked(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        burnInitiator: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: BurnNotificationTracked.toCell(BurnNotificationTracked.create(body)),
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

    async sendChangeMinterAdmin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        newAdminAddress: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeMinterAdmin.toCell(ChangeMinterAdmin.create(body)),
            ...extraOptions
        });
    }

    async sendClaimMinterAdmin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ClaimMinterAdmin.toCell(ClaimMinterAdmin.create(body)),
            ...extraOptions
        });
    }

    async sendDropMinterAdmin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DropMinterAdmin.toCell(DropMinterAdmin.create(body)),
            ...extraOptions
        });
    }

    async sendChangeMinterMetadata(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        newMetadata: c.Cell
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeMinterMetadata.toCell(ChangeMinterMetadata.create(body)),
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

    async getJettonData(provider: ContractProvider): Promise<JettonDataReply> {
        const r = StackReader.fromGetMethod(5, await provider.get('get_jetton_data', []));
        return ({
            $: 'JettonDataReply',
            totalSupply: r.readBigInt(),
            mintable: r.readBoolean(),
            adminAddress: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            jettonContent: r.readCellRef<OnchainMetadataReply>(OnchainMetadataReply.fromSlice),
            jettonWalletCode: r.readCell(),
        });
    }

    async getWalletAddress(provider: ContractProvider, ownerAddress: c.Address): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_wallet_address', [
            { type: 'slice', cell: makeCellFrom<c.Address>(ownerAddress,
                (v,b) => b.storeAddress(v)
            ) },
        ]));
        return r.readSlice().loadAddress();
    }

    async getNextAdminAddress(provider: ContractProvider): Promise<c.Address | null> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_next_admin_address', []));
        return r.readNullable<c.Address>(
            (r) => r.readSlice().loadAddress()
        );
    }
}
