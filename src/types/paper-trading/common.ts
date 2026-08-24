export type PaperTradingResponse<T> = {
    error_code: string;
    message: string;
    data: T;
};
