'use client';

import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { StockOverviewTrend } from '@/components/common/stock-info/overview/StockOverviewTrend';
import { StockOverviewValuation } from '@/components/common/stock-info/overview/StockOverviewValuation';
import { Spinner } from '@/components/common/ui/Spinner';
import {
    fetchCompanyFinancialOverview,
    fetchFinancialNewsBySymbol,
} from '@/services/api/datafeed/finance';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { FinanceOverviewData } from '@/types/datafeed/finance';
import { isSuccessApi } from '@/utils/common';

export const StockOverview = () => {
    const { selectedStock } = useStockInfoStore();
    const [isLoading, setIsLoading] = useState(false);
    const [overview, setOverview] = useState<FinanceOverviewData | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [netRevenue, setNetRevenue] = useState<number[]>([]);
    const [profitAfterTax, setProfitAfterTax] = useState<number[]>([]);

    const fetchOverviewData = async (symbol: string) => {
        setIsLoading(true);
        try {
            const [overviewResponse, newsResponse] = await Promise.all([
                fetchCompanyFinancialOverview(symbol),
                fetchFinancialNewsBySymbol(symbol),
            ]);

            if (isSuccessApi(overviewResponse.error_code) && overviewResponse.data) {
                setOverview(overviewResponse.data);
            }

            if (isSuccessApi(newsResponse.error_code) && newsResponse.data?.financial?.length) {
                const sorted = [...newsResponse.data.financial].sort(
                    (a, b) => a.year - b.year || a.quarter - b.quarter,
                );
                setCategories(sorted.map((row) => `Q${row.quarter}/${row.year}`));
                setNetRevenue(sorted.map((row) => row.net_sale / 1e12));
                setProfitAfterTax(sorted.map((row) => row.profit / 1e12));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const symbol = selectedStock?.symbol;
        if (!symbol) {
            setOverview(null);
            setCategories([]);
            setNetRevenue([]);
            setProfitAfterTax([]);
            return;
        }

        fetchOverviewData(symbol);
    }, [selectedStock?.symbol]);

    return (
        <section
            className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto"
            aria-label={'Tổng quan định giá và chỉ số'}
        >
            {isLoading ? (
                <div className="flex h-full min-h-0 items-center justify-center" role="status">
                    <Spinner isLoading isOverlay={false} />
                </div>
            ) : overview ? (
                <div className="flex flex-col gap-8">
                    <StockOverviewValuation
                        overview={overview}
                        companyType={selectedStock?.companyType}
                    />
                    <StockOverviewTrend
                        categories={categories}
                        netRevenue={netRevenue}
                        profitAfterTax={profitAfterTax}
                    />
                </div>
            ) : (
                <EmptyState />
            )}
        </section>
    );
};
