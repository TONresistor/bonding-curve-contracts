// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a BondingCurveMasterV2 contract in Tolk.
/* eslint-disable */

import * as c from '@ton/core';
import { beginCell, ContractProvider, Sender, SendMode } from '@ton/core';

// ————————————————————————————————————————————
//   predefined types and functions
//

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
}

// ————————————————————————————————————————————
//   auto-generated serializers to/from cells
//

type coins = bigint

type uint2 = bigint
type uint3 = bigint
type uint16 = bigint
type uint64 = bigint
type uint256 = bigint

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
 > struct (0xa0a0b001) CreateLaunch {
 >     queryId: uint64
 >     metadata: cell
 >     salt: uint64
 >     options: Cell<LaunchOptions>
 > }
 */
export interface CreateLaunch {
    readonly $: 'CreateLaunch'
    queryId: uint64
    metadata: c.Cell
    salt: uint64
    options: CellRef<LaunchOptions>
}

export const CreateLaunch = {
    PREFIX: 0xa0a0b001,

    create(args: {
        queryId: uint64
        metadata: c.Cell
        salt: uint64
        options: CellRef<LaunchOptions>
    }): CreateLaunch {
        return {
            $: 'CreateLaunch',
            ...args
        }
    },
    fromSlice(s: c.Slice): CreateLaunch {
        loadAndCheckPrefix32(s, 0xa0a0b001, 'CreateLaunch');
        return {
            $: 'CreateLaunch',
            queryId: s.loadUintBig(64),
            metadata: s.loadRef(),
            salt: s.loadUintBig(64),
            options: loadCellRef<LaunchOptions>(s, LaunchOptions.fromSlice),
        }
    },
    store(self: CreateLaunch, b: c.Builder): void {
        b.storeUint(0xa0a0b001, 32);
        b.storeUint(self.queryId, 64);
        b.storeRef(self.metadata);
        b.storeUint(self.salt, 64);
        storeCellRef<LaunchOptions>(self.options, b, LaunchOptions.store);
    },
    toCell(self: CreateLaunch): c.Cell {
        return makeCellFrom<CreateLaunch>(self, CreateLaunch.store);
    }
}

/**
 > struct (0xa0a0a002) ChangeMasterAdmin {
 >     queryId: uint64
 >     newAdmin: address
 > }
 */
export interface ChangeMasterAdmin {
    readonly $: 'ChangeMasterAdmin'
    queryId: uint64
    newAdmin: c.Address
}

export const ChangeMasterAdmin = {
    PREFIX: 0xa0a0a002,

    create(args: {
        queryId: uint64
        newAdmin: c.Address
    }): ChangeMasterAdmin {
        return {
            $: 'ChangeMasterAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeMasterAdmin {
        loadAndCheckPrefix32(s, 0xa0a0a002, 'ChangeMasterAdmin');
        return {
            $: 'ChangeMasterAdmin',
            queryId: s.loadUintBig(64),
            newAdmin: s.loadAddress(),
        }
    },
    store(self: ChangeMasterAdmin, b: c.Builder): void {
        b.storeUint(0xa0a0a002, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.newAdmin);
    },
    toCell(self: ChangeMasterAdmin): c.Cell {
        return makeCellFrom<ChangeMasterAdmin>(self, ChangeMasterAdmin.store);
    }
}

/**
 > struct (0xa0a0a003) ClaimMasterAdmin {
 >     queryId: uint64
 > }
 */
export interface ClaimMasterAdmin {
    readonly $: 'ClaimMasterAdmin'
    queryId: uint64
}

export const ClaimMasterAdmin = {
    PREFIX: 0xa0a0a003,

    create(args: {
        queryId: uint64
    }): ClaimMasterAdmin {
        return {
            $: 'ClaimMasterAdmin',
            ...args
        }
    },
    fromSlice(s: c.Slice): ClaimMasterAdmin {
        loadAndCheckPrefix32(s, 0xa0a0a003, 'ClaimMasterAdmin');
        return {
            $: 'ClaimMasterAdmin',
            queryId: s.loadUintBig(64),
        }
    },
    store(self: ClaimMasterAdmin, b: c.Builder): void {
        b.storeUint(0xa0a0a003, 32);
        b.storeUint(self.queryId, 64);
    },
    toCell(self: ClaimMasterAdmin): c.Cell {
        return makeCellFrom<ClaimMasterAdmin>(self, ClaimMasterAdmin.store);
    }
}

/**
 > struct (0xa0a0a004) ChangeTreasury {
 >     queryId: uint64
 >     newTreasury: address
 > }
 */
export interface ChangeTreasury {
    readonly $: 'ChangeTreasury'
    queryId: uint64
    newTreasury: c.Address
}

export const ChangeTreasury = {
    PREFIX: 0xa0a0a004,

    create(args: {
        queryId: uint64
        newTreasury: c.Address
    }): ChangeTreasury {
        return {
            $: 'ChangeTreasury',
            ...args
        }
    },
    fromSlice(s: c.Slice): ChangeTreasury {
        loadAndCheckPrefix32(s, 0xa0a0a004, 'ChangeTreasury');
        return {
            $: 'ChangeTreasury',
            queryId: s.loadUintBig(64),
            newTreasury: s.loadAddress(),
        }
    },
    store(self: ChangeTreasury, b: c.Builder): void {
        b.storeUint(0xa0a0a004, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.newTreasury);
    },
    toCell(self: ChangeTreasury): c.Cell {
        return makeCellFrom<ChangeTreasury>(self, ChangeTreasury.store);
    }
}

/**
 > struct (0xa0a0a005) WithdrawProtocolFees {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface WithdrawProtocolFees {
    readonly $: 'WithdrawProtocolFees'
    queryId: uint64
    amount: coins
}

export const WithdrawProtocolFees = {
    PREFIX: 0xa0a0a005,

    create(args: {
        queryId: uint64
        amount: coins
    }): WithdrawProtocolFees {
        return {
            $: 'WithdrawProtocolFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): WithdrawProtocolFees {
        loadAndCheckPrefix32(s, 0xa0a0a005, 'WithdrawProtocolFees');
        return {
            $: 'WithdrawProtocolFees',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: WithdrawProtocolFees, b: c.Builder): void {
        b.storeUint(0xa0a0a005, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: WithdrawProtocolFees): c.Cell {
        return makeCellFrom<WithdrawProtocolFees>(self, WithdrawProtocolFees.store);
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
 > struct (0xa0a0a014) ReinitializeCurve {
 >     queryId: uint64
 >     creator: address
 >     salt: uint64
 >     metadata: cell
 >     options: Cell<LaunchOptions>
 > }
 */
export interface ReinitializeCurve {
    readonly $: 'ReinitializeCurve'
    queryId: uint64
    creator: c.Address
    salt: uint64
    metadata: c.Cell
    options: CellRef<LaunchOptions>
}

export const ReinitializeCurve = {
    PREFIX: 0xa0a0a014,

    create(args: {
        queryId: uint64
        creator: c.Address
        salt: uint64
        metadata: c.Cell
        options: CellRef<LaunchOptions>
    }): ReinitializeCurve {
        return {
            $: 'ReinitializeCurve',
            ...args
        }
    },
    fromSlice(s: c.Slice): ReinitializeCurve {
        loadAndCheckPrefix32(s, 0xa0a0a014, 'ReinitializeCurve');
        return {
            $: 'ReinitializeCurve',
            queryId: s.loadUintBig(64),
            creator: s.loadAddress(),
            salt: s.loadUintBig(64),
            metadata: s.loadRef(),
            options: loadCellRef<LaunchOptions>(s, LaunchOptions.fromSlice),
        }
    },
    store(self: ReinitializeCurve, b: c.Builder): void {
        b.storeUint(0xa0a0a014, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.creator);
        b.storeUint(self.salt, 64);
        b.storeRef(self.metadata);
        storeCellRef<LaunchOptions>(self.options, b, LaunchOptions.store);
    },
    toCell(self: ReinitializeCurve): c.Cell {
        return makeCellFrom<ReinitializeCurve>(self, ReinitializeCurve.store);
    }
}

/**
 > struct (0xa0a0a015) TreasuryPayout {
 >     queryId: uint64
 >     amount: coins
 > }
 */
export interface TreasuryPayout {
    readonly $: 'TreasuryPayout'
    queryId: uint64
    amount: coins
}

export const TreasuryPayout = {
    PREFIX: 0xa0a0a015,

    create(args: {
        queryId: uint64
        amount: coins
    }): TreasuryPayout {
        return {
            $: 'TreasuryPayout',
            ...args
        }
    },
    fromSlice(s: c.Slice): TreasuryPayout {
        loadAndCheckPrefix32(s, 0xa0a0a015, 'TreasuryPayout');
        return {
            $: 'TreasuryPayout',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
        }
    },
    store(self: TreasuryPayout, b: c.Builder): void {
        b.storeUint(0xa0a0a015, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
    },
    toCell(self: TreasuryPayout): c.Cell {
        return makeCellFrom<TreasuryPayout>(self, TreasuryPayout.store);
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
 > struct LaunchCreatedEvent {
 >     creator: address
 >     salt: uint64
 >     curveAddress: address
 >     minterAddress: address
 >     virtualTonReserve: coins
 > }
 */
export interface LaunchCreatedEvent {
    readonly $: 'LaunchCreatedEvent'
    creator: c.Address
    salt: uint64
    curveAddress: c.Address
    minterAddress: c.Address
    virtualTonReserve: coins
}

export const LaunchCreatedEvent = {
    create(args: {
        creator: c.Address
        salt: uint64
        curveAddress: c.Address
        minterAddress: c.Address
        virtualTonReserve: coins
    }): LaunchCreatedEvent {
        return {
            $: 'LaunchCreatedEvent',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchCreatedEvent {
        return {
            $: 'LaunchCreatedEvent',
            creator: s.loadAddress(),
            salt: s.loadUintBig(64),
            curveAddress: s.loadAddress(),
            minterAddress: s.loadAddress(),
            virtualTonReserve: s.loadCoins(),
        }
    },
    store(self: LaunchCreatedEvent, b: c.Builder): void {
        b.storeAddress(self.creator);
        b.storeUint(self.salt, 64);
        b.storeAddress(self.curveAddress);
        b.storeAddress(self.minterAddress);
        b.storeCoins(self.virtualTonReserve);
    },
    toCell(self: LaunchCreatedEvent): c.Cell {
        return makeCellFrom<LaunchCreatedEvent>(self, LaunchCreatedEvent.store);
    }
}

/**
 > struct LaunchRolledBackEvent {
 >     refundTo: address
 >     curveAddress: address
 >     refundSent: bool
 >     refundAmount: coins
 > }
 */
export interface LaunchRolledBackEvent {
    readonly $: 'LaunchRolledBackEvent'
    refundTo: c.Address
    curveAddress: c.Address
    refundSent: boolean
    refundAmount: coins
}

export const LaunchRolledBackEvent = {
    create(args: {
        refundTo: c.Address
        curveAddress: c.Address
        refundSent: boolean
        refundAmount: coins
    }): LaunchRolledBackEvent {
        return {
            $: 'LaunchRolledBackEvent',
            ...args
        }
    },
    fromSlice(s: c.Slice): LaunchRolledBackEvent {
        return {
            $: 'LaunchRolledBackEvent',
            refundTo: s.loadAddress(),
            curveAddress: s.loadAddress(),
            refundSent: s.loadBoolean(),
            refundAmount: s.loadCoins(),
        }
    },
    store(self: LaunchRolledBackEvent, b: c.Builder): void {
        b.storeAddress(self.refundTo);
        b.storeAddress(self.curveAddress);
        b.storeBit(self.refundSent);
        b.storeCoins(self.refundAmount);
    },
    toCell(self: LaunchRolledBackEvent): c.Cell {
        return makeCellFrom<LaunchRolledBackEvent>(self, LaunchRolledBackEvent.store);
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
 > struct CreationQuote {
 >     minimumCreateValue: coins
 >     protocolFee: coins
 >     migrationPrefund: coins
 >     operatingReserves: coins
 >     executionBudget: coins
 > }
 */
export interface CreationQuote {
    readonly $: 'CreationQuote'
    minimumCreateValue: coins
    protocolFee: coins
    migrationPrefund: coins
    operatingReserves: coins
    executionBudget: coins
}

export const CreationQuote = {
    create(args: {
        minimumCreateValue: coins
        protocolFee: coins
        migrationPrefund: coins
        operatingReserves: coins
        executionBudget: coins
    }): CreationQuote {
        return {
            $: 'CreationQuote',
            ...args
        }
    },
    fromSlice(s: c.Slice): CreationQuote {
        return {
            $: 'CreationQuote',
            minimumCreateValue: s.loadCoins(),
            protocolFee: s.loadCoins(),
            migrationPrefund: s.loadCoins(),
            operatingReserves: s.loadCoins(),
            executionBudget: s.loadCoins(),
        }
    },
    store(self: CreationQuote, b: c.Builder): void {
        b.storeCoins(self.minimumCreateValue);
        b.storeCoins(self.protocolFee);
        b.storeCoins(self.migrationPrefund);
        b.storeCoins(self.operatingReserves);
        b.storeCoins(self.executionBudget);
    },
    toCell(self: CreationQuote): c.Cell {
        return makeCellFrom<CreationQuote>(self, CreationQuote.store);
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
 > struct MasterStorage {
 >     admin: address
 >     nextAdmin: address?
 >     treasury: address
 >     totalLaunches: uint64
 >     feesBalance: coins
 >     launches: map<uint256, uint2>
 > }
 */
export interface MasterStorage {
    readonly $: 'MasterStorage'
    admin: c.Address
    nextAdmin: c.Address | null
    treasury: c.Address
    totalLaunches: uint64
    feesBalance: coins
    launches: c.Dictionary<uint256, uint2> /* = [] as map<uint256, uint2> */
}

export const MasterStorage = {
    create(args: {
        admin: c.Address
        nextAdmin: c.Address | null
        treasury: c.Address
        totalLaunches: uint64
        feesBalance: coins
        launches: c.Dictionary<uint256, uint2> /* = [] as map<uint256, uint2> */
    }): MasterStorage {
        return {
            $: 'MasterStorage',
            ...args
        }
    },
    fromSlice(s: c.Slice): MasterStorage {
        return {
            $: 'MasterStorage',
            admin: s.loadAddress(),
            nextAdmin: s.loadMaybeAddress(),
            treasury: s.loadAddress(),
            totalLaunches: s.loadUintBig(64),
            feesBalance: s.loadCoins(),
            launches: c.Dictionary.load<uint256, uint2>(c.Dictionary.Keys.BigUint(256), c.Dictionary.Values.BigUint(2), s),
        }
    },
    store(self: MasterStorage, b: c.Builder): void {
        b.storeAddress(self.admin);
        b.storeAddress(self.nextAdmin);
        b.storeAddress(self.treasury);
        b.storeUint(self.totalLaunches, 64);
        b.storeCoins(self.feesBalance);
        b.storeDict<uint256, uint2>(self.launches, c.Dictionary.Keys.BigUint(256), c.Dictionary.Values.BigUint(2));
    },
    toCell(self: MasterStorage): c.Cell {
        return makeCellFrom<MasterStorage>(self, MasterStorage.store);
    }
}

/**
 > struct MasterDataReply {
 >     admin: address
 >     nextAdmin: address?
 >     treasury: address
 >     totalLaunches: uint64
 >     feesBalance: coins
 > }
 */
export interface MasterDataReply {
    readonly $: 'MasterDataReply'
    admin: c.Address
    nextAdmin: c.Address | null
    treasury: c.Address
    totalLaunches: uint64
    feesBalance: coins
}

export const MasterDataReply = {
    create(args: {
        admin: c.Address
        nextAdmin: c.Address | null
        treasury: c.Address
        totalLaunches: uint64
        feesBalance: coins
    }): MasterDataReply {
        return {
            $: 'MasterDataReply',
            ...args
        }
    },
    fromSlice(s: c.Slice): MasterDataReply {
        return {
            $: 'MasterDataReply',
            admin: s.loadAddress(),
            nextAdmin: s.loadMaybeAddress(),
            treasury: s.loadAddress(),
            totalLaunches: s.loadUintBig(64),
            feesBalance: s.loadCoins(),
        }
    },
    store(self: MasterDataReply, b: c.Builder): void {
        b.storeAddress(self.admin);
        b.storeAddress(self.nextAdmin);
        b.storeAddress(self.treasury);
        b.storeUint(self.totalLaunches, 64);
        b.storeCoins(self.feesBalance);
    },
    toCell(self: MasterDataReply): c.Cell {
        return makeCellFrom<MasterDataReply>(self, MasterDataReply.store);
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

// ————————————————————————————————————————————
//    class BondingCurveMasterV2
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

export class BondingCurveMasterV2 implements c.Contract {
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
        return new BondingCurveMasterV2(address);
    }

    static fromStorage(emptyStorage: {
        admin: c.Address
        nextAdmin: c.Address | null
        treasury: c.Address
        totalLaunches: uint64
        feesBalance: coins
        launches: c.Dictionary<uint256, uint2> /* = [] as map<uint256, uint2> */
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? BondingCurveMasterV2.CodeCell,
            data: MasterStorage.toCell(MasterStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new BondingCurveMasterV2(address, initialState);
    }

    static createCellOfCreateLaunch(body: {
        queryId: uint64
        metadata: c.Cell
        salt: uint64
        options: CellRef<LaunchOptions>
    }) {
        return CreateLaunch.toCell(CreateLaunch.create(body));
    }

    static createCellOfConfirmLaunch(body: {
        queryId: uint64
        creator: c.Address
        salt: uint64
        options: CellRef<LaunchOptions>
    }) {
        return ConfirmLaunch.toCell(ConfirmLaunch.create(body));
    }

    static createCellOfCancelLaunchFees(body: {
        queryId: uint64
        creator: c.Address
        salt: uint64
        options: CellRef<LaunchOptions>
    }) {
        return CancelLaunchFees.toCell(CancelLaunchFees.create(body));
    }

    static createCellOfChangeMasterAdmin(body: {
        queryId: uint64
        newAdmin: c.Address
    }) {
        return ChangeMasterAdmin.toCell(ChangeMasterAdmin.create(body));
    }

    static createCellOfClaimMasterAdmin(body: {
        queryId: uint64
    }) {
        return ClaimMasterAdmin.toCell(ClaimMasterAdmin.create(body));
    }

    static createCellOfChangeTreasury(body: {
        queryId: uint64
        newTreasury: c.Address
    }) {
        return ChangeTreasury.toCell(ChangeTreasury.create(body));
    }

    static createCellOfWithdrawProtocolFees(body: {
        queryId: uint64
        amount: coins
    }) {
        return WithdrawProtocolFees.toCell(WithdrawProtocolFees.create(body));
    }

    static createCellOfDepositProtocolFees(body: {
        queryId: uint64
        amount: coins
        creator: c.Address
        salt: uint64
        options: CellRef<LaunchOptions>
    }) {
        return DepositProtocolFees.toCell(DepositProtocolFees.create(body));
    }

    static createCellOfReinitializeCurve(body: {
        queryId: uint64
        creator: c.Address
        salt: uint64
        metadata: c.Cell
        options: CellRef<LaunchOptions>
    }) {
        return ReinitializeCurve.toCell(ReinitializeCurve.create(body));
    }

    static createCellOfTopUpTons(body: {
    }) {
        return TopUpTons.toCell(TopUpTons.create());
    }

    static createCellOfProbeLaunchSettlement(body: {
        queryId: uint64
        leg: uint3
    }) {
        return ProbeLaunchSettlement.toCell(ProbeLaunchSettlement.create(body));
    }

    async sendDeploy(provider: ContractProvider, via: Sender, msgValue: coins, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: c.Cell.EMPTY,
            ...extraOptions
        });
    }

    async sendCreateLaunch(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        metadata: c.Cell
        salt: uint64
        options: CellRef<LaunchOptions>
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CreateLaunch.toCell(CreateLaunch.create(body)),
            ...extraOptions
        });
    }

    async sendConfirmLaunch(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        creator: c.Address
        salt: uint64
        options: CellRef<LaunchOptions>
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ConfirmLaunch.toCell(ConfirmLaunch.create(body)),
            ...extraOptions
        });
    }

    async sendCancelLaunchFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        creator: c.Address
        salt: uint64
        options: CellRef<LaunchOptions>
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CancelLaunchFees.toCell(CancelLaunchFees.create(body)),
            ...extraOptions
        });
    }

    async sendChangeMasterAdmin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        newAdmin: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeMasterAdmin.toCell(ChangeMasterAdmin.create(body)),
            ...extraOptions
        });
    }

    async sendClaimMasterAdmin(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ClaimMasterAdmin.toCell(ClaimMasterAdmin.create(body)),
            ...extraOptions
        });
    }

    async sendChangeTreasury(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        newTreasury: c.Address
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ChangeTreasury.toCell(ChangeTreasury.create(body)),
            ...extraOptions
        });
    }

    async sendWithdrawProtocolFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: WithdrawProtocolFees.toCell(WithdrawProtocolFees.create(body)),
            ...extraOptions
        });
    }

    async sendDepositProtocolFees(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        amount: coins
        creator: c.Address
        salt: uint64
        options: CellRef<LaunchOptions>
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: DepositProtocolFees.toCell(DepositProtocolFees.create(body)),
            ...extraOptions
        });
    }

    async sendReinitializeCurve(provider: ContractProvider, via: Sender, msgValue: coins, body: {
        queryId: uint64
        creator: c.Address
        salt: uint64
        metadata: c.Cell
        options: CellRef<LaunchOptions>
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: ReinitializeCurve.toCell(ReinitializeCurve.create(body)),
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

    async getMasterData(provider: ContractProvider): Promise<MasterDataReply> {
        const r = StackReader.fromGetMethod(5, await provider.get('get_master_data', []));
        return ({
            $: 'MasterDataReply',
            admin: r.readSlice().loadAddress(),
            nextAdmin: r.readNullable<c.Address>(
                (r) => r.readSlice().loadAddress()
            ),
            treasury: r.readSlice().loadAddress(),
            totalLaunches: r.readBigInt(),
            feesBalance: r.readBigInt(),
        });
    }

    async getLaunchAddress(provider: ContractProvider, creator: c.Address, salt: uint64, options: CellRef<LaunchOptions>): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_launch_address', [
            { type: 'slice', cell: makeCellFrom<c.Address>(creator,
                (v,b) => b.storeAddress(v)
            ) },
            { type: 'int', value: salt },
            { type: 'cell', cell: LaunchOptions.toCell(options.ref) },
        ]));
        return r.readSlice().loadAddress();
    }

    async getStorageReserve(provider: ContractProvider): Promise<coins> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_storage_reserve', []));
        return r.readBigInt();
    }

    async getLaunchPreview(provider: ContractProvider, options: CellRef<LaunchOptions>): Promise<LaunchPreview> {
        const r = StackReader.fromGetMethod(12, await provider.get('get_launch_preview', [
            { type: 'cell', cell: LaunchOptions.toCell(options.ref) },
        ]));
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

    async getVersion(provider: ContractProvider): Promise<bigint> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_version', []));
        return r.readBigInt();
    }

    async getCreateLaunchQuote(provider: ContractProvider, creator: c.Address, request: CellRef<CreateLaunch>): Promise<CreationQuote> {
        const r = StackReader.fromGetMethod(5, await provider.get('get_create_launch_quote', [
            { type: 'slice', cell: makeCellFrom<c.Address>(creator,
                (v,b) => b.storeAddress(v)
            ) },
            { type: 'cell', cell: CreateLaunch.toCell(request.ref) },
        ]));
        return ({
            $: 'CreationQuote',
            minimumCreateValue: r.readBigInt(),
            protocolFee: r.readBigInt(),
            migrationPrefund: r.readBigInt(),
            operatingReserves: r.readBigInt(),
            executionBudget: r.readBigInt(),
        });
    }
}
