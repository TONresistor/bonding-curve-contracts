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
}
