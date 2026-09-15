'use client';

import { RiBarChart2Fill, RiFireFill, RiHandCoinFill } from 'react-icons/ri';

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
            <p className="body-3-highlight text-secondary">{`Trong tháng ${month}...`}</p>
            <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-quaternary p-4">
                    <div className="flex shrink-0 items-center gap-2">
                        <RiFireFill size={20} className="text-primary shrink-0" aria-hidden />
                        <span className="body-2-highlight text-orange whitespace-nowrap">
                            {`${beatValue} quỹ`}
                        </span>
                    </div>
                    <span className="body-3 text-primary whitespace-nowrap">
                        {'vượt VNINDEX'}
                    </span>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-quaternary p-4">
                    <div className="flex shrink-0 items-center gap-2">
                        <RiHandCoinFill size={20} className="text-primary shrink-0" aria-hidden />
                        <span
                            className={`body-2-highlight whitespace-nowrap ${netInflowColor}`}
                        >
                            {netInflowText}
                        </span>
                    </div>
                    <span className="body-3 text-primary whitespace-nowrap">
                        {'tiền vào ròng'}
                    </span>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-quaternary p-4">
                    <div className="flex shrink-0 items-center gap-2">
                        <RiBarChart2Fill size={20} className="text-primary shrink-0" aria-hidden />
                        <span className={`body-2-highlight whitespace-nowrap ${aumColor}`}>
                            {aumText}
                        </span>
                    </div>
                    <span className="body-3 text-primary whitespace-nowrap">
                        {'tài sản quản lý'}
                    </span>
                </div>
            </div>
        </div>
    );
};
