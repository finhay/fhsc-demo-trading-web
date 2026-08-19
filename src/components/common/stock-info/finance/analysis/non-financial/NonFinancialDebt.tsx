'use client';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import { ANALYSIS_CONTENT_CARD, NON_FINANCIAL_DEBT } from '@/constants/stock-info';
import { useTranslate } from '@/hooks/useTranslate';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';

export const NonFinancialDebt = ({ dataAnnual }: { dataAnnual: any }) => {
    const trans = useTranslate();
    const fa = trans.stockInfo.finance_analysis as Record<string, string>;
    const latest = dataAnnual?.[0] ?? {};

    const ratioBars = NON_FINANCIAL_DEBT.ratioBars.map((bar) => {
        const value = Number(latest?.[bar.field]) || 0;
        return {
            ...bar,
            value,
            display: formatNumberVNWithUnit(value),
        };
    });

    const totalRatio = ratioBars.reduce((acc, b) => acc + b.value, 0) || 1;

    const stats = NON_FINANCIAL_DEBT.stats.map((s) => ({
        labelKey: s.labelKey,
        value: `${formatNumberVN(Number(latest?.[s.field]) || 0)}${s.suffix}`,
        textColor: s.textColor,
    }));

    const rates = NON_FINANCIAL_DEBT.rates.map((r) => ({
        labelKey: r.labelKey,
        value: `${formatNumberVN(Number(latest?.[r.field]) || 0)}${r.suffix}`,
    }));

    return (
        <AnalysisSection title={fa.nonfin_debt_question}>
            <div className={ANALYSIS_CONTENT_CARD}>
                {latest?.vonchusohuu_tong && latest?.nonganhan && latest?.nodaihan && (
                    <div className="flex w-full overflow-hidden rounded">
                        {ratioBars.map((bar) => (
                            <div
                                key={bar.labelKey}
                                className={`flex items-center justify-center py-0.5 ${bar.bgClass ?? ''}`}
                                style={{
                                    width: `${(bar.value / totalRatio) * 100}%`,
                                    ...(bar.bgStyle ?? {}),
                                }}
                            >
                                <span
                                    className="truncate px-2 font-tiny-highlight"
                                    style={bar.textStyle}
                                >
                                    {fa[bar.labelKey]}: {bar.display}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    {stats.map((s) => (
                        <div
                            key={s.labelKey}
                            className="flex items-center justify-between gap-2 font-body-3"
                        >
                            <span className="min-w-0 flex-1 text-secondary">{fa[s.labelKey]}</span>
                            <span className={`shrink-0 font-body-3-highlight ${s.textColor}`}>
                                {s.value}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="h-px w-full bg-tertiary" />
                <div className="flex gap-4">
                    {rates.map((r) => (
                        <div key={r.labelKey} className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="font-body-3 text-secondary">{fa[r.labelKey]}</span>
                            <span className="font-body-2-highlight text-primary">{r.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </AnalysisSection>
    );
};
