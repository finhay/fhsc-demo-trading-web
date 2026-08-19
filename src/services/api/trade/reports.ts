import { vnscService } from '@/services/interceptor';
import type { ExportTradingReportResponse, ReportResultResponse } from '@/types/trade/reports';

export const exportTradingReport = (
    subAccountId: string,
    side: string,
): Promise<ExportTradingReportResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/trade/reports/trading/sub-accounts/${subAccountId}/export?side=${side}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchTradingReportResult = (reportId: string): Promise<ReportResultResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/reports/trading/exports/${reportId}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
