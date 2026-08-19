import { useEffect, useRef } from 'react';

import * as echarts from 'echarts';

const CHART_FONT_FAMILY =
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const customTheme = {
    textStyle: {
        fontFamily: CHART_FONT_FAMILY,
    },
};

if (typeof window !== 'undefined') {
    echarts.registerTheme('vnsc-default', customTheme);
}

type Options = {
    theme?: string | object;
    opts?: {
        renderer?: 'canvas' | 'svg';
        devicePixelRatio?: number;
        width?: number;
        height?: number;
        locale?: string;
    };
    shouldInitialize?: boolean;
};

export const useEChartsInstance = (
    chartRef: React.RefObject<HTMLDivElement | null>,
    options: Options = {},
) => {
    const chartInstanceRef = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        const shouldInit = options.shouldInitialize ?? true;
        const instance = chartInstanceRef.current;

        if (instance && (!shouldInit || instance.getDom() !== chartRef.current)) {
            instance.dispose();
            chartInstanceRef.current = null;
        }

        if (!chartRef.current || !shouldInit) return;

        if (!chartInstanceRef.current) {
            const theme = options.theme ?? 'vnsc-default';
            chartInstanceRef.current = echarts.init(chartRef.current, theme, options.opts);
        }

        const handleResize = () => {
            chartInstanceRef.current?.resize();
        };

        window.addEventListener('resize', handleResize);

        const el = chartRef.current;
        const ro =
            typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => handleResize()) : null;
        ro?.observe(el);

        return () => {
            window.removeEventListener('resize', handleResize);
            ro?.disconnect();
        };
    }, [chartRef, options.theme, options.opts?.renderer, options.shouldInitialize]);

    useEffect(
        () => () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.dispose();
                chartInstanceRef.current = null;
            }
        },
        [],
    );

    return chartInstanceRef;
};
