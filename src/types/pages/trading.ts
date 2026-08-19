import type { FormAsyncValidateOrFn, FormValidateOrFn } from '@tanstack/form-core';
import type { ReactFormExtendedApi } from '@tanstack/react-form';

import { TransactionLogItem } from '@/types/datafeed/stock-info';
import type { TwapLoOrderDto } from '@/types/trade/twap-lo';

export type DepthRawRow = {
    buyPrice: number;
    buyVol: number;
    sellPrice: number;
    sellVol: number;
};

export type OrderLotSplit = { evenLotQty: number; oddLotQty: number };

export type PendingOrder = {
    side: string;
    price: number;
    orderType: string;
    orderLots: OrderLotSplit[];
    orderMode: string;
    stockType: string;
    executionDate: string;
    expiredDate: string;
};

export type OrderModeOption = {
    key: string;
};

export type PlacementOrder = {
    kind: 'even' | 'odd';
    qty: number;
};

export type TradeMatchedHistoryTableRow = {
    symbol: string;
    order_id?: string;
    isTotal: boolean;
    quantity: number;
    price: number;
    volume: number;
};

export type RealtimeMatchEntry = {
    orderId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    volume: number;
    status: string;
};

export type TradeOrderBookRow = {
    orderId: string;
    symbol: string;
    filledQty: number;
    totalQty: number;
    filledPrice: number;
    placedPrice: string;
    marketPrice: string | null;
    rawPrice: number;
    rawQty: number;
    type: string;
    status: string;
    allowCancel?: boolean;
    allowAmend?: boolean;
    orderConditionType?: string | null;
    priceType?: string | null;
    executionDate?: string;
    expiredDate?: string;
    twapLoOrder?: TwapLoOrderDto;
};

export type TradeOrderAmendStockInfo = {
    floor: number;
    ceiling: number;
    exchange: string;
    stockType: string;
};

export type TradeTransactionDisplayItem = Pick<
    TransactionLogItem,
    'sequence' | 'time' | 'side' | 'match_volume' | 'match_price' | 'change_value'
>;

export type MarketPortfolioColumnMeta = {
    align: string;
};

export type WatchlistTableMeta = {
    updatedSymbols: Set<string>;
};

export type TradePanelActiveConfig = {
    key: string;
    orderSide: string;
    ariaLabel: string;
    legendSr: string;
    priceField: 'buyPrice' | 'sellPrice';
    qtyField: 'buyQuantity' | 'sellQuantity';
    stepperSide: 'buy' | 'sell';
    validatePrice: (input: { value: string }) => string | undefined;
    validateQty: (input: { value: string }) => string | undefined;
    percentage: number;
    onPctChange: (pct: number) => void;
    setStorePrice: (price: number) => void;
    setStoreQty: (qty: number) => void;
    maxQty: number;
    totalLabel: string;
    ctaLabel: string;
    ctaEnabledClass: string;
};

export type PanelFormValues = {
    buyPrice: string;
    buyQuantity: string;
    sellPrice: string;
    sellQuantity: string;
    childQuantity: string;
    executionDate: string;
    expiredDate: string;
};

type FormValidator = undefined | FormValidateOrFn<PanelFormValues>;
type FormAsyncValidator = undefined | FormAsyncValidateOrFn<PanelFormValues>;

export type TradePanelFormInstance = ReactFormExtendedApi<
    PanelFormValues,
    FormValidator,
    FormValidator,
    FormAsyncValidator,
    FormValidator,
    FormAsyncValidator,
    FormValidator,
    FormAsyncValidator,
    FormValidator,
    FormAsyncValidator,
    FormAsyncValidator,
    unknown
>;
