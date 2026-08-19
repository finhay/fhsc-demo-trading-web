'use client';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import {
    ANALYSIS_CONTENT_CARD,
    FINANCE_ANALYSIS_LABELS,
    INSURANCE_HEALTH_ITEMS,
} from '@/constants/stock-info';
import { formatNumberVN } from '@/utils/format';

export const InsuranceHealth = ({ dataQuarterly }: { dataQuarterly: any }) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;
    const latestQuarterly = dataQuarterly?.[0] ?? {};

    const investmentItems = INSURANCE_HEALTH_ITEMS.map((item) => ({
        ...item,
        value: Number(latestQuarterly?.[item.key]) * 100 || 0,
    }));

    const stats = [
        {
            labelKey: 'technical_reserve',
            withYoY: true,
            value: formatNumberVN(Number(latestQuarterly?.tt_duphongnghiepvubaohiem_yoy ?? 0)),
        },
        {
            labelKey: 'technical_reserve_pct',
            withYoY: false,
            value: `${formatNumberVN(Number(latestQuarterly?.tile_duphongnghiepvubaohiem ?? 0) * 100)}%`,
        },
        {
            labelKey: 'de_ratio',
            withYoY: false,
            value: formatNumberVN(latestQuarterly?.nophaitra_vcsh),
        },
        {
            labelKey: 'debt_to_assets',
            withYoY: false,
            value: `${formatNumberVN(Number(latestQuarterly?.tongno_tongtaisan ?? 0) * 100)}%`,
        },
    ];

    return (
        <AnalysisSection
            title={'Tài chính có khoẻ không?'}
            right={
                <span className="shrink-0 rounded-full border border-tertiary px-2 py-1 font-body-3 text-primary">
                    {'YoY'}
                </span>
            }
        >
            <div className={ANALYSIS_CONTENT_CARD}>
                <div className="flex flex-col gap-3">
                    <p className="font-body-3 text-primary">{'Tỷ trọng đầu tư'}</p>
                    <div className="flex gap-3">
                        {investmentItems.map((item) => (
                            <div key={item.labelKey} className="flex min-w-0 flex-1 flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="font-body-3 text-secondary">
                                        {fa[item.labelKey]}
                                    </span>
                                    <span className={`font-body-2-highlight ${item.textColor}`}>
                                        {formatNumberVN(item.value)}%
                                    </span>
                                </div>
                                <div className="relative h-3 w-full rounded-full">
                                    <div
                                        className={`absolute inset-0 rounded-full ${item.bgColor} opacity-20`}
                                        aria-hidden
                                    />
                                    <div
                                        className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
                                        style={{ width: `${Math.min(item.value, 100)}%` }}
                                        aria-hidden
                                    >
                                        <div
                                            className={`absolute inset-0 min-w-full rounded-full ${item.bgColor}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-px w-full shrink-0 bg-tertiary" />
                <div className="flex shrink-0 gap-3">
                    {stats.map((s) => (
                        <div key={s.labelKey} className="flex min-w-0 flex-1 flex-col gap-1">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="truncate font-body-3 text-secondary">
                                    {fa[s.labelKey]}
                                </span>
                                {s.withYoY && (
                                    <span className="shrink-0 rounded-full border border-tertiary px-2 py-0.5 font-tiny-highlight text-primary">
                                        {'YoY'}
                                    </span>
                                )}
                            </div>
                            <span className="font-body-2-highlight text-primary">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </AnalysisSection>
    );
};
