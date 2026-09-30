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
 > struct FeeRecipients {
 >     creator: address
 >     protocol: address
 >     creatorBps: uint16
 > }
 */
export interface FeeRecipients {
    readonly $: 'FeeRecipients'
    creator: c.Address
    protocol: c.Address
    creatorBps: uint16
}

export const FeeRecipients = {
    create(args: {
        creator: c.Address
        protocol: c.Address
        creatorBps: uint16
    }): FeeRecipients {
        return {
            $: 'FeeRecipients',
            ...args
        }
    },
    fromSlice(s: c.Slice): FeeRecipients {
        return {
            $: 'FeeRecipients',
            creator: s.loadAddress(),
            protocol: s.loadAddress(),
            creatorBps: s.loadUintBig(16),
        }
    },
    store(self: FeeRecipients, b: c.Builder): void {
        b.storeAddress(self.creator);
        b.storeAddress(self.protocol);
        b.storeUint(self.creatorBps, 16);
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
 > }
 */
export interface CollectorStorage {
    readonly $: 'CollectorStorage'
    minter: c.Address
    recipients: CellRef<FeeRecipients>
    initialized: boolean
    nextId: uint64
}

export const CollectorStorage = {
    create(args: {
        minter: c.Address
        recipients: CellRef<FeeRecipients>
        initialized: boolean
        nextId: uint64
    }): CollectorStorage {
        return {
            $: 'CollectorStorage',
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
        }
    },
    store(self: CollectorStorage, b: c.Builder): void {
        b.storeAddress(self.minter);
        storeCellRef<FeeRecipients>(self.recipients, b, FeeRecipients.store);
        b.storeBit(self.initialized);
        b.storeUint(self.nextId, 64);
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

    async getSplitterAddress(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_splitter_address', []));
        return r.readSlice().loadAddress();
    }

    async getPoolAddress(provider: ContractProvider): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_pool_address', []));
        return r.readSlice().loadAddress();
    }
}
