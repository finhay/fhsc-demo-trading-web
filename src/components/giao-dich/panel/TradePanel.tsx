'use client';

import { useForm } from '@tanstack/react-form';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SubAccounts } from '@/components/common/assets/SubAccounts';
import { TradePanelInfoBar } from '@/components/giao-dich/panel/controls/TradePanelInfoBar';
import { TradePanelSideTabs } from '@/components/giao-dich/panel/controls/TradePanelSideTabs';
import { TradePanelForm, TradePanelSubmit } from '@/components/giao-dich/panel/form/TradePanelForm';
import { TradePanelOverlays } from '@/components/giao-dich/panel/overlays/TradePanelOverlays';
import { PAPER_ORDER_TYPE } from '@/constants/paper-trading';
import { ORDER_SIDE, TRADE_LITERAL, TRADE_UI_CONFIG } from '@/constants/trading';
import {
    fetchPaperAccountBuyingPower,
    fetchPaperAccountPortfolio,
} from '@/services/api/paper-trading/account';
import { fetchPaperMarketSessions } from '@/services/api/paper-trading/market';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import { usePaperAccountStore } from '@/stores/paper-trading/usePaperAccountStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { PendingOrder } from '@/types/pages/trading';
import { isSuccessApi } from '@/utils/common';
import { formatBoardPrice, formatNumberVN } from '@/utils/format';
import { normalizePaperStatus } from '@/utils/paper-trading/order-book';
import {
    calcQtyFromPercentage,
    getStepSize,
    makeBuyQtyValidator,
    makePriceValidator,
    makeSellQtyValidator,
    makeTradePanelQtyValidator,
    parsePrice,
    parseQuantity,
    stepDecreaseVolume,
    stepIncreaseVolume,
} from '@/utils/trading/panel';

type TradePanelProps = {
    initialSide?: string;
    initialPrice?: number;
};

export const TradePanel = ({ initialSide, initialPrice }: TradePanelProps = {}) => {
    const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastAvailTradeArgsRef = useRef<string>('');
    const skipNextDefaultQtyRef = useRef({ buy: false, sell: false });
    const injectedSideRef = useRef<string | null>(
        initialPrice && initialPrice > 0 ? (initialSide ?? TRADE_LITERAL.BUY) : null,
    );

    const [activeSide, setActiveSide] = useState<string>(initialSide ?? TRADE_LITERAL.BUY);
    const [availableCash, setAvailableCash] = useState(0);
    const [maxQtty, setMaxQtty] = useState(0);
    const [maxSell, setMaxSell] = useState(0);
    const [buyPercentage, setBuyPercentage] = useState(0);
    const [sellPercentage, setSellPercentage] = useState(0);
    // Mặc định coi phiên đang mở: nếu API sessions lỗi hoặc trả shape lạ thì không chặn đặt lệnh.
    const [isSessionOpen, setIsSessionOpen] = useState(true);
    const [realtimePrices, setRealtimePrices] = useState({
        buyPrice1: 0,
        sellPrice1: 0,
    });
    const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
    const { selectedStock } = useStockInfoStore();
    const { accountId, asset, fetchAsset } = usePaperAccountStore();

    const {
        buyPrice: storeBuyPrice,
        buyQuantity: storeBuyQuantity,
        sellPrice: storeSellPrice,
        sellQuantity: storeSellQuantity,
        setBuyPrice: setStoreBuyPrice,
        setBuyQuantity: setStoreBuyQuantity,
        setSellPrice: setStoreSellPrice,
        setSellQuantity: setStoreSellQuantity,
        setActiveTradeSide,
    } = useTradingStore();

    const form = useForm({
        defaultValues: {
            buyPrice: '',
            buyQuantity: '',
            sellPrice: '',
            sellQuantity: '',
        },
    });

    const priceValidator = useMemo(
        () =>
            makePriceValidator(
                selectedStock?.floor ?? 0,
                selectedStock?.ceiling ?? 0,
                true,
                selectedStock?.exchange ?? '',
                selectedStock?.stockType ?? '',
                selectedStock?.symbol ?? '',
            ),
        [
            selectedStock?.floor,
            selectedStock?.ceiling,
            selectedStock?.exchange,
            selectedStock?.stockType,
            selectedStock?.symbol,
        ],
    );

    // Simulator chỉ nhận lô chẵn nên luôn bật kiểm tra bội số 100.
    const validateBuyQty = makeTradePanelQtyValidator(
        makeBuyQtyValidator(maxQtty),
        true,
        'KL phải là bội số của 100',
    );

    const validateSellQty = makeTradePanelQtyValidator(
        makeSellQtyValidator(maxSell),
        true,
        'KL phải là bội số của 100',
    );

    const infoItems = useMemo(() => {
        if (activeSide === TRADE_LITERAL.BUY) {
            return [
                {
                    label: 'Sức mua tối đa',
                    value:
                        availableCash > 0
                            ? `${formatNumberVN(availableCash, { trimTrailingZeros: true })}${'đ'}`
                            : '--',
                },
                {
                    label: 'KL mua tối đa',
                    value: maxQtty > 0 ? `${formatNumberVN(maxQtty, { decimals: 0 })}cp` : '--',
                },
            ];
        }

        return [
            {
                label: 'KL bán tối đa',
                value: maxSell > 0 ? `${formatNumberVN(maxSell, { decimals: 0 })}cp` : '--',
            },
        ];
    }, [activeSide, availableCash, maxQtty, maxSell]);

    const isPanelPlaceOrderVisible = !!pendingOrder && !!selectedStock?.symbol;

    const getPriceStep = useCallback(
        (priceInDong: number) =>
            getStepSize(
                priceInDong,
                selectedStock?.exchange ?? '',
                selectedStock?.stockType ?? '',
                selectedStock?.symbol ?? '',
            ),
        [selectedStock],
    );

    /**
     * API paper chỉ có sức mua chiều MUA. Chiều BÁN suy từ `available_quantity` của mã
     * trong danh mục; số dư tiền lấy thẳng từ endpoint asset.
     */
    const fetchTradeCapacity = useCallback(
        async (paperAccountId: string, symbol: string, price: number, side: string) => {
            lastAvailTradeArgsRef.current = `${paperAccountId}|${symbol}|${side}|${price}`;
            try {
                fetchAsset();

                if (side === TRADE_LITERAL.BUY) {
                    const { error_code, data } = await fetchPaperAccountBuyingPower(
                        paperAccountId,
                        symbol,
                        price,
                    );
                    if (isSuccessApi(error_code)) setMaxQtty(data.max_buyable_quantity ?? 0);
                    return;
                }

                const { error_code, data } = await fetchPaperAccountPortfolio(paperAccountId);
                if (isSuccessApi(error_code)) {
                    const holding = (data ?? []).find((item) => item.symbol === symbol);
                    setMaxSell(holding?.available_quantity ?? 0);
                }
            } catch {
                setMaxQtty(0);
                setMaxSell(0);
            }
        },
        [fetchAsset],
    );

    const realtimePriceForSide = useCallback(
        (side: string) =>
            side === TRADE_LITERAL.BUY
                ? selectedStock?.sellPrice1 || 0
                : selectedStock?.buyPrice1 || 0,
        [selectedStock?.sellPrice1, selectedStock?.buyPrice1],
    );

    const requestAvailableTrade = useCallback(
        (side: string, price: number, options?: { immediate?: boolean }) => {
            const symbol = selectedStock?.symbol;
            if (!accountId || !symbol) return;

            const fire = () => {
                const key = `${accountId}|${symbol}|${side}|${price}`;
                if (key === lastAvailTradeArgsRef.current) return;
                fetchTradeCapacity(accountId, symbol, price, side);
            };

            if (priceDebounceRef.current) {
                clearTimeout(priceDebounceRef.current);
                priceDebounceRef.current = null;
            }

            if (options?.immediate) {
                fire();
                return;
            }
            priceDebounceRef.current = setTimeout(fire, 500);
        },
        [accountId, selectedStock?.symbol, fetchTradeCapacity],
    );

    const bumpFormPrice = useCallback(
        (which: string, direction: string) => {
            const field = which === TRADE_LITERAL.BUY ? 'buyPrice' : 'sellPrice';
            const setStore = which === TRADE_LITERAL.BUY ? setStoreBuyPrice : setStoreSellPrice;
            const cur = parsePrice(form.getFieldValue(field));
            let next = 0;
            if (direction === TRADE_LITERAL.INCREASE) {
                const basePrice = cur || TRADE_UI_CONFIG.DEFAULT_PRICE_DONG;
                const step = getPriceStep(basePrice);
                next = basePrice + step;
                form.setFieldValue(field, formatBoardPrice(next));
                setStore(next);
            } else {
                if (!cur) return;
                const step = getPriceStep(cur - 1);
                next = Math.max(0, cur - step);
                form.setFieldValue(field, next > 0 ? formatBoardPrice(next) : '');
                setStore(next);
            }
            requestAvailableTrade(which, next, { immediate: false });
        },
        [form, getPriceStep, setStoreBuyPrice, setStoreSellPrice, requestAvailableTrade],
    );

    const setQtyForSide = useCallback(
        (which: string, qty: number) => {
            const field = which === TRADE_LITERAL.BUY ? 'buyQuantity' : 'sellQuantity';
            const max = which === TRADE_LITERAL.BUY ? maxQtty : maxSell;
            const setStore =
                which === TRADE_LITERAL.BUY ? setStoreBuyQuantity : setStoreSellQuantity;
            const setPct = which === TRADE_LITERAL.BUY ? setBuyPercentage : setSellPercentage;
            const clamped = Math.max(0, qty);
            form.setFieldValue(field, clamped > 0 ? formatNumberVN(clamped, { decimals: 0 }) : '');
            setStore(clamped);
            setPct(max > 0 ? Math.min(100, Math.round((clamped / max) * 100)) : 0);
            form.validateField(field, 'change');
        },
        [form, maxQtty, maxSell, setStoreBuyQuantity, setStoreSellQuantity],
    );

    const bumpQty = useCallback(
        (which: string, direction: string) => {
            const field = which === TRADE_LITERAL.BUY ? 'buyQuantity' : 'sellQuantity';
            const cur = parseQuantity(form.getFieldValue(field));
            const delta =
                direction === TRADE_LITERAL.INCREASE
                    ? stepIncreaseVolume(cur)
                    : stepDecreaseVolume(cur);
            setQtyForSide(which, direction === TRADE_LITERAL.INCREASE ? cur + delta : cur - delta);
        },
        [form, setQtyForSide],
    );

    const handlePctForSide = useCallback(
        (which: string, pct: number) => {
            const field = which === TRADE_LITERAL.BUY ? 'buyQuantity' : 'sellQuantity';
            const max = which === TRADE_LITERAL.BUY ? maxQtty : maxSell;
            const setPct = which === TRADE_LITERAL.BUY ? setBuyPercentage : setSellPercentage;
            setPct(pct);
            const qty = calcQtyFromPercentage(pct, max);
            form.setFieldValue(field, qty > 0 ? formatNumberVN(qty, { decimals: 0 }) : '');
            form.validateField(field, 'change');
        },
        [form, maxQtty, maxSell],
    );

    const handleOpenConfirm = useCallback(
        (side: string) => {
            const isBuy = side === ORDER_SIDE.BUY;
            const rawPrice = parsePrice(form.getFieldValue(isBuy ? 'buyPrice' : 'sellPrice'));
            const qty = parseQuantity(form.getFieldValue(isBuy ? 'buyQuantity' : 'sellQuantity'));

            setPendingOrder({
                side,
                price: rawPrice,
                quantity: qty,
                orderType: PAPER_ORDER_TYPE.LO,
                stockType: selectedStock?.stockType ?? '',
            });
        },
        [form, selectedStock],
    );

    const handlePlaceOrderSuccess = useCallback(() => {
        if (!pendingOrder) return;

        const placedSide = pendingOrder.side;
        setPendingOrder(null);

        if (placedSide === ORDER_SIDE.BUY) {
            skipNextDefaultQtyRef.current.buy = true;
            form.setFieldValue('buyQuantity', '');
            setStoreBuyQuantity(0);
            setBuyPercentage(0);
        } else {
            skipNextDefaultQtyRef.current.sell = true;
            form.setFieldValue('sellQuantity', '');
            setStoreSellQuantity(0);
            setSellPercentage(0);
        }

        if (accountId && selectedStock?.symbol) {
            const priceField = placedSide === ORDER_SIDE.BUY ? 'buyPrice' : 'sellPrice';
            const price = parsePrice(form.getFieldValue(priceField));
            setTimeout(() => {
                fetchTradeCapacity(accountId, selectedStock.symbol, price, activeSide);
            }, TRADE_UI_CONFIG.AVAILABLE_TRADE_REFRESH_DELAY_MS);
        }
    }, [
        pendingOrder,
        form,
        accountId,
        selectedStock,
        activeSide,
        fetchTradeCapacity,
        setStoreBuyQuantity,
        setStoreSellQuantity,
    ]);

    const activeConfig = useMemo(
        () =>
            activeSide === TRADE_LITERAL.BUY
                ? {
                      key: TRADE_LITERAL.BUY,
                      orderSide: ORDER_SIDE.BUY,
                      ariaLabel: 'Lệnh mua',
                      legendSr: 'Thông tin lệnh mua',
                      priceField: 'buyPrice' as const,
                      qtyField: 'buyQuantity' as const,
                      stepperSide: 'buy' as const,
                      validatePrice: priceValidator,
                      validateQty: validateBuyQty,
                      percentage: buyPercentage,
                      onPctChange: (pct: number) => handlePctForSide(TRADE_LITERAL.BUY, pct),
                      setStorePrice: setStoreBuyPrice,
                      setStoreQty: setStoreBuyQuantity,
                      maxQty: maxQtty,
                      totalLabel: 'Tổng tiền mua',
                      ctaLabel: 'Mua',
                      ctaEnabledClass:
                          'bg-highlight text-quaternary hover:opacity-90 active:opacity-80',
                  }
                : {
                      key: TRADE_LITERAL.SELL,
                      orderSide: ORDER_SIDE.SELL,
                      ariaLabel: 'Lệnh bán',
                      legendSr: 'Thông tin lệnh bán',
                      priceField: 'sellPrice' as const,
                      qtyField: 'sellQuantity' as const,
                      stepperSide: 'sell' as const,
                      validatePrice: priceValidator,
                      validateQty: validateSellQty,
                      percentage: sellPercentage,
                      onPctChange: (pct: number) => handlePctForSide(TRADE_LITERAL.SELL, pct),
                      setStorePrice: setStoreSellPrice,
                      setStoreQty: setStoreSellQuantity,
                      maxQty: maxSell,
                      totalLabel: 'Tổng tiền bán',
                      ctaLabel: 'Bán',
                      ctaEnabledClass: 'bg-red text-primary hover:opacity-90 active:opacity-80',
                  },
        [
            activeSide,
            buyPercentage,
            handlePctForSide,
            maxQtty,
            maxSell,
            sellPercentage,
            setStoreBuyPrice,
            setStoreBuyQuantity,
            setStoreSellPrice,
            setStoreSellQuantity,
            priceValidator,
            validateBuyQty,
            validateSellQty,
        ],
    );

    useEffect(() => {
        return () => {
            setStoreBuyPrice(0);
            setStoreBuyQuantity(0);
            setStoreSellPrice(0);
            setStoreSellQuantity(0);
        };
    }, []);

    useEffect(() => {
        setActiveTradeSide(activeSide);
    }, [activeSide, setActiveTradeSide]);

    useEffect(() => {
        form.reset();
        setStoreBuyPrice(0);
        setStoreBuyQuantity(0);
        setStoreSellPrice(0);
        setStoreSellQuantity(0);
        setBuyPercentage(0);
        setSellPercentage(0);
        setRealtimePrices({ buyPrice1: 0, sellPrice1: 0 });
    }, [
        selectedStock,
        form,
        setStoreBuyPrice,
        setStoreBuyQuantity,
        setStoreSellPrice,
        setStoreSellQuantity,
    ]);

    useEffect(() => {
        setPendingOrder(null);
    }, [selectedStock?.symbol]);

    useEffect(() => {
        if (!selectedStock) return;

        if (selectedStock.buyPrice1 && selectedStock.sellPrice1) {
            setRealtimePrices({
                buyPrice1: selectedStock.buyPrice1,
                sellPrice1: selectedStock.sellPrice1,
            });
        }
    }, [selectedStock]);

    useEffect(() => {
        if (initialPrice && initialPrice > 0) {
            requestAvailableTrade(initialSide ?? TRADE_LITERAL.BUY, initialPrice, {
                immediate: true,
            });
        } else {
            requestAvailableTrade(activeSide, realtimePriceForSide(activeSide), {
                immediate: true,
            });
        }
    }, [requestAvailableTrade]);

    useEffect(() => {
        if (realtimePrices.buyPrice1 > 0 && realtimePrices.sellPrice1 > 0) {
            if (injectedSideRef.current !== TRADE_LITERAL.BUY) {
                form.setFieldValue('buyPrice', formatBoardPrice(realtimePrices.sellPrice1));
            }
            if (injectedSideRef.current !== TRADE_LITERAL.SELL) {
                form.setFieldValue('sellPrice', formatBoardPrice(realtimePrices.buyPrice1));
            }
        }
    }, [realtimePrices, form]);

    useEffect(() => {
        if (!initialPrice || initialPrice <= 0) return;
        const side = initialSide ?? TRADE_LITERAL.BUY;
        const field = side === TRADE_LITERAL.BUY ? 'buyPrice' : 'sellPrice';
        form.setFieldValue(field, formatBoardPrice(initialPrice));
    }, []);

    useEffect(() => {
        if (maxQtty > 0) {
            if (skipNextDefaultQtyRef.current.buy) {
                skipNextDefaultQtyRef.current.buy = false;
                form.setFieldValue('buyQuantity', '');
                setBuyPercentage(0);
            } else {
                const defaultBuyQty = Math.min(TRADE_UI_CONFIG.DEFAULT_QUANTITY, maxQtty);
                form.setFieldValue('buyQuantity', formatNumberVN(defaultBuyQty, { decimals: 0 }));
                setBuyPercentage(Math.min(100, Math.round((defaultBuyQty / maxQtty) * 100)));
            }
        } else {
            form.setFieldValue('buyQuantity', '');
            setBuyPercentage(0);
        }
        if (maxSell > 0) {
            if (skipNextDefaultQtyRef.current.sell) {
                skipNextDefaultQtyRef.current.sell = false;
                form.setFieldValue('sellQuantity', '');
                setSellPercentage(0);
            } else {
                const defaultSellQty = Math.min(TRADE_UI_CONFIG.DEFAULT_QUANTITY, maxSell);
                form.setFieldValue('sellQuantity', formatNumberVN(defaultSellQty, { decimals: 0 }));
                setSellPercentage(Math.min(100, Math.round((defaultSellQty / maxSell) * 100)));
            }
        } else {
            form.setFieldValue('sellQuantity', '');
            setSellPercentage(0);
        }
    }, [maxQtty, maxSell, form]);

    useEffect(() => {
        if (storeBuyPrice > 0) {
            form.setFieldValue('buyPrice', formatBoardPrice(storeBuyPrice));
            requestAvailableTrade(TRADE_LITERAL.BUY, storeBuyPrice, { immediate: false });
        }
    }, [storeBuyPrice, form, requestAvailableTrade]);

    useEffect(() => {
        if (storeBuyQuantity > 0) {
            form.setFieldValue('buyQuantity', formatNumberVN(storeBuyQuantity, { decimals: 0 }));
        }
    }, [storeBuyQuantity]);

    useEffect(() => {
        if (storeBuyQuantity > 0 && maxQtty > 0) {
            setBuyPercentage(Math.min(100, Math.round((storeBuyQuantity / maxQtty) * 100)));
        }
    }, [storeBuyQuantity, maxQtty]);

    useEffect(() => {
        if (storeSellPrice > 0) {
            form.setFieldValue('sellPrice', formatBoardPrice(storeSellPrice));
            requestAvailableTrade(TRADE_LITERAL.SELL, storeSellPrice, { immediate: false });
        }
    }, [storeSellPrice, form, requestAvailableTrade]);

    useEffect(() => {
        if (storeSellQuantity > 0) {
            form.setFieldValue('sellQuantity', formatNumberVN(storeSellQuantity, { decimals: 0 }));
        }
    }, [storeSellQuantity]);

    useEffect(() => {
        if (storeSellQuantity > 0 && maxSell > 0) {
            setSellPercentage(Math.min(100, Math.round((storeSellQuantity / maxSell) * 100)));
        }
    }, [storeSellQuantity, maxSell]);

    useEffect(() => {
        const exchange = selectedStock?.exchange;
        if (!exchange) return;

        fetchPaperMarketSessions()
            .then(({ error_code, data }) => {
                if (!isSuccessApi(error_code)) return;
                const sessions = data ?? [];
                const matched =
                    sessions.find((item) => item.exchange === exchange) ?? sessions[0] ?? null;
                setIsSessionOpen(!matched || normalizePaperStatus(matched.session) !== 'CLOSED');
            })
            .catch(() => setIsSessionOpen(true));
    }, [selectedStock?.exchange]);

    return (
        <section className="flex h-full min-h-0 w-full flex-col gap-1" aria-label={'Bảng đặt lệnh'}>
            <SubAccounts variant="embedded" />
            <TradePanelSideTabs
                activeSide={activeSide}
                onChange={(side) => {
                    setActiveSide(side);
                    requestAvailableTrade(side, realtimePriceForSide(side), { immediate: true });
                }}
            />
            <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 rounded-xl bg-secondary p-3">
                {isPanelPlaceOrderVisible ? (
                    <TradePanelOverlays
                        isPlaceOrderVisible={isPanelPlaceOrderVisible}
                        symbol={selectedStock?.symbol ?? ''}
                        pendingOrder={pendingOrder}
                        onPlaceOrderClose={() => setPendingOrder(null)}
                        onPlaceOrderSuccess={handlePlaceOrderSuccess}
                    />
                ) : (
                    <>
                        <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto">
                            <TradePanelInfoBar infoItems={infoItems} />
                            <TradePanelForm
                                form={form}
                                activeConfig={activeConfig}
                                requestAvailableTrade={requestAvailableTrade}
                                bumpFormPrice={bumpFormPrice}
                                bumpQty={bumpQty}
                                setBuyPercentage={setBuyPercentage}
                                setSellPercentage={setSellPercentage}
                            />
                        </div>
                        <TradePanelSubmit
                            form={form}
                            activeConfig={activeConfig}
                            symbol={selectedStock?.symbol ?? ''}
                            isSessionOpen={isSessionOpen}
                            onOpenConfirm={handleOpenConfirm}
                        />
                    </>
                )}
            </div>
        </section>
    );
};
