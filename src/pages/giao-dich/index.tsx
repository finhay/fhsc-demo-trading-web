'use client';

import { useCallback, useEffect } from 'react';

import { useRouter } from 'next/router';

import { StockSection } from '@/components/common/stock-info/StockSection';
import { StockChartPanel } from '@/components/common/stock-info/chart/StockChartPanel';
import { Dialog } from '@/components/common/ui/Dialog';
import { TradeOrderBook } from '@/components/giao-dich/order-book/TradeOrderBook';
import { TradeOrderHistory } from '@/components/giao-dich/order-history/TradeOrderHistory';
import { TradePanel } from '@/components/giao-dich/panel/TradePanel';
import { TradeVerifyOtpPanel } from '@/components/giao-dich/verification/TradeVerifyOtpPanel';
import { TradeVerifyQrCard } from '@/components/giao-dich/verification/TradeVerifyQrCard';
import { TradeWatchlist } from '@/components/giao-dich/watchlist/TradeWatchlist';
import { ACCOUNT_TYPE } from '@/constants/common';
import { TRADE_PAGE_ARIA, TRADE_PAGE_META, TWO_FA_PLACEMENT } from '@/constants/trading';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import { useWatchlistStore } from '@/stores/common/useWatchlistStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';

export default function GiaoDich() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const isAuthenticated = !!profile;
    const { stopLoading } = useLoadingStore();
    const { selectedStock, fetchStockInfo, setSelectedStock } = useStockInfoStore();
    const {
        is2FAVisible,
        twoFAPlacement,
        close2FA,
        init2FA,
        resetStore,
        isChartFullscreen,
        onAfter2FASuccess,
    } = useTradingStore();
    const { setCurrentWatchList } = useWatchlistStore();

    const handle2FASuccess = () => {
        close2FA();
        onAfter2FASuccess?.();
    };

    const fetchData = useCallback(
        async (symbol: string) => {
            try {
                await fetchStockInfo(symbol);
            } finally {
                stopLoading();
            }
        },
        [fetchStockInfo, stopLoading],
    );

    useEffect(() => {
        if (isAuthenticated) {
            init2FA();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!router.isReady) return;
        const querySymbol =
            typeof router.query.symbol === 'string' ? router.query.symbol.toUpperCase() : '';
        const currentSymbol = useStockInfoStore.getState().selectedStock?.symbol ?? '';
        const targetSymbol = querySymbol || currentSymbol || TRADE_PAGE_META.DEFAULT_SYMBOL;

        if (targetSymbol === currentSymbol) {
            stopLoading();
            return;
        }

        fetchData(targetSymbol);
    }, [router.isReady, router.query.symbol]);

    useEffect(() => {
        if (!router.isReady) return;
        const symbol = selectedStock?.symbol;
        if (!symbol) return;
        const querySymbol = typeof router.query.symbol === 'string' ? router.query.symbol : '';
        if (symbol === querySymbol) return;
        router.replace({ pathname: '/giao-dich', query: { symbol } }, undefined, {
            shallow: true,
        });
    }, [selectedStock?.symbol, router.isReady]);

    useEffect(() => {
        setCurrentWatchList(null);
        return () => {
            resetStore();
            setSelectedStock(null);
            setCurrentWatchList(null);
        };
    }, [resetStore, setSelectedStock, setCurrentWatchList]);

    return (
        <DefaultLayout title={TRADE_PAGE_META.TITLE} metaDescription={TRADE_PAGE_META.DESCRIPTION}>
            <main
                className={`flex flex-col w-full h-full overflow-hidden min-w-0 ${
                    isChartFullscreen ? 'gap-0' : 'gap-1'
                }`}
            >
                <div className="flex flex-1 gap-1 overflow-hidden min-h-0">
                    <aside
                        className={`w-80 shrink-0 flex-col gap-1 h-full overflow-hidden ${
                            isChartFullscreen ? 'hidden' : 'hidden 2xl:flex'
                        }`}
                        aria-label={TRADE_PAGE_ARIA.ACCOUNT_PORTFOLIO}
                    >
                        <TradeWatchlist />
                    </aside>
                    <StockSection
                        className="flex flex-1 flex-col overflow-hidden bg-secondary rounded-xl min-w-0"
                        hideChartPanel
                    />
                    {!isChartFullscreen && (
                        <aside
                            className="flex h-full shrink-0 overflow-hidden"
                            aria-label={TRADE_PAGE_ARIA.PRICE_TRANSACTION}
                        >
                            <StockChartPanel />
                        </aside>
                    )}
                    {isAuthenticated && (
                        <aside
                            className={`flex h-full min-h-0 w-80 shrink-0 flex-col ${
                                isChartFullscreen ? 'hidden' : ''
                            }`}
                            aria-label={TRADE_PAGE_ARIA.ACCOUNT_TRADE}
                        >
                            <TradePanel />
                        </aside>
                    )}
                </div>
                {isAuthenticated && (
                    <div
                        className={`flex h-64 min-h-0 gap-1 overflow-hidden ${
                            isChartFullscreen ? 'hidden' : ''
                        }`}
                    >
                        <div className="min-w-0 flex-1 overflow-hidden">
                            <TradeOrderBook />
                        </div>
                        <div className="h-full w-[calc(40rem+0.25rem)] shrink-0 overflow-hidden">
                            <TradeOrderHistory />
                        </div>
                    </div>
                )}
            </main>
            {is2FAVisible &&
                twoFAPlacement === TWO_FA_PLACEMENT.GLOBAL &&
                (profile?.user_type === ACCOUNT_TYPE.ENTERPRISE ? (
                    <Dialog onClose={close2FA}>
                        <TradeVerifyOtpPanel onClose={close2FA} onSuccess={handle2FASuccess} />
                    </Dialog>
                ) : (
                    <TradeVerifyQrCard onClose={close2FA} onSuccess={handle2FASuccess} />
                ))}
        </DefaultLayout>
    );
}
