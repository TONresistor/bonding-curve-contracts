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
type uint8 = bigint
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
 >     reserveRatio: uint8
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
    reserveRatio: uint8 /* = 5 */
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
        reserveRatio?: uint8 /* = 5 */
        minBuyBps?: uint16 /* = 0 */
        maxBuyBps?: uint16 /* = 0 */
        beneficiaries?: CellRef<FeeBeneficiaries> | null /* = null */
        buybackBurn?: boolean /* = false */
    }): LaunchOptions {
        return {
            $: 'LaunchOptions',
            graduationThreshold: 2000000000000n,
            reserveRatio: 5n,
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
            reserveRatio: s.loadUintBig(8),
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
        b.storeUint(self.reserveRatio, 8);
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
        const r = StackReader.fromGetMethod(10, await provider.get('get_launch_preview', [
            { type: 'cell', cell: LaunchOptions.toCell(options.ref) },
        ]));
        return ({
            $: 'LaunchPreview',
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
