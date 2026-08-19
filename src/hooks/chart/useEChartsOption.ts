import { useEffect } from 'react';

import type * as echarts from 'echarts';

type Options = {
    enabled?: boolean;
    deps: React.DependencyList;
};

export const useEChartsOption = (
    chartInstanceRef: React.RefObject<echarts.ECharts | null>,
    getOption: () => echarts.EChartsOption,
    { enabled = true, deps }: Options,
) => {
    useEffect(() => {
        if (!enabled) return;

        const frameId = requestAnimationFrame(() => {
            const chart = chartInstanceRef.current;
            if (!chart) return;
            chart.setOption(getOption(), true);
            chart.resize();
        });

        return () => cancelAnimationFrame(frameId);
    }, [enabled, chartInstanceRef, ...deps]);
};
