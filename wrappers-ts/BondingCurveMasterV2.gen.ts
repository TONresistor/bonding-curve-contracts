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
type uint16 = bigint
type uint64 = bigint
type uint256 = bigint

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
 > struct LaunchOptions {
 >     supply: coins
 >     creatorFeeBps: uint16
 >     devBuyAmount: coins
 >     minDevTokens: coins
 > }
 */
export interface LaunchOptions {
    readonly $: 'LaunchOptions'
    supply: coins
    creatorFeeBps: uint16
    devBuyAmount: coins
    minDevTokens: coins
}

export const LaunchOptions = {
    create(args: {
        supply: coins
        creatorFeeBps: uint16
        devBuyAmount: coins
        minDevTokens: coins
    }): LaunchOptions {
        return {
            $: 'LaunchOptions',
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
        }
    },
    store(self: LaunchOptions, b: c.Builder): void {
        b.storeCoins(self.supply);
        b.storeUint(self.creatorFeeBps, 16);
        b.storeCoins(self.devBuyAmount);
        b.storeCoins(self.minDevTokens);
    },
    toCell(self: LaunchOptions): c.Cell {
        return makeCellFrom<LaunchOptions>(self, LaunchOptions.store);
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

    async getVersion(provider: ContractProvider): Promise<bigint> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_version', []));
        return r.readBigInt();
    }
}
