'use client';

import { Fragment } from 'react';

import { Dialog } from '@/components/common/ui/Dialog';
import type { PaperOrderBookItem } from '@/types/paper-trading/orders';
import { formatNumberVN } from '@/utils/format';
import { getPaperStatusView, resolvePaperOrderBookId } from '@/utils/paper-trading/order-book';
import { getOrderStatusColor } from '@/utils/trading/order-book';

type Props = {
    items: PaperOrderBookItem[];
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

    const renderRow = (item: PaperOrderBookItem) => {
        const status = getPaperStatusView(item.status, item.status_code);
        const timeText =
            item.txdate && item.txtime
                ? `${item.txdate} ${item.txtime.split('.')[0]}`
                : item.txdate || '--';
        const execPrice = item.execprice;

        return (
            <>
                <td className={`${CELL_CLASS} w-2/12`}>{timeText}</td>
                <td className={`${CELL_CLASS} w-1/12`}>{item.side}</td>
                <td className={`${CELL_CLASS} w-1/12`}>
                    {formatNumberVN(item.qtty, { decimals: 0 })}
                </td>
                <td className={`${CELL_CLASS} w-1/12`}>{formatNumberVN(item.price / 1000)}</td>
                <td className={`${CELL_CLASS} w-2/12`}>
                    {formatNumberVN(item.execqtty, { decimals: 0 })}
                </td>
                <td className={`${CELL_CLASS} w-2/12`}>
                    {execPrice != null && execPrice > 0
                        ? formatNumberVN(execPrice / 1000)
                        : '--'}
                </td>
                <td className={`${CELL_CLASS} w-1/12`}>
                    {formatNumberVN(item.remainqtty, { decimals: 0 })}
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
                            <Fragment key={resolvePaperOrderBookId(item) || index}>
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
