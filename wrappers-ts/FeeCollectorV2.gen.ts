// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a FeeCollectorV2 contract in Tolk.
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
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint16 = bigint
type uint64 = bigint

/**
 > struct (0xbe3e3179) DedustClaimCreatorFees {
 >     queryId: uint64
 >     to: address
 >     excessesTo: address
 > }
 */
export interface DedustClaimCreatorFees {
    readonly $: 'DedustClaimCreatorFees'
    queryId: uint64
    to: c.Address
    excessesTo: c.Address
}

export const DedustClaimCreatorFees = {
    PREFIX: 0xbe3e3179,

    create(args: {
        queryId: uint64
        to: c.Address
        excessesTo: c.Address
    }): DedustClaimCreatorFees {
        return {
            $: 'DedustClaimCreatorFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): DedustClaimCreatorFees {
        loadAndCheckPrefix32(s, 0xbe3e3179, 'DedustClaimCreatorFees');
        return {
            $: 'DedustClaimCreatorFees',
            queryId: s.loadUintBig(64),
            to: s.loadAddress(),
            excessesTo: s.loadAddress(),
        }
    },
    store(self: DedustClaimCreatorFees, b: c.Builder): void {
        b.storeUint(0xbe3e3179, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.to);
        b.storeAddress(self.excessesTo);
    },
    toCell(self: DedustClaimCreatorFees): c.Cell {
        return makeCellFrom<DedustClaimCreatorFees>(self, DedustClaimCreatorFees.store);
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
 > struct CollectorStorage {
 >     minter: address
 >     recipients: Cell<FeeRecipients>
 >     initialized: bool
 >     nextId: uint64
 >     nativeAccrued: coins
 > }
 */
export interface CollectorStorage {
    readonly $: 'CollectorStorage'
    minter: c.Address
    recipients: CellRef<FeeRecipients>
    initialized: boolean
    nextId: uint64
    nativeAccrued: coins /* = 0 */
}

export const CollectorStorage = {
    create(args: {
        minter: c.Address
        recipients: CellRef<FeeRecipients>
        initialized: boolean
        nextId: uint64
        nativeAccrued?: coins /* = 0 */
    }): CollectorStorage {
        return {
            $: 'CollectorStorage',
            nativeAccrued: 0n,
            ...args
        }
    },
    fromSlice(s: c.Slice): CollectorStorage {
        return {
            $: 'CollectorStorage',
            minter: s.loadAddress(),
            recipients: loadCellRef<FeeRecipients>(s, FeeRecipients.fromSlice),
            initialized: s.loadBoolean(),
            nextId: s.loadUintBig(64),
            nativeAccrued: s.loadCoins(),
        }
    },
    store(self: CollectorStorage, b: c.Builder): void {
        b.storeAddress(self.minter);
        storeCellRef<FeeRecipients>(self.recipients, b, FeeRecipients.store);
        b.storeBit(self.initialized);
        b.storeUint(self.nextId, 64);
        b.storeCoins(self.nativeAccrued);
    },
    toCell(self: CollectorStorage): c.Cell {
        return makeCellFrom<CollectorStorage>(self, CollectorStorage.store);
    }
}

/**
 > struct (0xa0a0b040) CollectPoolFees {
 >     queryId: uint64
 > }
 */
export interface CollectPoolFees {
    readonly $: 'CollectPoolFees'
    queryId: uint64
}

export const CollectPoolFees = {
    PREFIX: 0xa0a0b040,

    create(args: {
        queryId: uint64
    }): CollectPoolFees {
        return {
            $: 'CollectPoolFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): CollectPoolFees {
        loadAndCheckPrefix32(s, 0xa0a0b040, 'CollectPoolFees');
        return {
            $: 'CollectPoolFees',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: CollectPoolFees, b: c.Builder): void {
        b.storeUint(0xa0a0b040, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: CollectPoolFees): c.Cell {
        return makeCellFrom<CollectPoolFees>(self, CollectPoolFees.store);
    }
}

/**
 > struct (0xa0a0b041) SweepCollectedTokens {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface SweepCollectedTokens {
    readonly $: 'SweepCollectedTokens'
    queryId: uint64
    amount: coins
}

export const SweepCollectedTokens = {
    PREFIX: 0xa0a0b041,

    create(args: {
        queryId: uint64
        amount: coins
    }): SweepCollectedTokens {
        return {
            $: 'SweepCollectedTokens',
            ...args
        }
    },
    fromSlice(s: c.Slice): SweepCollectedTokens {
        loadAndCheckPrefix32(s, 0xa0a0b041, 'SweepCollectedTokens');
        return {
            $: 'SweepCollectedTokens',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: SweepCollectedTokens, b: c.Builder): void {
        b.storeUint(0xa0a0b041, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: SweepCollectedTokens): c.Cell {
        return makeCellFrom<SweepCollectedTokens>(self, SweepCollectedTokens.store);
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
 > struct (0xa0a0b045) RetryCollectedFees {
 >     queryId: uint64
 > }
 */
export interface RetryCollectedFees {
    readonly $: 'RetryCollectedFees'
    queryId: uint64
}

export const RetryCollectedFees = {
    PREFIX: 0xa0a0b045,

    create(args: {
        queryId: uint64
    }): RetryCollectedFees {
        return {
            $: 'RetryCollectedFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): RetryCollectedFees {
        loadAndCheckPrefix32(s, 0xa0a0b045, 'RetryCollectedFees');
        return {
            $: 'RetryCollectedFees',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: RetryCollectedFees, b: c.Builder): void {
        b.storeUint(0xa0a0b045, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: RetryCollectedFees): c.Cell {
        return makeCellFrom<RetryCollectedFees>(self, RetryCollectedFees.store);
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
//    class FeeCollectorV2
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

export class FeeCollectorV2 implements c.Contract {
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
        return new FeeCollectorV2(address);
    }

    static fromStorage(emptyStorage: {
        minter: c.Address
        recipients: CellRef<FeeRecipients>
        initialized: boolean
        nextId: uint64
        nativeAccrued?: coins /* = 0 */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? FeeCollectorV2.CodeCell,
            data: CollectorStorage.toCell(CollectorStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new FeeCollectorV2(address, initialState);
    }

    static createCellOfCollectPoolFees(body: {
        queryId: uint64
    }) {
        return CollectPoolFees.toCell(CollectPoolFees.create(body));
    }

    static createCellOfSweepCollectedTokens(body: {
        queryId: uint64
        amount: coins
    }) {
        return SweepCollectedTokens.toCell(SweepCollectedTokens.create(body));
    }

    static createCellOfDedustNativePayout(body: {
        queryId: uint64
        rest: RemainingBitsAndRefs
    }) {
        return DedustNativePayout.toCell(DedustNativePayout.create(body));
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

    static createCellOfRetryCollectedFees(body: {
        queryId: uint64
    }) {
        return RetryCollectedFees.toCell(RetryCollectedFees.create(body));
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendCollectPoolFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CollectPoolFees.toCell(CollectPoolFees.create(body)),
            ...extraOptions
        });
    }

    async sendSweepCollectedTokens(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: SweepCollectedTokens.toCell(SweepCollectedTokens.create(body)),
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

    async sendRetryCollectedFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: RetryCollectedFees.toCell(RetryCollectedFees.create(body)),
            ...extraOptions
        });
    }

    async getSplitterAddress(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_splitter_address', []));
        return r.readSlice().loadAddress();
    }

    async getPoolAddress(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_pool_address', []));
        return r.readSlice().loadAddress();
    }
}
