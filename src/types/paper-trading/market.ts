import type { PaperTradingResponse } from '@/types/paper-trading/common';

/** Shape suy ra từ nghiệp vụ — BE chưa trả mẫu response trong Postman collection. */
export type PaperInstrument = {
    symbol: string;
    name: string;
    exchange: string;
};

export type PaperInstrumentsResponse = PaperTradingResponse<PaperInstrument[]>;

export type PaperQuote = {
    symbol: string;
    exchange: string;
    tradable: boolean;
    reference_price: number;
    ceiling_price: number;
    floor_price: number;
    last_price: number;
};

export type PaperQuoteResponse = PaperTradingResponse<PaperQuote>;

/** Shape suy ra từ nghiệp vụ — BE chưa trả mẫu response trong Postman collection. */
export type PaperSession = {
    exchange: string;
    session: string;
};

export type PaperSessionsResponse = PaperTradingResponse<PaperSession[]>;
