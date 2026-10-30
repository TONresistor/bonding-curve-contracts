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
