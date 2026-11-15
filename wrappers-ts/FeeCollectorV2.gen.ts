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
