import type { AssetsSummary } from '@/types/accounts/assets';

export type AssetSummaryProps = {
    data: AssetsSummary | null;
    isLoading: boolean;
};

export type PortfolioTreemapCell = {
    name: string;
    symbol: string;
    value: number;
    percent: number;
    itemStyle: { color: string };
};

export type PortfolioTradeAnchor = {
    symbol: string;
    side: string;
    price: number;
    rect: DOMRect;
};

export type OrderStatusLabelKey =
    | 'sent'
    | 'matched_all'
    | 'completed'
    | 'matched'
    | 'waiting_to_send'
    | 'sending'
    | 'fixed'
    | 'fixing'
    | 'cancelled'
    | 'expired'
    | 'rejecting';

export type FormatPnlDisplayInput = {
    pnl: number;
    pnl_rate: number;
};

export type FormatPnlDisplayResult = {
    amount: string;
    pct: string;
    isUp: boolean;
};

export type AssetAllocationItem = {
    label: string;
    value: string;
    color: string;
    percentage: number;
    pnlChange: FormatPnlDisplayResult | null;
};
