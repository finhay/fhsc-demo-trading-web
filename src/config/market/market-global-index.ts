import type * as echarts from 'echarts';

export const createChartGlobalIndexSparkline = (
    values: number[],
    change: number,
): echarts.EChartsOption | null => {
    if (values.length === 0) return null;

    const lineColor = change > 0 ? '#3ac45c' : change < 0 ? '#eb4337' : '#e98e00';

    return {
        animation: false,
        grid: { top: 2, right: 0, bottom: 2, left: 0, containLabel: false },
        xAxis: { type: 'category', show: false, boundaryGap: false },
        yAxis: { type: 'value', show: false, scale: true },
        series: [
            {
                type: 'line',
                data: values,
                silent: true,
                symbol: 'none',
                showSymbol: false,
                lineStyle: { color: lineColor, width: 1.5 },
                itemStyle: { color: lineColor },
            },
        ],
    };
};
