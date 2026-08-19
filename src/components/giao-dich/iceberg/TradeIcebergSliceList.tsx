'use client';

import { useTranslate } from '@/hooks/useTranslate';
import type { IcebergSliceDto } from '@/types/trade/iceberg-orders';
import { formatBoardPrice, formatNumberVN } from '@/utils/format';
import { getIcebergSliceStatus, getOrderStatusBorder } from '@/utils/trading/order-book';

type Props = {
    slices: IcebergSliceDto[];
    limitPrice: number;
    matchedPrice: number | null;
};

export const TradeIcebergSliceList = ({ slices, limitPrice, matchedPrice }: Props) => {
    const trans = useTranslate();
    const detailTrans = trans.trading.iceberg_detail;

    const getSliceStatus = (slice: IcebergSliceDto) =>
        getIcebergSliceStatus(trans, slice.order_status, slice.matched_quantity, slice.quantity);

    const getSliceMatchedPrice = (slice: IcebergSliceDto) => {
        if (slice.matched_price > 0) return slice.matched_price;
        if (matchedPrice != null && matchedPrice > 0) return matchedPrice;
        return 0;
    };

    const renderUnmatchedRows = (slice: IcebergSliceDto) => {
        const orderValue = limitPrice * slice.quantity;

        return (
            <>
                <div className="flex items-center gap-6 font-body-3 text-secondary">
                    <dt className="min-w-0 flex-1">{detailTrans.slice_qty}</dt>
                    <dd className="shrink-0 whitespace-nowrap font-body-3-highlight">
                        {formatNumberVN(slice.quantity, { decimals: 0 })} {detailTrans.unit}
                    </dd>
                </div>
                <div className="flex items-center gap-6 font-body-3 text-secondary">
                    <dt className="min-w-0 flex-1">{detailTrans.slice_price_placed}</dt>
                    <dd className="shrink-0 whitespace-nowrap font-body-3-highlight">
                        {formatBoardPrice(limitPrice)}
                    </dd>
                </div>
                <div className="flex items-center gap-6 font-body-3 text-secondary">
                    <dt className="min-w-0 flex-1">{detailTrans.slice_value}</dt>
                    <dd className="shrink-0 whitespace-nowrap font-body-3-highlight">
                        {formatNumberVN(orderValue, { trimTrailingZeros: true })}
                        {trans.trading.currency.suffix}
                    </dd>
                </div>
            </>
        );
    };

    const renderMatchedRows = (slice: IcebergSliceDto) => {
        const sliceMatchedPrice = getSliceMatchedPrice(slice);
        const orderValue = (sliceMatchedPrice || limitPrice) * slice.quantity;

        return (
            <>
                <div className="flex items-center gap-6">
                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                        {detailTrans.slice_qty_matched}
                    </dt>
                    <dd className="shrink-0 whitespace-nowrap font-body-3-highlight text-primary">
                        <span>{formatNumberVN(slice.matched_quantity, { decimals: 0 })} / </span>
                        <span className="text-secondary">
                            {formatNumberVN(slice.quantity, { decimals: 0 })} {detailTrans.unit}
                        </span>
                    </dd>
                </div>
                <div className="flex items-center gap-6">
                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                        {detailTrans.slice_price_matched}
                    </dt>
                    <dd className="shrink-0 whitespace-nowrap font-body-3-highlight text-primary">
                        <span>{formatBoardPrice(sliceMatchedPrice)} / </span>
                        <span className="text-secondary">{formatBoardPrice(limitPrice)}</span>
                    </dd>
                </div>
                <div className="flex items-center gap-6">
                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                        {detailTrans.slice_value}
                    </dt>
                    <dd className="shrink-0 whitespace-nowrap font-body-3-highlight text-primary">
                        {formatNumberVN(orderValue, { trimTrailingZeros: true })}
                        {trans.trading.currency.suffix}
                    </dd>
                </div>
            </>
        );
    };

    return (
        <div className="flex flex-col">
            {slices.map((slice, index) => {
                const isUnmatched = slice.order_status === 'PENDING';
                const status = getSliceStatus(slice);

                return (
                    <div key={slice.id} className="flex flex-col">
                        <dl className="flex flex-col gap-3 py-4">
                            <div className="flex items-center gap-3">
                                <dt className="min-w-0 flex-1 font-body-3-highlight text-primary">
                                    {detailTrans.child_title.replace(
                                        '{index}',
                                        String(slice.slice_index + 1),
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
                            {isUnmatched ? renderUnmatchedRows(slice) : renderMatchedRows(slice)}
                        </dl>
                        {index < slices.length - 1 && <div className="h-px w-full bg-quaternary" />}
                    </div>
                );
            })}
        </div>
    );
};
