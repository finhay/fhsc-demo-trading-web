'use client';

import { RiBarChart2Fill, RiFireFill, RiHandCoinFill } from 'react-icons/ri';

import { useTranslate } from '@/hooks/useTranslate';
import type { FundMarketSummary } from '@/types/pages/fund';
import {
    formatFundNetFlowBillion,
    formatFundPercent,
    getFundValueColor,
} from '@/utils/market/market-fund';

type Props = {
    summary: FundMarketSummary;
};

export const MarketFundSummary = ({ summary }: Props) => {
    const trans = useTranslate();
    const t = trans.market.assets.fund_modal;
    const month = summary.month ?? new Date().getMonth() + 1;
    const beatValue =
        summary.fundsBeatingVnIndex == null ? '--' : String(summary.fundsBeatingVnIndex);
    const netInflowText = formatFundNetFlowBillion(summary.netFundFlow);
    const aumText = formatFundPercent(summary.aumChangePercent, {
        decimals: 1,
        zeroAsDash: false,
    });
    const netInflowColor = getFundValueColor(summary.netFundFlow, 'text-primary');
    const aumColor = getFundValueColor(summary.aumChangePercent, 'text-primary');

    return (
        <div className="flex flex-col gap-3">
            <p className="font-body-2-highlight text-secondary">{t.month_title_fn(month)}</p>
            <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-quaternary p-4">
                    <div className="flex shrink-0 items-center gap-2">
                        <RiFireFill size={20} className="text-primary shrink-0" aria-hidden />
                        <span className="font-body-1-highlight text-orange whitespace-nowrap">
                            {t.beat_vnindex_value_fn(beatValue)}
                        </span>
                    </div>
                    <span className="font-body-2 text-primary whitespace-nowrap">
                        {t.beat_vnindex_label}
                    </span>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-quaternary p-4">
                    <div className="flex shrink-0 items-center gap-2">
                        <RiHandCoinFill size={20} className="text-primary shrink-0" aria-hidden />
                        <span
                            className={`font-body-1-highlight whitespace-nowrap ${netInflowColor}`}
                        >
                            {netInflowText}
                        </span>
                    </div>
                    <span className="font-body-2 text-primary whitespace-nowrap">
                        {t.net_inflow_label}
                    </span>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-quaternary p-4">
                    <div className="flex shrink-0 items-center gap-2">
                        <RiBarChart2Fill size={20} className="text-primary shrink-0" aria-hidden />
                        <span className={`font-body-1-highlight whitespace-nowrap ${aumColor}`}>
                            {aumText}
                        </span>
                    </div>
                    <span className="font-body-2 text-primary whitespace-nowrap">
                        {t.aum_label}
                    </span>
                </div>
            </div>
        </div>
    );
};
