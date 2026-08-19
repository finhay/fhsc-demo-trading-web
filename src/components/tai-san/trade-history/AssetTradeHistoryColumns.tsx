import { type ColumnDef } from '@tanstack/react-table';

import { SortableHeader } from '@/components/common/table/SortableHeader';
import { ORDER_STATUS_MAP } from '@/constants/assets';
import type { useTranslate } from '@/hooks/useTranslate';
import type { SortableColMeta } from '@/types/pages/common';
import type { CashAdvance, OrderHistory } from '@/types/trade/history';
import type { Loans } from '@/types/trade/loans';
import { formatOrderSide } from '@/utils/assets';
import { formatDateOrDash, formatNumberVN, formatPercentVN } from '@/utils/format';

type Trans = ReturnType<typeof useTranslate>;

const renderOrderStatus = (trans: Trans, status: string) => {
    const statusInfo = ORDER_STATUS_MAP[status];
    const labelKey = statusInfo?.labelKey;
    const label =
        labelKey != null
            ? trans.assets.order_status[labelKey as keyof typeof trans.assets.order_status]
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

export const getOrderHistoryColumns = (trans: Trans): ColumnDef<OrderHistory, unknown>[] => {
    const t = trans.assets.trade_history;

    return [
        {
            id: 'symbol',
            accessorKey: 'symbol',
            header: ({ column }) => (
                <SortableHeader label={t.col_symbol} column={column} align="left" />
            ),
            meta: { align: 'left' } satisfies SortableColMeta,
            cell: ({ getValue }) => (
                <span className="font-body-3-highlight text-primary">{getValue<string>()}</span>
            ),
        },
        {
            id: 'order_id',
            accessorKey: 'order_id',
            header: ({ column }) => (
                <SortableHeader label={t.col_order_id} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
        },
        {
            id: 'tx_date',
            accessorKey: 'tx_date',
            header: ({ column }) => (
                <SortableHeader label={t.col_date} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
        },
        {
            id: 'side',
            accessorKey: 'side',
            header: ({ column }) => (
                <SortableHeader label={t.col_trade_type} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatOrderSide(getValue<string>()),
        },
        {
            id: 'orderType',
            accessorKey: 'orderType',
            header: ({ column }) => (
                <SortableHeader label={t.col_order_type} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
        },
        {
            id: 'exec_price',
            accessorKey: 'exec_price',
            header: ({ column }) => (
                <SortableHeader label={t.col_match_price} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>()),
        },
        {
            id: 'exec_qtty',
            accessorKey: 'exec_qtty',
            header: ({ column }) => (
                <SortableHeader label={t.col_match_vol} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ row }) =>
                `${formatNumberVN(row.original.exec_qtty, { decimals: 0 })}/${formatNumberVN(row.original.order_qtty, { decimals: 0 })}`,
        },
        {
            id: 'tax_amt',
            accessorKey: 'tax_amt',
            header: ({ column }) => (
                <SortableHeader label={t.col_tax} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'fee_amt',
            accessorKey: 'fee_amt',
            header: ({ column }) => (
                <SortableHeader label={t.col_fee} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: ({ column }) => (
                <SortableHeader label={t.col_status} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => renderOrderStatus(trans, getValue<string>()),
        },
    ];
};

export const getCashAdvanceColumns = (trans: Trans): ColumnDef<CashAdvance, unknown>[] => {
    const t = trans.assets.trade_history;

    return [
        {
            id: 'order_date',
            accessorKey: 'order_date',
            header: ({ column }) => (
                <SortableHeader label={t.col_sell_date} column={column} align="left" />
            ),
            meta: { align: 'left' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
        },
        {
            id: 'tx_date',
            accessorKey: 'tx_date',
            header: ({ column }) => (
                <SortableHeader label={t.col_advance_date} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
        },
        {
            id: 'clear_date',
            accessorKey: 'clear_date',
            header: ({ column }) => (
                <SortableHeader label={t.col_payment_date} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
        },
        {
            id: 'advanced_days',
            accessorKey: 'advanced_days',
            header: ({ column }) => (
                <SortableHeader label={t.col_advance_days} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
        },
        {
            id: 'amt',
            accessorKey: 'amt',
            header: ({ column }) => (
                <SortableHeader label={t.col_sell_amount} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'advanced_amt',
            accessorKey: 'advanced_amt',
            header: ({ column }) => (
                <SortableHeader label={t.col_advance_amount} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'fee_amt',
            accessorKey: 'fee_amt',
            header: ({ column }) => (
                <SortableHeader label={t.col_advance_fee} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'receive_amt',
            accessorKey: 'receive_amt',
            header: ({ column }) => (
                <SortableHeader label={t.col_advance_received} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
    ];
};

export const getLoansColumns = (trans: Trans): ColumnDef<Loans, unknown>[] => {
    const t = trans.assets.trade_history;

    return [
        {
            id: 'release_date',
            accessorKey: 'release_date',
            header: ({ column }) => (
                <SortableHeader label={t.col_disbursement_date} column={column} align="left" />
            ),
            meta: { align: 'left' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
        },
        {
            id: 'overdue_date',
            accessorKey: 'overdue_date',
            header: ({ column }) => (
                <SortableHeader label={t.col_due_date} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatDateOrDash(getValue<string>()),
        },
        {
            id: 'principal_loan',
            accessorKey: 'principal_loan',
            header: ({ column }) => (
                <SortableHeader label={t.col_principal} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'principal_paid',
            accessorKey: 'principal_paid',
            header: ({ column }) => (
                <SortableHeader label={t.col_paid} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'principal_remaining',
            accessorKey: 'principal_remaining',
            header: ({ column }) => (
                <SortableHeader label={t.col_remaining} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'interest_rate',
            accessorKey: 'interest_rate',
            header: ({ column }) => (
                <SortableHeader label={t.col_interest_rate} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatPercentVN(getValue<number>()),
        },
        {
            id: 'interest_loan',
            accessorKey: 'interest_loan',
            header: ({ column }) => (
                <SortableHeader label={t.col_interest_debt} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
        {
            id: 'interest_paid',
            accessorKey: 'interest_paid',
            header: ({ column }) => (
                <SortableHeader label={t.col_interest_paid} column={column} align="right" />
            ),
            meta: { align: 'right' } satisfies SortableColMeta,
            cell: ({ getValue }) => formatNumberVN(getValue<number>(), { trimTrailingZeros: true }),
        },
    ];
};
