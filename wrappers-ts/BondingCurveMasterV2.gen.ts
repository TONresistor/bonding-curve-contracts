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
 >     minBuy: coins
 >     maxBuy: coins
 >     beneficiaries: Cell<FeeBeneficiaries>?
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
    minBuy: coins /* = 0 */
    maxBuy: coins /* = 0 */
    beneficiaries: CellRef<FeeBeneficiaries> | null /* = null */
}

export const LaunchOptions = {
    create(args: {
        supply: coins
        creatorFeeBps: uint16
        devBuyAmount: coins
        minDevTokens: coins
        graduationThreshold?: coins /* = 2000000000000 as coins */
        reserveRatio?: uint8 /* = 5 */
        minBuy?: coins /* = 0 */
        maxBuy?: coins /* = 0 */
        beneficiaries?: CellRef<FeeBeneficiaries> | null /* = null */
    }): LaunchOptions {
        return {
            $: 'LaunchOptions',
            graduationThreshold: 2000000000000n,
            reserveRatio: 5n,
            minBuy: 0n,
            maxBuy: 0n,
            beneficiaries: null,
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
            minBuy: s.loadCoins(),
            maxBuy: s.loadCoins(),
            beneficiaries: s.loadBoolean() ? loadCellRef<FeeBeneficiaries>(s, FeeBeneficiaries.fromSlice) : null,
        }
    },
    store(self: LaunchOptions, b: c.Builder): void {
        b.storeCoins(self.supply);
        b.storeUint(self.creatorFeeBps, 16);
        b.storeCoins(self.devBuyAmount);
        b.storeCoins(self.minDevTokens);
        b.storeCoins(self.graduationThreshold);
        b.storeUint(self.reserveRatio, 8);
        b.storeCoins(self.minBuy);
        b.storeCoins(self.maxBuy);
        storeTolkNullable<CellRef<FeeBeneficiaries>>(self.beneficiaries, b,
            (v,b) => storeCellRef<FeeBeneficiaries>(v, b, FeeBeneficiaries.store)
        );
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
        const r = StackReader.fromGetMethod(8, await provider.get('get_launch_preview', [
            { type: 'cell', cell: LaunchOptions.toCell(options.ref) },
        ]));
        return ({
            $: 'LaunchPreview',
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
