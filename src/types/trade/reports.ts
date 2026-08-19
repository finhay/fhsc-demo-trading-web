export type ExportTradingReportResponse = {
    error_code: string;
    message: string;
    data: string;
};

export type ReportResultResponse = {
    error_code: string;
    message: string;
    data: {
        url: string;
        status: string;
        error: string;
    };
};
