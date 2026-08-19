'use client';

import { Fragment, useEffect, useState } from 'react';

import Image from 'next/image';

import { FaBalanceScale, FaTrophy } from 'react-icons/fa';
import { FaArrowTrendUp } from 'react-icons/fa6';

import { PROFIT_PERIOD_ONE_YEAR } from '@/constants/market';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchFundCertificateDetail, fetchFundSuggestions } from '@/services/api/fund';
import type {
    FundCertificateDetail,
    FundCertificateDetailResponse,
    FundCompareRow,
} from '@/types/pages/fund';
import { isSuccessApi } from '@/utils/common';
import {
    formatFundNetFlowBillion,
    formatFundPercent,
    getFundCompareWinner,
    getFundValueColor,
    getProfitByPeriod,
} from '@/utils/market/market-fund';

type Props = {
    original: FundCertificateDetail;
};

export const MarketFundDetailCompare = ({ original }: Props) => {
    const trans = useTranslate();
    const d = trans.market.assets.fund_modal.detail;
    const [suggestions, setSuggestions] = useState<FundCertificateDetail[]>([]);

    const fetchData = async () => {
        try {
            const { data, error_code } = await fetchFundSuggestions(original.name);
            if (!isSuccessApi(error_code) || !data?.length) {
                setSuggestions([]);
                return;
            }

            const results = await Promise.allSettled(
                data.map((item) => fetchFundCertificateDetail(item.fund_name)),
            );

            const details = results
                .filter(
                    (result): result is PromiseFulfilledResult<FundCertificateDetailResponse> =>
                        result.status === 'fulfilled' && isSuccessApi(result.value.error_code),
                )
                .map((result) => result.value.result);

            setSuggestions(details);
        } catch {
            setSuggestions([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, [original.name]);

    const buildRows = (suggested: FundCertificateDetail): FundCompareRow[] => {
        const originalProfit = getProfitByPeriod(original, PROFIT_PERIOD_ONE_YEAR);
        const suggestedProfit = getProfitByPeriod(suggested, PROFIT_PERIOD_ONE_YEAR);
        const month = original.monthly_stats?.month ?? suggested.monthly_stats?.month ?? null;
        const year = original.monthly_stats?.year ?? suggested.monthly_stats?.year ?? null;

        return [
            {
                key: 'profit_1y',
                label: d.compare_profit_1y,
                leftValue: formatFundPercent(originalProfit),
                rightValue: formatFundPercent(suggestedProfit),
                leftColorClass: getFundValueColor(originalProfit),
                rightColorClass: getFundValueColor(suggestedProfit),
                winner: getFundCompareWinner(originalProfit, suggestedProfit),
                valueSuffix: d.compare_profit_suffix,
            },
            {
                key: 'aum_change',
                label: d.compare_aum_change,
                leftValue: formatFundPercent(original.monthly_stats?.aum_change_percent),
                rightValue: formatFundPercent(suggested.monthly_stats?.aum_change_percent),
                leftColorClass: getFundValueColor(original.monthly_stats?.aum_change_percent),
                rightColorClass: getFundValueColor(suggested.monthly_stats?.aum_change_percent),
                winner: getFundCompareWinner(
                    original.monthly_stats?.aum_change_percent,
                    suggested.monthly_stats?.aum_change_percent,
                ),
                showTrendIcon: true,
            },
            {
                key: 'investor_change',
                label: d.compare_investor_change,
                leftValue: formatFundPercent(original.monthly_stats?.investor_change_percent),
                rightValue: formatFundPercent(suggested.monthly_stats?.investor_change_percent),
                leftColorClass: getFundValueColor(original.monthly_stats?.investor_change_percent),
                rightColorClass: getFundValueColor(
                    suggested.monthly_stats?.investor_change_percent,
                ),
                winner: getFundCompareWinner(
                    original.monthly_stats?.investor_change_percent,
                    suggested.monthly_stats?.investor_change_percent,
                ),
                showTrendIcon: true,
            },
            {
                key: 'cashflow',
                label: month && year ? d.compare_cashflow_month_fn(month, year) : '',
                leftValue: formatFundNetFlowBillion(original.monthly_stats?.net_inflow),
                rightValue: formatFundNetFlowBillion(suggested.monthly_stats?.net_inflow),
                leftColorClass: getFundValueColor(original.monthly_stats?.net_inflow),
                rightColorClass: getFundValueColor(suggested.monthly_stats?.net_inflow),
                winner: getFundCompareWinner(
                    original.monthly_stats?.net_inflow,
                    suggested.monthly_stats?.net_inflow,
                ),
            },
        ];
    };

    const renderBadge = (item: FundCertificateDetail, nameFirst?: boolean) => {
        const logo = item.image_url ? (
            <Image
                src={item.image_url}
                alt={item.name}
                width={20}
                height={20}
                className="bg-quinary size-5 shrink-0 rounded-full object-cover"
            />
        ) : (
            <div className="bg-tertiary size-5 shrink-0 rounded-full" />
        );
        const name = (
            <span className="font-body-2-highlight truncate text-primary">{item.name}</span>
        );

        return (
            <div
                className={`flex min-w-0 flex-1 items-center gap-2 ${nameFirst ? 'justify-end' : ''}`}
            >
                {nameFirst ? (
                    <>
                        {name}
                        {logo}
                    </>
                ) : (
                    <>
                        {logo}
                        {name}
                    </>
                )}
            </div>
        );
    };

    const renderValue = (value: string, colorClass: string, suffix?: string) => (
        <span className={`font-body-2-highlight ${colorClass}`}>
            {value}
            {suffix && <span className="font-body-3 text-tertiary">{suffix}</span>}
        </span>
    );

    if (suggestions.length === 0) return null;

    return (
        <section className="flex flex-col gap-4">
            <h3 className="font-body-2-highlight text-primary">{d.compare_heading}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {suggestions.map((suggested) => {
                    const rows = buildRows(suggested);

                    return (
                        <div
                            key={suggested.name}
                            className="flex flex-col gap-4 rounded-2xl bg-secondary p-3"
                        >
                            <div className="flex items-center justify-center gap-6">
                                {renderBadge(original, true)}
                                <FaBalanceScale
                                    size={16}
                                    className="shrink-0 text-tertiary"
                                    aria-hidden
                                />
                                {renderBadge(suggested)}
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                {rows.map((row, index) => (
                                    <Fragment key={row.key}>
                                        <div className="flex w-full flex-col items-center gap-2">
                                            <span className="flex items-center gap-1 font-body-3 text-primary">
                                                {row.showTrendIcon && (
                                                    <FaArrowTrendUp
                                                        size={12}
                                                        className="shrink-0 text-primary"
                                                    />
                                                )}
                                                {row.label}
                                            </span>
                                            <div className="flex w-full items-center gap-16">
                                                <div className="flex flex-1 items-center justify-end gap-1">
                                                    {row.winner === 'left' && (
                                                        <FaTrophy
                                                            size={14}
                                                            className="shrink-0 text-yellow"
                                                        />
                                                    )}
                                                    {renderValue(
                                                        row.leftValue,
                                                        row.leftColorClass,
                                                        row.valueSuffix,
                                                    )}
                                                </div>
                                                <div className="flex flex-1 items-center gap-1">
                                                    {renderValue(
                                                        row.rightValue,
                                                        row.rightColorClass,
                                                        row.valueSuffix,
                                                    )}
                                                    {row.winner === 'right' && (
                                                        <FaTrophy
                                                            size={14}
                                                            className="shrink-0 text-yellow"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {index < rows.length - 1 && (
                                            <div className="h-px w-40 bg-tertiary" />
                                        )}
                                    </Fragment>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
