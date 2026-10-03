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
