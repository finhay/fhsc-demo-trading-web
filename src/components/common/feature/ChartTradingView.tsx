'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Spinner } from '@/components/common/ui/Spinner';
import { buildChartUrl } from '@/utils/common';

type Props = {
    symbol?: string;
};

export const ChartTradingView = ({ symbol }: Props) => {
    const [status, setStatus] = useState<string>('loading');
    const [reloadKey, setReloadKey] = useState(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const initialUrlRef = useRef('');
    const activeUrlRef = useRef('');

    const chartUrl = useMemo(() => {
        if (!symbol) return '';
        return buildChartUrl(symbol.toUpperCase());
    }, [symbol]);

    if (chartUrl && !initialUrlRef.current) {
        initialUrlRef.current = chartUrl;
    }

    const clearLoadTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    useEffect(() => {
        if (!chartUrl) {
            initialUrlRef.current = '';
            activeUrlRef.current = '';
            return;
        }

        if (activeUrlRef.current && activeUrlRef.current !== chartUrl) {
            iframeRef.current?.contentWindow?.location.replace(chartUrl);
        }
        activeUrlRef.current = chartUrl;

        setStatus('loading');
        timeoutRef.current = setTimeout(() => setStatus('error'), 10000);

        return clearLoadTimeout;
    }, [chartUrl, reloadKey]);

    const handleLoad = () => {
        clearLoadTimeout();
        setStatus('loaded');
        const iframe = iframeRef.current;
        if (!iframe) return;
        iframe.style.height = 'calc(100% - 1px)';
        requestAnimationFrame(() => {
            iframe.style.height = '';
        });
    };

    const handleError = () => {
        clearLoadTimeout();
        setStatus('error');
    };

    const handleRetry = () => {
        initialUrlRef.current = chartUrl;
        activeUrlRef.current = chartUrl;
        setReloadKey((key) => key + 1);
    };

    return (
        <section className="relative flex h-full min-h-0 flex-col">
            {chartUrl && (
                <iframe
                    key={reloadKey}
                    ref={iframeRef}
                    title="chart"
                    className="w-full h-full border-0"
                    src={initialUrlRef.current}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}

            {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center base-secondary">
                    <Spinner isLoading isOverlay={false} />
                </div>
            )}

            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 base-secondary px-4 text-center">
                    <p className="text-secondary body-3">
                        {'Không thể tải biểu đồ. Vui lòng thử lại.'}
                    </p>
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="base-highlight px-6 py-2 rounded-full body-3"
                    >
                        {'Tải lại'}
                    </button>
                </div>
            )}
        </section>
    );
};
