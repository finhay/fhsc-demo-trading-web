import { type ColumnDef } from '@tanstack/react-table';

import { SortableHeader } from '@/components/common/table/SortableHeader';
import { PAPER_ORDER_SIDE } from '@/constants/paper-trading';
import type { SortableColMeta } from '@/types/pages/common';
import type { PaperOrder } from '@/types/paper-trading/orders';
import { formatDateOrDash, formatNumberVN } from '@/utils/format';
import { getPaperOrderStatus } from '@/utils/paper-trading/order-book';
import { getOrderStatusColor } from '@/utils/trading/order-book';

const renderOrderStatus = (order: PaperOrder) => {
    const status = getPaperOrderStatus(order);
    return (
        <span
            className={`inline-flex items-center justify-center whitespace-nowrap font-body-3 ${getOrderStatusColor(status.tone)}`}
        >
            {status.text}
        </span>
    );
};

export const getPaperOrderHistoryColumns = (): ColumnDef<PaperOrder, unknown>[] => [
    {
        id: 'symbol',
        accessorKey: 'symbol',
        header: ({ column }) => <SortableHeader label={'Mã'} column={column} align="left" />,
        meta: { align: 'left' } satisfies SortableColMeta,
        cell: ({ getValue }) => (
            <span className="font-body-3-highlight text-primary">{getValue<string>()}</span>
        ),
    },
    {
        id: 'id',
        accessorKey: 'id',
        header: ({ column }) => (
            <SortableHeader label={'Số hiệu lệnh'} column={column} align="right" />
        ),
        meta: { align: 'right' } satisfies SortableColMeta,
    },
    {
        id: 'created_date',
        accessorKey: 'created_date',
        header: ({ column }) => <SortableHeader label={'Ngày'} column={column} align="right" />,
        meta: { align: 'right' } satisfies SortableColMeta,
        cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
    },
    {
        id: 'side',
        accessorKey: 'side',
        header: ({ column }) => (
            <SortableHeader label={'Loại giao dịch'} column={column} align="right" />
        ),
        meta: { align: 'right' } satisfies SortableColMeta,
        cell: ({ getValue }) => (getValue<string>() === PAPER_ORDER_SIDE.BUY ? 'Mua' : 'Bán'),
    },
    {
        id: 'type',
        accessorKey: 'type',
        header: ({ column }) => (
            <SortableHeader label={'Loại lệnh'} column={column} align="right" />
        ),
        meta: { align: 'right' } satisfies SortableColMeta,
    },
    {
        id: 'price',
        accessorKey: 'price',
        header: ({ column }) => <SortableHeader label={'Giá đặt'} column={column} align="right" />,
        meta: { align: 'right' } satisfies SortableColMeta,
        cell: ({ getValue }) => formatNumberVN((getValue<number>() ?? 0) / 1000),
    },
    {
        id: 'fill_quantity',
        accessorKey: 'fill_quantity',
        header: ({ column }) => (
            <SortableHeader label={'KL khớp/đặt'} column={column} align="right" />
        ),
        meta: { align: 'right' } satisfies SortableColMeta,
        cell: ({ row }) =>
            `${formatNumberVN(row.original.fill_quantity ?? 0, { decimals: 0 })}/${formatNumberVN(
                row.original.quantity ?? 0,
                { decimals: 0 },
            )}`,
    },
    {
        id: 'fee_amount',
        accessorKey: 'fee_amount',
        header: ({ column }) => <SortableHeader label={'Phí'} column={column} align="right" />,
        meta: { align: 'right' } satisfies SortableColMeta,
        cell: ({ getValue }) =>
            formatNumberVN(getValue<number>() ?? 0, { trimTrailingZeros: true }),
    },
    {
        id: 'order_status',
        accessorKey: 'order_status',
        header: ({ column }) => (
            <SortableHeader label={'Trạng thái'} column={column} align="right" />
        ),
        meta: { align: 'right' } satisfies SortableColMeta,
        cell: ({ row }) => renderOrderStatus(row.original),
    },
];
