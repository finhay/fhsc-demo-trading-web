'use client';

import { useEffect, useMemo, useState } from 'react';

import {
    getStockStatisticsPriceColumns,
    getStockStatisticsTradingColumns,
} from '@/components/common/stock-info/statistics/StockStatisticsColumns';
import { StockStatisticsTable } from '@/components/common/stock-info/statistics/StockStatisticsTable';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { STATISTICS_TAB, STATISTICS_TABS } from '@/constants/stock-info';
import {
    fetchForeignTradingHistory,
    fetchPriceHistoriesChart,
    fetchProprietaryTradingHistory,
} from '@/services/api/datafeed/stock-info';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { PriceHistoriesChartData, TradingHistoryItem } from '@/types/datafeed/stock-info';
import type { StockStatisticsPriceHistoryRow } from '@/types/pages/stock-info';
import { isSuccessApi } from '@/utils/common';

const STOCK_INFO_STATISTICS = {
    tab_aria: 'Chọn loại thống kê',
    section_aria: 'Bảng thống kê',
    tab_price_history: 'Giá quá khứ',
    tab_foreign: 'GD nước ngoài',
    tab_proprietary: 'GD tự doanh',
    empty: 'Chưa có dữ liệu',
    col_date: 'Ngày',
    col_change: 'Thay đổi',
    col_change_percent: '%',
    col_close: 'Đóng ĐC',
    col_open: 'Mở',
    col_high: 'Cao',
    col_low: 'Thấp',
    col_volume: 'KLGD',
    col_net_volume: 'KL ròng',
    col_net_value: 'GT ròng',
    col_buy_volume: 'KL mua',
    col_buy_value: 'GT mua',
    col_sell_volume: 'KL bán',
    col_sell_value: 'GT bán',
};

type StatisticsTab = (typeof STATISTICS_TAB)[keyof typeof STATISTICS_TAB];

export const StockStatistics = () => {
    const { selectedStock } = useStockInfoStore();
    const [activeTab, setActiveTab] = useState<StatisticsTab>(STATISTICS_TAB.PRICE_HISTORY);
    const [isLoading, setIsLoading] = useState(false);
    const [priceData, setPriceData] = useState<PriceHistoriesChartData | null>(null);
    const [foreignRows, setForeignRows] = useState<TradingHistoryItem[]>([]);
    const [proprietaryRows, setProprietaryRows] = useState<TradingHistoryItem[]>([]);

    useEffect(() => {
        setActiveTab(STATISTICS_TAB.PRICE_HISTORY);
    }, [selectedStock?.symbol]);

    useEffect(() => {
        const symbol = selectedStock?.symbol;
        if (!symbol) {
            setPriceData(null);
            setForeignRows([]);
            setProprietaryRows([]);
            return;
        }

        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const [priceRes, foreignRes, proprietaryRes] = await Promise.all([
                    fetchPriceHistoriesChart(symbol),
                    fetchForeignTradingHistory(symbol),
                    fetchProprietaryTradingHistory(symbol),
                ]);

                setPriceData(isSuccessApi(priceRes.error_code) ? priceRes.data : null);
                setForeignRows(
                    isSuccessApi(foreignRes.error_code) && Array.isArray(foreignRes.data?.data)
                        ? foreignRes.data.data
                        : [],
                );
                setProprietaryRows(
                    isSuccessApi(proprietaryRes.error_code) &&
                        Array.isArray(proprietaryRes.data?.data)
                        ? proprietaryRes.data.data
                        : [],
                );
            } catch {
                setPriceData(null);
                setForeignRows([]);
                setProprietaryRows([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAll();
    }, [selectedStock?.symbol]);

    const priceRows = useMemo<StockStatisticsPriceHistoryRow[]>(() => {
        if (!priceData?.time?.length) return [];

        const rows = priceData.time.map((time, i) => {
            const close = priceData.close[i];
            const prevClose = i > 0 ? priceData.close[i - 1] : null;
            const change = prevClose != null ? close - prevClose : 0;
            const changePercent = prevClose ? (change / prevClose) * 100 : 0;
            return {
                time,
                open: priceData.open[i],
                high: priceData.high[i],
                low: priceData.low[i],
                close,
                volume: priceData.volume[i],
                change,
                changePercent,
                prevClose,
            };
        });

        return rows.reverse();
    }, [priceData]);

    const priceColumns = useMemo(() => getStockStatisticsPriceColumns(), []);
    const tradingColumns = useMemo(() => getStockStatisticsTradingColumns(), []);

    const tradingRows = activeTab === STATISTICS_TAB.FOREIGN ? foreignRows : proprietaryRows;

    return (
        <section
            className="flex h-full min-h-0 flex-col gap-2 overflow-hidden"
            aria-label={'Bảng thống kê'}
        >
            <nav
                className="flex shrink-0 items-center gap-1"
                role="tablist"
                aria-label={'Chọn loại thống kê'}
            >
                {STATISTICS_TABS.map(({ key, labelKey }) => {
                    const isActive = activeTab === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center justify-center rounded-full px-3 py-1 transition-colors ${
                                isActive
                                    ? 'bg-tertiary font-body-3-highlight text-primary'
                                    : 'font-body-3 text-secondary'
                            }`}
                        >
                            {STOCK_INFO_STATISTICS[labelKey]}
                        </button>
                    );
                })}
            </nav>
            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-tertiary bg-secondary">
                {isLoading ? (
                    <div className="h-full min-h-0 p-3" role="status">
                        <Skeleton />
                    </div>
                ) : (
                    <div className="scrollbar h-full overflow-auto">
                        {activeTab === STATISTICS_TAB.PRICE_HISTORY ? (
                            <StockStatisticsTable
                                key={STATISTICS_TAB.PRICE_HISTORY}
                                data={priceRows}
                                columns={priceColumns}
                                getRowId={(row) => String(row.time)}
                            />
                        ) : (
                            <StockStatisticsTable
                                key={activeTab}
                                data={tradingRows}
                                columns={tradingColumns}
                                getRowId={(row) => row.date}
                            />
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};
