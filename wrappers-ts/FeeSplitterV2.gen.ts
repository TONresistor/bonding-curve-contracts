// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a FeeSplitterV2 contract in Tolk.
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

    readCellRef<T>(loadFn_T: LoadCallback<T>): CellRef<T> {
        return { ref: loadFn_T(this.readCell().beginParse()) };
    }

    readDictionary<K extends c.DictionaryKeyTypes, V>(keySerializer: c.DictionaryKey<K>, valueSerializer: c.DictionaryValue<V>): c.Dictionary<K, V> {
        if (this.tuple[0].type === 'null') {
            this.tuple.shift();
            return c.Dictionary.empty<K, V>(keySerializer, valueSerializer);
        }
        return c.Dictionary.loadDirect<K, V>(keySerializer, valueSerializer, this.readCell());
    }
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint16 = bigint
type uint64 = bigint

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
 > struct FeeBalance {
 >     tonAmount: coins
 >     tokenAmount: coins
 > }
 */
export interface FeeBalance {
    readonly $: 'FeeBalance'
    tonAmount: coins
    tokenAmount: coins
}

export const FeeBalance = {
    create(args: {
        tonAmount: coins
        tokenAmount: coins
    }): FeeBalance {
        return {
            $: 'FeeBalance',
            ...args
        }
    },
    fromSlice(s: c.Slice): FeeBalance {
        return {
            $: 'FeeBalance',
            tonAmount: s.loadCoins(),
            tokenAmount: s.loadCoins(),
        }
    },
    store(self: FeeBalance, b: c.Builder): void {
        b.storeCoins(self.tonAmount);
        b.storeCoins(self.tokenAmount);
    },
    toCell(self: FeeBalance): c.Cell {
        return makeCellFrom<FeeBalance>(self, FeeBalance.store);
    }
}

/**
 > struct FeeRecipients {
 >     creator: address
 >     protocol: address
 >     creatorBps: uint16
 >     curve: address?
 >     beneficiaries: Cell<FeeBeneficiaries>?
 >     buybackBurn: bool
 > }
 */
export interface FeeRecipients {
    readonly $: 'FeeRecipients'
    creator: c.Address
    protocol: c.Address
    creatorBps: uint16
    curve: c.Address | null /* = null */
    beneficiaries: CellRef<FeeBeneficiaries> | null /* = null */
    buybackBurn: boolean /* = false */
}

export const FeeRecipients = {
    create(args: {
        creator: c.Address
        protocol: c.Address
        creatorBps: uint16
        curve?: c.Address | null /* = null */
        beneficiaries?: CellRef<FeeBeneficiaries> | null /* = null */
        buybackBurn?: boolean /* = false */
    }): FeeRecipients {
        return {
            $: 'FeeRecipients',
            curve: null,
            beneficiaries: null,
            buybackBurn: false,
            ...args
        }
    },
    fromSlice(s: c.Slice): FeeRecipients {
        return {
            $: 'FeeRecipients',
            creator: s.loadAddress(),
            protocol: s.loadAddress(),
            creatorBps: s.loadUintBig(16),
            curve: s.loadMaybeAddress(),
            beneficiaries: s.loadBoolean() ? loadCellRef<FeeBeneficiaries>(s, FeeBeneficiaries.fromSlice) : null,
            buybackBurn: s.loadBoolean(),
        }
    },
    store(self: FeeRecipients, b: c.Builder): void {
        b.storeAddress(self.creator);
        b.storeAddress(self.protocol);
        b.storeUint(self.creatorBps, 16);
        b.storeAddress(self.curve);
        storeTolkNullable<CellRef<FeeBeneficiaries>>(self.beneficiaries, b,
            (v,b) => storeCellRef<FeeBeneficiaries>(v, b, FeeBeneficiaries.store)
        );
        b.storeBit(self.buybackBurn);
    },
    toCell(self: FeeRecipients): c.Cell {
        return makeCellFrom<FeeRecipients>(self, FeeRecipients.store);
    }
}

/**
 > struct SplitterConfig {
 >     collector: address
 >     minter: address
 >     recipients: Cell<FeeRecipients>
 > }
 */
export interface SplitterConfig {
    readonly $: 'SplitterConfig'
    collector: c.Address
    minter: c.Address
    recipients: CellRef<FeeRecipients>
}

export const SplitterConfig = {
    create(args: {
        collector: c.Address
        minter: c.Address
        recipients: CellRef<FeeRecipients>
    }): SplitterConfig {
        return {
            $: 'SplitterConfig',
            ...args
        }
    },
    fromSlice(s: c.Slice): SplitterConfig {
        return {
            $: 'SplitterConfig',
            collector: s.loadAddress(),
            minter: s.loadAddress(),
            recipients: loadCellRef<FeeRecipients>(s, FeeRecipients.fromSlice),
        }
    },
    store(self: SplitterConfig, b: c.Builder): void {
        b.storeAddress(self.collector);
        b.storeAddress(self.minter);
        storeCellRef<FeeRecipients>(self.recipients, b, FeeRecipients.store);
    },
    toCell(self: SplitterConfig): c.Cell {
        return makeCellFrom<SplitterConfig>(self, SplitterConfig.store);
    }
}

/**
 > struct TokenPayout {
 >     protocol: bool
 >     amount: coins
 >     recipient: address
 > }
 */
export interface TokenPayout {
    readonly $: 'TokenPayout'
    protocol: boolean
    amount: coins
    recipient: c.Address
}

export const TokenPayout = {
    create(args: {
        protocol: boolean
        amount: coins
        recipient: c.Address
    }): TokenPayout {
        return {
            $: 'TokenPayout',
            ...args
        }
    },
    fromSlice(s: c.Slice): TokenPayout {
        return {
            $: 'TokenPayout',
            protocol: s.loadBoolean(),
            amount: s.loadCoins(),
            recipient: s.loadAddress(),
        }
    },
    store(self: TokenPayout, b: c.Builder): void {
        b.storeBit(self.protocol);
        b.storeCoins(self.amount);
        b.storeAddress(self.recipient);
    },
    toCell(self: TokenPayout): c.Cell {
        return makeCellFrom<TokenPayout>(self, TokenPayout.store);
    }
}

/**
 > struct SplitterStorage {
 >     config: Cell<SplitterConfig>
 >     creatorTon: coins
 >     protocolTon: coins
 >     creatorTokens: coins
 >     protocolTokens: coins
 >     nextId: uint64
 >     pending: map<uint64, TokenPayout>
 >     balances: map<address, FeeBalance>
 > }
 */
export interface SplitterStorage {
    readonly $: 'SplitterStorage'
    config: CellRef<SplitterConfig>
    creatorTon: coins
    protocolTon: coins
    creatorTokens: coins
    protocolTokens: coins
    nextId: uint64
    pending: c.Dictionary<uint64, TokenPayout>
    balances: c.Dictionary<c.Address, FeeBalance> /* = [] as map<address, FeeBalance> */
}

export const SplitterStorage = {
    create(args: {
        config: CellRef<SplitterConfig>
        creatorTon: coins
        protocolTon: coins
        creatorTokens: coins
        protocolTokens: coins
        nextId: uint64
        pending: c.Dictionary<uint64, TokenPayout>
        balances: c.Dictionary<c.Address, FeeBalance> /* = [] as map<address, FeeBalance> */
    }): SplitterStorage {
        return {
            $: 'SplitterStorage',
            ...args
        }
    },
    fromSlice(s: c.Slice): SplitterStorage {
        return {
            $: 'SplitterStorage',
            config: loadCellRef<SplitterConfig>(s, SplitterConfig.fromSlice),
            creatorTon: s.loadCoins(),
            protocolTon: s.loadCoins(),
            creatorTokens: s.loadCoins(),
            protocolTokens: s.loadCoins(),
            nextId: s.loadUintBig(64),
            pending: c.Dictionary.load<uint64, TokenPayout>(c.Dictionary.Keys.BigUint(64), createDictionaryValue<TokenPayout>(TokenPayout.fromSlice, TokenPayout.store), s),
            balances: c.Dictionary.load<c.Address, FeeBalance>(c.Dictionary.Keys.Address(), createDictionaryValue<FeeBalance>(FeeBalance.fromSlice, FeeBalance.store), s),
        }
    },
    store(self: SplitterStorage, b: c.Builder): void {
        storeCellRef<SplitterConfig>(self.config, b, SplitterConfig.store);
        b.storeCoins(self.creatorTon);
        b.storeCoins(self.protocolTon);
        b.storeCoins(self.creatorTokens);
        b.storeCoins(self.protocolTokens);
        b.storeUint(self.nextId, 64);
        b.storeDict<uint64, TokenPayout>(self.pending, c.Dictionary.Keys.BigUint(64), createDictionaryValue<TokenPayout>(TokenPayout.fromSlice, TokenPayout.store));
        b.storeDict<c.Address, FeeBalance>(self.balances, c.Dictionary.Keys.Address(), createDictionaryValue<FeeBalance>(FeeBalance.fromSlice, FeeBalance.store));
    },
    toCell(self: SplitterStorage): c.Cell {
        return makeCellFrom<SplitterStorage>(self, SplitterStorage.store);
    }
}

/**
 > struct (0xa0a0b042) CreditNativeFees {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface CreditNativeFees {
    readonly $: 'CreditNativeFees'
    queryId: uint64
    amount: coins
}

export const CreditNativeFees = {
    PREFIX: 0xa0a0b042,

    create(args: {
        queryId: uint64
        amount: coins
    }): CreditNativeFees {
        return {
            $: 'CreditNativeFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): CreditNativeFees {
        loadAndCheckPrefix32(s, 0xa0a0b042, 'CreditNativeFees');
        return {
            $: 'CreditNativeFees',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: CreditNativeFees, b: c.Builder): void {
        b.storeUint(0xa0a0b042, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: CreditNativeFees): c.Cell {
        return makeCellFrom<CreditNativeFees>(self, CreditNativeFees.store);
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
//    class FeeSplitterV2
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

export class FeeSplitterV2 implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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');

    static Errors = {
        'Errors.NotEnoughGas': 48,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new FeeSplitterV2(address);
    }

    static fromStorage(emptyStorage: {
        config: CellRef<SplitterConfig>
        creatorTon: coins
        protocolTon: coins
        creatorTokens: coins
        protocolTokens: coins
        nextId: uint64
        pending: c.Dictionary<uint64, TokenPayout>
        balances: c.Dictionary<c.Address, FeeBalance> /* = [] as map<address, FeeBalance> */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? FeeSplitterV2.CodeCell,
            data: SplitterStorage.toCell(SplitterStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new FeeSplitterV2(address, initialState);
    }

    static createCellOfCreditNativeFees(body: {
        queryId: uint64
        amount: coins
    }) {
        return CreditNativeFees.toCell(CreditNativeFees.create(body));
    }

    static createCellOfCreditCurveFees(body: {
        queryId: uint64
        amount: coins
    }) {
        return CreditCurveFees.toCell(CreditCurveFees.create(body));
    }

    static createCellOfTransferNotificationForRecipient(body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address | null
        forwardPayload: PayloadInline | PayloadInRef
    }) {
        return TransferNotificationForRecipient.toCell(TransferNotificationForRecipient.create(body));
    }

    static createCellOfClaimSplitFees(body: {
        queryId: uint64
        protocol: boolean
    }) {
        return ClaimSplitFees.toCell(ClaimSplitFees.create(body));
    }

    static createCellOfTransferDelivered(body: {
        queryId: uint64
        amount: coins
    }) {
        return TransferDelivered.toCell(TransferDelivered.create(body));
    }

    static createCellOfTransferFailed(body: {
        queryId: uint64
        amount: coins
    }) {
        return TransferFailed.toCell(TransferFailed.create(body));
    }

    static createCellOfReturnExcessesBack(body: {
        queryId: uint64
    }) {
        return ReturnExcessesBack.toCell(ReturnExcessesBack.create(body));
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

    async sendCreditNativeFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CreditNativeFees.toCell(CreditNativeFees.create(body)),
            ...extraOptions
        });
    }

    async sendCreditCurveFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CreditCurveFees.toCell(CreditCurveFees.create(body)),
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

    async sendClaimSplitFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        protocol: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ClaimSplitFees.toCell(ClaimSplitFees.create(body)),
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

    async sendReturnExcessesBack(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ReturnExcessesBack.toCell(ReturnExcessesBack.create(body)),
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

    async getSplitterData(provider: ContractProvider): Promise<SplitterStorage> {
        const r = StackReader.fromGetMethod(8, await provider.get('get_splitter_data', []));
        return ({
            $: 'SplitterStorage',
            config: r.readCellRef<SplitterConfig>(SplitterConfig.fromSlice),
            creatorTon: r.readBigInt(),
            protocolTon: r.readBigInt(),
            creatorTokens: r.readBigInt(),
            protocolTokens: r.readBigInt(),
            nextId: r.readBigInt(),
            pending: r.readDictionary<uint64, TokenPayout>(c.Dictionary.Keys.BigUint(64), createDictionaryValue<TokenPayout>(TokenPayout.fromSlice, TokenPayout.store)),
            balances: r.readDictionary<c.Address, FeeBalance>(c.Dictionary.Keys.Address(), createDictionaryValue<FeeBalance>(FeeBalance.fromSlice, FeeBalance.store)),
        });
    }

    async getFeeBalance(provider: ContractProvider, recipient: c.Address, protocol: boolean = false): Promise<FeeBalance> {
        const r = StackReader.fromGetMethod(2, await provider.get('get_fee_balance', [
            { type: 'slice', cell: makeCellFrom<c.Address>(recipient,
                (v,b) => b.storeAddress(v)
            ) },
            { type: 'int', value: (protocol ? -1n : 0n) },
        ]));
        return ({
            $: 'FeeBalance',
            tonAmount: r.readBigInt(),
            tokenAmount: r.readBigInt(),
        });
    }

    async getBeneficiaries(provider: ContractProvider): Promise<c.Dictionary<c.Address, uint16>> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_beneficiaries', []));
        return r.readDictionary<c.Address, uint16>(c.Dictionary.Keys.Address(), c.Dictionary.Values.BigUint(16));
    }
}
