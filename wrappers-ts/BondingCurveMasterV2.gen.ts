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
