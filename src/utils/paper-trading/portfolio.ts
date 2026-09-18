import type { PaperPortfolioItem } from '@/types/paper-trading/account';
import type { PortfolioItem } from '@/types/trade/portfolio';

/**
 * Map item từ `GET /v1/accounts/{id}/portfolio` sang `PortfolioItem` để bảng/chart dùng lại.
 *
 * `trade` = `available` vì cột "Có thể GD" đọc `trade`.
 * `total` giữ nguyên API (không gồm CP quyền chờ về).
 * `receiving_right` = `receivable_qty` — cột Tổng / `calcPortfolioHoldingQuantity` cộng thêm phần này.
 */
export const mapPaperPortfolioItem = (item: PaperPortfolioItem): PortfolioItem => {
    const available = item.available ?? 0;
    const basicPrice = item.basic_price ?? 0;

    return {
        sub_account_id: item.sub_account_id,
        symbol: item.symbol,
        securities_type: 'STOCK',
        total: item.total ?? 0,
        available,
        trade: available,
        blocked: item.blocked ?? 0,
        mortgage: 0,
        vsd_mortgage: 0,
        restrict: 0,
        receiving_right: item.receivable_qty ?? 0,
        receiving_t0: item.receiving_t0 ?? 0,
        receiving_t1: item.receiving_t1 ?? 0,
        receiving_t2: item.receiving_t2 ?? 0,
        matching_amount: 0,
        sending_t0: 0,
        sending_t1: 0,
        sending_t2: 0,
        withdraw: 0,
        cost_price: item.cost_price ?? 0,
        basic_price: basicPrice,
        close_price: basicPrice,
        cost_price_amount: item.cost_price_amount ?? 0,
        basic_price_amount: item.basic_price_amount ?? 0,
        pnl_amount: item.pnl_amount ?? 0,
        pnl_rate: item.pnl_rate ?? 0,
        total_pnl: item.pnl_amount ?? 0,
        is_sellable: available > 0,
        custodycd: '',
        has_newest_news: false,
    };
};
