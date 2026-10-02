import type { PaperTradingResponse } from '@/types/paper-trading/common';
import type { PaperOrderType } from '@/types/paper-trading/orders';

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

export type PaperSession = {
    exchange: string;
    /** PRE_OPEN | CONTINUOUS | INTERMISSION | PRE_CLOSE | POST | CLOSED */
    phase: string;
    /** Loại lệnh đặt được ngay lúc gọi API — rỗng khi ngoài giờ giao dịch */
    available_order_types: PaperOrderType[];
};

export type PaperSessionsResponse = PaperTradingResponse<PaperSession[]>;
