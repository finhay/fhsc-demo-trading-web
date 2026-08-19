'use client';

import { useEffect, useRef, useState } from 'react';

import { FaCircle } from 'react-icons/fa6';

import { Dropdown } from '@/components/common/ui/Dropdown';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { MarketDot } from '@/components/thi-truong/shared/MarketDot';
import { createChartMarketLiquidityV2 } from '@/config/market/market-liquidity';
import { EXCHANGES } from '@/constants/common';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchMarketLiquidityStats } from '@/services/api/datafeed/trading-data';
import type { MarketLiquidityItem } from '@/types/datafeed/trading-data';
import { isSuccessApi } from '@/utils/common';

export const MarketLiquidity = () => {
    const trans = useTranslate();
    const [activeExchange, setActiveExchange] = useState<string>(EXCHANGES[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [todayData, setTodayData] = useState<MarketLiquidityItem[]>([]);
    const [avgData, setAvgData] = useState<MarketLiquidityItem[]>([]);

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartRef, { shouldInitialize: !isLoading });
    const exchangeOptions = EXCHANGES.map((ex) => ({ value: ex, label: ex }));

    const fetchData = async (exchange: string, showLoading = false) => {
        if (showLoading) setIsLoading(true);
        const { data, error_code } = await fetchMarketLiquidityStats(exchange);
        if (isSuccessApi(error_code)) {
            setTodayData(data?.latest?.items ?? []);
            setAvgData(data?.previous?.items ?? []);
        }
        if (showLoading) setIsLoading(false);
    };

    useEffect(() => {
        fetchData(activeExchange, true);
        const id = setInterval(() => fetchData(activeExchange), 180_000);
        return () => clearInterval(id);
    }, [activeExchange]);

    useEffect(() => {
        if (isLoading) return;
        chartInstanceRef.current?.setOption(
            createChartMarketLiquidityV2(todayData, avgData, trans),
        );
    }, [isLoading, todayData, avgData, trans]);

    return (
        <section className="bg-secondary flex min-h-0 flex-col gap-3 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="font-body-2-highlight text-primary flex items-center gap-2">
                    <MarketDot />
                    {trans.market.liquidity.heading}
                </h2>
                <Dropdown
                    options={exchangeOptions}
                    value={activeExchange}
                    onChange={setActiveExchange}
                />
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <FaCircle className="text-blue shrink-0" size={8} />
                    <span className="font-caption text-secondary">
                        {trans.market.liquidity.value_open}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <FaCircle className="text-orange shrink-0" size={8} />
                    <span className="font-caption text-secondary">
                        {trans.market.liquidity.value_avg5}
                    </span>
                </div>
            </div>
            {isLoading ? (
                <div className="w-full h-64">
                    <Skeleton />
                </div>
            ) : (
                <div className="relative w-full h-64">
                    <div ref={chartRef} className="w-full h-full" aria-hidden="true" />
                </div>
            )}
        </section>
    );
};
