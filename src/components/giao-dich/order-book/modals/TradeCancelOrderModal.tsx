'use client';

import { type ReactNode, useMemo } from 'react';

import { Dialog } from '@/components/common/ui/Dialog';
import { ACCOUNT_TYPE, ERROR_CODES } from '@/constants/common';
import { TWO_FA_PLACEMENT } from '@/constants/trading';
import { toast } from '@/hooks/lib/useToast';
import { cancelSubAccountOrder247, cancelSubAccountStockOrder } from '@/services/api/trade/orders';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { mapOrderErrorCodeToStatus } from '@/utils/trading/shared';

type Props = {
    orderId: string;
    symbol: string;
    side: string;
    rawPrice: number;
    rawQty: number;
    orderConditionType?: string | null;
    onClose: () => void;
    onSuccess: () => void;
    onExpired2FA?: () => void;
};

export const TradeCancelOrderModal = ({
    orderId,
    symbol,
    side,
    rawPrice,
    rawQty,
    orderConditionType,
    onClose,
    onSuccess,
    onExpired2FA,
}: Props) => {
    const { activeSubAccount, profile } = useAuthStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const { request2FA, handle2FATokenExpired, patchOrdersInBook } = useTradingStore();

    const validationType = profile?.user_type === ACCOUNT_TYPE.ENTERPRISE ? 'OTP' : 'SMART_OTP';
    const subAccountId = activeSubAccount?.sub_account_id ?? '';

    const isBuy = side === 'Mua';
    const displayPrice = rawPrice / 1000;
    const title = `${isBuy ? 'Huỷ lệnh mua' : 'Huỷ lệnh bán'} ${symbol}`;

    const summaryRows = useMemo(
        () =>
            [
                {
                    label: 'Loại lệnh',
                    value: (
                        <dd
                            className={`font-body-3-highlight ${isBuy ? 'text-green' : 'text-red'}`}
                        >
                            {side}
                        </dd>
                    ),
                },
                {
                    label: 'Mã CK',
                    value: <dd className="font-body-3-highlight text-primary">{symbol}</dd>,
                },
                {
                    label: 'Giá đặt',
                    value: (
                        <dd className="font-body-3 text-primary">{formatNumberVN(displayPrice)}</dd>
                    ),
                },
                {
                    label: 'Số lượng',
                    value: (
                        <dd className="font-body-3 text-primary">
                            {formatNumberVN(rawQty, { decimals: 0 })} {'cp'}
                        </dd>
                    ),
                },
            ] as { label: string; value: ReactNode }[],
        [displayPrice, isBuy, rawQty, side, symbol],
    );

    const handleConfirmClick = () => {
        request2FA(handleConfirm, TWO_FA_PLACEMENT.GLOBAL);
        onClose();
    };

    const handleConfirm = async () => {
        startLoading();
        let is2FAExpired = false;
        try {
            const is247 = !!orderConditionType;
            const cancelFn = is247 ? cancelSubAccountOrder247 : cancelSubAccountStockOrder;
            const { error_code, data, message } = await cancelFn(subAccountId, orderId, {
                sub_account: activeSubAccount?.sub_account_ext,
                cus_id: profile?.cust_id,
                validation_type: validationType,
                order_condition_type: orderConditionType,
            });

            if (isSuccessApi(error_code)) {
                if (data && data.length > 0) {
                    if (data[0].code === '0') {
                        patchOrdersInBook([
                            {
                                orderId,
                                status: data[0].order_status ?? (is247 ? 'CANCELLED' : '3'),
                                allowCancel: false,
                                allowAmend: false,
                            },
                        ]);
                        toast.success('Thành công');
                    } else {
                        toast.error(
                            mapOrderErrorCodeToStatus(data[0].code, data[0].rejected_reason ?? ''),
                        );
                    }
                }
                onSuccess();
            } else if (error_code === ERROR_CODES.FAILED_2FA_TOKEN_EXPIRED) {
                is2FAExpired = true;
            } else {
                toast.error(message);
            }
        } catch (err: unknown) {
            const errCode =
                (err as { error_code?: string })?.error_code ??
                (err as { response?: { data?: { error_code?: string } } })?.response?.data
                    ?.error_code;
            if (errCode === ERROR_CODES.FAILED_2FA_TOKEN_EXPIRED) {
                is2FAExpired = true;
            } else {
                toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
            }
        } finally {
            stopLoading();
            onClose();
            if (is2FAExpired) handle2FATokenExpired(onExpired2FA, TWO_FA_PLACEMENT.GLOBAL);
        }
    };

    return (
        <Dialog title={title} maxWidth="max-w-md" onClose={onClose}>
            <div className="flex flex-col gap-4">
                <dl className="bg-tertiary rounded-xl px-4 py-3 flex flex-col gap-3">
                    {summaryRows.map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                            <dt className="font-body-3 text-secondary">{label}</dt>
                            {value}
                        </div>
                    ))}
                </dl>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 rounded-xl font-body-3-highlight bg-tertiary text-primary hover:bg-quaternary transition-colors"
                    >
                        {'Đóng'}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmClick}
                        disabled={isLoading}
                        className={`flex-1 py-2 rounded-xl font-body-3-highlight transition-colors ${
                            isLoading
                                ? 'bg-disabled text-disabled cursor-not-allowed'
                                : 'bg-red text-primary hover:opacity-90'
                        }`}
                    >
                        {'Xác nhận huỷ'}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};
