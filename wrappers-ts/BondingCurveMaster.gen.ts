// AUTO-GENERATED, do not edit
// It's a TypeScript wrapper for a BondingCurveMaster contract in Tolk.
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

type uint64 = bigint

/**
 > struct (0xa0a0a001) CreateLaunch {
 >     queryId: uint64
 >     metadata: cell
 >     salt: uint64
 > }
 */
export interface CreateLaunch {
    readonly $: 'CreateLaunch'
    queryId: uint64
    metadata: c.Cell
    salt: uint64
}

export const CreateLaunch = {
    PREFIX: 0xa0a0a001,

    create(args: {
        queryId: uint64
        metadata: c.Cell
        salt: uint64
    }): CreateLaunch {
        return {
            $: 'CreateLaunch',
            ...args
        }
    },
    fromSlice(s: c.Slice): CreateLaunch {
        loadAndCheckPrefix32(s, 0xa0a0a001, 'CreateLaunch');
        return {
            $: 'CreateLaunch',
            queryId: s.loadUintBig(64),
            metadata: s.loadRef(),
            salt: s.loadUintBig(64),
        }
    },
    store(self: CreateLaunch, b: c.Builder): void {
        b.storeUint(0xa0a0a001, 32);
        b.storeUint(self.queryId, 64);
        b.storeRef(self.metadata);
        b.storeUint(self.salt, 64);
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
 > struct (0xa0a0a006) DepositProtocolFees {
 >     queryId: uint64
 >     amount: coins
 >     creator: address
 >     salt: uint64
 > }
 */
export interface DepositProtocolFees {
    readonly $: 'DepositProtocolFees'
    queryId: uint64
    amount: coins
    creator: c.Address
    salt: uint64
}

export const DepositProtocolFees = {
    PREFIX: 0xa0a0a006,

    create(args: {
        queryId: uint64
        amount: coins
        creator: c.Address
        salt: uint64
    }): DepositProtocolFees {
        return {
            $: 'DepositProtocolFees',
            ...args
        }
    },
    fromSlice(s: c.Slice): DepositProtocolFees {
        loadAndCheckPrefix32(s, 0xa0a0a006, 'DepositProtocolFees');
        return {
            $: 'DepositProtocolFees',
            queryId: s.loadUintBig(64),
            amount: s.loadCoins(),
            creator: s.loadAddress(),
            salt: s.loadUintBig(64),
        }
    },
    store(self: DepositProtocolFees, b: c.Builder): void {
        b.storeUint(0xa0a0a006, 32);
        b.storeUint(self.queryId, 64);
        b.storeCoins(self.amount);
        b.storeAddress(self.creator);
        b.storeUint(self.salt, 64);
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
 > }
 */
export interface ReinitializeCurve {
    readonly $: 'ReinitializeCurve'
    queryId: uint64
    creator: c.Address
    salt: uint64
    metadata: c.Cell
}

export const ReinitializeCurve = {
    PREFIX: 0xa0a0a014,

    create(args: {
        queryId: uint64
        creator: c.Address
        salt: uint64
        metadata: c.Cell
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
        }
    },
    store(self: ReinitializeCurve, b: c.Builder): void {
        b.storeUint(0xa0a0a014, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.creator);
        b.storeUint(self.salt, 64);
        b.storeRef(self.metadata);
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
 > }
 */
export interface InitializeCurve {
    readonly $: 'InitializeCurve'
    queryId: uint64
    jettonMinter: c.Address
    refundTo: c.Address | null
}

export const InitializeCurve = {
    PREFIX: 0xa0a0a010,

    create(args: {
        queryId: uint64
        jettonMinter: c.Address
        refundTo: c.Address | null
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
        }
    },
    store(self: InitializeCurve, b: c.Builder): void {
        b.storeUint(0xa0a0a010, 32);
        b.storeUint(self.queryId, 64);
        b.storeAddress(self.jettonMinter);
        b.storeAddress(self.refundTo);
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
 > struct MasterStorage {
 >     admin: address
 >     nextAdmin: address?
 >     treasury: address
 >     totalLaunches: uint64
 >     feesBalance: coins
 > }
 */
export interface MasterStorage {
    readonly $: 'MasterStorage'
    admin: c.Address
    nextAdmin: c.Address | null
    treasury: c.Address
    totalLaunches: uint64
    feesBalance: coins
}

export const MasterStorage = {
    create(args: {
        admin: c.Address
        nextAdmin: c.Address | null
        treasury: c.Address
        totalLaunches: uint64
        feesBalance: coins
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
        }
    },
    store(self: MasterStorage, b: c.Builder): void {
        b.storeAddress(self.admin);
        b.storeAddress(self.nextAdmin);
        b.storeAddress(self.treasury);
        b.storeUint(self.totalLaunches, 64);
        b.storeCoins(self.feesBalance);
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
//    class BondingCurveMaster
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

export class BondingCurveMaster implements c.Contract {
    static CodeCell = c.Cell.fromBase64('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');

    static Errors = {
        'Errors.BalanceError': 47,
        'Errors.NotEnoughGas': 48,
        'Errors.InvalidMessage': 49,
        'Errors.NotOwner': 73,
        'Errors.NotValidWallet': 74,
    }

    readonly address: c.Address
    readonly init: { code: c.Cell, data: c.Cell } | undefined

    protected constructor(address: c.Address, init?: { code: c.Cell, data: c.Cell }) {
        this.address = address;
        this.init = init;
    }

    static fromAddress(address: c.Address) {
        return new BondingCurveMaster(address);
    }

    static fromStorage(emptyStorage: {
        admin: c.Address
        nextAdmin: c.Address | null
        treasury: c.Address
        totalLaunches: uint64
        feesBalance: coins
    }, deployedOptions?: DeployedAddrOptions) {
        const initialState = {
            code: deployedOptions?.overrideContractCode ?? BondingCurveMaster.CodeCell,
            data: MasterStorage.toCell(MasterStorage.create(emptyStorage)),
        };
        const address = calculateDeployedAddress(initialState.code, initialState.data, deployedOptions ?? {});
        return new BondingCurveMaster(address, initialState);
    }

    static createCellOfCreateLaunch(body: {
        queryId: uint64
        metadata: c.Cell
        salt: uint64
    }) {
        return CreateLaunch.toCell(CreateLaunch.create(body));
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
    }) {
        return DepositProtocolFees.toCell(DepositProtocolFees.create(body));
    }

    static createCellOfReinitializeCurve(body: {
        queryId: uint64
        creator: c.Address
        salt: uint64
        metadata: c.Cell
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
    }, extraOptions?: ExtraSendOptions) {
        return provider.internal(via, {
            value: msgValue,
            body: CreateLaunch.toCell(CreateLaunch.create(body)),
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

    async getLaunchAddress(provider: ContractProvider, creator: c.Address, salt: uint64): Promise<c.Address> {
        const r = StackReader.fromGetMethod(1, await provider.get('get_launch_address', [
            { type: 'slice', cell: makeCellFrom<c.Address>(creator,
                (v,b) => b.storeAddress(v)
            ) },
            { type: 'int', value: salt },
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
