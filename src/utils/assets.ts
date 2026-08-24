import type { FormatPnlDisplayInput, FormatPnlDisplayResult } from '@/types/pages/assets';
import { PortfolioItem } from '@/types/trade/portfolio';
import { formatNumberVN } from '@/utils/format';

export const calcAssetPercent = (value: number, total: number): number => {
    if (total === 0) return 0;
    const pct = (value / total) * 100;
    return Number(
        formatNumberVN(pct, { decimals: 2, trimTrailingZeros: false })
            .replace(/\./g, '')
            .replace(',', '.'),
    );
};

export const formatPnlDisplay = (
    pnlData?: FormatPnlDisplayInput,
): FormatPnlDisplayResult | null => {
    if (!pnlData || pnlData.pnl === 0) return null;
    const isUp = pnlData.pnl > 0;
    return {
        amount: `${isUp ? '+' : ''}${formatNumberVN(pnlData.pnl, { trimTrailingZeros: true })}đ`,
        pct: `${isUp ? '+' : ''}${formatNumberVN(pnlData.pnl_rate)}%`,
        isUp,
    };
};

export const calcPortfolioHoldingQuantity = (portfolio: PortfolioItem): number =>
    portfolio.trade +
    portfolio.mortgage +
    portfolio.vsd_mortgage +
    portfolio.restrict +
    portfolio.blocked +
    portfolio.receiving_right +
    portfolio.receiving_t0 +
    portfolio.receiving_t1 +
    portfolio.receiving_t2 +
    portfolio.matching_amount;

export const calcPortfolioMarketValue = (portfolio: PortfolioItem): number => {
    return calcPortfolioHoldingQuantity(portfolio) * portfolio.basic_price;
};

export const calcPortfolioTotals = (
    items: PortfolioItem[],
): { totalPnl: number; totalCost: number; totalPnlRate: number } => {
    const totalPnl = items.reduce((sum, item) => sum + (item.pnl_amount || 0), 0);
    const totalCost = items.reduce((sum, item) => sum + (item.cost_price_amount || 0), 0);
    return {
        totalPnl,
        totalCost,
        totalPnlRate: totalCost > 0 ? (totalPnl / totalCost) * 100 : 0,
    };
};

export const formatSubAccountLabel = (account?: {
    account_type_name: string;
    sub_account_ext: string;
}): string => (account ? `TK ${account.account_type_name}: ${account.sub_account_ext}` : '');

const ATO_BOARD_PRICE = -1;
const ATC_BOARD_PRICE = -2;

export const formatPortfolioPrice = (price: number, percent?: boolean) => {
    if (price === ATO_BOARD_PRICE) {
        return 'ATO';
    }
    if (price === ATC_BOARD_PRICE) {
        return 'ATC';
    }
    if (price === 0 && !percent) {
        return 0;
    }
    if (price === 0 && percent) {
        return price;
    }
    return formatNumberVN(price, { trimTrailingZeros: true });
};
