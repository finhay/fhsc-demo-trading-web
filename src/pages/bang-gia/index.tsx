'use client';

import { useState } from 'react';

import { IBoardChartIndex } from '@/components/bang-gia/navigation/IBoardChartIndex';
import { IBoardNavigation } from '@/components/bang-gia/navigation/IBoardNavigation';
import { IBoardTable } from '@/components/bang-gia/table/IBoardTable';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { buildMarketPageTitle } from '@/utils/common';

export default function BangGia() {
    const { exchange, data } = useMarketIndexStore();
    const [isIndexSliderVisible, setIsIndexSliderVisible] = useState(true);

    const pageTitle = buildMarketPageTitle({
        exchange,
        marketIndexes: data ?? [],
        pageSuffix: 'Bảng giá',
        fallbackTitle: 'Bảng giá',
    });

    return (
        <DefaultLayout title={pageTitle} metaDescription={pageTitle}>
            <article className="bg-primary flex h-full min-h-0 w-full flex-col gap-2 overflow-hidden">
                <section
                    className={`shrink-0 grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${
                        isIndexSliderVisible
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0 -mt-2'
                    }`}
                >
                    <div
                        className={`min-h-0 overflow-hidden transition-transform duration-300 ease-in-out ${
                            isIndexSliderVisible ? 'translate-y-0' : '-translate-y-full'
                        }`}
                    >
                        <IBoardChartIndex />
                    </div>
                </section>
                <section className="shrink-0">
                    <IBoardNavigation
                        isIndexSliderVisible={isIndexSliderVisible}
                        toggleIndexSlider={() => setIsIndexSliderVisible((v) => !v)}
                    />
                </section>
                <section className="min-h-0 flex-1 overflow-hidden">
                    <IBoardTable />
                </section>
            </article>
        </DefaultLayout>
    );
}
