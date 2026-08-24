import type { AssetsSummary } from '@/types/accounts/assets';
import type { PaperAccountAsset } from '@/types/paper-trading/account';
import type { PortfolioItem } from '@/types/trade/portfolio';
import { calcPortfolioMarketValue, calcPortfolioTotals } from '@/utils/assets';

const EMPTY_PNL = { pnl: 0, pnl_rate: 0 };

/**
 * Simulator chỉ trả tiền mặt + danh mục, trong khi `AssetOverview` / `AssetAllocation` /
 * `AssetDebt` đang nhận `AssetsSummary` nhiều tầng. Dựng lại đúng shape đó để 3 component
 * này không phải viết lại — các nhánh không có nguồn dữ liệu để 0.
 *
 * `debt` toàn 0 khiến `AssetDebt` tự rơi vào empty state "Bạn đang không có khoản nợ nào!".
 */
export const buildPaperAssetsSummary = (
    asset: PaperAccountAsset | null,
    portfolio: PortfolioItem[],
): AssetsSummary => {
    const cashTotal = (asset?.available_cash ?? 0) + (asset?.reserved_cash ?? 0);
    const stockValue = portfolio.reduce((sum, item) => sum + calcPortfolioMarketValue(item), 0);
    const { totalPnl, totalPnlRate } = calcPortfolioTotals(portfolio);

    return {
        net_asset_value: cashTotal + stockValue,
        products: {
            total: stockValue,
            stock: stockValue,
            fund: 0,
            saving: null,
            bond: 0,
            child_savings: 0,
            hay0: 0,
            hay0_interest: 0,
            hay0_depositing: 0,
            hay0_withdrawing: 0,
        },
        money: {
            total: cashTotal,
            ci_balance: asset?.available_cash ?? 0,
            ca_receiving: 0,
            emk_amt: 0,
            receiving_amt: asset?.reserved_cash ?? 0,
            baldefovd: 0,
        },
        debt: {
            total: 0,
            secure_amount: 0,
            advance_amt: 0,
            sms_fee_amt: 0,
            cidepo_fee_acr: 0,
            owe_deposit: 0,
            cidepo_fee: 0,
        },
        pnl: {
            stock: { pnl: totalPnl, pnl_rate: totalPnlRate },
            fund: EMPTY_PNL,
            child_savings: EMPTY_PNL,
        },
    };
};
