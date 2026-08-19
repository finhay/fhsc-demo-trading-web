'use client';

import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Spinner } from '@/components/common/ui/Spinner';
import {
    BILLION,
    FINANCIAL_REPORT_TABS,
    FINANCIAL_STATEMENT_TYPE,
    TRADE_REPORT_DIVIDER_CLASS_MAP,
    TRADE_REPORT_METRIC_STYLE_CLASS_MAP,
} from '@/constants/stock-info';
import { useTranslate } from '@/hooks/useTranslate';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { FinancialStatementData, ReportTab } from '@/types/pages/stock-info';
import { formatNumberVN, formatPeriod } from '@/utils/format';
import { getTradeReportSchema } from '@/utils/stock-info';

type Props = {
    isLoading: boolean;
    financialData: FinancialStatementData;
};

export const ReportPanel = ({ isLoading, financialData }: Props) => {
    const trans = useTranslate();
    const { selectedStock } = useStockInfoStore();
    const [activeTab, setActiveTab] = useState<ReportTab>(
        FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT,
    );
    const [hoveredCell, setHoveredCell] = useState<{ rowIndex: number; colIndex: number } | null>(
        null,
    );

    useEffect(() => {
        setActiveTab(FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT);
        setHoveredCell(null);
    }, [selectedStock?.symbol]);

    useEffect(() => {
        setHoveredCell(null);
    }, [activeTab]);

    const activeRows = financialData[activeTab];

    const reportSchema = useMemo(
        () => getTradeReportSchema(selectedStock?.companyType, activeTab),
        [selectedStock?.companyType, activeTab],
    );

    const isCellHighlighted = (rowIndex: number | null, colIndex: number | null) => {
        if (!hoveredCell) return false;
        return (
            (rowIndex !== null && hoveredCell.rowIndex === rowIndex) ||
            (colIndex !== null && hoveredCell.colIndex === colIndex)
        );
    };

    const cellBgClass = (highlighted: boolean) => (highlighted ? 'bg-tertiary' : 'bg-secondary');

    return (
        <section
            className="flex h-full min-h-0 flex-col gap-2 p-3 overflow-hidden bg-secondary rounded-2xl border border-tertiary"
            aria-label={trans.stockInfo.finance_report.section_aria}
        >
            <nav
                className="flex shrink-0 items-start gap-4"
                role="tablist"
                aria-label={trans.stockInfo.finance_report.tab_aria}
            >
                {FINANCIAL_REPORT_TABS.map(({ key, labelKey }) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        id={`trade-report-${key}-tab`}
                        aria-selected={activeTab === key}
                        aria-controls="trade-report-panel"
                        onClick={() => setActiveTab(key)}
                        className={`font-body-3-highlight whitespace-nowrap transition-colors ${
                            activeTab === key ? 'text-primary' : 'text-secondary'
                        }`}
                    >
                        {trans.stockInfo.finance_report[labelKey]}
                    </button>
                ))}
            </nav>
            {isLoading ? (
                <div className="flex h-full min-h-0 items-center justify-center" role="status">
                    <Spinner isLoading isOverlay={false} />
                </div>
            ) : activeRows.length > 0 ? (
                <>
                    <div
                        id="trade-report-panel"
                        role="tabpanel"
                        aria-labelledby={`trade-report-${activeTab}-tab`}
                        className="scrollbar min-h-0 flex-1 overflow-auto bg-secondary"
                    >
                        <table
                            className="w-full min-w-full border-separate border-spacing-0 bg-secondary"
                            onMouseLeave={() => setHoveredCell(null)}
                        >
                            <thead className="bg-secondary">
                                <tr className="bg-secondary">
                                    <th className="bg-secondary text-primary sticky top-0 left-0 z-20 w-48 whitespace-normal break-words py-2 text-left font-caption-highlight">
                                        QoQ
                                    </th>
                                    {activeRows.map((row, colIndex) => (
                                        <th
                                            key={`${row.year}-${row.quarter}`}
                                            className={`${cellBgClass(isCellHighlighted(null, colIndex))} sticky top-0 z-10 p-2 text-right font-caption-highlight ${
                                                colIndex === 0 ? 'text-primary' : 'text-secondary'
                                            }`}
                                        >
                                            {formatPeriod(row)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-secondary">
                                {reportSchema.map((schemaRow, rowIndex) => {
                                    if (schemaRow.kind === 'divider') {
                                        return (
                                            <tr key={`divider-${rowIndex}`}>
                                                <td
                                                    colSpan={activeRows.length + 1}
                                                    className={
                                                        TRADE_REPORT_DIVIDER_CLASS_MAP[
                                                            schemaRow.variant
                                                        ]
                                                    }
                                                />
                                            </tr>
                                        );
                                    }

                                    if (schemaRow.kind === 'section') {
                                        return (
                                            <tr
                                                key={`section-${schemaRow.label}-${rowIndex}`}
                                                className="bg-secondary"
                                            >
                                                <td
                                                    className={`bg-secondary sticky left-0 z-10 w-48 whitespace-normal break-words p-2 ${TRADE_REPORT_METRIC_STYLE_CLASS_MAP.sectionTitle}`}
                                                >
                                                    {schemaRow.label}
                                                </td>
                                                {activeRows.map((row, colIndex) => (
                                                    <td
                                                        key={`section-empty-${schemaRow.label}-${row.year}-${row.quarter}`}
                                                        className={`${cellBgClass(isCellHighlighted(null, colIndex))} p-2`}
                                                    />
                                                ))}
                                            </tr>
                                        );
                                    }

                                    const isRowHighlighted = isCellHighlighted(rowIndex, null);

                                    return (
                                        <tr key={schemaRow.metricKey} className="bg-secondary">
                                            <td
                                                className={`${cellBgClass(isRowHighlighted)} sticky left-0 z-10 w-48 whitespace-normal break-words p-2 ${TRADE_REPORT_METRIC_STYLE_CLASS_MAP[schemaRow.style]}`}
                                            >
                                                {schemaRow.uiLabel ?? '—'}
                                            </td>
                                            {activeRows.map((row, colIndex) => {
                                                const value = (row as Record<string, unknown>)[
                                                    schemaRow.metricKey
                                                ];
                                                const normalizedValue =
                                                    typeof value === 'number' ? value : 0;
                                                const billionValue = normalizedValue / BILLION;
                                                const isWholeBillion = Math.abs(billionValue) >= 1;
                                                const formattedValue = formatNumberVN(
                                                    isWholeBillion
                                                        ? Math.trunc(billionValue)
                                                        : billionValue,
                                                    {
                                                        decimals: isWholeBillion ? 0 : 2,
                                                        trimTrailingZeros: true,
                                                    },
                                                );
                                                const displayValue =
                                                    formattedValue === '-0' ? '0' : formattedValue;
                                                return (
                                                    <td
                                                        key={`${schemaRow.metricKey}-${row.year}-${row.quarter}`}
                                                        className={`${cellBgClass(isCellHighlighted(rowIndex, colIndex))} p-2 text-right font-caption ${
                                                            normalizedValue < 0
                                                                ? 'text-red'
                                                                : 'text-primary'
                                                        }`}
                                                        onMouseEnter={() =>
                                                            setHoveredCell({ rowIndex, colIndex })
                                                        }
                                                    >
                                                        {displayValue}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="ml-auto font-caption text-secondary">Đơn vị: tỷ đồng</div>
                </>
            ) : (
                <EmptyState />
            )}
        </section>
    );
};
