import { type ColumnDef } from '@tanstack/react-table';

import { SortableHeader } from '@/components/common/table/SortableHeader';
import { ASSETS_TRADE_HISTORY, ORDER_STATUS_MAP } from '@/constants/assets';
import type { SortableColMeta } from '@/types/pages/common';
import type { CashAdvance, OrderHistory } from '@/types/trade/history';
import type { Loans } from '@/types/trade/loans';
import { formatOrderSide } from '@/utils/assets';
import { formatDateOrDash, formatNumberVN, formatPercentVN } from '@/utils/format';

const ASSETS_ORDER_STATUS = {
    sent: 'Đã gửi',
    matched_all: 'Thành công',
    completed: 'Thành công',
    matched: 'Đang khớp',
    waiting_to_send: 'Chờ gửi',
    sending: 'Đang gửi',
    fixed: 'Đã sửa',
    fixing: 'Đang sửa',
    cancelled: 'Đã hủy',
    expired: 'Hết hiệu lực',
    rejecting: 'Từ chối',
};

const renderOrderStatus = (status: string) => {
    const statusInfo = ORDER_STATUS_MAP[status];
    const labelKey = statusInfo?.labelKey;
    const label =
        labelKey != null
            ? ASSETS_ORDER_STATUS[labelKey as keyof typeof ASSETS_ORDER_STATUS]
            : status;
    const type = statusInfo?.type ?? 'warning';
    const colorClass =
        type === 'success' ? 'text-green' : type === 'error' ? 'text-red' : 'text-yellow';
    return (
        <span
            className={`inline-flex items-center justify-center whitespace-nowrap font-body-3 ${colorClass}`}
        >
            {label}
        </span>
    );
};

export const getOrderHistoryColumns = (): ColumnDef<OrderHistory, unknown>[] => {
    const t = ASSETS_TRADE_HISTORY;

    return [
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
            id: 'order_id',
            accessorKey: 'order_id',
            header: ({ column }) => (
                <SortableHeader label={'Số hiệu lệnh'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
        },
        {
            id: 'tx_date',
            accessorKey: 'tx_date',
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
            cell: ({ getValue }) => formatOrderSide(getValue<string>()),
        },
        {
            id: 'orderType',
            accessorKey: 'orderType',
            header: ({ column }) => (
                <SortableHeader label={'Loại lệnh'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
        },
        {
            id: 'exec_price',
            accessorKey: 'exec_price',
            header: ({ column }) => (
                <SortableHeader label={'Giá khớp'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>()),
        },
        {
            id: 'exec_qtty',
            accessorKey: 'exec_qtty',
            header: ({ column }) => (
                <SortableHeader label={'KL khớp/đặt'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ row }) =>
                `${formatNumberVN(row.original.exec_qtty, { decimals: 0 })}/${formatNumberVN(row.original.order_qtty, { decimals: 0 })}`,
        },
        {
            id: 'tax_amt',
            accessorKey: 'tax_amt',
            header: ({ column }) => <SortableHeader label={'Thuế'} column={column} align="right" />,
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'fee_amt',
            accessorKey: 'fee_amt',
            header: ({ column }) => <SortableHeader label={'Phí'} column={column} align="right" />,
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: ({ column }) => (
                <SortableHeader label={'Trạng thái'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => renderOrderStatus(getValue<string>()),
        },
    ];
};

export const getCashAdvanceColumns = (): ColumnDef<CashAdvance, unknown>[] => {
    const t = ASSETS_TRADE_HISTORY;

    return [
        {
            id: 'order_date',
            accessorKey: 'order_date',
            header: ({ column }) => (
                <SortableHeader label={'Ngày bán'} column={column} align="left" />
            ),
            meta: { align: 'left' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
        },
        {
            id: 'tx_date',
            accessorKey: 'tx_date',
            header: ({ column }) => (
                <SortableHeader label={'Ngày ứng'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
        },
        {
            id: 'clear_date',
            accessorKey: 'clear_date',
            header: ({ column }) => (
                <SortableHeader label={'Ngày thanh toán'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
        },
        {
            id: 'advanced_days',
            accessorKey: 'advanced_days',
            header: ({ column }) => (
                <SortableHeader label={'Số ngày ứng'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
        },
        {
            id: 'amt',
            accessorKey: 'amt',
            header: ({ column }) => (
                <SortableHeader label={'Tiền bán'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'advanced_amt',
            accessorKey: 'advanced_amt',
            header: ({ column }) => (
                <SortableHeader label={'Tiền ứng'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'fee_amt',
            accessorKey: 'fee_amt',
            header: ({ column }) => (
                <SortableHeader label={'Phí ứng'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'receive_amt',
            accessorKey: 'receive_amt',
            header: ({ column }) => (
                <SortableHeader label={'Tiền ứng thực nhận'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
    ];
};

export const getLoansColumns = (): ColumnDef<Loans, unknown>[] => {
    const t = ASSETS_TRADE_HISTORY;

    return [
        {
            id: 'release_date',
            accessorKey: 'release_date',
            header: ({ column }) => (
                <SortableHeader label={'Ngày giải ngân'} column={column} align="left" />
            ),
            meta: { align: 'left' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
        },
        {
            id: 'overdue_date',
            accessorKey: 'overdue_date',
            header: ({ column }) => (
                <SortableHeader label={'Ngày đáo hạn'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
        },
        {
            id: 'principal_loan',
            accessorKey: 'principal_loan',
            header: ({ column }) => (
                <SortableHeader label={'Nợ gốc'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'principal_paid',
            accessorKey: 'principal_paid',
            header: ({ column }) => (
                <SortableHeader label={'Đã trả'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'principal_remaining',
            accessorKey: 'principal_remaining',
            header: ({ column }) => (
                <SortableHeader label={'Nợ gốc còn lại'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'interest_rate',
            accessorKey: 'interest_rate',
            header: ({ column }) => (
                <SortableHeader label={'Lãi suất'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatPercentVN(getValue<number>()),
        },
        {
            id: 'interest_loan',
            accessorKey: 'interest_loan',
            header: ({ column }) => (
                <SortableHeader label={'Nợ lãi'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'interest_paid',
            accessorKey: 'interest_paid',
            header: ({ column }) => (
                <SortableHeader label={'Lãi đã trả'} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
    ];
};
