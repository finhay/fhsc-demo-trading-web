import type * as echarts from 'echarts';

import type { useTranslate } from '@/hooks/useTranslate';
import type { MarketLiquidityItem } from '@/types/datafeed/trading-data';
import { formatNumberVN, formatTimeHm } from '@/utils/format';

const getNiceYMax = (value: number): number => {
    if (value <= 0) return 4;
    const exp = Math.floor(Math.log10(value));
    const base = 10 ** exp;
    const steps = [1, 2, 4, 8];
    for (const step of steps) {
        if (value <= step * base) return step * base;
    }
    return 10 * base;
};

export const createChartMarketLiquidityV2 = (
    todayData: MarketLiquidityItem[],
    avgData: MarketLiquidityItem[],
    trans: ReturnType<typeof useTranslate>,
): echarts.EChartsOption => {
    const today: [number, number][] = todayData.map((item, index) => [index, item.accumulated_val]);
    const avg: [number, number][] = avgData.map((item, index) => [index, item.accumulated_val]);

    const maxIndex = Math.max(todayData.length, avgData.length) - 1;
    const tickStep = Math.ceil(maxIndex / 4);

    const rawYMax = Math.max(...today.map(([, v]) => v), ...avg.map(([, v]) => v), 0);
    const yMax = getNiceYMax(rawYMax);
    const yInterval = yMax / 4;

    const nameOpen = trans.market.liquidity.value_open;
    const nameAvg5 = trans.market.liquidity.value_avg5;

    const getSeriesDotClass = (seriesName: string) =>
        seriesName === nameOpen ? 'bg-blue' : 'bg-orange';

    return {
        animationDuration: 450,
        animationDurationUpdate: 0,
        grid: { top: 5, right: 60, bottom: 30, left: 0, containLabel: false },
        xAxis: {
            type: 'value',
            min: 0,
            max: maxIndex > 0 ? maxIndex : undefined,
            interval: tickStep > 0 ? tickStep : undefined,
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: {
                color: '#999999',
                fontSize: 10,
                formatter: (value: number) => {
                    const index = Number(value);
                    return formatTimeHm(todayData[index]?.time ?? avgData[index]?.time);
                },
            },
            axisPointer: {
                show: true,
                type: 'line',
                lineStyle: { color: '#999999', type: 'dashed', width: 1 },
            },
        },
        yAxis: {
            type: 'value',
            position: 'right',
            offset: 40,
            min: 0,
            max: yMax,
            interval: yInterval,
            splitLine: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                align: 'right',
                color: '#999999',
                fontSize: 10,
                formatter: (value: number) => {
                    if (value === 0) return '0';
                    return `${formatNumberVN(value, { trimTrailingZeros: true })}T`;
                },
            },
        },
        tooltip: {
            trigger: 'axis',
            renderMode: 'html',
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            formatter: (params: any) => {
                const list = Array.isArray(params) ? params : [params];
                const index = Number(list[0]?.value?.[0] ?? list[0]?.axisValue ?? 0);
                const timeStr = formatTimeHm(todayData[index]?.time ?? avgData[index]?.time);

                const rows = list
                    .map(
                        (point: any) => `
                                <p class="flex items-center gap-2 font-caption text-secondary">
                                    <span class="shrink-0 rounded-full ${getSeriesDotClass(String(point.seriesName))} h-2 w-2" aria-hidden="true"></span>
                                    <span class="min-w-0 flex-1">
                                        <span>${point.seriesName}</span>:
                                        <span class="font-caption-highlight text-primary">${formatNumberVN(point.value?.[1] ?? 0, { trimTrailingZeros: true })} tỷ</span>
                                    </span>
                                </p>
                            `,
                    )
                    .join('');
                return `
                    <div class="flex flex-col gap-1 rounded-xl bg-tertiary p-2">
                        <span class="font-caption text-secondary">${timeStr}</span>
                        ${rows}
                    </div>
                `;
            },
        },
        series: [
            {
                type: 'line',
                name: nameAvg5,
                data: avg,
                smooth: true,
                symbol: 'circle',
                showSymbol: false,
                symbolSize: 8,
                lineStyle: { color: '#e98e00', width: 2 },
                itemStyle: { color: '#e98e00' },
                areaStyle: { color: '#E98E001A' },
                z: 1,
                markLine: {
                    silent: true,
                    symbol: 'none',
                    animation: false,
                    label: { show: false },
                    lineStyle: { color: '#999999', width: 1, type: 'solid' },
                    data: [{ yAxis: 0 }],
                },
            },
            {
                type: 'line',
                name: nameOpen,
                data: today,
                smooth: true,
                symbol: 'circle',
                showSymbol: false,
                symbolSize: 8,
                lineStyle: { color: '#2994ff', width: 2 },
                itemStyle: { color: '#2994ff' },
                areaStyle: { color: '#2994FF1A' },
                z: 2,
            },
        ],
    };
};
