import type { PaperTradingResponse } from '@/types/paper-trading/common';

export type RegisterPaperAccountPayload = {
    account_id: string;
};

export type PaperAccountAsset = {
    account_id: string;
    cash_balance: number;
    available_cash: number;
    reserved_cash: number;
};

export type PaperAccountAssetResponse = PaperTradingResponse<PaperAccountAsset>;

/** Shape suy ra từ nghiệp vụ — BE chưa trả mẫu response trong Postman collection. */
export type PaperPortfolioItem = {
    symbol: string;
    quantity: number;
    available_quantity: number;
    average_price: number;
    market_price: number;
    market_value: number;
    unrealized_profit: number;
    unrealized_profit_rate: number;
};

export type PaperPortfolioResponse = PaperTradingResponse<PaperPortfolioItem[]>;

export type PaperBuyingPower = {
    max_buyable_quantity: number;
};

export type PaperBuyingPowerResponse = PaperTradingResponse<PaperBuyingPower>;
