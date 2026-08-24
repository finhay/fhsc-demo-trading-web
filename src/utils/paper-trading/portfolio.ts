import type { PaperPortfolioItem } from '@/types/paper-trading/account';
import type { PortfolioItem } from '@/types/trade/portfolio';

/**
 * Map về đúng shape `PortfolioItem` cũ để mọi bảng/chart hiện có dùng lại được.
 *
 * Mẹo quan trọng: `calcPortfolioHoldingQuantity` (utils/assets.ts) cộng 10 field khối lượng.
 * Ta đặt `trade = available_quantity` và `blocked = quantity - available_quantity` nên tổng 10
 * field vẫn đúng bằng `quantity` — nhờ vậy `calcPortfolioMarketValue`, `AssetStructure`,
 * `AssetStocks` chạy đúng mà không phải sửa. Đừng "dọn" cặp field này.
 */
export const mapPaperPortfolioItem = (
    item: PaperPortfolioItem,
    accountId: string,
): PortfolioItem => {
    const quantity = item.quantity ?? 0;
    const available = item.available_quantity ?? 0;
    const averagePrice = item.average_price ?? 0;
    const marketPrice = item.market_price ?? 0;

    return {
        sub_account_id: accountId,
        symbol: item.symbol,
        securities_type: 'STOCK',
        total: quantity,
        available,
        trade: available,
        blocked: Math.max(0, quantity - available),
        mortgage: 0,
        vsd_mortgage: 0,
        restrict: 0,
        receiving_right: 0,
        receiving_t0: 0,
        receiving_t1: 0,
        receiving_t2: 0,
        matching_amount: 0,
        sending_t0: 0,
        sending_t1: 0,
        sending_t2: 0,
        withdraw: 0,
        cost_price: averagePrice,
        basic_price: marketPrice,
        close_price: marketPrice,
        cost_price_amount: quantity * averagePrice,
        basic_price_amount: item.market_value ?? quantity * marketPrice,
        pnl_amount: item.unrealized_profit ?? 0,
        pnl_rate: item.unrealized_profit_rate ?? 0,
        total_pnl: item.unrealized_profit ?? 0,
        is_sellable: available > 0,
        custodycd: '',
        has_newest_news: false,
    };
};
