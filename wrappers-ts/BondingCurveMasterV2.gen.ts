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
