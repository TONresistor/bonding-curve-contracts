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
