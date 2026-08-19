'use client';

import { RiBarChart2Fill, RiHandCoinFill, RiTeamFill } from 'react-icons/ri';

import { useTranslate } from '@/hooks/useTranslate';
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
    const trans = useTranslate();
    const d = trans.market.assets.fund_modal.detail;
    const stats = detail.monthly_stats;

    if (!stats?.month || !stats?.year) return null;

    const cards = [
        {
            key: 'aum',
            icon: RiBarChart2Fill,
            value: stats.aum_change_percent,
            label: d.monthly_stats_aum_label,
        },
        {
            key: 'investor',
            icon: RiTeamFill,
            value: stats.investor_change_percent,
            label: d.monthly_stats_investor_label,
        },
    ];

    return (
        <section className="flex flex-col gap-4">
            <h3 className="font-body-2-highlight text-primary">
                {d.monthly_stats_title_fn(stats.month, stats.year, detail.name)}
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
                                    className={`font-body-1-highlight whitespace-nowrap ${colorClass}`}
                                >
                                    {formatFundPercent(card.value)}
                                </span>
                            </div>
                            <span className="font-body-2 text-primary whitespace-nowrap">
                                {card.label}
                            </span>
                        </div>
                    );
                })}
                <div className="flex flex-1 items-center gap-2 rounded-2xl border border-tertiary p-4">
                    <div className="flex shrink-0 items-center gap-2">
                        <RiHandCoinFill size={20} className="text-primary shrink-0" aria-hidden />
                        <span
                            className={`font-body-1-highlight whitespace-nowrap ${getChangeColor(stats.net_inflow ?? 0)}`}
                        >
                            {formatFundNetFlowBillion(stats.net_inflow)}
                        </span>
                    </div>
                    <span className="font-body-2 text-primary whitespace-nowrap">
                        {d.monthly_stats_net_inflow_label}
                    </span>
                </div>
            </div>
        </section>
    );
};
