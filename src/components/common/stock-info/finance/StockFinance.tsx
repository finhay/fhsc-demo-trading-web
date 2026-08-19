'use client';

import { useEffect, useState } from 'react';

import { AnalysisPanel } from '@/components/common/stock-info/finance/analysis/AnalysisPanel';
import { ReportPanel } from '@/components/common/stock-info/finance/report/ReportPanel';
import {
    EMPTY_FINANCIAL_STATEMENT_DATA,
    FINANCE_TAB,
    FINANCIAL_REPORT_TABS,
    FINANCIAL_STATEMENT_TYPE,
} from '@/constants/stock-info';
import { useTranslate } from '@/hooks/useTranslate';
import {
    fetchCompanyFinancialAnalysis,
    fetchFinancialStatement,
} from '@/services/api/datafeed/finance';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { FinancialStatementRow } from '@/types/datafeed/finance';
import type { FinancialStatementData } from '@/types/pages/stock-info';
import { isSuccessApi } from '@/utils/common';

export const StockFinance = () => {
    const trans = useTranslate();
    const [activeTab, setActiveTab] = useState<string>(FINANCE_TAB.ANALYSIS);
    const [isLoading, setIsLoading] = useState(true);
    const [dataAnnual, setDataAnnual] = useState<any>([]);
    const [dataQuarterly, setDataQuarterly] = useState<any>([]);
    const [financialData, setFinancialData] = useState<FinancialStatementData>(
        EMPTY_FINANCIAL_STATEMENT_DATA,
    );
    const { selectedStock } = useStockInfoStore();

    const financeTabs = [
        { key: FINANCE_TAB.ANALYSIS, label: trans.stockInfo.finance.tab_analysis },
        { key: FINANCE_TAB.REPORT, label: trans.stockInfo.finance.tab_report },
    ];

    const fetchFinanceData = async (symbol: string) => {
        setIsLoading(true);
        try {
            const [annualRes, quarterlyRes, ...statementResponses] = await Promise.all([
                fetchCompanyFinancialAnalysis(symbol),
                fetchCompanyFinancialAnalysis(symbol, 'quarterly'),
                ...FINANCIAL_REPORT_TABS.map(({ key }) =>
                    fetchFinancialStatement({ symbol, type: key }),
                ),
            ]);

            if (isSuccessApi(annualRes.error_code) && isSuccessApi(quarterlyRes.error_code)) {
                setDataAnnual(annualRes.data);
                setDataQuarterly(quarterlyRes.data);
            }

            const nextFinancialData = statementResponses.reduce<FinancialStatementData>(
                (acc, response, index) => {
                    const statementType = FINANCIAL_REPORT_TABS[index]?.key;
                    if (!statementType) return acc;

                    acc[statementType] =
                        isSuccessApi(response.error_code) && Array.isArray(response.data)
                            ? (response.data as FinancialStatementRow[])
                            : [];

                    return acc;
                },
                { ...EMPTY_FINANCIAL_STATEMENT_DATA },
            );
            setFinancialData(nextFinancialData);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const symbol = selectedStock?.symbol;
        if (!symbol) {
            setDataAnnual([]);
            setDataQuarterly([]);
            setFinancialData({ ...EMPTY_FINANCIAL_STATEMENT_DATA });
            return;
        }

        fetchFinanceData(symbol);
    }, [selectedStock?.symbol]);

    return (
        <section className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
            <nav
                className="flex shrink-0 items-center gap-1"
                role="tablist"
                aria-label={trans.stockInfo.finance.tab_aria}
            >
                {financeTabs.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center justify-center rounded-full px-3 py-1 transition-colors ${
                            activeTab === key
                                ? 'bg-tertiary font-body-3-highlight text-primary'
                                : 'font-body-3 text-secondary'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </nav>
            <div className="min-h-0 flex-1 overflow-hidden">
                {activeTab === FINANCE_TAB.ANALYSIS ? (
                    <AnalysisPanel
                        isLoading={isLoading}
                        dataAnnual={dataAnnual}
                        dataQuarterly={dataQuarterly}
                        incomeData={financialData[FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT]}
                        cashFlowData={financialData[FINANCIAL_STATEMENT_TYPE.CASH_FLOW]}
                    />
                ) : (
                    <ReportPanel isLoading={isLoading} financialData={financialData} />
                )}
            </div>
        </section>
    );
};
