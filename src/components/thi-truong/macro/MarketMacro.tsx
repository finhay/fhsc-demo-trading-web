'use client';

import { useEffect, useRef, useState } from 'react';

import { FaChevronRight } from 'react-icons/fa';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { MarketMacroModal } from '@/components/thi-truong/macro/MarketMacroModal';
import { EMPTY_MACRO_VN_RAW, MACRO_INDICATOR_ROW_CONFIGS } from '@/constants/market';
import { fetchMacroExport, fetchMacroIndicator } from '@/services/api/datafeed/finance';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import type { MacroExportPoint, MacroPoint } from '@/types/datafeed/finance';
import type { MacroIndicatorState, MacroRow, MacroVnRawState } from '@/types/pages/market';
import { formatNumberVN, formatQuarterlyMonthHeader } from '@/utils/format';
import { buildMacroCellColorMap } from '@/utils/market/market-macro';
import { unwrap } from '@/utils/market/market-shared';

const MACRO_ROWS = {
    IIP: {
        label: 'Chỉ số IIP',
        subLabel: 'YoY',
    },
    PMI: {
        label: 'Chỉ số PMI',
        subLabel: '',
    },
    SERVICE_RETAIL: {
        label: 'Bán lẻ dịch vụ',
        subLabel: 'YoY',
    },
    GOODS_RETAIL: {
        label: 'Bán lẻ hàng hoá',
        subLabel: 'YoY',
    },
    CPI: {
        label: 'CPI',
        subLabel: 'YoY',
    },
    EXPORT_TOTAL: {
        label: 'XK cả nước',
        subLabel: '%YoY',
    },
    EXPORT_DOMESTIC: {
        label: 'XK nội địa',
        subLabel: '%YoY',
    },
    EXPORT_FDI: {
        label: 'XK FDI',
        subLabel: '%YoY',
    },
};

export const MarketMacro = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [raw, setRaw] = useState<MacroVnRawState>(EMPTY_MACRO_VN_RAW);
    const [data, setData] = useState<MacroIndicatorState>({ months: [], rows: [] });
    const { startLoading, stopLoading } = useLoadingStore();

    const fetchPromiseRef = useRef<Promise<void> | null>(null);

    const fetchData = async () => {
        const [iipRes, pmiRes, serviceRes, goodsRes, cpiRes, exportRes] = await Promise.allSettled([
            fetchMacroIndicator('IIP'),
            fetchMacroIndicator('PMI'),
            fetchMacroIndicator('SERVICE_RETAIL'),
            fetchMacroIndicator('GOODS_RETAIL'),
            fetchMacroIndicator('CPI'),
            fetchMacroExport(),
        ]);

        const iipData: MacroPoint[] = unwrap(iipRes) ?? [];
        const pmiData: MacroPoint[] = unwrap(pmiRes) ?? [];
        const serviceData: MacroPoint[] = unwrap(serviceRes) ?? [];
        const goodsData: MacroPoint[] = unwrap(goodsRes) ?? [];
        const cpiData: MacroPoint[] = unwrap(cpiRes) ?? [];
        const exportData: MacroExportPoint[] = unwrap(exportRes) ?? [];

        setRaw({
            iip: iipData,
            pmi: pmiData,
            serviceRetail: serviceData,
            goodsRetail: goodsData,
            cpi: cpiData,
            exportData,
        });

        const allMonthsSet = new Set<string>();
        [...iipData, ...pmiData, ...serviceData, ...goodsData, ...cpiData].forEach((item) =>
            allMonthsSet.add(item.month),
        );
        exportData.forEach((item) => allMonthsSet.add(item.month));

        const activeMonths = Array.from(allMonthsSet).sort((a, b) => b.localeCompare(a));

        const buildValueMap = (points: MacroPoint[]): Record<string, number | null> => {
            const map: Record<string, number | null> = {};
            activeMonths.forEach((month) => {
                const point = points.find((point) => point.month === month);
                map[month] = point ? point.value : null;
            });
            return map;
        };

        const buildExportValueMap = (
            field: keyof Pick<MacroExportPoint, 'total' | 'domestic' | 'fdi'>,
        ): Record<string, number | null> => {
            const map: Record<string, number | null> = {};
            activeMonths.forEach((month) => {
                const point = exportData.find((point) => point.month === month);
                map[month] = point ? point[field] : null;
            });
            return map;
        };

        const buildMacroRow = (
            config: (typeof MACRO_INDICATOR_ROW_CONFIGS)[number],
            values: Record<string, number | null>,
        ): MacroRow => ({
            key: config.key,
            isPercent: config.isPercent,
            values,
        });

        const rows: MacroRow[] = [
            buildMacroRow(MACRO_INDICATOR_ROW_CONFIGS[0], buildValueMap(iipData)),
            buildMacroRow(MACRO_INDICATOR_ROW_CONFIGS[1], buildValueMap(pmiData)),
            buildMacroRow(MACRO_INDICATOR_ROW_CONFIGS[2], buildValueMap(serviceData)),
            buildMacroRow(MACRO_INDICATOR_ROW_CONFIGS[3], buildValueMap(goodsData)),
            buildMacroRow(MACRO_INDICATOR_ROW_CONFIGS[4], buildValueMap(cpiData)),
            buildMacroRow(MACRO_INDICATOR_ROW_CONFIGS[5], buildExportValueMap('total')),
            buildMacroRow(MACRO_INDICATOR_ROW_CONFIGS[6], buildExportValueMap('domestic')),
            buildMacroRow(MACRO_INDICATOR_ROW_CONFIGS[7], buildExportValueMap('fdi')),
        ];

        setData({ months: activeMonths, rows });
    };

    useEffect(() => {
        fetchPromiseRef.current = fetchData();
    }, []);

    const handleOpenModal = async () => {
        startLoading();
        try {
            await fetchPromiseRef.current;
        } finally {
            setIsModalOpen(true);
            stopLoading();
        }
    };

    return (
        <section className="bg-secondary flex h-fit w-full min-h-0 flex-col gap-3 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="font-body-2-highlight text-primary flex items-center gap-2">
                    {'Vĩ mô'}
                </h2>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="text-primary shrink-0"
                    aria-label={'Vĩ mô'}
                >
                    <FaChevronRight size={14} />
                </button>
            </div>
            {data.rows.length === 0 ? (
                <div className="flex min-h-0 flex-1 items-center justify-center">
                    <EmptyState />
                </div>
            ) : (
                <div className="scrollbar overflow-x-auto">
                    <table className="w-full min-w-max border-separate border-spacing-0">
                        <thead>
                            <tr>
                                <th
                                    scope="col"
                                    className="bg-secondary sticky left-0 z-20 w-32 min-w-32 max-w-32 pb-2 text-left after:absolute after:inset-y-0 after:right-0 after:w-0.5 after:bg-secondary"
                                />
                                {data.months.map((month, index) => (
                                    <th
                                        key={month}
                                        scope="col"
                                        className={`font-caption whitespace-nowrap p-px text-right ${index === 0 ? 'text-primary' : 'text-secondary'}`}
                                    >
                                        <div className="flex h-[50px] min-w-20 items-center justify-end px-2">
                                            {formatQuarterlyMonthHeader(month)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((row) => {
                                const colorMap = buildMacroCellColorMap(
                                    row.values,
                                    row.key === 'CPI',
                                );
                                return (
                                    <tr key={row.key}>
                                        <th
                                            scope="row"
                                            className="bg-secondary sticky left-0 z-20 w-32 min-w-32 max-w-32 py-3 px-2 text-left font-normal after:absolute after:inset-y-0 after:right-0 after:w-0.5 after:bg-secondary"
                                        >
                                            <p className="font-caption-highlight text-primary">
                                                {MACRO_ROWS[row.key].label}
                                            </p>
                                            <p className="font-caption text-tertiary">
                                                {MACRO_ROWS[row.key].subLabel}
                                            </p>
                                        </th>
                                        {data.months.map((month) => {
                                            const value = row.values[month];
                                            return (
                                                <td
                                                    key={month}
                                                    className="whitespace-nowrap p-px text-right"
                                                >
                                                    <div
                                                        className="flex h-16 w-20 items-center justify-end px-2"
                                                        style={{
                                                            backgroundColor: colorMap[month],
                                                        }}
                                                    >
                                                        <span className="font-body-3 text-primary">
                                                            {value === null
                                                                ? '--'
                                                                : `${formatNumberVN(value, { trimTrailingZeros: true })}${row.isPercent ? '%' : ''}`}
                                                        </span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <MarketMacroModal onClose={() => setIsModalOpen(false)} raw={raw} />}
        </section>
    );
};
