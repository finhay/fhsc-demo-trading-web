'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { PortfolioLeadPanel } from '@/components/common/portfolio-chart/PortfolioLeadPanel';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { useMQTT } from '@/hooks/useMQTT';
import { useTranslate } from '@/hooks/useTranslate';
import { StockPriceMessage } from '@/proto/stock';
import { fetchStocksMetadataBySymbolsV4 } from '@/services/api/datafeed/stock-info';
import { useAssetStore } from '@/stores/assets/useAssetStore';
import type { StocksInfoItem } from '@/types/datafeed/stock-info';
import type { MarketPortfolioTheme } from '@/types/pages/market';
import { calcPortfolioHoldingQuantity, calcPortfolioTotals } from '@/utils/assets';
import { buildStockPriceTopics, isSuccessApi } from '@/utils/common';
import { formatNumberVN, formatPercentVN } from '@/utils/format';
import {
    buildMarketPortfolioView,
    mergePortfolioStockMqttUpdate,
} from '@/utils/market/market-portfolio';

export const AssetStocks = () => {
    const trans = useTranslate();
    const [stocks, setStocks] = useState<StocksInfoItem[]>([]);
    const [isMetadataLoading, setIsMetadataLoading] = useState(true);
    const [activeSymbol, setActiveSymbol] = useState('');
    const { portfolio, isPortfolioLoading } = useAssetStore();
    const pendingMqttRef = useRef<Map<string, StockPriceMessage>>(new Map());
    const rafMqttRef = useRef<number | null>(null);

    const quantities = useMemo(() => {
        const quantityMap: Record<string, number> = {};
        portfolio.forEach((item) => {
            const quantity = calcPortfolioHoldingQuantity(item);
            if (quantity > 0) quantityMap[item.symbol] = quantity;
        });
        return quantityMap;
    }, [portfolio]);

    const portfolioSymbolsKey = useMemo(() => Object.keys(quantities).join(','), [quantities]);

    const stockSymbolsKey = useMemo(() => stocks.map((stock) => stock.symbol).join(','), [stocks]);
    const mqttTopics = useMemo(
        () => (stockSymbolsKey ? buildStockPriceTopics(stockSymbolsKey.split(',')) : []),
        [stockSymbolsKey],
    );

    const { rows, chartItems, portfolioChangePercent } = useMemo(
        () => buildMarketPortfolioView(stocks, quantities),
        [stocks, quantities],
    );

    const totalMarketValue = useMemo(
        () => rows.reduce((sum, row) => sum + row.marketValue, 0),
        [rows],
    );

    const { totalPnl, totalPnlRate } = useMemo(() => calcPortfolioTotals(portfolio), [portfolio]);

    const largestRow = useMemo(
        () =>
            rows.length > 0
                ? rows.reduce((max, row) => (row.marketValue > max.marketValue ? row : max))
                : null,
        [rows],
    );
    const activeRow = rows.find((row) => row.symbol === activeSymbol) ?? largestRow;
    const theme: MarketPortfolioTheme = activeRow && activeRow.change < 0 ? 'red' : 'green';
    const isPortfolioUp = portfolioChangePercent >= 0;
    const isPnlUp = totalPnl >= 0;
    const isLoading = isPortfolioLoading || isMetadataLoading;
    const isEmpty = !isLoading && (rows.length === 0 || !activeRow);

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

    const fetchStocksMetadata = async (symbols: string[]) => {
        if (symbols.length === 0) {
            setStocks([]);
            setActiveSymbol('');
            setIsMetadataLoading(false);
            return;
        }
        setIsMetadataLoading(true);
        try {
            const { result, error_code } = await fetchStocksMetadataBySymbolsV4(symbols);
            if (isSuccessApi(error_code)) {
                setStocks(result);
            }
        } catch {
            setStocks([]);
        } finally {
            setIsMetadataLoading(false);
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
        if (isPortfolioLoading) return;
        fetchStocksMetadata(portfolioSymbolsKey ? portfolioSymbolsKey.split(',') : []);
    }, [isPortfolioLoading, portfolioSymbolsKey]);

    return (
        <section className="flex h-full flex-col gap-3 overflow-hidden rounded-xl bg-secondary p-3">
            <h2 className="shrink-0 font-body-2-highlight text-primary">
                {trans.assets.stock_summary.total_value}
            </h2>
            {isLoading ? (
                <div className="h-80 w-full">
                    <Skeleton />
                </div>
            ) : isEmpty ? (
                <div className="flex h-80 w-full items-center justify-center">
                    <EmptyState />
                </div>
            ) : (
                <>
                    <div className="flex shrink-0 flex-col gap-1">
                        <p className="font-heading-4 text-primary">
                            {formatNumberVN(totalMarketValue, {
                                trimTrailingZeros: true,
                            })}
                            đ
                        </p>
                        <div className="flex items-start gap-3 whitespace-nowrap font-body-3">
                            <span className="text-secondary">
                                {isPnlUp
                                    ? trans.assets.stock_summary.profit
                                    : trans.assets.stock_summary.loss}
                            </span>
                            <span className={isPnlUp ? 'text-green' : 'text-red'}>
                                {isPnlUp ? '+' : '-'}{' '}
                                {formatNumberVN(Math.abs(totalPnl), {
                                    trimTrailingZeros: true,
                                })}{' '}
                                đ ({isPnlUp ? '+' : '-'}
                                {formatPercentVN(Math.abs(totalPnlRate))})
                            </span>
                        </div>
                    </div>
                    <div className="h-px w-full shrink-0 bg-tertiary" />
                    <h3 className="shrink-0 font-body-3 text-primary">
                        {trans.assets.stock_summary.did_you_know}
                    </h3>
                    <div className="flex shrink-0 flex-wrap items-start gap-3">
                        <span className="font-body-3 text-secondary">
                            {isPortfolioUp
                                ? trans.assets.stock_summary.session_up
                                : trans.assets.stock_summary.session_down}
                        </span>
                        <span
                            className={`inline-flex items-center gap-0.5 font-body-3-highlight ${
                                isPortfolioUp ? 'text-green' : 'text-red'
                            }`}
                        >
                            {isPortfolioUp ? (
                                <FaArrowUp size={14} aria-hidden />
                            ) : (
                                <FaArrowDown size={14} aria-hidden />
                            )}
                            {formatPercentVN(Math.abs(portfolioChangePercent))}
                        </span>
                    </div>
                    <PortfolioLeadPanel
                        items={chartItems}
                        activeSymbol={activeRow!.symbol}
                        theme={theme}
                        onSelect={setActiveSymbol}
                        impactPercent={activeRow!.impactPercent}
                        weightPercent={activeRow!.weightPercent}
                        heading={
                            activeRow!.symbol === rows[0]?.symbol
                                ? trans.assets.stock_summary.lead_heading
                                : trans.market.portfolio.impact_heading
                        }
                    />
                </>
            )}
        </section>
    );
};
