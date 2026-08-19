import * as echarts from 'echarts';

import { MarketIndexChartRealtime } from '@/types/pages/chart';
import { formatStockTimeRange } from '@/utils/format';

const filterIntradaySeries = (
    times: number[],
    values: number[],
    volumes: number[],
    minX: number,
    maxX: number,
) => {
    const linePointIndex: [number, number][] = [];
    const lineVolume: [number, number][] = [];

    for (let timeIdx = 0; timeIdx < times.length; timeIdx++) {
        if (times[timeIdx] >= minX && times[timeIdx] <= maxX) {
            linePointIndex.push([times[timeIdx], values[timeIdx]]);
            lineVolume.push([times[timeIdx], volumes[timeIdx]]);
        }
    }

    return { linePointIndex, lineVolume };
};

export const createChartMarketIndex = (
    _indexId: string,
    realtimeData: MarketIndexChartRealtime | null | undefined,
): echarts.EChartsOption | null => {
    if (!realtimeData) return null;

    const times = realtimeData.times ?? [];
    const values = realtimeData.values ?? [];
    const volumes = realtimeData.volumes ?? [];
    const refNum = realtimeData.reference ? Number(realtimeData.reference) : 0;

    let rangeTime = formatStockTimeRange();
    let minX = rangeTime[0];
    let maxX = rangeTime[rangeTime.length - 1];
    let { linePointIndex, lineVolume } = filterIntradaySeries(times, values, volumes, minX, maxX);

    if (linePointIndex.length === 0 && times.length > 0) {
        rangeTime = formatStockTimeRange(times[0]);
        minX = rangeTime[0];
        maxX = rangeTime[rangeTime.length - 1];
        ({ linePointIndex, lineVolume } = filterIntradaySeries(times, values, volumes, minX, maxX));
    }

    const lineReference: [number, number][] = rangeTime.map((t) => [t, refNum]);
    const ys = linePointIndex.map((p) => p[1]).filter((v) => Number.isFinite(v));
    const dataSpan = ys.length ? Math.max(...ys, refNum) - Math.min(...ys, refNum) : 1;
    const eps = Math.max(dataSpan, 1) * 0.0015;

    return {
        animation: false,
        useUTC: true,
        grid: { top: 2, right: 0, bottom: 16, left: 0 },
        visualMap: {
            show: false,
            type: 'continuous',
            seriesIndex: 2,
            dimension: 1,
            min: refNum - eps,
            max: refNum + eps,
            inRange: { color: ['#ea1b2a', '#00ba3c'] },
            outOfRange: { color: ['#ea1b2a', '#00ba3c'] },
        },
        xAxis: {
            type: 'time',
            min: minX,
            max: maxX,
            interval: 3600 * 1000,
            axisLabel: {
                fontSize: 9,
                color: '#666666',
                formatter: '{HH}h',
                margin: 8,
                showMinLabel: true,
            },
            axisLine: { lineStyle: { color: '#999999', width: 1 } },
            axisTick: { show: true, length: 10, lineStyle: { color: '#999999' } },
            splitLine: { show: false },
        },
        yAxis: [
            {
                type: 'value',
                show: false,
                scale: true,
                splitLine: { show: false },
            },
            {
                type: 'value',
                show: false,
                min: 0,
                splitLine: { show: false },
            },
        ],
        tooltip: { show: false },
        series: [
            {
                type: 'bar',
                yAxisIndex: 1,
                data: lineVolume,
                color: '#669FEF',
                silent: true,
                barWidth: 1,
                z: 1,
            },
            {
                type: 'line',
                yAxisIndex: 0,
                data: lineReference,
                silent: true,
                symbol: 'none',
                showSymbol: false,
                lineStyle: { color: '#fbc900', width: 1.5, type: 'dashed' },
                z: 2,
            },
            {
                type: 'line',
                yAxisIndex: 0,
                data: linePointIndex,
                symbol: 'none',
                showSymbol: false,
                lineStyle: { width: 1 },
                z: 3,
            },
        ],
    };
};
