import Long from 'long';
import _m0 from 'protobufjs/minimal';

export interface StockPriceMessage {
    price: number;
    bid1: number;
    offer1: number;
    bid2: number;
    offer2: number;
    bid3: number;
    offer3: number;
    bid1Vol: number;
    offer1Vol: number;
    bid2Vol: number;
    offer2Vol: number;
    bid3Vol: number;
    offer3Vol: number;
    changePercent: number;
    symbol: string;
    change: number;
    vol: number;
    remainBid: number;
    remainAsk: number;
    foreignBought: number;
    foreignSold: number;
    foreignRemain: number;
    totalVol: number;
    totalVal: number;
    high: number;
    medium: number;
    low: number;
    ceiling: number;
    reference: number;
    floor: number;
    name: string;
    score?: string;
    valuation_percent?: number;
    valuation_type?: string;
    exchange?: string;
}

export interface StockPriceMessageList {
    stockPrices: StockPriceMessage[];
}

export interface IndexData {
    indexValue: number;
    allQuantity: number;
    allValue: number;
    advances: number;
    declines: number;
    nochanges: number;
    change: number;
    changePercent: number;
    reference: number;
    sessionInExchange: string;
    name: string;
    ceiling: number;
    floor: number;
    createdAt: number;
}

function createBaseStockPriceMessage(): StockPriceMessage {
    return {
        price: 0,
        bid1: 0,
        offer1: 0,
        bid2: 0,
        offer2: 0,
        bid3: 0,
        offer3: 0,
        bid1Vol: 0,
        offer1Vol: 0,
        bid2Vol: 0,
        offer2Vol: 0,
        bid3Vol: 0,
        offer3Vol: 0,
        changePercent: 0,
        symbol: '',
        change: 0,
        vol: 0,
        remainBid: 0,
        remainAsk: 0,
        foreignBought: 0,
        foreignSold: 0,
        foreignRemain: 0,
        totalVol: 0,
        totalVal: 0,
        high: 0,
        medium: 0,
        low: 0,
        ceiling: 0,
        reference: 0,
        floor: 0,
        name: '',
    };
}

export const StockPriceMessage = {
    encode(message: StockPriceMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.price !== 0) {
            writer.uint32(8).int32(message.price);
        }
        if (message.bid1 !== 0) {
            writer.uint32(16).int32(message.bid1);
        }
        if (message.offer1 !== 0) {
            writer.uint32(24).int32(message.offer1);
        }
        if (message.bid2 !== 0) {
            writer.uint32(32).int32(message.bid2);
        }
        if (message.offer2 !== 0) {
            writer.uint32(40).int32(message.offer2);
        }
        if (message.bid3 !== 0) {
            writer.uint32(48).int32(message.bid3);
        }
        if (message.offer3 !== 0) {
            writer.uint32(56).int32(message.offer3);
        }
        if (message.bid1Vol !== 0) {
            writer.uint32(64).int64(message.bid1Vol);
        }
        if (message.offer1Vol !== 0) {
            writer.uint32(72).int64(message.offer1Vol);
        }
        if (message.bid2Vol !== 0) {
            writer.uint32(80).int64(message.bid2Vol);
        }
        if (message.offer2Vol !== 0) {
            writer.uint32(88).int64(message.offer2Vol);
        }
        if (message.bid3Vol !== 0) {
            writer.uint32(96).int64(message.bid3Vol);
        }
        if (message.offer3Vol !== 0) {
            writer.uint32(104).int64(message.offer3Vol);
        }
        if (message.changePercent !== 0) {
            writer.uint32(117).float(message.changePercent);
        }
        if (message.symbol !== '') {
            writer.uint32(122).string(message.symbol);
        }
        if (message.change !== 0) {
            writer.uint32(128).int32(message.change);
        }
        if (message.vol !== 0) {
            writer.uint32(136).int64(message.vol);
        }
        if (message.remainBid !== 0) {
            writer.uint32(144).int64(message.remainBid);
        }
        if (message.remainAsk !== 0) {
            writer.uint32(152).int64(message.remainAsk);
        }
        if (message.foreignBought !== 0) {
            writer.uint32(160).int64(message.foreignBought);
        }
        if (message.foreignSold !== 0) {
            writer.uint32(168).int64(message.foreignSold);
        }
        if (message.foreignRemain !== 0) {
            writer.uint32(176).int64(message.foreignRemain);
        }
        if (message.totalVol !== 0) {
            writer.uint32(184).int64(message.totalVol);
        }
        if (message.totalVal !== 0) {
            writer.uint32(192).int64(message.totalVal);
        }
        if (message.high !== 0) {
            writer.uint32(200).int32(message.high);
        }
        if (message.medium !== 0) {
            writer.uint32(208).int32(message.medium);
        }
        if (message.low !== 0) {
            writer.uint32(216).int32(message.low);
        }
        if (message.ceiling !== 0) {
            writer.uint32(224).int32(message.ceiling);
        }
        if (message.reference !== 0) {
            writer.uint32(232).int32(message.reference);
        }
        if (message.floor !== 0) {
            writer.uint32(240).int32(message.floor);
        }
        if (message.name !== '') {
            writer.uint32(250).string(message.name);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): StockPriceMessage {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStockPriceMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.price = reader.int32();
                    break;
                case 2:
                    message.bid1 = reader.int32();
                    break;
                case 3:
                    message.offer1 = reader.int32();
                    break;
                case 4:
                    message.bid2 = reader.int32();
                    break;
                case 5:
                    message.offer2 = reader.int32();
                    break;
                case 6:
                    message.bid3 = reader.int32();
                    break;
                case 7:
                    message.offer3 = reader.int32();
                    break;
                case 8:
                    message.bid1Vol = longToNumber(reader.int64() as Long);
                    break;
                case 9:
                    message.offer1Vol = longToNumber(reader.int64() as Long);
                    break;
                case 10:
                    message.bid2Vol = longToNumber(reader.int64() as Long);
                    break;
                case 11:
                    message.offer2Vol = longToNumber(reader.int64() as Long);
                    break;
                case 12:
                    message.bid3Vol = longToNumber(reader.int64() as Long);
                    break;
                case 13:
                    message.offer3Vol = longToNumber(reader.int64() as Long);
                    break;
                case 14:
                    message.changePercent = reader.float();
                    break;
                case 15:
                    message.symbol = reader.string();
                    break;
                case 16:
                    message.change = reader.int32();
                    break;
                case 17:
                    message.vol = longToNumber(reader.int64() as Long);
                    break;
                case 18:
                    message.remainBid = longToNumber(reader.int64() as Long);
                    break;
                case 19:
                    message.remainAsk = longToNumber(reader.int64() as Long);
                    break;
                case 20:
                    message.foreignBought = longToNumber(reader.int64() as Long);
                    break;
                case 21:
                    message.foreignSold = longToNumber(reader.int64() as Long);
                    break;
                case 22:
                    message.foreignRemain = longToNumber(reader.int64() as Long);
                    break;
                case 23:
                    message.totalVol = longToNumber(reader.int64() as Long);
                    break;
                case 24:
                    message.totalVal = longToNumber(reader.int64() as Long);
                    break;
                case 25:
                    message.high = reader.int32();
                    break;
                case 26:
                    message.medium = reader.int32();
                    break;
                case 27:
                    message.low = reader.int32();
                    break;
                case 28:
                    message.ceiling = reader.int32();
                    break;
                case 29:
                    message.reference = reader.int32();
                    break;
                case 30:
                    message.floor = reader.int32();
                    break;
                case 31:
                    message.name = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): StockPriceMessage {
        return {
            price: isSet(object.price) ? Number(object.price) : 0,
            bid1: isSet(object.bid1) ? Number(object.bid1) : 0,
            offer1: isSet(object.offer1) ? Number(object.offer1) : 0,
            bid2: isSet(object.bid2) ? Number(object.bid2) : 0,
            offer2: isSet(object.offer2) ? Number(object.offer2) : 0,
            bid3: isSet(object.bid3) ? Number(object.bid3) : 0,
            offer3: isSet(object.offer3) ? Number(object.offer3) : 0,
            bid1Vol: isSet(object.bid1Vol) ? Number(object.bid1Vol) : 0,
            offer1Vol: isSet(object.offer1Vol) ? Number(object.offer1Vol) : 0,
            bid2Vol: isSet(object.bid2Vol) ? Number(object.bid2Vol) : 0,
            offer2Vol: isSet(object.offer2Vol) ? Number(object.offer2Vol) : 0,
            bid3Vol: isSet(object.bid3Vol) ? Number(object.bid3Vol) : 0,
            offer3Vol: isSet(object.offer3Vol) ? Number(object.offer3Vol) : 0,
            changePercent: isSet(object.changePercent) ? Number(object.changePercent) : 0,
            symbol: isSet(object.symbol) ? String(object.symbol) : '',
            change: isSet(object.change) ? Number(object.change) : 0,
            vol: isSet(object.vol) ? Number(object.vol) : 0,
            remainBid: isSet(object.remainBid) ? Number(object.remainBid) : 0,
            remainAsk: isSet(object.remainAsk) ? Number(object.remainAsk) : 0,
            foreignBought: isSet(object.foreignBought) ? Number(object.foreignBought) : 0,
            foreignSold: isSet(object.foreignSold) ? Number(object.foreignSold) : 0,
            foreignRemain: isSet(object.foreignRemain) ? Number(object.foreignRemain) : 0,
            totalVol: isSet(object.totalVol) ? Number(object.totalVol) : 0,
            totalVal: isSet(object.totalVal) ? Number(object.totalVal) : 0,
            high: isSet(object.high) ? Number(object.high) : 0,
            medium: isSet(object.medium) ? Number(object.medium) : 0,
            low: isSet(object.low) ? Number(object.low) : 0,
            ceiling: isSet(object.ceiling) ? Number(object.ceiling) : 0,
            reference: isSet(object.reference) ? Number(object.reference) : 0,
            floor: isSet(object.floor) ? Number(object.floor) : 0,
            name: isSet(object.name) ? String(object.name) : '',
        };
    },

    toJSON(message: StockPriceMessage): unknown {
        const obj: any = {};
        message.price !== undefined && (obj.price = Math.round(message.price));
        message.bid1 !== undefined && (obj.bid1 = Math.round(message.bid1));
        message.offer1 !== undefined && (obj.offer1 = Math.round(message.offer1));
        message.bid2 !== undefined && (obj.bid2 = Math.round(message.bid2));
        message.offer2 !== undefined && (obj.offer2 = Math.round(message.offer2));
        message.bid3 !== undefined && (obj.bid3 = Math.round(message.bid3));
        message.offer3 !== undefined && (obj.offer3 = Math.round(message.offer3));
        message.bid1Vol !== undefined && (obj.bid1Vol = Math.round(message.bid1Vol));
        message.offer1Vol !== undefined && (obj.offer1Vol = Math.round(message.offer1Vol));
        message.bid2Vol !== undefined && (obj.bid2Vol = Math.round(message.bid2Vol));
        message.offer2Vol !== undefined && (obj.offer2Vol = Math.round(message.offer2Vol));
        message.bid3Vol !== undefined && (obj.bid3Vol = Math.round(message.bid3Vol));
        message.offer3Vol !== undefined && (obj.offer3Vol = Math.round(message.offer3Vol));
        message.changePercent !== undefined && (obj.changePercent = message.changePercent);
        message.symbol !== undefined && (obj.symbol = message.symbol);
        message.change !== undefined && (obj.change = Math.round(message.change));
        message.vol !== undefined && (obj.vol = Math.round(message.vol));
        message.remainBid !== undefined && (obj.remainBid = Math.round(message.remainBid));
        message.remainAsk !== undefined && (obj.remainAsk = Math.round(message.remainAsk));
        message.foreignBought !== undefined &&
            (obj.foreignBought = Math.round(message.foreignBought));
        message.foreignSold !== undefined && (obj.foreignSold = Math.round(message.foreignSold));
        message.foreignRemain !== undefined &&
            (obj.foreignRemain = Math.round(message.foreignRemain));
        message.totalVol !== undefined && (obj.totalVol = Math.round(message.totalVol));
        message.totalVal !== undefined && (obj.totalVal = Math.round(message.totalVal));
        message.high !== undefined && (obj.high = Math.round(message.high));
        message.medium !== undefined && (obj.medium = Math.round(message.medium));
        message.low !== undefined && (obj.low = Math.round(message.low));
        message.ceiling !== undefined && (obj.ceiling = Math.round(message.ceiling));
        message.reference !== undefined && (obj.reference = Math.round(message.reference));
        message.floor !== undefined && (obj.floor = Math.round(message.floor));
        message.name !== undefined && (obj.name = message.name);
        return obj;
    },

    create<I extends Exact<DeepPartial<StockPriceMessage>, I>>(base?: I): StockPriceMessage {
        return StockPriceMessage.fromPartial(base ?? {});
    },

    fromPartial<I extends Exact<DeepPartial<StockPriceMessage>, I>>(object: I): StockPriceMessage {
        const message = createBaseStockPriceMessage();
        message.price = object.price ?? 0;
        message.bid1 = object.bid1 ?? 0;
        message.offer1 = object.offer1 ?? 0;
        message.bid2 = object.bid2 ?? 0;
        message.offer2 = object.offer2 ?? 0;
        message.bid3 = object.bid3 ?? 0;
        message.offer3 = object.offer3 ?? 0;
        message.bid1Vol = object.bid1Vol ?? 0;
        message.offer1Vol = object.offer1Vol ?? 0;
        message.bid2Vol = object.bid2Vol ?? 0;
        message.offer2Vol = object.offer2Vol ?? 0;
        message.bid3Vol = object.bid3Vol ?? 0;
        message.offer3Vol = object.offer3Vol ?? 0;
        message.changePercent = object.changePercent ?? 0;
        message.symbol = object.symbol ?? '';
        message.change = object.change ?? 0;
        message.vol = object.vol ?? 0;
        message.remainBid = object.remainBid ?? 0;
        message.remainAsk = object.remainAsk ?? 0;
        message.foreignBought = object.foreignBought ?? 0;
        message.foreignSold = object.foreignSold ?? 0;
        message.foreignRemain = object.foreignRemain ?? 0;
        message.totalVol = object.totalVol ?? 0;
        message.totalVal = object.totalVal ?? 0;
        message.high = object.high ?? 0;
        message.medium = object.medium ?? 0;
        message.low = object.low ?? 0;
        message.ceiling = object.ceiling ?? 0;
        message.reference = object.reference ?? 0;
        message.floor = object.floor ?? 0;
        message.name = object.name ?? '';
        return message;
    },
};

function createBaseStockPriceMessageList(): StockPriceMessageList {
    return { stockPrices: [] };
}

export const StockPriceMessageList = {
    encode(message: StockPriceMessageList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        for (const v of message.stockPrices) {
            StockPriceMessage.encode(v!, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): StockPriceMessageList {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStockPriceMessageList();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.stockPrices.push(StockPriceMessage.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): StockPriceMessageList {
        return {
            stockPrices: Array.isArray(object?.stockPrices)
                ? object.stockPrices.map((e: any) => StockPriceMessage.fromJSON(e))
                : [],
        };
    },

    toJSON(message: StockPriceMessageList): unknown {
        const obj: any = {};
        if (message.stockPrices) {
            obj.stockPrices = message.stockPrices.map((e) =>
                e ? StockPriceMessage.toJSON(e) : undefined,
            );
        } else {
            obj.stockPrices = [];
        }
        return obj;
    },

    create<I extends Exact<DeepPartial<StockPriceMessageList>, I>>(
        base?: I,
    ): StockPriceMessageList {
        return StockPriceMessageList.fromPartial(base ?? {});
    },

    fromPartial<I extends Exact<DeepPartial<StockPriceMessageList>, I>>(
        object: I,
    ): StockPriceMessageList {
        const message = createBaseStockPriceMessageList();
        message.stockPrices =
            object.stockPrices?.map((e) => StockPriceMessage.fromPartial(e)) || [];
        return message;
    },
};

function createBaseIndexData(): IndexData {
    return {
        indexValue: 0,
        allQuantity: 0,
        allValue: 0,
        advances: 0,
        declines: 0,
        nochanges: 0,
        change: 0,
        changePercent: 0,
        reference: 0,
        sessionInExchange: '',
        name: '',
        ceiling: 0,
        floor: 0,
        createdAt: 0,
    };
}

export const IndexData = {
    encode(message: IndexData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.indexValue !== 0) {
            writer.uint32(13).float(message.indexValue);
        }
        if (message.allQuantity !== 0) {
            writer.uint32(16).int64(message.allQuantity);
        }
        if (message.allValue !== 0) {
            writer.uint32(24).int64(message.allValue);
        }
        if (message.advances !== 0) {
            writer.uint32(32).int32(message.advances);
        }
        if (message.declines !== 0) {
            writer.uint32(40).int32(message.declines);
        }
        if (message.nochanges !== 0) {
            writer.uint32(48).int32(message.nochanges);
        }
        if (message.change !== 0) {
            writer.uint32(61).float(message.change);
        }
        if (message.changePercent !== 0) {
            writer.uint32(69).float(message.changePercent);
        }
        if (message.reference !== 0) {
            writer.uint32(77).float(message.reference);
        }
        if (message.sessionInExchange !== '') {
            writer.uint32(82).string(message.sessionInExchange);
        }
        if (message.name !== '') {
            writer.uint32(90).string(message.name);
        }
        if (message.ceiling !== 0) {
            writer.uint32(96).int32(message.ceiling);
        }
        if (message.floor !== 0) {
            writer.uint32(104).int32(message.floor);
        }
        if (message.createdAt !== 0) {
            writer.uint32(112).int64(message.createdAt);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): IndexData {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseIndexData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.indexValue = reader.float();
                    break;
                case 2:
                    message.allQuantity = longToNumber(reader.int64() as Long);
                    break;
                case 3:
                    message.allValue = longToNumber(reader.int64() as Long);
                    break;
                case 4:
                    message.advances = reader.int32();
                    break;
                case 5:
                    message.declines = reader.int32();
                    break;
                case 6:
                    message.nochanges = reader.int32();
                    break;
                case 7:
                    message.change = reader.float();
                    break;
                case 8:
                    message.changePercent = reader.float();
                    break;
                case 9:
                    message.reference = reader.float();
                    break;
                case 10:
                    message.sessionInExchange = reader.string();
                    break;
                case 11:
                    message.name = reader.string();
                    break;
                case 12:
                    message.ceiling = reader.int32();
                    break;
                case 13:
                    message.floor = reader.int32();
                    break;
                case 14:
                    message.createdAt = longToNumber(reader.int64() as Long);
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): IndexData {
        return {
            indexValue: isSet(object.indexValue) ? Number(object.indexValue) : 0,
            allQuantity: isSet(object.allQuantity) ? Number(object.allQuantity) : 0,
            allValue: isSet(object.allValue) ? Number(object.allValue) : 0,
            advances: isSet(object.advances) ? Number(object.advances) : 0,
            declines: isSet(object.declines) ? Number(object.declines) : 0,
            nochanges: isSet(object.nochanges) ? Number(object.nochanges) : 0,
            change: isSet(object.change) ? Number(object.change) : 0,
            changePercent: isSet(object.changePercent) ? Number(object.changePercent) : 0,
            reference: isSet(object.reference) ? Number(object.reference) : 0,
            sessionInExchange: isSet(object.sessionInExchange)
                ? String(object.sessionInExchange)
                : '',
            name: isSet(object.name) ? String(object.name) : '',
            ceiling: isSet(object.ceiling) ? Number(object.ceiling) : 0,
            floor: isSet(object.floor) ? Number(object.floor) : 0,
            createdAt: isSet(object.createdAt) ? Number(object.createdAt) : 0,
        };
    },

    toJSON(message: IndexData): unknown {
        const obj: any = {};
        message.indexValue !== undefined && (obj.indexValue = message.indexValue);
        message.allQuantity !== undefined && (obj.allQuantity = Math.round(message.allQuantity));
        message.allValue !== undefined && (obj.allValue = Math.round(message.allValue));
        message.advances !== undefined && (obj.advances = Math.round(message.advances));
        message.declines !== undefined && (obj.declines = Math.round(message.declines));
        message.nochanges !== undefined && (obj.nochanges = Math.round(message.nochanges));
        message.change !== undefined && (obj.change = message.change);
        message.changePercent !== undefined && (obj.changePercent = message.changePercent);
        message.reference !== undefined && (obj.reference = message.reference);
        message.sessionInExchange !== undefined &&
            (obj.sessionInExchange = message.sessionInExchange);
        message.name !== undefined && (obj.name = message.name);
        message.ceiling !== undefined && (obj.ceiling = Math.round(message.ceiling));
        message.floor !== undefined && (obj.floor = Math.round(message.floor));
        message.createdAt !== undefined && (obj.createdAt = Math.round(message.createdAt));
        return obj;
    },

    create<I extends Exact<DeepPartial<IndexData>, I>>(base?: I): IndexData {
        return IndexData.fromPartial(base ?? {});
    },

    fromPartial<I extends Exact<DeepPartial<IndexData>, I>>(object: I): IndexData {
        const message = createBaseIndexData();
        message.indexValue = object.indexValue ?? 0;
        message.allQuantity = object.allQuantity ?? 0;
        message.allValue = object.allValue ?? 0;
        message.advances = object.advances ?? 0;
        message.declines = object.declines ?? 0;
        message.nochanges = object.nochanges ?? 0;
        message.change = object.change ?? 0;
        message.changePercent = object.changePercent ?? 0;
        message.reference = object.reference ?? 0;
        message.sessionInExchange = object.sessionInExchange ?? '';
        message.name = object.name ?? '';
        message.ceiling = object.ceiling ?? 0;
        message.floor = object.floor ?? 0;
        message.createdAt = object.createdAt ?? 0;
        return message;
    },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    throw 'Unable to locate global object';
})();

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
    ? T
    : T extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepPartial<U>>
        : T extends {}
          ? { [K in keyof T]?: DeepPartial<T[K]> }
          : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
    ? P
    : P & { [K in keyof P]: Exact<P[K], I[K]> } & {
          [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
      };

function longToNumber(long: Long): number {
    if (long.gt(Number.MAX_SAFE_INTEGER)) {
        throw new tsProtoGlobalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
    }
    return long.toNumber();
}

if (_m0.util.Long !== Long) {
    _m0.util.Long = Long as any;
    _m0.configure();
}

function isSet(value: any): boolean {
    return value !== null && value !== undefined;
}
