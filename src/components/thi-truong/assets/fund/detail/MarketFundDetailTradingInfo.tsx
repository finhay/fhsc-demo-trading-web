'use client';

import type { FundCertificateDetail } from '@/types/pages/fund';
import { formatDate, formatDateTime, formatNumberVN } from '@/utils/format';
import { formatFundCurrency } from '@/utils/market/market-fund';

type Props = {
    detail: FundCertificateDetail;
};

export const MarketFundDetailTradingInfo = ({ detail }: Props) => {
    const formatQuantity = (value: number | null | undefined) =>
        value == null || value === 0
            ? 'Không quy định'
            : `${formatNumberVN(value, { decimals: 1, trimTrailingZeros: true })} ${'ccq'}`;

    const expectedCash =
        detail.time_received_cash_day == null
            ? '--'
            : detail.time_received_cash_day === 0
              ? 'Ngay ngày khớp lệnh'
              : `Trong ${detail.time_received_cash_day} ngày làm việc`;

    const rows = [
        [
            { label: 'Phát hành bởi', value: detail.fund_company_management_name || '--' },
            { label: 'Lịch giao dịch', value: detail.trading_schedule || '--' },
            {
                label: 'Phiên sắp tới',
                value: detail.matching_session ? formatDate(detail.matching_session) : '--',
            },
            {
                label: 'Hạn đặt lệnh phiên tới',
                value: detail.active_session ? formatDateTime(detail.active_session) : '--',
            },
        ],
        [
            { label: 'Mua tối thiểu', value: formatFundCurrency(detail.min_buy_value) },
            { label: 'Bán tối thiểu', value: formatQuantity(detail.min_sell_value) },
            {
                label: 'Sở hữu sau bán (nếu không bán hết)',
                value: formatQuantity(detail.min_hold_value),
            },
            { label: 'Tiền về dự kiến sau khi khớp lệnh', value: expectedCash },
        ],
    ];

    return (
        <section className="flex flex-col gap-4">
            <h3 className="body-3-highlight text-primary">{'Thông tin giao dịch'}</h3>
            <div className="flex flex-col divide-y divide-tertiary rounded-2xl base-secondary">
                {rows.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="flex flex-col divide-y divide-tertiary sm:flex-row sm:divide-x sm:divide-y-0"
                    >
                        {row.map((cell) => (
                            <div key={cell.label} className="flex flex-1 flex-col gap-1 p-4">
                                <span className="body-4 text-secondary">{cell.label}</span>
                                <span className="body-3-highlight text-primary">
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
