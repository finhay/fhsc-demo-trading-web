import type { AssetsSummary } from '@/types/accounts/assets';
import type { PaperAccountAsset } from '@/types/paper-trading/account';

const EMPTY_PNL = { pnl: 0, pnl_rate: 0 };

/**
 * Map `GET /v1/accounts/{id}/asset` sang `AssetsSummary` để Overview / Allocation /
 * Debt dùng lại shape cũ. Simulator chỉ có tiền mặt + chứng khoán — các nhánh còn lại để 0.
 *
 * `debt` toàn 0 khiến `AssetDebt` tự rơi vào empty state "Bạn đang không có khoản nợ nào!".
 */
export const buildPaperAssetsSummary = (asset: PaperAccountAsset | null): AssetsSummary => {
    const stockPnl = asset?.pnl?.stock;

    return {
        net_asset_value: asset?.net_asset_value ?? 0,
        products: {
            total: asset?.products?.total ?? 0,
            stock: asset?.products?.stock ?? 0,
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
            total: asset?.money?.total ?? 0,
            ci_balance: asset?.money?.ci_balance ?? 0,
            ca_receiving: asset?.products?.receivable?.cash ?? 0,
            emk_amt: 0,
            receiving_amt: asset?.money?.reserved ?? 0,
            baldefovd: asset?.money?.baldefovd ?? 0,
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
            stock: stockPnl ?? EMPTY_PNL,
            fund: EMPTY_PNL,
            child_savings: EMPTY_PNL,
        },
    };
};
