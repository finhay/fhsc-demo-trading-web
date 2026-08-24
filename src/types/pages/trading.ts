import type { FormAsyncValidateOrFn, FormValidateOrFn } from '@tanstack/form-core';
import type { ReactFormExtendedApi } from '@tanstack/react-form';

import { TransactionLogItem } from '@/types/datafeed/stock-info';
import type { PaperOrder } from '@/types/paper-trading/orders';

export type DepthRawRow = {
    buyPrice: number;
    buyVol: number;
    sellPrice: number;
    sellVol: number;
};

export type PendingOrder = {
    side: string;
    price: number;
    quantity: number;
    orderType: string;
    stockType: string;
};

export type TradeMatchedHistoryTableRow = {
    symbol: string;
    order_id?: string;
    isTotal: boolean;
    quantity: number;
    price: number;
    volume: number;
};

export type OrderStatusTone = 'success' | 'error' | 'pending' | 'neutral';

export type OrderStatusView = { text: string; tone: OrderStatusTone };

export type TradeOrderBookRow = {
    orderId: string;
    symbol: string;
    filledQty: string;
    totalQty: string;
    filledPrice: string;
    placedPrice: string;
    marketPrice: string | null;
    rawPrice: number;
    rawQty: number;
    type: string;
    status: string;
    /** Suy ở FE — API paper không trả allowcancel/allowamend */
    isActive?: boolean;
    allowCancel?: boolean;
    allowAmend?: boolean;
    priceType?: string | null;
    paperOrder?: PaperOrder;
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
