import { INVESTOR_CSV_REQUIRED_COLS } from '@/constants/fund';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundInvestorStore } from '@/stores/fund/useFundInvestorStore';
import type { FundInvestorPreviewColKey } from '@/types/pages/fund';
import { formatNumberVNWithUnit } from '@/utils/format';
import type { RawInvestor } from '@/utils/fund/fund';
import { createFundInvestorPreviewColumns } from '@/utils/fund/fund';

const REQUIRED_INVESTOR_COL_SET = new Set<string>(INVESTOR_CSV_REQUIRED_COLS);

export const FundInvestorPreview = () => {
    const trans = useTranslate();
    const { parsedInvestors, existingIds, fileName, confirmImport, resetStore, error } =
        useFundInvestorStore();

    const validInvestors = parsedInvestors.filter(
        (r) => !r._invalidFields || r._invalidFields.length === 0,
    );
    const invalidCount = parsedInvestors.length - validInvestors.length;
    const canConfirm = validInvestors.length > 0;
    const newCount = validInvestors.filter((r) => !existingIds.has(r.ma_ndt)).length;
    const updateCount = validInvestors.length - newCount;

    const columns = createFundInvestorPreviewColumns(
        trans.fund.import.import_investor.preview.columns,
    );

    const renderCell = (row: RawInvestor, key: FundInvestorPreviewColKey) => {
        const isUpdate = existingIds.has(row.ma_ndt);
        switch (key) {
            case 'ma_ndt':
                return <span className="font-body-3-highlight text-primary">{row.ma_ndt}</span>;
            case 'ho_ten':
                return <span className="font-body-3 text-primary">{row.ho_ten}</span>;
            case 'so_dien_thoai':
                return <span className="font-caption text-secondary">{row.so_dien_thoai}</span>;
            case 'rm_phu_trach':
                return <span className="font-caption text-secondary">{row.rm_phu_trach}</span>;
            case 'von_uy_thac_vnd':
                return (
                    <span className="whitespace-nowrap font-body-3 tabular-nums text-primary">
                        {formatNumberVNWithUnit(row.von_uy_thac_vnd)}
                    </span>
                );
            case 'trang_thai':
                return (
                    <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-px font-tiny-highlight ${row.trang_thai === 'active' ? 'bg-success text-green' : 'bg-tertiary text-secondary'}`}
                    >
                        {trans.fund.investor.status[row.trang_thai]}
                    </span>
                );
            case 'thesis':
                return (
                    <span className="font-caption text-secondary">
                        {row.thesis.map((th) => `${th.sector} ${th.pct}%`).join(' · ')}
                    </span>
                );
            case '_action':
                return (
                    <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-px font-tiny-highlight ${isUpdate ? 'bg-orange/10 text-orange' : 'bg-success text-green'}`}
                    >
                        {isUpdate
                            ? trans.fund.import.import_investor.preview.update_rows
                            : trans.fund.import.import_investor.preview.new_rows}
                    </span>
                );
        }
    };

    const confirmInvestorImport = async () => {
        await confirmImport();
        if (useFundInvestorStore.getState().error) {
            toast.error(trans.fund.import.import_investor.errors.import_error);
        }
    };

    return (
        <section
            className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl bg-secondary"
            aria-label={trans.fund.import.import_investor.preview.title}
        >
            <aside className="flex w-80 shrink-0 flex-col gap-3 border-r border-tertiary p-3">
                <div className="flex flex-col gap-1">
                    <h2 className="font-heading-4 text-primary">
                        {trans.fund.import.import_investor.preview.title}
                    </h2>
                    <p className="font-body-3 text-secondary">
                        {trans.fund.import.import_investor.preview.description}
                    </p>
                </div>
                <dl className="flex flex-wrap gap-x-3 gap-y-2 [&>*]:w-[calc(50%-0.375rem)]">
                    {(
                        [
                            {
                                label: trans.fund.import.import_investor.preview.total_rows,
                                value: String(parsedInvestors.length),
                                cls: 'text-primary',
                            },
                            {
                                label: trans.fund.import.import_investor.preview.new_rows,
                                value: String(newCount),
                                cls: 'text-green',
                            },
                            {
                                label: trans.fund.import.import_investor.preview.update_rows,
                                value: String(updateCount),
                                cls: 'text-orange',
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
                        aria-label={trans.fund.import.import_investor.preview.title}
                    >
                        <thead className="sticky top-0 z-10 bg-secondary">
                            <tr className="border-b border-tertiary">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        className={`whitespace-nowrap px-3 py-2 font-caption-highlight text-tertiary ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                                    >
                                        {col.label}
                                        {REQUIRED_INVESTOR_COL_SET.has(col.key) && (
                                            <span aria-hidden="true" className="ml-0.5 text-red">
                                                *
                                            </span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {parsedInvestors.map((row, idx) => {
                                const isInvalid =
                                    !!row._invalidFields && row._invalidFields.length > 0;
                                return (
                                    <tr
                                        key={`${row.ma_ndt}-${idx}`}
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
                                                className={`whitespace-nowrap px-3 py-2 align-middle ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
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
                                ? trans.fund.import.import_investor.errors.invalid_rows_warning
                                : trans.fund.import.import_investor.errors.all_rows_invalid
                            ).replace('{count}', String(invalidCount))}
                        </p>
                    )}
                    {error && (
                        <p role="alert" className="font-body-3 text-red">
                            {trans.fund.import.import_investor.errors[
                                error as keyof typeof trans.fund.import.import_investor.errors
                            ] ?? error}
                        </p>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={resetStore}
                            className="flex items-center justify-center rounded-full bg-tertiary px-4 py-2 font-body-3-highlight text-primary"
                        >
                            {trans.fund.import.import_investor.preview.back}
                        </button>
                        <button
                            type="button"
                            onClick={confirmInvestorImport}
                            disabled={!canConfirm}
                            className={`flex items-center justify-center rounded-full px-4 py-2 font-body-3-highlight ${!canConfirm ? 'bg-disabled text-disabled' : 'bg-highlight text-quaternary'}`}
                        >
                            {trans.fund.import.import_investor.preview.confirm}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
