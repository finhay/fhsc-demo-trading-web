'use client';

import { RiBarChart2Fill, RiHandCoinFill, RiTeamFill } from 'react-icons/ri';

import type { FundCertificateDetail } from '@/types/pages/fund';
import { getChangeColor } from '@/utils/common';
import {
    formatFundNetFlowBillion,
    formatFundPercent,
    getFundValueColor,
} from '@/utils/market/market-fund';

type Props = {
    detail: FundCertificateDetail;
};

export const MarketFundDetailMonthlyStats = ({ detail }: Props) => {
    const stats = detail.monthly_stats;

    if (!stats?.month || !stats?.year) return null;

    const cards = [
        {
            key: 'aum',
            icon: RiBarChart2Fill,
            value: stats.aum_change_percent,
            label: 'tài sản quản lý',
        },
        {
            key: 'investor',
            icon: RiTeamFill,
            value: stats.investor_change_percent,
            label: 'số nhà đầu tư',
        },
    ];

    return (
        <section className="flex flex-col gap-4">
            <h3 className="body-3-highlight text-primary">
                {`Trong tháng ${
                    stats.year === new Date().getFullYear()
                        ? `${stats.month}`
                        : `${stats.month}/${stats.year}`
                }, ${detail.name} có...`}
            </h3>
            <div className="flex flex-col gap-3 md:flex-row">
                {cards.map((card) => {
                    const colorClass = getFundValueColor(card.value);
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.key}
                            className="flex flex-1 items-center gap-2 rounded-2xl border border-tertiary p-4"
                        >
                            <div className="flex shrink-0 items-center gap-2">
                                <Icon size={20} className="text-primary shrink-0" aria-hidden />
                                <span
                                    className={`body-2-highlight whitespace-nowrap ${colorClass}`}
                                >
                                    {formatFundPercent(card.value)}
                                </span>
                            </div>
                            <span className="body-3 text-primary whitespace-nowrap">
                                {card.label}
                            </span>
                        </div>
                    );
                })}
                <div className="flex flex-1 items-center gap-2 rounded-2xl border border-tertiary p-4">
                    <div className="flex shrink-0 items-center gap-2">
                        <RiHandCoinFill size={20} className="text-primary shrink-0" aria-hidden />
                        <span
                            className={`body-2-highlight whitespace-nowrap ${getChangeColor(stats.net_inflow ?? 0)}`}
                        >
                            {formatFundNetFlowBillion(stats.net_inflow)}
                        </span>
                    </div>
                    <span className="body-3 text-primary whitespace-nowrap">
                        {'tiền vào ròng'}
                    </span>
                </div>
            </div>
        </section>
    );
};
