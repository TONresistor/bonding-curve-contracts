// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a JettonWalletV2 contract in Tolk.
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

type uint3 = bigint
type uint64 = bigint

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
 > struct (0xa0a0b054) InternalTransferTracked {
 >     queryId: uint64
 >     jettonAmount: coins
 >     transferInitiator: address?
 >     sendExcessesTo: address?
 >     forwardTonAmount: coins
 >     forwardPayload: ForwardPayloadRemainder
 > }
 */
export interface InternalTransferTracked {
    readonly $: 'InternalTransferTracked'
    queryId: uint64
    jettonAmount: coins
    transferInitiator: c.Address | null
    sendExcessesTo: c.Address | null
    forwardTonAmount: coins
    forwardPayload: ForwardPayloadRemainder
}

export const InternalTransferTracked = {
    PREFIX: 0xa0a0b054,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address | null
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        forwardPayload: ForwardPayloadRemainder
    }): InternalTransferTracked {
        return {
            $: 'InternalTransferTracked',
            ...args
        }
    },
    fromSlice(s: c.Slice): InternalTransferTracked {
        loadAndCheckPrefix32(s, 0xa0a0b054, 'InternalTransferTracked');
        return {
            $: 'InternalTransferTracked',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            transferInitiator: s.loadMaybeAddress(),
            sendExcessesTo: s.loadMaybeAddress(),
            forwardTonAmount: s.loadCoins(),
            forwardPayload: ForwardPayloadRemainder.fromSlice(s),
        }
    },
    store(self: InternalTransferTracked, b: c.Builder): void {
        b.storeUint(0xa0a0b054, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.transferInitiator);
        b.storeAddress(self.sendExcessesTo);
        b.storeCoins(self.forwardTonAmount);
        ForwardPayloadRemainder.store(self.forwardPayload, b);
    },
    toCell(self: InternalTransferTracked): c.Cell {
        return makeCellFrom<InternalTransferTracked>(self, InternalTransferTracked.store);
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
 > struct WalletStorageV2 {
 >     jettonBalance: coins
 >     ownerAddress: address
 >     minterAddress: address
 >     protection: RemainingBitsAndRefs
 > }
 */
export interface WalletStorageV2 {
    readonly $: 'WalletStorageV2'
    jettonBalance: coins
    ownerAddress: c.Address
    minterAddress: c.Address
    protection: RemainingBitsAndRefs
}

export const WalletStorageV2 = {
    create(args: {
        jettonBalance: coins
        ownerAddress: c.Address
        minterAddress: c.Address
        protection: RemainingBitsAndRefs
    }): WalletStorageV2 {
        return {
            $: 'WalletStorageV2',
            ...args
        }
    },
    fromSlice(s: c.Slice): WalletStorageV2 {
        return {
            $: 'WalletStorageV2',
            jettonBalance: s.loadCoins(),
            ownerAddress: s.loadAddress(),
            minterAddress: s.loadAddress(),
            protection: loadTolkRemaining(s),
        }
    },
    store(self: WalletStorageV2, b: c.Builder): void {
        b.storeCoins(self.jettonBalance);
        b.storeAddress(self.ownerAddress);
        b.storeAddress(self.minterAddress);
        storeTolkRemaining(self.protection, b);
    },
    toCell(self: WalletStorageV2): c.Cell {
        return makeCellFrom<WalletStorageV2>(self, WalletStorageV2.store);
    }
}

/**
 > enum Errors { 7 variants }
 */
export type Errors = bigint

export const Errors = {
    BalanceError: 47n,
    NotEnoughGas: 48n,
    InvalidMessage: 49n,
    InvalidOp: 72n,
    NotOwner: 73n,
    NotValidWallet: 74n,
    WrongWorkchain: 333n,

    fromSlice(s: c.Slice): Errors {
        return s.loadUintBig(9);
    },
    store(self: Errors, b: c.Builder): void {
        b.storeUint(self, 9);
    },
    toCell(self: Errors): c.Cell {
        return makeCellFrom<Errors>(self, Errors.store);
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
 > struct (0x595f07bc) AskToBurn {
 >     queryId: uint64
 >     jettonAmount: coins
 >     sendExcessesTo: address?
 >     customPayload: cell?
 > }
 */
export interface AskToBurn {
    readonly $: 'AskToBurn'
    queryId: uint64
    jettonAmount: coins
    sendExcessesTo: c.Address | null
    customPayload: c.Cell | null
}

export const AskToBurn = {
    PREFIX: 0x595f07bc,

    create(args: {
        queryId: uint64
        jettonAmount: coins
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
    }): AskToBurn {
        return {
            $: 'AskToBurn',
            ...args
        }
    },
    fromSlice(s: c.Slice): AskToBurn {
        loadAndCheckPrefix32(s, 0x595f07bc, 'AskToBurn');
        return {
            $: 'AskToBurn',
            queryId: s.loadUintBig(64),
            jettonAmount: s.loadCoins(),
            sendExcessesTo: s.loadMaybeAddress(),
            customPayload: s.loadBoolean() ? s.loadRef() : null,
        }
    },
    store(self: AskToBurn, b: c.Builder): void {
        b.storeUint(0x595f07bc, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.jettonAmount);
        b.storeAddress(self.sendExcessesTo);
        storeTolkNullable<c.Cell>(self.customPayload, b,
            (v,b) => b.storeRef(v)
        );
    },
    toCell(self: AskToBurn): c.Cell {
        return makeCellFrom<AskToBurn>(self, AskToBurn.store);
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
 > struct JettonWalletDataReply {
 >     jettonBalance: coins
 >     ownerAddress: address
 >     minterAddress: address
 >     jettonWalletCode: cell
 > }
 */
export interface JettonWalletDataReply {
    readonly $: 'JettonWalletDataReply'
    jettonBalance: coins
    ownerAddress: c.Address
    minterAddress: c.Address
    jettonWalletCode: c.Cell
}

export const JettonWalletDataReply = {
    create(args: {
        jettonBalance: coins
        ownerAddress: c.Address
        minterAddress: c.Address
        jettonWalletCode: c.Cell
    }): JettonWalletDataReply {
        return {
            $: 'JettonWalletDataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): JettonWalletDataReply {
        return {
            $: 'JettonWalletDataReply',
            jettonBalance: s.loadCoins(),
            ownerAddress: s.loadAddress(),
            minterAddress: s.loadAddress(),
            jettonWalletCode: s.loadRef(),
        }
    },
    store(self: JettonWalletDataReply, b: c.Builder): void {
        b.storeCoins(self.jettonBalance);
        b.storeAddress(self.ownerAddress);
        b.storeAddress(self.minterAddress);
        b.storeRef(self.jettonWalletCode);
    },
    toCell(self: JettonWalletDataReply): c.Cell {
        return makeCellFrom<JettonWalletDataReply>(self, JettonWalletDataReply.store);
    }
}

// ————————————————————————————————————————————
//    class JettonWalletV2
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

export class JettonWalletV2 implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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');

    static Errors = {
        'ERROR_BALANCE_ERROR': 47,
        'Errors.NotEnoughGas': 48,
        'Errors.InvalidMessage': 49,
        'Errors.InvalidOp': 72,
        'ERROR_NOT_OWNER': 73,
        'ERROR_NOT_VALID_WALLET': 74,
        'ERROR_WRONG_WORKCHAIN': 333,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new JettonWalletV2(address);
    }

    static fromStorage(emptyStorage: {
        jettonBalance: coins
        ownerAddress: c.Address
        minterAddress: c.Address
        protection: RemainingBitsAndRefs
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? JettonWalletV2.CodeCell,
            data: WalletStorageV2.toCell(WalletStorageV2.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new JettonWalletV2(address, initialState);
    }

    static createCellOfAskToTransfer(body: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }) {
        return AskToTransfer.toCell(AskToTransfer.create(body));
    }

    static createCellOfAskToTransferTracked(body: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
        forwardTonAmount: coins
        forwardPayload: ForwardPayloadRemainder
    }) {
        return AskToTransferTracked.toCell(AskToTransferTracked.create(body));
    }

    static createCellOfAskToBurn(body: {
        queryId: uint64
        jettonAmount: coins
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
    }) {
        return AskToBurn.toCell(AskToBurn.create(body));
    }

    static createCellOfAskToBurnTracked(body: {
        queryId: uint64
        jettonAmount: coins
    }) {
        return AskToBurnTracked.toCell(AskToBurnTracked.create(body));
    }

    static createCellOfInternalTransferStep(body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address | null
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }) {
        return InternalTransferStep.toCell(InternalTransferStep.create(body));
    }

    static createCellOfInternalTransferTracked(body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address | null
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        forwardPayload: ForwardPayloadRemainder
    }) {
        return InternalTransferTracked.toCell(InternalTransferTracked.create(body));
    }

    static createCellOfInternalCurveMint(body: {
        queryId: uint64
        jettonAmount: coins
    }) {
        return InternalCurveMint.toCell(InternalCurveMint.create(body));
    }

    static createCellOfInternalLaunchMint(body: {
        queryId: uint64
        jettonAmount: coins
        curve: c.Address
        protect: boolean
    }) {
        return InternalLaunchMint.toCell(InternalLaunchMint.create(body));
    }

    static createCellOfProbeLaunchSettlement(body: {
        queryId: uint64
        leg: uint3
    }) {
        return ProbeLaunchSettlement.toCell(ProbeLaunchSettlement.create(body));
    }

    static createCellOfInspectLaunchMint(body: {
        queryId: uint64
        leg: uint3
        curve: c.Address
    }) {
        return InspectLaunchMint.toCell(InspectLaunchMint.create(body));
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

    async sendAskToTransfer(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AskToTransfer.toCell(AskToTransfer.create(body)),
            ...extraOptions
        });
    }

    async sendAskToTransferTracked(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        transferRecipient: c.Address
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
        forwardTonAmount: coins
        forwardPayload: ForwardPayloadRemainder
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AskToTransferTracked.toCell(AskToTransferTracked.create(body)),
            ...extraOptions
        });
    }

    async sendAskToBurn(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        sendExcessesTo: c.Address | null
        customPayload: c.Cell | null
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AskToBurn.toCell(AskToBurn.create(body)),
            ...extraOptions
        });
    }

    async sendAskToBurnTracked(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: AskToBurnTracked.toCell(AskToBurnTracked.create(body)),
            ...extraOptions
        });
    }

    async sendInternalTransferStep(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address | null
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        forwardPayload: PayloadInline | PayloadInRef
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InternalTransferStep.toCell(InternalTransferStep.create(body)),
            ...extraOptions
        });
    }

    async sendInternalTransferTracked(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        transferInitiator: c.Address | null
        sendExcessesTo: c.Address | null
        forwardTonAmount: coins
        forwardPayload: ForwardPayloadRemainder
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InternalTransferTracked.toCell(InternalTransferTracked.create(body)),
            ...extraOptions
        });
    }

    async sendInternalCurveMint(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InternalCurveMint.toCell(InternalCurveMint.create(body)),
            ...extraOptions
        });
    }

    async sendInternalLaunchMint(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        jettonAmount: coins
        curve: c.Address
        protect: boolean
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InternalLaunchMint.toCell(InternalLaunchMint.create(body)),
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

    async sendInspectLaunchMint(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        leg: uint3
        curve: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: InspectLaunchMint.toCell(InspectLaunchMint.create(body)),
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

    async getWalletData(provider: ContractProvider): Promise<JettonWalletDataReply> {
        const r = StackReader.fromGetMethod(4, await provider.get('get_wallet_data', []));
        return ({
            $: 'JettonWalletDataReply',
            jettonBalance: r.readBigInt(),
            ownerAddress: r.readSlice().loadAddress(),
            minterAddress: r.readSlice().loadAddress(),
            jettonWalletCode: r.readCell(),
        });
    }

    async getMinSellNotification(provider: ContractProvider): Promise<coins> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_min_sell_notification', []));
        return r.readBigInt();
    }
}
