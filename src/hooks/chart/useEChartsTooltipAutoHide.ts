import { useCallback, useEffect } from 'react';

import type * as echarts from 'echarts';

type Options = {
    enabled?: boolean;
};

export const useEChartsTooltipAutoHide = (
    chartRef: React.RefObject<HTMLDivElement | null>,
    chartInstanceRef: React.RefObject<echarts.ECharts | null>,
    options: Options = {},
) => {
    const { enabled = true } = options;

    const hideTooltip = useCallback(() => {
        const instance = chartInstanceRef.current;
        if (!instance || instance.isDisposed()) return;
        instance.dispatchAction({ type: 'hideTip' });
    }, [chartInstanceRef]);

    useEffect(() => {
        if (!enabled) return;

        const container = chartRef.current;

        container?.addEventListener('mouseleave', hideTooltip);
        window.addEventListener('scroll', hideTooltip, { capture: true, passive: true });
        window.addEventListener('wheel', hideTooltip, { passive: true });
        window.addEventListener('blur', hideTooltip);

        return () => {
            container?.removeEventListener('mouseleave', hideTooltip);
            window.removeEventListener('scroll', hideTooltip, { capture: true });
            window.removeEventListener('wheel', hideTooltip);
            window.removeEventListener('blur', hideTooltip);
            hideTooltip();
        };
    }, [chartRef, hideTooltip, enabled]);

    return hideTooltip;
};
