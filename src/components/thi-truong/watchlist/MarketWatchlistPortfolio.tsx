'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { PortfolioLeadPanel } from '@/components/common/portfolio-chart/PortfolioLeadPanel';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { useMQTT } from '@/hooks/useMQTT';
import { StockPriceMessage } from '@/proto/stock';
import { fetchStocksMetadataBySymbolsV4 } from '@/services/api/datafeed/stock-info';
import { fetchSubAccountStockPortfolio } from '@/services/api/trade/portfolio';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import type { StocksInfoItem } from '@/types/datafeed/stock-info';
import type { MarketPortfolioTheme } from '@/types/pages/market';
import { calcPortfolioHoldingQuantity } from '@/utils/assets';
import { buildStockPriceTopics, isSuccessApi } from '@/utils/common';
import {
    buildMarketPortfolioView,
    mergePortfolioStockMqttUpdate,
} from '@/utils/market/market-portfolio';

import { MarketWatchlistStockList } from './MarketWatchlistStockList';

export const MarketWatchlistPortfolio = () => {
    const { profile, activeSubAccount } = useAuthStore();
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [stocks, setStocks] = useState<StocksInfoItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSymbol, setActiveSymbol] = useState('');
    const pendingMqttRef = useRef<Map<string, StockPriceMessage>>(new Map());
    const rafMqttRef = useRef<number | null>(null);

    const stockSymbolsKey = useMemo(() => stocks.map((stock) => stock.symbol).join(','), [stocks]);
    const mqttTopics = useMemo(
        () => (stockSymbolsKey ? buildStockPriceTopics(stockSymbolsKey.split(',')) : []),
        [stockSymbolsKey],
    );

    const { rows, chartItems } = useMemo(
        () => buildMarketPortfolioView(stocks, quantities),
        [stocks, quantities],
    );

    const largestRow = useMemo(
        () =>
            rows.length > 0
                ? rows.reduce((max, row) => (row.marketValue > max.marketValue ? row : max))
                : null,
        [rows],
    );
    const activeRow = rows.find((row) => row.symbol === activeSymbol) ?? largestRow;
    const theme: MarketPortfolioTheme = activeRow && activeRow.change < 0 ? 'red' : 'green';

    const flushMqttBatch = useCallback(() => {
        rafMqttRef.current = null;
        const batch = new Map(pendingMqttRef.current);
        pendingMqttRef.current.clear();
        if (batch.size === 0) return;
        setStocks((prevStocks) =>
            prevStocks.map((stock) => {
                const update = batch.get(stock.symbol);
                return update ? mergePortfolioStockMqttUpdate(stock, update) : stock;
            }),
        );
    }, []);

    const scheduleMqttFlush = useCallback(() => {
        if (rafMqttRef.current != null) return;
        rafMqttRef.current = requestAnimationFrame(() => {
            flushMqttBatch();
        });
    }, [flushMqttBatch]);

    const handleMQTTMessage = useCallback(
        (_topic: string, message: Buffer) => {
            const update = StockPriceMessage.decode(new Uint8Array(message));
            if (!update.symbol) return;
            pendingMqttRef.current.set(update.symbol, update);
            scheduleMqttFlush();
        },
        [scheduleMqttFlush],
    );

    const resetData = () => {
        setQuantities({});
        setStocks([]);
        setActiveSymbol('');
    };

    const fetchData = async () => {
        if (!profile || !activeSubAccount) {
            resetData();
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const { data, error_code } = await fetchSubAccountStockPortfolio(
                activeSubAccount.sub_account_id,
            );
            if (!isSuccessApi(error_code)) {
                resetData();
                return;
            }
            const quantityMap: Record<string, number> = {};
            (data.portfolio || []).forEach((item) => {
                const quantity = calcPortfolioHoldingQuantity(item);
                if (quantity > 0) quantityMap[item.symbol] = quantity;
            });
            const symbols = Object.keys(quantityMap);
            if (symbols.length === 0) {
                resetData();
                return;
            }
            const { result, error_code: stocksErrorCode } =
                await fetchStocksMetadataBySymbolsV4(symbols);
            if (!isSuccessApi(stocksErrorCode)) {
                resetData();
                return;
            }
            setQuantities(quantityMap);
            setStocks(result);
        } catch {
            resetData();
        } finally {
            setIsLoading(false);
        }
    };

    useMQTT(mqttTopics, handleMQTTMessage, stocks.length > 0);

    useEffect(() => {
        return () => {
            if (rafMqttRef.current != null) {
                cancelAnimationFrame(rafMqttRef.current);
            }
        };
    }, []);

    useEffect(() => {
        fetchData();
    }, [profile, activeSubAccount?.sub_account_id]);

    if (isLoading) {
        return (
            <div className="flex min-h-0 flex-1">
                <Skeleton />
            </div>
        );
    }

    if (!activeRow || rows.length === 0) {
        return (
            <div className="flex min-h-0 flex-1 flex-col">
                <EmptyState />
            </div>
        );
    }

    return (
        <div
            aria-label={'Danh mục sở hữu của bạn:'}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
        >
            <div className="shrink-0">
                <PortfolioLeadPanel
                    items={chartItems}
                    activeSymbol={activeRow.symbol}
                    theme={theme}
                    onSelect={setActiveSymbol}
                    impactPercent={activeRow.impactPercent}
                    weightPercent={activeRow.weightPercent}
                    heading={
                        activeRow.symbol === rows[0]?.symbol
                            ? 'Dẫn dắt danh mục'
                            : 'Tác động danh mục'
                    }
                />
            </div>
            <MarketWatchlistStockList
                rows={rows}
                activeSymbol={activeRow.symbol}
                theme={theme}
                onSelect={setActiveSymbol}
            />
        </div>
    );
};
