'use client';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import {
    ANALYSIS_CONTENT_CARD,
    CHART_GRADIENTS,
    FINANCE_ANALYSIS_LABELS,
    NON_FINANCIAL_CASHFLOW,
} from '@/constants/stock-info';
import type { FinancialStatementRow } from '@/types/datafeed/finance';
import { formatNumberVNWithUnit } from '@/utils/format';
import { getToneByValue, getValueClass, sortByYearAsc } from '@/utils/stock-info';

export const NonFinancialCashflow = ({
    dataQuarterly,
    cashFlowData,
}: {
    dataQuarterly: any;
    cashFlowData: FinancialStatementRow[];
}) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;
    const latest = dataQuarterly?.[0] ?? {};
    const { fields, labelKeys } = NON_FINANCIAL_CASHFLOW;
    const sortedCashFlow = sortByYearAsc(cashFlowData);
    const latestCashFlow = sortedCashFlow[sortedCashFlow.length - 1] ?? {};

    const ocf = Number(latestCashFlow?.[fields.ocf]) || 0;
    const capex = Number(latest?.[fields.capex]) || 0;
    const fcf = ocf - capex;
    const netCash = Number(latest?.[fields.netCash]) || 0;

    const cashflowItems = [
        { labelKey: labelKeys.ocf, value: ocf },
        { labelKey: labelKeys.capex, value: capex },
        { labelKey: labelKeys.fcf, value: fcf },
        { labelKey: labelKeys.netCash, value: netCash },
    ].map((item) => ({
        ...item,
        tone: getToneByValue(item.value),
        textColor: getValueClass(item.value, true),
    }));

    return (
        <AnalysisSection title={'Dòng tiền có khoẻ không?'}>
            <div className={ANALYSIS_CONTENT_CARD}>
                <div className="flex gap-3">
                    {cashflowItems.map((item) => (
                        <div
                            key={item.labelKey}
                            className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl p-2"
                            style={{
                                background:
                                    item.tone === 'positive'
                                        ? CHART_GRADIENTS.positive
                                        : CHART_GRADIENTS.negative,
                            }}
                        >
                            <p className="font-caption text-secondary">{fa[item.labelKey]}</p>
                            <p className={`font-body-3-highlight ${item.textColor}`}>
                                {formatNumberVNWithUnit(item.value)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </AnalysisSection>
    );
};
