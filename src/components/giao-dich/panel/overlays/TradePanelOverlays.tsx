'use client';

import {
    type PendingIcebergOrder,
    TradeIcebergOrder,
} from '@/components/giao-dich/iceberg/TradeIcebergOrder';
import { TradeTwapLoOrder } from '@/components/giao-dich/twap-lo/TradeTwapLoOrder';
import { TradePlaceOrderPanel } from '@/components/giao-dich/verification/TradePlaceOrderPanel';
import { TradeVerifyOtpPanel } from '@/components/giao-dich/verification/TradeVerifyOtpPanel';
import { TradeVerifyQrPanel } from '@/components/giao-dich/verification/TradeVerifyQrPanel';
import type { PendingOrder } from '@/types/pages/trading';
import type { PendingTwapLoOrder, TwapLoOrderDto } from '@/types/trade/twap-lo';

type Props = {
    isQrVerifyVisible: boolean;
    isOtpVerifyVisible: boolean;
    isPlaceOrderVisible: boolean;
    isIcebergOrderVisible: boolean;
    isTwapLoOrderVisible: boolean;
    symbol: string;
    pendingOrder: PendingOrder | null;
    pendingIcebergOrder: PendingIcebergOrder | null;
    pendingTwapLoOrder: PendingTwapLoOrder | null;
    twapLoPreview: TwapLoOrderDto | null;
    onTwapLoPreviewLoaded: (preview: TwapLoOrderDto) => void;
    onVerifyClose: () => void;
    onVerifySuccess: () => void;
    onPlaceOrderClose: () => void;
    onPlaceOrderSuccess: () => void;
    onIcebergOrderClose: () => void;
    onIcebergOrderSuccess: () => void;
    onTwapLoOrderClose: () => void;
    onTwapLoOrderSuccess: () => void;
};

export const TradePanelOverlays = ({
    isQrVerifyVisible,
    isOtpVerifyVisible,
    isPlaceOrderVisible,
    isIcebergOrderVisible,
    isTwapLoOrderVisible,
    symbol,
    pendingOrder,
    pendingIcebergOrder,
    pendingTwapLoOrder,
    twapLoPreview,
    onTwapLoPreviewLoaded,
    onVerifyClose,
    onVerifySuccess,
    onPlaceOrderClose,
    onPlaceOrderSuccess,
    onIcebergOrderClose,
    onIcebergOrderSuccess,
    onTwapLoOrderClose,
    onTwapLoOrderSuccess,
}: Props) => {
    if (isQrVerifyVisible) {
        return <TradeVerifyQrPanel onClose={onVerifyClose} onSuccess={onVerifySuccess} />;
    }

    if (isOtpVerifyVisible) {
        return <TradeVerifyOtpPanel onClose={onVerifyClose} onSuccess={onVerifySuccess} />;
    }

    if (isPlaceOrderVisible && pendingOrder) {
        return (
            <TradePlaceOrderPanel
                symbol={symbol}
                pendingOrder={pendingOrder}
                onClose={onPlaceOrderClose}
                onSuccess={onPlaceOrderSuccess}
            />
        );
    }

    if (isIcebergOrderVisible && pendingIcebergOrder) {
        return (
            <TradeIcebergOrder
                symbol={symbol}
                order={pendingIcebergOrder}
                onClose={onIcebergOrderClose}
                onSuccess={onIcebergOrderSuccess}
            />
        );
    }

    if (isTwapLoOrderVisible && pendingTwapLoOrder) {
        return (
            <TradeTwapLoOrder
                symbol={symbol}
                order={pendingTwapLoOrder}
                initialPreview={twapLoPreview}
                onPreviewLoaded={onTwapLoPreviewLoaded}
                onClose={onTwapLoOrderClose}
                onSuccess={onTwapLoOrderSuccess}
            />
        );
    }

    return null;
};
