'use client';

import Image from 'next/image';
import { useRouter } from 'next/router';

import {
    PROFIT_PERIOD_FIVE_YEARS,
    PROFIT_PERIOD_ONE_YEAR,
    PROFIT_PERIOD_THREE_YEARS,
} from '@/constants/market';
import { useTranslate } from '@/hooks/useTranslate';
import type { FundCertificateDetail } from '@/types/pages/fund';
import {
    formatFundPercent,
    getFundValueColor,
    getProfitByPeriod,
} from '@/utils/market/market-fund';

type Props = {
    detail: FundCertificateDetail;
};

export const MarketFundDetailHeader = ({ detail }: Props) => {
    const trans = useTranslate();
    const { locale } = useRouter();
    const t = trans.market.assets.fund_modal;
    const d = t.detail;

    const briefDescription =
        locale === 'en'
            ? detail.en_brief_description || detail.brief_description
            : detail.brief_description;

    const periods = [
        { key: PROFIT_PERIOD_ONE_YEAR, label: d.profit_1y },
        { key: PROFIT_PERIOD_THREE_YEARS, label: d.profit_3y },
        { key: PROFIT_PERIOD_FIVE_YEARS, label: d.profit_5y },
    ];

    return (
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
                {detail.image_url ? (
                    <Image
                        src={detail.image_url}
                        alt={detail.name}
                        width={64}
                        height={64}
                        className="bg-quinary size-16 shrink-0 rounded-full object-cover"
                    />
                ) : (
                    <div className="bg-tertiary size-16 shrink-0 rounded-full" />
                )}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className="font-body-1-highlight text-primary">{detail.name}</span>
                        <span className="font-caption rounded-full border border-green px-3 py-1 text-primary">
                            {t.list_tabs[detail.type as keyof typeof t.list_tabs] ?? detail.type}
                        </span>
                    </div>
                    {briefDescription && (
                        <span className="font-body-3 text-secondary">{briefDescription}</span>
                    )}
                </div>
            </div>
            <div className="flex items-stretch gap-5 rounded-2xl border border-tertiary p-4">
                {periods.map((period, index) => {
                    const value = getProfitByPeriod(detail, period.key);
                    const hasValue = value != null && value !== 0;
                    const valueColor = getFundValueColor(value);
                    return (
                        <div key={period.key} className="flex items-stretch gap-5">
                            {index > 0 && <div className="w-px shrink-0 bg-tertiary" aria-hidden />}
                            <div className="flex w-[120px] flex-col gap-1">
                                <span className="font-body-3-highlight text-primary">
                                    {period.label}
                                </span>
                                <span className={`font-body-2-highlight ${valueColor}`}>
                                    {formatFundPercent(value)}
                                    {hasValue && (
                                        <span className="font-body-3 text-tertiary">
                                            {d.profit_suffix}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
