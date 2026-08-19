'use client';

import type { TwapLoSliceDto } from '@/types/trade/twap-lo';
import { formatBoardPrice, formatDateTime, formatNumberVN } from '@/utils/format';
import { getOrderStatusBorder, getTwapLoSliceStatus } from '@/utils/trading/order-book';
import { getTwapLoSliceQty, isPendingTwapLoSlice } from '@/utils/trading/panel';

type Props = {
    slices: TwapLoSliceDto[];
    limitPrice: number;
};

export const TradeTwapLoSliceList = ({ slices, limitPrice }: Props) => {
    const getSliceStatus = (slice: TwapLoSliceDto) =>
        getTwapLoSliceStatus(slice.status, slice.matchedQty ?? 0, getTwapLoSliceQty(slice));

    const renderSliceRows = (slice: TwapLoSliceDto) => {
        const qty = getTwapLoSliceQty(slice);
        const matchedQty = slice.matchedQty ?? 0;
        const matchedPrice = slice.matchedPrice ?? 0;
        const orderValue = limitPrice * qty;
        const textClass = isPendingTwapLoSlice(slice) ? 'text-secondary' : 'text-primary';
        const valueClass = `shrink-0 whitespace-nowrap font-body-3 ${textClass}`;

        if (isPendingTwapLoSlice(slice)) {
            return (
                <>
                    <div className="flex items-center gap-6">
                        <dt className="min-w-0 flex-1 font-body-3 text-secondary">{'KL'}</dt>
                        <dd className={valueClass}>
                            {formatNumberVN(qty, { decimals: 0 })} {'cp'}
                        </dd>
                    </div>
                    <div className="flex items-center gap-6">
                        <dt className="min-w-0 flex-1 font-body-3 text-secondary">{'Giá đặt'}</dt>
                        <dd className={valueClass}>{formatBoardPrice(limitPrice)}</dd>
                    </div>
                    <div className="flex items-center gap-6">
                        <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                            {'Giá trị lệnh'}
                        </dt>
                        <dd className={valueClass}>
                            {formatNumberVN(orderValue, { trimTrailingZeros: true })}
                            {'đ'}
                        </dd>
                    </div>
                    {slice.scheduledAt && (
                        <div className="flex items-center gap-6">
                            <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                {'Dự kiến đặt'}
                            </dt>
                            <dd className={valueClass}>{formatDateTime(slice.scheduledAt)}</dd>
                        </div>
                    )}
                </>
            );
        }

        return (
            <>
                <div className="flex items-center gap-6">
                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">{'KL Khớp/Tổng'}</dt>
                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                        <span>{formatNumberVN(matchedQty, { decimals: 0 })} / </span>
                        <span className="text-secondary">
                            {formatNumberVN(qty, { decimals: 0 })} {'cp'}
                        </span>
                    </dd>
                </div>
                <div className="flex items-center gap-6">
                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                        {'Giá khớp/Giá đặt'}
                    </dt>
                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                        <span>{matchedPrice > 0 ? formatBoardPrice(matchedPrice) : '--'} / </span>
                        <span className="text-secondary">{formatBoardPrice(limitPrice)}</span>
                    </dd>
                </div>
                <div className="flex items-center gap-6">
                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">{'Giá trị lệnh'}</dt>
                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                        {formatNumberVN(orderValue, { trimTrailingZeros: true })}
                        {'đ'}
                    </dd>
                </div>
                {slice.placedAt && (
                    <div className="flex items-center gap-6">
                        <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                            {'Thời gian đặt'}
                        </dt>
                        <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                            {formatDateTime(slice.placedAt)}
                        </dd>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="flex flex-col">
            {slices.map((slice, index) => {
                const status = getSliceStatus(slice);

                return (
                    <div key={slice.id ?? `${slice.seq}-${index}`} className="flex flex-col">
                        <dl className="flex flex-col gap-3 py-4">
                            <div className="flex items-center gap-3">
                                <dt className="min-w-0 flex-1 font-body-3-highlight text-primary">
                                    {'Lệnh {index}'.replace(
                                        '{index}',
                                        String(slice.seq ?? index + 1),
                                    )}
                                </dt>
                                {status.text ? (
                                    <span
                                        className={`shrink-0 rounded-full border px-2 py-1 font-caption text-primary ${getOrderStatusBorder(status.tone)}`}
                                    >
                                        {status.text}
                                    </span>
                                ) : null}
                            </div>
                            {renderSliceRows(slice)}
                        </dl>
                        {index < slices.length - 1 && <div className="h-px w-full bg-quaternary" />}
                    </div>
                );
            })}
        </div>
    );
};
