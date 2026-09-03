import type { PaperTradingResponse } from '@/types/paper-trading/common';

export type RegisterPaperAccountPayload = {
    account_id: string;
};

export type PaperAccountAssetPnl = {
    pnl_rate: number;
    pnl: number;
};

export type PaperAccountAsset = {
    account_id: string;
    net_asset_value: number;
    products: {
        cost_value: number;
        total: number;
        stock: number;
    };
    money: {
        ci_balance: number;
        baldefovd: number;
        total: number;
        reserved: number;
    };
    pnl: {
        stock: PaperAccountAssetPnl;
    };
};

export type PaperAccountAssetResponse = PaperTradingResponse<PaperAccountAsset>;

export type PaperPortfolioItem = {
    sub_account_id: string;
    symbol: string;
    total: number;
    available: number;
    blocked: number;
    receiving_t0: number;
    receiving_t1: number;
    receiving_t2: number;
    cost_price: number;
    cost_price_amount: number;
    basic_price: number;
    basic_price_amount: number;
    pnl_amount: number;
    pnl_rate: number;
};

export type PaperPortfolioData = {
    portfolio: PaperPortfolioItem[];
};

export type PaperPortfolioResponse = PaperTradingResponse<PaperPortfolioData>;

export type PaperBuyingPower = {
    max_buyable_quantity: number;
};

export type PaperBuyingPowerResponse = PaperTradingResponse<PaperBuyingPower>;
