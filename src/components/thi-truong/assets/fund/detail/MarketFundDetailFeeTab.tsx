'use client';

import { FUND_FEE_TYPES } from '@/constants/market';
import { useTranslate } from '@/hooks/useTranslate';
import type { FundCertificateDetail, FundFeeItem } from '@/types/pages/fund';
import { formatFundFeePercent, formatFundFeeRange } from '@/utils/market/market-fund';

type Props = {
    detail: FundCertificateDetail;
};

export const MarketFundDetailFeeTab = ({ detail }: Props) => {
    const trans = useTranslate();
    const d = trans.market.assets.fund_modal.detail.fee_tab;

    const rangeLabels = {
        under: d.range_under_fn,
        over: d.range_over_fn,
        between: d.range_between_fn,
        unitDay: d.unit_day,
        unitMonth: d.unit_month,
        unitYear: d.unit_year,
    };

    const buyFees = detail.fees?.filter((fee) => fee.type === FUND_FEE_TYPES.buy) ?? [];
    const sellFees = detail.fees?.filter((fee) => fee.type === FUND_FEE_TYPES.sell) ?? [];
    const hasBuyFee = buyFees.some((fee) => (fee.percent ?? 0) > 0);
    const transferFeeData = detail.transfer_fee_detail?.data?.filter((row) => row.key) ?? [];

    const renderFeeRow = (items: FundFeeItem[]) => (
        <div className="flex flex-wrap divide-x divide-tertiary">
            {items.map((item) => (
                <div key={item.key} className="flex min-w-40 flex-1 flex-col gap-1 px-4 first:pl-0">
                    <span className="font-body-3 text-secondary">{item.label}</span>
                    <span className="font-body-2-highlight text-primary">{item.value}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col divide-y divide-tertiary rounded-2xl bg-secondary p-4">
            <div className="pb-4">
                {hasBuyFee ? (
                    renderFeeRow(
                        buyFees.map((fee, index) => ({
                            key: fee.id ?? index,
                            label: formatFundFeeRange(fee, rangeLabels),
                            value: formatFundFeePercent(fee.percent, d.free),
                        })),
                    )
                ) : (
                    <div className="flex flex-col gap-1">
                        <span className="font-body-3 text-secondary">{d.buy_fee}</span>
                        <span className="font-body-2-highlight text-primary">{d.free}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 py-4">
                <span className="font-body-3 text-secondary">{d.sell_fee}</span>
                {sellFees.length > 0 ? (
                    renderFeeRow(
                        sellFees.map((fee, index) => ({
                            key: fee.id ?? index,
                            label: formatFundFeeRange(fee, rangeLabels),
                            value: formatFundFeePercent(fee.percent, d.free),
                        })),
                    )
                ) : (
                    <span className="font-body-2-highlight text-primary">{d.no_limit_free}</span>
                )}
            </div>

            {transferFeeData.length > 0 && (
                <div className="flex flex-col gap-3 py-4">
                    <span className="font-body-3 text-secondary">
                        {detail.transfer_fee_detail?.title || d.transfer_fee_default_title}
                    </span>
                    {renderFeeRow(
                        transferFeeData.map((row, index) => ({
                            key: row.key ?? index,
                            label: row.key ?? '',
                            value: row.value ?? '--',
                        })),
                    )}
                </div>
            )}

            {detail.tax != null && (
                <div className="flex flex-col gap-1 pt-4">
                    <span className="font-body-3 text-secondary">{d.tax}</span>
                    <span className="font-body-2-highlight text-primary">{detail.tax}%</span>
                </div>
            )}
        </div>
    );
};
