'use client';

import { useTranslate } from '@/hooks/useTranslate';
import type { FundCertificateDetail } from '@/types/pages/fund';
import { formatDate, formatDateTime, formatNumberVN } from '@/utils/format';
import { formatFundCurrency } from '@/utils/market/market-fund';

type Props = {
    detail: FundCertificateDetail;
};

export const MarketFundDetailTradingInfo = ({ detail }: Props) => {
    const trans = useTranslate();
    const d = trans.market.assets.fund_modal.detail.trading_info;

    const formatQuantity = (value: number | null | undefined) =>
        value == null || value === 0
            ? d.no_limit
            : `${formatNumberVN(value, { decimals: 1, trimTrailingZeros: true })} ${d.unit_ccq}`;

    const expectedCash =
        detail.time_received_cash_day == null
            ? '--'
            : detail.time_received_cash_day === 0
              ? d.expected_cash_same_day
              : d.expected_cash_days_fn(detail.time_received_cash_day);

    const rows = [
        [
            { label: d.issuer, value: detail.fund_company_management_name || '--' },
            { label: d.schedule, value: detail.trading_schedule || '--' },
            {
                label: d.next_session,
                value: detail.matching_session ? formatDate(detail.matching_session) : '--',
            },
            {
                label: d.next_session_deadline,
                value: detail.active_session ? formatDateTime(detail.active_session) : '--',
            },
        ],
        [
            { label: d.min_buy, value: formatFundCurrency(detail.min_buy_value) },
            { label: d.min_sell, value: formatQuantity(detail.min_sell_value) },
            { label: d.min_hold, value: formatQuantity(detail.min_hold_value) },
            { label: d.expected_cash, value: expectedCash },
        ],
    ];

    return (
        <section className="flex flex-col gap-4">
            <h3 className="font-body-2-highlight text-primary">{d.heading}</h3>
            <div className="flex flex-col divide-y divide-tertiary rounded-2xl bg-secondary">
                {rows.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="flex flex-col divide-y divide-tertiary sm:flex-row sm:divide-x sm:divide-y-0"
                    >
                        {row.map((cell) => (
                            <div key={cell.label} className="flex flex-1 flex-col gap-1 p-4">
                                <span className="font-body-3 text-secondary">{cell.label}</span>
                                <span className="font-body-2-highlight text-primary">
                                    {cell.value}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
};
