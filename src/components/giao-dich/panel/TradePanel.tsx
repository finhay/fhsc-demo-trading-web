'use client';

import { useForm } from '@tanstack/react-form';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SubAccounts } from '@/components/common/assets/SubAccounts';
import { type PendingIcebergOrder } from '@/components/giao-dich/iceberg/TradeIcebergOrder';
import { TradePanelInfoBar } from '@/components/giao-dich/panel/controls/TradePanelInfoBar';
import { TradePanelOrderMode } from '@/components/giao-dich/panel/controls/TradePanelOrderMode';
import { TradePanelOrderTypes } from '@/components/giao-dich/panel/controls/TradePanelOrderTypes';
import { TradePanelSideTabs } from '@/components/giao-dich/panel/controls/TradePanelSideTabs';
import { TradePanelForm, TradePanelSubmit } from '@/components/giao-dich/panel/form/TradePanelForm';
import { TradePanelOverlays } from '@/components/giao-dich/panel/overlays/TradePanelOverlays';
import { ACCOUNT_TYPE, SUB_ACCOUNT_PERMISSION, SUB_ACCOUNT_TYPE } from '@/constants/common';
import {
    EXCHANGE,
    EXCHANGE_SESSION,
    ORDER_MODE_KEY,
    ORDER_SIDE,
    ORDER_TYPE_KEY,
    PANEL_ORDER_MODES,
    TRADE_LITERAL,
    TRADE_SESSION_NEAR_BOUNDARY,
    TRADE_UI_CONFIG,
    TWAP_LO_URGENCY,
    TWO_FA_PLACEMENT,
} from '@/constants/trading';
import { useClickOutside } from '@/hooks/lib/useClickOutside';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchSubAccountAvailableTrade } from '@/services/api/trade/orders';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { PendingOrder } from '@/types/pages/trading';
import type { PendingTwapLoOrder, TwapLoOrderDto, TwapLoUrgency } from '@/types/trade/twap-lo';
import { isSuccessApi } from '@/utils/common';
import {
    addMonths,
    formatApiDate,
    formatBoardPrice,
    formatDate,
    formatNumberVN,
} from '@/utils/format';
import {
    buildOrderLotSplits,
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
    const trans = useTranslate();

    const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastAvailTradeArgsRef = useRef<string>('');
    const skipNextDefaultQtyRef = useRef({ buy: false, sell: false });
    const injectedSideRef = useRef<string | null>(
        initialPrice && initialPrice > 0 ? (initialSide ?? TRADE_LITERAL.BUY) : null,
    );

    const [activeSide, setActiveSide] = useState<string>(initialSide ?? TRADE_LITERAL.BUY);
    const [orderMode, setOrderMode] = useState<string>(ORDER_MODE_KEY.NORMAL);
    const [isOrderModeDropdownOpen, setIsOrderModeDropdownOpen] = useState(false);
    const [selectedOrderType, setSelectedOrderType] = useState<string>(ORDER_TYPE_KEY.LO);
    const [ppse, setPpse] = useState(0);
    const [mrratioloan, setMrratioloan] = useState(0);
    const [maxQtty, setMaxQtty] = useState(0);
    const [maxSell, setMaxSell] = useState(0);
    const [buyPercentage, setBuyPercentage] = useState(0);
    const [sellPercentage, setSellPercentage] = useState(0);
    const [realtimePrices, setRealtimePrices] = useState({
        buyPrice1: 0,
        sellPrice1: 0,
    });
    const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
    const [pendingIcebergOrder, setPendingIcebergOrder] = useState<PendingIcebergOrder | null>(
        null,
    );
    const [pendingTwapLoOrder, setPendingTwapLoOrder] = useState<PendingTwapLoOrder | null>(null);
    const [twapLoPreview, setTwapLoPreview] = useState<TwapLoOrderDto | null>(null);
    const [twapStartAt, setTwapStartAt] = useState('');
    const [twapUrgency, setTwapUrgency] = useState<TwapLoUrgency>(TWAP_LO_URGENCY.SLOW);
    const { activeSubAccount, profile } = useAuthStore();
    const { selectedStock } = useStockInfoStore();

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
        is2FAVisible,
        twoFAPlacement,
        close2FA,
        orderTypes,
        fetchOrderTypes,
        exchangeSession,
        setOrderTypes,
        onAfter2FASuccess,
    } = useTradingStore();

    const form = useForm({
        defaultValues: {
            buyPrice: '',
            buyQuantity: '',
            sellPrice: '',
            sellQuantity: '',
            childQuantity: '',
            executionDate: formatApiDate(),
            expiredDate: formatApiDate(addMonths(TRADE_UI_CONFIG.DEFAULT_247_MONTH_OFFSET)),
        },
    });

    const isLO = selectedOrderType === ORDER_TYPE_KEY.LO;
    const is247 = orderMode === ORDER_MODE_KEY.TAB_247;
    const isIceberg = orderMode === ORDER_MODE_KEY.ICEBERG;
    const isTwapLo = orderMode === ORDER_MODE_KEY.TWAP_LO;
    const isSessionClosed = exchangeSession === EXCHANGE_SESSION.CLOSED;

    const availableOrderModes = PANEL_ORDER_MODES.filter(
        ({ key }) => !isSessionClosed || key !== ORDER_MODE_KEY.NORMAL,
    );

    const selectedOrderModeLabel =
        orderMode === ORDER_MODE_KEY.TAB_247
            ? trans.trading.order_book.tab_247
            : orderMode === ORDER_MODE_KEY.ICEBERG
              ? trans.trading.order_book.tab_iceberg
              : orderMode === ORDER_MODE_KEY.TWAP_LO
                ? trans.trading.order_book.tab_twap_lo
                : trans.trading.order_book.tab_normal;

    const isOrderTypeAllowedInSession =
        orderMode === ORDER_MODE_KEY.TAB_247 ||
        orderTypes.length === 0 ||
        orderTypes.includes(selectedOrderType);

    const isSessionNearBoundary =
        orderMode === ORDER_MODE_KEY.NORMAL &&
        TRADE_SESSION_NEAR_BOUNDARY.includes(
            exchangeSession as (typeof TRADE_SESSION_NEAR_BOUNDARY)[number],
        );

    const isMarginAccount = activeSubAccount?.account_type === SUB_ACCOUNT_TYPE.MARGIN;

    const canTrade = !!activeSubAccount?.permissions?.some(
        (permission) =>
            permission === SUB_ACCOUNT_PERMISSION.ALL ||
            permission === SUB_ACCOUNT_PERMISSION.TRADE,
    );

    const orderModeDropdownRef = useClickOutside<HTMLDivElement>(
        () => setIsOrderModeDropdownOpen(false),
        isOrderModeDropdownOpen,
    );

    const validateBuyPrice = useMemo(() => {
        if (is247) {
            return makePriceValidator(
                0,
                0,
                true,
                selectedStock?.exchange ?? '',
                selectedStock?.stockType ?? '',
                selectedStock?.symbol ?? '',
            );
        }
        return makePriceValidator(
            selectedStock?.floor ?? 0,
            selectedStock?.ceiling ?? 0,
            isLO,
            selectedStock?.exchange ?? '',
            selectedStock?.stockType ?? '',
            selectedStock?.symbol ?? '',
        );
    }, [
        is247,
        isLO,
        selectedStock?.floor,
        selectedStock?.ceiling,
        selectedStock?.exchange,
        selectedStock?.stockType,
        selectedStock?.symbol,
    ]);

    const validateSellPrice = useMemo(() => {
        if (is247) {
            return makePriceValidator(
                0,
                0,
                true,
                selectedStock?.exchange ?? '',
                selectedStock?.stockType ?? '',
                selectedStock?.symbol ?? '',
            );
        }
        return makePriceValidator(
            selectedStock?.floor ?? 0,
            selectedStock?.ceiling ?? 0,
            isLO,
            selectedStock?.exchange ?? '',
            selectedStock?.stockType ?? '',
            selectedStock?.symbol ?? '',
        );
    }, [
        is247,
        isLO,
        selectedStock?.floor,
        selectedStock?.ceiling,
        selectedStock?.exchange,
        selectedStock?.stockType,
        selectedStock?.symbol,
    ]);

    const validateBuyQty = is247
        ? () => undefined
        : makeTradePanelQtyValidator(
              makeBuyQtyValidator(maxQtty),
              isLO && !isIceberg && !isTwapLo,
              trans.trading.panel.err_qty_divisible,
          );

    const validateSellQty = is247
        ? () => undefined
        : makeTradePanelQtyValidator(
              makeSellQtyValidator(maxSell),
              isLO && !isIceberg && !isTwapLo,
              trans.trading.panel.err_qty_divisible,
          );

    const infoItems = useMemo(() => {
        const marginItem = isMarginAccount
            ? [
                  {
                      label: trans.trading.panel.loan_ratio,
                      value: mrratioloan > 0 ? `${formatNumberVN(mrratioloan)}%` : '--',
                  },
              ]
            : [];

        if (activeSide === TRADE_LITERAL.BUY) {
            return [
                ...marginItem,
                {
                    label: trans.trading.panel.max_buy_power,
                    value:
                        ppse > 0
                            ? `${formatNumberVN(ppse, { trimTrailingZeros: true })}${trans.trading.currency.suffix}`
                            : '--',
                },
                {
                    label: trans.trading.panel.max_buy_qty,
                    value: maxQtty > 0 ? `${formatNumberVN(maxQtty, { decimals: 0 })}cp` : '--',
                },
            ];
        }

        return [
            {
                label: trans.trading.panel.max_sell_qty,
                value: maxSell > 0 ? `${formatNumberVN(maxSell, { decimals: 0 })}cp` : '--',
            },
        ];
    }, [activeSide, isMarginAccount, maxQtty, maxSell, mrratioloan, ppse, trans]);

    const isPanelQrVerifyVisible =
        is2FAVisible &&
        twoFAPlacement === TWO_FA_PLACEMENT.PANEL &&
        profile?.user_type !== ACCOUNT_TYPE.ENTERPRISE;

    const isPanelOtpVerifyVisible =
        is2FAVisible &&
        twoFAPlacement === TWO_FA_PLACEMENT.PANEL &&
        profile?.user_type === ACCOUNT_TYPE.ENTERPRISE;

    const isPanelPlaceOrderVisible = !!pendingOrder && !!selectedStock?.symbol;
    const isPanelIcebergOrderVisible = !!pendingIcebergOrder && !!selectedStock?.symbol;
    const isPanelTwapLoOrderVisible = !!pendingTwapLoOrder && !!selectedStock?.symbol;

    const showOverlay =
        isPanelQrVerifyVisible ||
        isPanelOtpVerifyVisible ||
        isPanelPlaceOrderVisible ||
        isPanelIcebergOrderVisible ||
        isPanelTwapLoOrderVisible;

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

    const fetchAvailableTrade = useCallback(
        async (subAccountId: string, symbol: string, price: number, side: string) => {
            lastAvailTradeArgsRef.current = `${subAccountId}|${symbol}|${side}|${price}`;
            try {
                const { error_code, result } = await fetchSubAccountAvailableTrade(
                    subAccountId,
                    side === TRADE_LITERAL.BUY ? ORDER_SIDE.BUY : ORDER_SIDE.SELL,
                    symbol,
                    price,
                );
                if (isSuccessApi(error_code)) {
                    setPpse(result.ppse);
                    setMrratioloan(Number(result.mrratioloan));
                    setMaxQtty(result.maxqtty);
                    setMaxSell(result.trade);
                }
            } catch {
                setPpse(0);
                setMrratioloan(0);
                setMaxQtty(0);
                setMaxSell(0);
            }
        },
        [],
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
            const subAccountId = activeSubAccount?.sub_account_id;
            const symbol = selectedStock?.symbol;
            if (!subAccountId || !symbol) return;

            const fire = () => {
                const key = `${subAccountId}|${symbol}|${side}|${price}`;
                if (key === lastAvailTradeArgsRef.current) return;
                fetchAvailableTrade(subAccountId, symbol, price, side);
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
        [activeSubAccount?.sub_account_id, selectedStock?.symbol, fetchAvailableTrade],
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
            const rawPrice =
                side === ORDER_SIDE.BUY
                    ? parsePrice(form.getFieldValue('buyPrice'))
                    : parsePrice(form.getFieldValue('sellPrice'));
            const qty =
                side === ORDER_SIDE.BUY
                    ? parseQuantity(form.getFieldValue('buyQuantity'))
                    : parseQuantity(form.getFieldValue('sellQuantity'));

            if (orderMode === ORDER_MODE_KEY.ICEBERG) {
                const displaySize = parseQuantity(form.getFieldValue('childQuantity'));
                setPendingIcebergOrder({
                    side: side as PendingIcebergOrder['side'],
                    price: rawPrice,
                    totalQuantity: qty,
                    displaySize,
                });
                return;
            }

            if (orderMode === ORDER_MODE_KEY.TWAP_LO) {
                setTwapLoPreview(null);
                setPendingTwapLoOrder({
                    side: side as PendingTwapLoOrder['side'],
                    price: rawPrice,
                    quantity: qty,
                    urgency: twapUrgency,
                    startAt: twapStartAt,
                });
                return;
            }

            const orderLots = buildOrderLotSplits(qty);

            const executionDateValue =
                form.getFieldValue('executionDate') || formatDate(new Date());
            const expiredDateValue = form.getFieldValue('expiredDate') || formatDate(new Date());

            const order = {
                side,
                price: rawPrice,
                orderType: selectedOrderType,
                orderLots,
                orderMode,
                stockType: selectedStock?.stockType ?? '',
                executionDate: executionDateValue,
                expiredDate: expiredDateValue,
            };

            setPendingOrder(order);
        },
        [form, selectedOrderType, orderMode, selectedStock, twapUrgency, twapStartAt],
    );

    const handlePanelVerifySuccess = () => {
        close2FA();
        onAfter2FASuccess?.();
    };

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

        if (activeSubAccount?.sub_account_id && selectedStock?.symbol) {
            const priceField = placedSide === ORDER_SIDE.BUY ? 'buyPrice' : 'sellPrice';
            const price = parsePrice(form.getFieldValue(priceField));
            const subAccountId = activeSubAccount.sub_account_id;
            setTimeout(() => {
                fetchAvailableTrade(subAccountId, selectedStock.symbol, price, activeSide);
            }, TRADE_UI_CONFIG.AVAILABLE_TRADE_REFRESH_DELAY_MS);
        }
    }, [
        pendingOrder,
        form,
        activeSubAccount,
        selectedStock,
        activeSide,
        fetchAvailableTrade,
        setStoreBuyQuantity,
        setStoreSellQuantity,
    ]);

    const handleIcebergOrderSuccess = useCallback(() => {
        if (!pendingIcebergOrder) return;

        const placedSide = pendingIcebergOrder.side;
        setPendingIcebergOrder(null);

        if (placedSide === ORDER_SIDE.BUY) {
            skipNextDefaultQtyRef.current.buy = true;
            form.setFieldValue('buyQuantity', '');
            form.setFieldValue('childQuantity', '');
            setStoreBuyQuantity(0);
            setBuyPercentage(0);
        } else {
            skipNextDefaultQtyRef.current.sell = true;
            form.setFieldValue('sellQuantity', '');
            form.setFieldValue('childQuantity', '');
            setStoreSellQuantity(0);
            setSellPercentage(0);
        }

        if (activeSubAccount?.sub_account_id && selectedStock?.symbol) {
            const priceField = placedSide === ORDER_SIDE.BUY ? 'buyPrice' : 'sellPrice';
            const price = parsePrice(form.getFieldValue(priceField));
            const subAccountId = activeSubAccount.sub_account_id;
            setTimeout(() => {
                fetchAvailableTrade(subAccountId, selectedStock.symbol, price, activeSide);
            }, TRADE_UI_CONFIG.AVAILABLE_TRADE_REFRESH_DELAY_MS);
        }
    }, [
        pendingIcebergOrder,
        form,
        activeSubAccount,
        selectedStock,
        activeSide,
        fetchAvailableTrade,
        setStoreBuyQuantity,
        setStoreSellQuantity,
    ]);

    const handleTwapLoOrderSuccess = useCallback(() => {
        if (!pendingTwapLoOrder) return;

        const placedSide = pendingTwapLoOrder.side;
        setPendingTwapLoOrder(null);
        setTwapLoPreview(null);
        setTwapStartAt('');
        setTwapUrgency(TWAP_LO_URGENCY.SLOW);

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

        if (activeSubAccount?.sub_account_id && selectedStock?.symbol) {
            const priceField = placedSide === ORDER_SIDE.BUY ? 'buyPrice' : 'sellPrice';
            const price = parsePrice(form.getFieldValue(priceField));
            const subAccountId = activeSubAccount.sub_account_id;
            setTimeout(() => {
                fetchAvailableTrade(subAccountId, selectedStock.symbol, price, activeSide);
            }, TRADE_UI_CONFIG.AVAILABLE_TRADE_REFRESH_DELAY_MS);
        }
    }, [
        pendingTwapLoOrder,
        form,
        activeSubAccount,
        selectedStock,
        activeSide,
        fetchAvailableTrade,
        setStoreBuyQuantity,
        setStoreSellQuantity,
    ]);

    const activeConfig = useMemo(
        () =>
            activeSide === TRADE_LITERAL.BUY
                ? {
                      key: TRADE_LITERAL.BUY,
                      orderSide: ORDER_SIDE.BUY,
                      ariaLabel: trans.trading.panel.buy_aria,
                      legendSr: trans.trading.panel.buy_legend,
                      priceField: 'buyPrice' as const,
                      qtyField: 'buyQuantity' as const,
                      stepperSide: 'buy' as const,
                      validatePrice: validateBuyPrice,
                      validateQty: validateBuyQty,
                      percentage: buyPercentage,
                      onPctChange: (pct: number) => handlePctForSide(TRADE_LITERAL.BUY, pct),
                      setStorePrice: setStoreBuyPrice,
                      setStoreQty: setStoreBuyQuantity,
                      maxQty: maxQtty,
                      totalLabel: trans.trading.panel.total_buy,
                      ctaLabel: trans.trading.panel.btn_buy,
                      ctaEnabledClass:
                          'bg-highlight text-quaternary hover:opacity-90 active:opacity-80',
                  }
                : {
                      key: TRADE_LITERAL.SELL,
                      orderSide: ORDER_SIDE.SELL,
                      ariaLabel: trans.trading.panel.sell_aria,
                      legendSr: trans.trading.panel.sell_legend,
                      priceField: 'sellPrice' as const,
                      qtyField: 'sellQuantity' as const,
                      stepperSide: 'sell' as const,
                      validatePrice: validateSellPrice,
                      validateQty: validateSellQty,
                      percentage: sellPercentage,
                      onPctChange: (pct: number) => handlePctForSide(TRADE_LITERAL.SELL, pct),
                      setStorePrice: setStoreSellPrice,
                      setStoreQty: setStoreSellQuantity,
                      maxQty: maxSell,
                      totalLabel: trans.trading.panel.total_sell,
                      ctaLabel: trans.trading.panel.btn_sell,
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
            validateBuyPrice,
            validateBuyQty,
            validateSellPrice,
            validateSellQty,
            trans,
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
        setOrderTypes([]);
        setSelectedOrderType(ORDER_TYPE_KEY.LO);
        setRealtimePrices({ buyPrice1: 0, sellPrice1: 0 });
        form.setFieldValue('executionDate', formatApiDate());
        form.setFieldValue(
            'expiredDate',
            formatApiDate(addMonths(TRADE_UI_CONFIG.DEFAULT_247_MONTH_OFFSET)),
        );
    }, [
        selectedStock,
        form,
        setStoreBuyPrice,
        setStoreBuyQuantity,
        setStoreSellPrice,
        setStoreSellQuantity,
        setOrderTypes,
    ]);

    useEffect(() => {
        setPendingOrder(null);
        setPendingIcebergOrder(null);
        setPendingTwapLoOrder(null);
        setTwapLoPreview(null);
        if (is2FAVisible && twoFAPlacement === TWO_FA_PLACEMENT.PANEL) {
            close2FA();
        }
    }, [selectedStock?.symbol]);

    useEffect(() => {
        if (!selectedStock) return;

        const targetExchange =
            selectedStock.floorCode === EXCHANGE.HCX ? EXCHANGE.HCX : selectedStock.exchange;
        if (targetExchange) fetchOrderTypes(targetExchange);

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
        if (isIceberg) {
            form.setFieldValue('buyQuantity', '');
            form.setFieldValue('sellQuantity', '');
            setBuyPercentage(0);
            setSellPercentage(0);
            return;
        }
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
    }, [maxQtty, maxSell, isIceberg, form]);

    useEffect(() => {
        if (storeBuyPrice > 0 && isLO) {
            form.setFieldValue('buyPrice', formatBoardPrice(storeBuyPrice));
            requestAvailableTrade(TRADE_LITERAL.BUY, storeBuyPrice, { immediate: false });
        }
    }, [storeBuyPrice, isLO, form, requestAvailableTrade]);

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
        if (storeSellPrice > 0 && isLO) {
            form.setFieldValue('sellPrice', formatBoardPrice(storeSellPrice));
            requestAvailableTrade(TRADE_LITERAL.SELL, storeSellPrice, { immediate: false });
        }
    }, [storeSellPrice, isLO, form, requestAvailableTrade]);

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
        if (isIceberg || isTwapLo) return;
        if (orderTypes.length > 0) {
            setSelectedOrderType(orderTypes[0]);
        }
    }, [orderTypes, isIceberg, isTwapLo]);

    useEffect(() => {
        if (isIceberg || isTwapLo) {
            setSelectedOrderType(ORDER_TYPE_KEY.LO);
        }
    }, [isIceberg, isTwapLo]);

    useEffect(() => {
        if (!isTwapLo) {
            setTwapStartAt('');
            setTwapUrgency(TWAP_LO_URGENCY.SLOW);
        }
    }, [isTwapLo]);

    useEffect(() => {
        if (!exchangeSession) return;
        setOrderMode(
            exchangeSession === EXCHANGE_SESSION.CLOSED
                ? ORDER_MODE_KEY.TAB_247
                : ORDER_MODE_KEY.NORMAL,
        );
    }, [exchangeSession]);

    return (
        <section
            className="flex h-full min-h-0 w-full flex-col gap-1"
            aria-label={trans.trading.panel.section_aria}
        >
            <SubAccounts permission={SUB_ACCOUNT_PERMISSION.TRADE} />
            <TradePanelSideTabs
                activeSide={activeSide}
                onChange={(side) => {
                    setActiveSide(side);
                    requestAvailableTrade(side, realtimePriceForSide(side), { immediate: true });
                }}
            />
            <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 rounded-xl bg-secondary p-3">
                {showOverlay ? (
                    <TradePanelOverlays
                        isQrVerifyVisible={isPanelQrVerifyVisible}
                        isOtpVerifyVisible={isPanelOtpVerifyVisible}
                        isPlaceOrderVisible={isPanelPlaceOrderVisible}
                        isIcebergOrderVisible={isPanelIcebergOrderVisible}
                        isTwapLoOrderVisible={isPanelTwapLoOrderVisible}
                        symbol={selectedStock?.symbol ?? ''}
                        pendingOrder={pendingOrder}
                        pendingIcebergOrder={pendingIcebergOrder}
                        pendingTwapLoOrder={pendingTwapLoOrder}
                        twapLoPreview={twapLoPreview}
                        onTwapLoPreviewLoaded={setTwapLoPreview}
                        onVerifyClose={close2FA}
                        onVerifySuccess={handlePanelVerifySuccess}
                        onPlaceOrderClose={() => setPendingOrder(null)}
                        onPlaceOrderSuccess={handlePlaceOrderSuccess}
                        onIcebergOrderClose={() => setPendingIcebergOrder(null)}
                        onIcebergOrderSuccess={handleIcebergOrderSuccess}
                        onTwapLoOrderClose={() => {
                            setPendingTwapLoOrder(null);
                            setTwapLoPreview(null);
                        }}
                        onTwapLoOrderSuccess={handleTwapLoOrderSuccess}
                    />
                ) : (
                    <>
                        <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto">
                            <TradePanelOrderMode
                                dropdownRef={orderModeDropdownRef}
                                exchangeSession={exchangeSession}
                                orderMode={orderMode}
                                selectedOrderModeLabel={selectedOrderModeLabel}
                                availableOrderModes={availableOrderModes}
                                isDropdownOpen={isOrderModeDropdownOpen}
                                onToggleDropdown={() => setIsOrderModeDropdownOpen((prev) => !prev)}
                                onSelectMode={(key) => {
                                    setOrderMode(key);
                                    setIsOrderModeDropdownOpen(false);
                                    form.setFieldValue('childQuantity', '');
                                }}
                            />
                            <TradePanelOrderTypes
                                orderMode={orderMode}
                                isIceberg={isIceberg}
                                isTwapLo={isTwapLo}
                                orderTypes={orderTypes}
                                selectedOrderType={selectedOrderType}
                                onSelectOrderType={(orderType) => {
                                    setSelectedOrderType(orderType);
                                    form.reset();
                                    setBuyPercentage(0);
                                    setSellPercentage(0);
                                }}
                            />
                            <TradePanelInfoBar infoItems={infoItems} />
                            <TradePanelForm
                                form={form}
                                activeConfig={activeConfig}
                                isLO={isLO}
                                is247={is247}
                                isIceberg={isIceberg}
                                isTwapLo={isTwapLo}
                                orderMode={orderMode}
                                selectedOrderType={selectedOrderType}
                                twapStartAt={twapStartAt}
                                twapUrgency={twapUrgency}
                                onTwapStartAtChange={setTwapStartAt}
                                onTwapUrgencyChange={setTwapUrgency}
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
                            isLO={isLO}
                            isIceberg={isIceberg}
                            selectedOrderType={selectedOrderType}
                            symbol={selectedStock?.symbol ?? ''}
                            isOrderTypeAllowedInSession={isOrderTypeAllowedInSession}
                            isSessionNearBoundary={isSessionNearBoundary}
                            canTrade={canTrade}
                            onOpenConfirm={handleOpenConfirm}
                        />
                    </>
                )}
            </div>
        </section>
    );
};
