'use client';

import { useRef, useState } from 'react';

import { createChartOmo } from '@/config/market/market-currency';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useEChartsOption } from '@/hooks/chart/useEChartsOption';
import type { OmoHistoryItem } from '@/types/datafeed/finance';
import type { OmoChartTab } from '@/types/pages/market';
import { formatNumberVN } from '@/utils/format';

type Props = {
    items: OmoHistoryItem[];
};

export const MarketOmo = ({ items }: Props) => {
    const [tab, setTab] = useState<OmoChartTab>('outstanding');
    const chartRef = useRef<HTMLDivElement>(null);
    const hasData = items.length > 0;
    const chartInstanceRef = useEChartsInstance(chartRef, { shouldInitialize: hasData });
    const last = items.at(-1);
    const tabs: { key: OmoChartTab; label: string }[] = [
        { key: 'outstanding', label: 'Tổng lưu hành' },
        { key: 'net', label: 'Bơm hút ròng' },
    ];

    useEChartsOption(chartInstanceRef, () => createChartOmo(items, tab), {
        enabled: hasData,
        deps: [items, tab],
    });

    return (
        <section className="base-secondary flex flex-col gap-3 rounded-xl p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
                <div className="flex flex-1 flex-col gap-3">
                    <p className="body-4 text-secondary">{'Hoạt động thị trường mở'}</p>
                    <div className="flex items-center gap-5">
                        {tabs.map(({ key, label }) => {
                            const isActive = tab === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setTab(key)}
                                    className={
                                        isActive
                                            ? 'body-3-highlight text-primary'
                                            : 'body-3-highlight text-secondary'
                                    }
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="border-tertiary flex items-center gap-5 rounded-2xl border px-4 py-3">
                    <div className="flex w-40 shrink-0 flex-col gap-2">
                        <p className="body-4 text-secondary">{'OMO lưu hành'}</p>
                        <p className="body-3-highlight text-primary">
                            {last
                                ? `${formatNumberVN(last.outstanding_volume, { trimTrailingZeros: true })} ${'tỷ'}`
                                : '--'}
                        </p>
                    </div>
                    <div className="base-tertiary self-stretch w-px" />
                    <div className="flex w-40 shrink-0 flex-col gap-2">
                        <p className="body-4 text-secondary">{'Lãi suất OMO'}</p>
                        <p className="body-3-highlight text-primary">
                            {last
                                ? `${formatNumberVN(last.rate, { trimTrailingZeros: true })}%`
                                : '--'}
                        </p>
                    </div>
                </div>
            </div>
            {hasData ? (
                <div key="chart" ref={chartRef} className="h-60 w-full" />
            ) : (
                <div
                    key="empty"
                    className="text-secondary body-5 flex h-60 items-center justify-center"
                >
                    --
                </div>
            )}
            <p className="body-5 text-tertiary text-right">{'Đơn vị: nghìn tỷ đồng'}</p>
        </section>
    );
};
