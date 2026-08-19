import { TRANSACTION_CSV_REQUIRED_COLS } from '@/constants/fund';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundTradeStore } from '@/stores/fund/useFundTradeStore';
import type { FundTradePreviewColKey } from '@/types/pages/fund';
import { formatNumberVN, formatNumberVNWithUnit } from '@/utils/format';
import type { RawTransaction } from '@/utils/fund/fund';
import { createFundTradePreviewColumns } from '@/utils/fund/fund';

const REQUIRED_TRADE_COL_SET = new Set<string>(TRANSACTION_CSV_REQUIRED_COLS);

export const FundTradePreview = () => {
    const trans = useTranslate();
    const { parsedRows, fileName, confirmImport, resetStore, error } = useFundTradeStore();

    const validRows = parsedRows.filter((r) => !r._invalidFields || r._invalidFields.length === 0);
    const invalidCount = parsedRows.length - validRows.length;
    const canConfirm = validRows.length > 0;
    const errorMsg =
        error && error !== 'all_rows_invalid'
            ? ((trans.fund.import.errors as Record<string, string>)[error] ??
              trans.fund.import.errors.import_error)
            : null;
    const ngay_gd = validRows[0]?.ngay_gd ?? parsedRows[0]?.ngay_gd ?? '—';

    const columns = createFundTradePreviewColumns(trans.fund.import.steps.preview.columns);

    const renderCell = (row: RawTransaction, key: FundTradePreviewColKey) => {
        switch (key) {
            case 'ma_gd':
                return <span className="font-caption text-secondary">{row.ma_gd}</span>;
            case 'ma_ndt':
                return <span className="font-body-3 text-primary">{row.ma_ndt}</span>;
            case 'loai_lenh':
                return <span className="font-caption text-primary">{row.loai_lenh}</span>;
            case 'ma_ck':
                return <span className="font-body-3-highlight text-primary">{row.ma_ck}</span>;
            case 'khoi_luong':
                return (
                    <span className="whitespace-nowrap font-body-3 tabular-nums text-primary">
                        {formatNumberVN(row.khoi_luong, { decimals: 0 })}
                    </span>
                );
            case 'gia_khop':
                return (
                    <span className="whitespace-nowrap font-body-3 tabular-nums text-primary">
                        {formatNumberVN(row.gia_khop)}
                    </span>
                );
            case 'tong_tien':
                return (
                    <span
                        className={`whitespace-nowrap font-body-3 tabular-nums ${row.tong_tien >= 0 ? 'text-green' : 'text-red'}`}
                    >
                        {formatNumberVNWithUnit(row.tong_tien)}
                    </span>
                );
        }
    };

    return (
        <section
            className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl bg-secondary"
            aria-label={trans.fund.import.steps.preview.title}
        >
            <aside className="flex w-80 shrink-0 flex-col gap-3 border-r border-tertiary p-3">
                <div className="flex flex-col gap-1">
                    <h2 className="font-heading-4 text-primary">
                        {trans.fund.import.steps.preview.title}
                    </h2>
                    <p className="font-body-3 text-secondary">
                        {trans.fund.import.steps.preview.description}
                    </p>
                </div>
                <dl className="flex flex-wrap gap-x-3 gap-y-2 [&>*]:w-[calc(50%-0.375rem)]">
                    {(
                        [
                            {
                                label: trans.fund.import.steps.preview.date,
                                value: ngay_gd,
                                cls: 'text-primary',
                            },
                            {
                                label: trans.fund.import.steps.preview.total_rows,
                                value: String(parsedRows.length),
                                cls: 'text-primary',
                            },
                        ] as const
                    ).map(({ label, value, cls }) => (
                        <div key={label} className="flex flex-col gap-1">
                            <dt className="font-caption text-tertiary">{label}</dt>
                            <dd className={`font-body-2-highlight ${cls}`}>{value}</dd>
                        </div>
                    ))}
                </dl>
                <p className="truncate font-caption text-tertiary" title={fileName}>
                    {fileName}
                </p>
            </aside>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="scrollbar min-h-0 min-w-0 flex-1 overflow-auto">
                    <table
                        className="w-full border-collapse"
                        aria-label={trans.fund.import.steps.preview.title}
                    >
                        <thead className="sticky top-0 z-10 bg-secondary">
                            <tr className="border-b border-tertiary">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        className={`whitespace-nowrap px-3 py-2 font-caption-highlight text-tertiary ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                                    >
                                        {col.label}
                                        {REQUIRED_TRADE_COL_SET.has(col.key) && (
                                            <span aria-hidden="true" className="ml-0.5 text-red">
                                                *
                                            </span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {parsedRows.map((row, idx) => {
                                const isInvalid =
                                    !!row._invalidFields && row._invalidFields.length > 0;
                                return (
                                    <tr
                                        key={`${row.ma_gd}-${idx}`}
                                        className={`border-b border-tertiary last:border-0 ${isInvalid ? 'bg-red/10' : ''}`}
                                        title={
                                            isInvalid
                                                ? `${trans.fund.import.invalid_row_label}: ${row._invalidFields!.join(', ')}`
                                                : undefined
                                        }
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={`whitespace-nowrap px-3 py-2 align-middle ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                                            >
                                                {renderCell(row, col.key)}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 border-t border-tertiary p-3">
                    {invalidCount > 0 && (
                        <p
                            role="alert"
                            className={`font-caption ${canConfirm ? 'text-orange' : 'text-red'}`}
                        >
                            {(canConfirm
                                ? trans.fund.import.errors.invalid_rows_warning
                                : trans.fund.import.errors.all_rows_invalid
                            ).replace('{count}', String(invalidCount))}
                        </p>
                    )}
                    {errorMsg && (
                        <p role="alert" className="font-caption text-red">
                            {errorMsg}
                        </p>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={resetStore}
                            className="flex items-center justify-center rounded-full bg-tertiary px-4 py-2 font-body-3-highlight text-primary"
                        >
                            {trans.fund.import.steps.preview.back}
                        </button>
                        <button
                            type="button"
                            onClick={confirmImport}
                            disabled={!canConfirm}
                            className={`flex items-center justify-center rounded-full px-4 py-2 font-body-3-highlight ${!canConfirm ? 'bg-disabled text-disabled' : 'bg-highlight text-quaternary'}`}
                        >
                            {trans.fund.import.steps.preview.confirm}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
