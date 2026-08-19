import { useCallback, useEffect, useRef } from 'react';

import * as echarts from 'echarts';

const CHART_FONT_FAMILY =
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

if (typeof window !== 'undefined') {
    echarts.registerTheme('vnsc-default', { textStyle: { fontFamily: CHART_FONT_FAMILY } });
}

type Options = {
    resizeOnWindow?: boolean;
};

export const useEChartsInstances = (options: Options = {}) => {
    const { resizeOnWindow = true } = options;
    const chartsMapRef = useRef<Map<string, echarts.ECharts>>(new Map());

    const disposeAll = useCallback(() => {
        chartsMapRef.current.forEach((c) => c.dispose());
        chartsMapRef.current.clear();
    }, []);

    useEffect(() => {
        if (!resizeOnWindow) return;

        const handleResize = () => {
            chartsMapRef.current.forEach((c) => c.resize());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [resizeOnWindow]);

    useEffect(
        () => () => {
            disposeAll();
        },
        [disposeAll],
    );

    return { chartsMapRef, disposeAll };
};
