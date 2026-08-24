'use client';

import { Fragment } from 'react';

import { Dialog } from '@/components/common/ui/Dialog';
import type { PaperOrder } from '@/types/paper-trading/orders';
import { formatDateTime, formatNumberVN } from '@/utils/format';
import { getPaperOrderStatus } from '@/utils/paper-trading/order-book';
import { getOrderStatusColor } from '@/utils/trading/order-book';

type Props = {
    items: PaperOrder[];
    onClose: () => void;
};

const CELL_CLASS = 'py-0 font-caption text-secondary whitespace-nowrap';

export const TradeDetailOrderModal = ({ items, onClose }: Props) => {
    const columns = [
        {
            key: 'time',
            label: 'Thời gian',
            align: 'left' as const,
            width: 'w-2/12',
        },
        {
            key: 'orderType',
            label: 'Loại lệnh',
            align: 'left' as const,
            width: 'w-1/12',
        },
        {
            key: 'placedQty',
            label: 'KL đặt',
            align: 'left' as const,
            width: 'w-1/12',
        },
        {
            key: 'price',
            label: 'Giá đặt',
            align: 'left' as const,
            width: 'w-1/12',
        },
        {
            key: 'matchedQty',
            label: 'KL khớp',
            align: 'left' as const,
            width: 'w-2/12',
        },
        {
            key: 'avgMatchedPrice',
            label: 'Giá khớp TB',
            align: 'left' as const,
            width: 'w-2/12',
        },
        {
            key: 'remainingQty',
            label: 'KL còn lại',
            align: 'left' as const,
            width: 'w-1/12',
        },
        {
            key: 'status',
            label: 'Trạng thái',
            align: 'right' as const,
            width: 'w-2/12',
        },
    ];

    const renderRow = (item: PaperOrder) => {
        const status = getPaperOrderStatus(item);
        const timeText = item.created_date ? formatDateTime(item.created_date) : '--';

        return (
            <>
                <td className={`${CELL_CLASS} w-2/12`}>{timeText}</td>
                <td className={`${CELL_CLASS} w-1/12`}>{item.type}</td>
                <td className={`${CELL_CLASS} w-1/12`}>
                    {formatNumberVN(item.quantity, { decimals: 0 })}
                </td>
                <td className={`${CELL_CLASS} w-1/12`}>{formatNumberVN(item.price / 1000)}</td>
                <td className={`${CELL_CLASS} w-2/12`}>
                    {formatNumberVN(item.fill_quantity, { decimals: 0 })}
                </td>
                {/* API paper không trả giá khớp trung bình */}
                <td className={`${CELL_CLASS} w-2/12`}>{'--'}</td>
                <td className={`${CELL_CLASS} w-1/12`}>
                    {formatNumberVN(item.leave_quantity, { decimals: 0 })}
                </td>
                <td className="w-2/12 py-0 font-caption whitespace-nowrap text-right">
                    <span className={getOrderStatusColor(status.tone)}>{status.text}</span>
                </td>
            </>
        );
    };

    return (
        <Dialog
            title={'Chi tiết lệnh'}
            maxWidth="max-w-4xl"
            maxHeight="max-h-screen"
            onClose={onClose}
        >
            <div className="scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-auto">
                <table className="w-full table-fixed border-separate border-spacing-y-3">
                    <thead>
                        <tr>
                            {columns.map(({ key, label, align, width }) => (
                                <th
                                    key={key}
                                    className={`pb-0 font-caption text-primary whitespace-nowrap ${width} ${
                                        align === 'right' ? 'text-right' : 'text-left'
                                    }`}
                                >
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <Fragment key={item.id || index}>
                                {index > 0 && (
                                    <tr aria-hidden>
                                        <td colSpan={columns.length} className="p-0">
                                            <div className="h-px w-full bg-tertiary" />
                                        </td>
                                    </tr>
                                )}
                                <tr>{renderRow(item)}</tr>
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </Dialog>
    );
};
