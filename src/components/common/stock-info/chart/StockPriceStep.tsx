'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    INITIAL_STOCK_PRICE_DATA,
    LOT_TABS,
    LOT_TYPE,
    ORDER_MODE_KEY,
    PRICE_COLOR_MAP,
    TRADE_LITERAL,
} from '@/constants/trading';
import { toast } from '@/hooks/lib/useToast';
import { useMQTT } from '@/hooks/useMQTT';
import { StockPriceMessage } from '@/proto/stock';
import { fetchOddStockRealtime, fetchStockRealtime } from '@/services/api/datafeed/stock-info';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import { StockPrice } from '@/types/datafeed/stock-info';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVNWithUnit } from '@/utils/format';
import { buildActiveOrderPriceMarkers } from '@/utils/trading/order-book';
import { buildDepthRawRows, calculatePriceRows } from '@/utils/trading/shared';

export const StockPriceStep = () => {
    const { selectedStock } = useStockInfoStore();
    const {
        activeTradeSide,
        setBuyPrice,
        setBuyQuantity,
        setSellPrice,
        setSellQuantity,
        orders,
        activeOrderTab,
    } = useTradingStore();

    const [activeTab, setActiveTab] = useState<typeof LOT_TYPE.EVEN | typeof LOT_TYPE.ODD>(
        LOT_TYPE.EVEN,
    );
    const [stockPriceData, setStockPriceData] = useState<StockPrice>({
        symbol: selectedStock?.symbol ?? '',
        ...INITIAL_STOCK_PRICE_DATA,
    });
    const pendingTickRef = useRef<StockPriceMessage | null>(null);
    const rafTickRef = useRef<number | null>(null);

    const priceStepTabs = {
        EVEN_LOT: {
            key: 'even-lot',
            realtimeUrl: 'stock-price',
            method: fetchStockRealtime,
        },
        ODD_LOT: {
            key: 'odd-lot',
            realtimeUrl: 'odd-stock-price',
            method: fetchOddStockRealtime,
        },
    };

    const tabConfig = activeTab === LOT_TYPE.EVEN ? priceStepTabs.EVEN_LOT : priceStepTabs.ODD_LOT;
    const mqttTopic = `/${tabConfig.realtimeUrl}/${selectedStock?.symbol ?? ''}`;

    const priceRows = calculatePriceRows(stockPriceData);
    const rawRows = buildDepthRawRows(stockPriceData);

    const priceMarkers = useMemo(
        () =>
            buildActiveOrderPriceMarkers(
                activeOrderTab === ORDER_MODE_KEY.NORMAL ? orders : [],
                selectedStock?.symbol ?? '',
            ),
        [orders, activeOrderTab, selectedStock?.symbol],
    );

    const pressure = useMemo(() => {
        const bidVol = stockPriceData.buyVol1 + stockPriceData.buyVol2 + stockPriceData.buyVol3;
        const askVol = stockPriceData.sellVol1 + stockPriceData.sellVol2 + stockPriceData.sellVol3;
        const total = bidVol + askVol;
        if (total <= 0) {
            return { bidPct: 50, askPct: 50 };
        }
        const bidPct = Math.round((bidVol / total) * 100);
        return { bidPct, askPct: 100 - bidPct };
    }, [stockPriceData]);

    const flushRealtimeTick = useCallback(() => {
        rafTickRef.current = null;
        const stockUpdate = pendingTickRef.current;
        pendingTickRef.current = null;
        if (!stockUpdate) return;

        setStockPriceData((prev) => ({
            ...prev,
            symbol: stockUpdate.symbol,
            buyPrice1: stockUpdate.bid1 || 0,
            buyPrice2: stockUpdate.bid2 || 0,
            buyPrice3: stockUpdate.bid3 || 0,
            buyVol1: stockUpdate.bid1Vol || 0,
            buyVol2: stockUpdate.bid2Vol || 0,
            buyVol3: stockUpdate.bid3Vol || 0,
            sellPrice1: stockUpdate.offer1 || 0,
            sellPrice2: stockUpdate.offer2 || 0,
            sellPrice3: stockUpdate.offer3 || 0,
            sellVol1: stockUpdate.offer1Vol || 0,
            sellVol2: stockUpdate.offer2Vol || 0,
            sellVol3: stockUpdate.offer3Vol || 0,
            foreignBought: stockUpdate.foreignBought || 0,
            foreignSold: stockUpdate.foreignSold || 0,
            remainAsk: stockUpdate.remainAsk || 0,
            remainBid: stockUpdate.remainBid || 0,
            high: stockUpdate.high || 0,
            low: stockUpdate.low || 0,
            floor: stockUpdate.floor || 0,
            ceiling: stockUpdate.ceiling || 0,
            reference: stockUpdate.reference || 0,
            average: stockUpdate.medium || 0,
            totalVolume: stockUpdate.totalVol || 0,
            totalValue: stockUpdate.totalVal || 0,
        }));
    }, []);

    const scheduleRealtimeTickFlush = useCallback(() => {
        if (rafTickRef.current != null) return;
        rafTickRef.current = requestAnimationFrame(() => {
            flushRealtimeTick();
        });
    }, [flushRealtimeTick]);

    const handleFillPrice = useCallback(
        (price: number) => {
            if (price <= 0) return;
            if (activeTradeSide === TRADE_LITERAL.BUY) {
                setBuyPrice(price);
                return;
            }
            setSellPrice(price);
        },
        [activeTradeSide, setBuyPrice, setSellPrice],
    );

    const handleFillQuantity = useCallback(
        (quantity: number) => {
            if (quantity <= 0) return;
            if (activeTradeSide === TRADE_LITERAL.BUY) {
                setBuyQuantity(quantity);
                return;
            }
            setSellQuantity(quantity);
        },
        [activeTradeSide, setBuyQuantity, setSellQuantity],
    );

    const fetchStockRealtimeData = useCallback(
        async (tab: typeof LOT_TYPE.EVEN | typeof LOT_TYPE.ODD) => {
            const symbol = selectedStock?.symbol;
            if (!symbol) return;

            const fetchData = tab === LOT_TYPE.EVEN ? fetchStockRealtime : fetchOddStockRealtime;
            try {
                const { error_code, result, message } = await fetchData(symbol);
                if (isSuccessApi(error_code)) {
                    setStockPriceData(result);
                } else {
                    toast.error(message);
                }
            } catch (err) {
                toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
            }
        },
        [selectedStock?.symbol, 'Có lỗi xảy ra, vui lòng thử lại'],
    );

    const handleChangeTab = useCallback(
        (tab: typeof LOT_TYPE.EVEN | typeof LOT_TYPE.ODD) => {
            if (tab === activeTab) return;
            setActiveTab(tab);
            fetchStockRealtimeData(tab);
        },
        [activeTab, fetchStockRealtimeData],
    );

    useEffect(() => {
        fetchStockRealtimeData(activeTab);
    }, [selectedStock?.symbol]);

    useMQTT(
        mqttTopic,
        (_topic, message) => {
            const buffer = new Uint8Array(message);
            const stockUpdate = StockPriceMessage.decode(buffer);
            pendingTickRef.current = stockUpdate;
            scheduleRealtimeTickFlush();
        },
        !!selectedStock?.symbol,
    );

    useEffect(() => {
        return () => {
            if (rafTickRef.current != null) {
                cancelAnimationFrame(rafTickRef.current);
            }
        };
    }, []);

    return (
        <section className="flex w-full shrink-0 flex-col gap-3 rounded-xl bg-secondary p-3">
            <header className="flex h-7 w-full items-center gap-6">
                <h3 className="shrink-0 font-body-3-highlight text-primary whitespace-nowrap">
                    {'Bước giá'}
                </h3>
                <nav
                    className="flex h-full min-w-0 flex-1 items-center gap-3"
                    role="tablist"
                    aria-label={'Chọn loại lô'}
                >
                    {LOT_TABS.map(({ key: tabKey }) => (
                        <button
                            key={tabKey}
                            role="tab"
                            aria-selected={activeTab === tabKey}
                            aria-controls={`pricestep-${tabKey}-panel`}
                            onClick={() => handleChangeTab(tabKey)}
                            className={`flex h-full items-center justify-center rounded-full px-3 py-1 transition-colors ${
                                activeTab === tabKey
                                    ? 'bg-tertiary font-caption text-primary'
                                    : 'font-caption text-secondary'
                            }`}
                        >
                            {tabKey === LOT_TYPE.EVEN ? 'Lô chẵn' : 'Lô lẻ'}
                        </button>
                    ))}
                </nav>
            </header>

            <div
                id={`pricestep-${activeTab}-panel`}
                role="tabpanel"
                aria-labelledby={activeTab}
                className="flex w-full flex-col gap-1.5"
                aria-label={'Bảng giá mua bán'}
            >
                <div className="flex w-full items-start gap-0.5 whitespace-nowrap font-caption text-secondary">
                    <div className="flex flex-1 items-start justify-between pr-1">
                        <span>{'KL mua'}</span>
                        <span>{'Giá mua'}</span>
                    </div>
                    <div className="flex flex-1 items-start justify-between pl-1">
                        <span>{'Giá bán'}</span>
                        <span>{'KL bán'}</span>
                    </div>
                </div>

                {priceRows.map((row, i) => (
                    <div key={i} className="flex w-full items-start gap-0.5">
                        <div className="flex flex-1 items-center justify-between gap-1">
                            <button
                                type="button"
                                onClick={() => handleFillQuantity(rawRows[i].buyVol)}
                                aria-label={`${'Điền khối lượng mua'} ${rawRows[i].buyVol}`}
                                className="cursor-pointer whitespace-nowrap font-caption text-primary"
                            >
                                {row.bidQty}
                            </button>
                            <div
                                className="flex min-w-5 items-center justify-end gap-1 bg-green/10 pr-1"
                                style={{ width: `${row.bidDepthPct}%` }}
                            >
                                {priceMarkers.sellPrices.has(rawRows[i].buyPrice) && (
                                    <span className="size-1.5 shrink-0 rounded-full bg-red" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleFillPrice(rawRows[i].buyPrice)}
                                    aria-label={`${'Điền giá mua'} ${rawRows[i].buyPrice}`}
                                    className={`cursor-pointer whitespace-nowrap font-caption ${PRICE_COLOR_MAP[row.bidPriceVariant] ?? 'text-primary'}`}
                                >
                                    {row.bidPrice}
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-1">
                            <div
                                className="flex min-w-5 items-center gap-1 bg-red/10 pl-1"
                                style={{ width: `${row.askDepthPct}%` }}
                            >
                                <button
                                    type="button"
                                    onClick={() => handleFillPrice(rawRows[i].sellPrice)}
                                    aria-label={`${'Điền giá bán'} ${rawRows[i].sellPrice}`}
                                    className={`cursor-pointer whitespace-nowrap font-caption ${PRICE_COLOR_MAP[row.askPriceVariant] ?? 'text-primary'}`}
                                >
                                    {row.askPrice}
                                </button>
                                {priceMarkers.buyPrices.has(rawRows[i].sellPrice) && (
                                    <span className="size-1.5 shrink-0 rounded-full bg-red" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleFillQuantity(rawRows[i].sellVol)}
                                aria-label={`${'Điền khối lượng bán'} ${rawRows[i].sellVol}`}
                                className="cursor-pointer whitespace-nowrap text-right font-caption text-primary"
                            >
                                {row.askQty}
                            </button>
                        </div>
                    </div>
                ))}

                <div className="flex w-full gap-0.5">
                    <div
                        className="flex items-center bg-green px-2 py-0.5"
                        style={{ width: `${pressure.bidPct}%` }}
                    >
                        <span className="whitespace-nowrap font-caption text-quaternary">
                            {pressure.bidPct}%
                        </span>
                    </div>
                    <div
                        className="flex items-center bg-red px-2 py-0.5"
                        style={{ width: `${pressure.askPct}%` }}
                    >
                        <span className="whitespace-nowrap font-caption text-quaternary">
                            {pressure.askPct}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex w-full flex-col gap-1 whitespace-nowrap font-caption text-primary">
                <div className="flex items-start justify-between">
                    <span>
                        {'Tổng KL'}: {formatNumberVNWithUnit(stockPriceData.totalVolume ?? 0)}
                    </span>
                    <span>
                        {'Tổng GT'}: {formatNumberVNWithUnit(stockPriceData.totalValue ?? 0)}
                    </span>
                </div>
                <div className="flex items-start justify-between">
                    <span>
                        {'Room'}: {formatNumberVNWithUnit(selectedStock?.foreignRemain ?? 0)}
                    </span>
                    <span>
                        {'KL cp lưu hành'}:{' '}
                        {formatNumberVNWithUnit(selectedStock?.listedShare ?? 0)}
                    </span>
                </div>
            </div>
        </section>
    );
};
