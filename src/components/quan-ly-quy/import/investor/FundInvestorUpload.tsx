import { useForm } from '@tanstack/react-form';

import { useEffect, useRef, useState } from 'react';

import { FaFileArrowUp, FaTrash } from 'react-icons/fa6';

import { FundDropdown } from '@/components/quan-ly-quy/common/FundDropdown';
import { FundImportCombobox } from '@/components/quan-ly-quy/import/FundImportCombobox';
import { FundImportFormField } from '@/components/quan-ly-quy/import/FundImportFormField';
import { FundImportRadio } from '@/components/quan-ly-quy/import/FundImportRadio';
import {
    FUND_FORM_DATE_CLS,
    FUND_FORM_INPUT_CLS,
    FUND_IMPORT_ACCEPT,
    FUND_THESIS_TOTAL_EPSILON,
} from '@/constants/fund';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { useFundInvestorStore } from '@/stores/fund/useFundInvestorStore';
import type { FundInvestorThesisRow, FundInvestorUploadFormValues } from '@/types/pages/fund';
import {
    type InvestorFieldConfig,
    buildSectorSuggestions,
    createInvestorFieldConfigs,
    isSupportedFundImportFile,
} from '@/utils/fund/fund';

type Props = { prefillSource?: 'file' | 'manual' };

export const FundInvestorUpload = ({ prefillSource = 'file' }: Props) => {
    const trans = useTranslate();
    const { investorRows, holdings } = useFundDataStore();
    const { parseFile, createManualInvestor, error, investorDraft, setInvestorDraft } =
        useFundInvestorStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const [source, setSource] = useState<'file' | 'manual'>(prefillSource);
    const [isDragging, setIsDragging] = useState(false);
    const [thesis, setThesis] = useState<FundInvestorThesisRow[]>(
        investorDraft?.thesis ?? [{ sector: '', pct: '' }],
    );
    const [thesisError, setThesisError] = useState<string | null>(null);
    const thesisRef = useRef(thesis);
    thesisRef.current = thesis;

    const form = useForm({
        defaultValues: {
            ma_ndt: investorDraft?.ma_ndt ?? '',
            ho_ten: investorDraft?.ho_ten ?? '',
            so_dien_thoai: investorDraft?.so_dien_thoai ?? '',
            ngay_uy_thac: investorDraft?.ngay_uy_thac ?? new Date().toISOString().slice(0, 10),
            rm_phu_trach: investorDraft?.rm_phu_trach ?? '',
            rm_id: investorDraft?.rm_id ?? '',
            von_uy_thac_vnd: investorDraft?.von_uy_thac_vnd ?? '',
            trang_thai: (investorDraft?.trang_thai ?? 'active') as 'active' | 'watch',
        },
        onSubmit: async ({ value }) => {
            const validThesis = thesisRef.current.filter(
                (x) => x.sector.trim() && Number(x.pct) > 0,
            );
            if (validThesis.length === 0) {
                setThesisError(trans.fund.import.import_investor.upload.manual.errors.required);
                return;
            }
            const total = validThesis.reduce((sum, x) => sum + Number(x.pct), 0);
            if (Math.abs(total - 100) > FUND_THESIS_TOTAL_EPSILON) {
                toast.error(trans.fund.import.import_investor.upload.manual.errors.thesis_total);
                return;
            }
            setThesisError(null);
            await createManualInvestor({
                ma_ndt: value.ma_ndt.trim().toUpperCase(),
                ho_ten: value.ho_ten.trim(),
                so_dien_thoai: value.so_dien_thoai.trim(),
                ngay_uy_thac: value.ngay_uy_thac,
                rm_phu_trach: value.rm_phu_trach.trim(),
                rm_id: value.rm_id.trim(),
                von_uy_thac_vnd: Number(value.von_uy_thac_vnd),
                trang_thai: value.trang_thai,
                thesis: validThesis.map((x) => ({
                    sector: x.sector.trim(),
                    pct: Number(x.pct),
                })),
            });
        },
    });

    const FIELD_CONFIGS = createInvestorFieldConfigs(
        trans.fund.import.import_investor.upload.manual,
        trans.fund.import.import_investor.upload.manual.errors,
    );

    const totalPct = thesis.reduce((sum, row) => sum + (Number(row.pct) || 0), 0);
    const hasAnyThesis = thesis.some((x) => x.sector.trim() && Number(x.pct) > 0);
    const isThesisValid = !hasAnyThesis || Math.abs(totalPct - 100) <= FUND_THESIS_TOTAL_EPSILON;
    const sectorSuggestions = buildSectorSuggestions(investorRows, holdings);

    const uploadCsvFile = async (file: File) => {
        if (!isSupportedFundImportFile(file.name)) {
            toast.error(trans.fund.import.import_investor.errors.invalid_file);
            return;
        }
        await parseFile(file);
    };

    const updateThesis = (idx: number, key: keyof FundInvestorThesisRow, value: string) => {
        setThesisError(null);
        setThesis((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
    };

    const renderField = (cfg: InvestorFieldConfig) => (
        <form.Field
            key={cfg.name}
            name={cfg.name}
            validators={
                cfg.validate
                    ? {
                          onChange: ({ value }) => cfg.validate!(String(value)),
                          onSubmit: ({ value }) => cfg.validate!(String(value)),
                      }
                    : undefined
            }
        >
            {(field) => (
                <FundImportFormField
                    label={cfg.label}
                    required={cfg.required}
                    error={field.state.meta.errors[0]}
                >
                    <input
                        type={cfg.type ?? 'text'}
                        min={cfg.min}
                        value={String(field.state.value)}
                        onChange={(e) =>
                            field.handleChange(
                                e.target.value as FundInvestorUploadFormValues[typeof cfg.name],
                            )
                        }
                        onBlur={field.handleBlur}
                        placeholder={cfg.placeholder}
                        className={cfg.type === 'date' ? FUND_FORM_DATE_CLS : FUND_FORM_INPUT_CLS}
                    />
                </FundImportFormField>
            )}
        </form.Field>
    );

    useEffect(() => {
        return () => {
            const { step } = useFundInvestorStore.getState();
            if (step === 'upload') {
                setInvestorDraft({ ...form.state.values, thesis });
            } else {
                setInvestorDraft(null);
            }
        };
    }, [thesis]);

    useEffect(() => {
        setSource(prefillSource);
    }, [prefillSource]);

    useEffect(() => {
        if (!error) return;
        toast.error(
            trans.fund.import.import_investor.errors[
                error as keyof typeof trans.fund.import.import_investor.errors
            ] ?? error,
        );
    }, [error]);

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 rounded-xl bg-secondary p-5">
            {source === 'file' && (
                <div
                    className="flex shrink-0 flex-col gap-2"
                    role="radiogroup"
                    aria-label={trans.fund.import.import_investor.upload.sources.file_title}
                >
                    <FundImportRadio
                        selected
                        onClick={() => setSource('file')}
                        title={trans.fund.import.import_investor.upload.sources.file_title}
                        sub={trans.fund.import.import_investor.upload.sources.file_subtitle}
                    />
                    <FundImportRadio
                        selected={false}
                        onClick={() => setSource('manual')}
                        title={trans.fund.import.import_investor.upload.sources.manual_title}
                        sub={trans.fund.import.import_investor.upload.sources.manual_subtitle}
                    />
                </div>
            )}
            {source === 'file' ? (
                <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) uploadCsvFile(f);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => inputRef.current?.click()}
                    className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-7 text-center transition-all ${
                        isDragging
                            ? 'border-highlight/50 bg-success'
                            : 'border-quaternary bg-quaternary/20 hover:border-highlight/40 hover:bg-success'
                    }`}
                >
                    <FaFileArrowUp size={28} className="text-highlight" aria-hidden="true" />
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                            <p className="font-body-3-highlight text-primary">
                                {trans.fund.import.import_investor.upload.choose_file}
                            </p>
                            <p className="font-caption text-secondary">
                                {trans.fund.import.import_investor.upload.drag_drop}
                            </p>
                        </div>
                        <p className="font-caption text-tertiary">
                            {trans.fund.import.import_investor.upload.file_format}
                        </p>
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden"
                >
                    <div className="flex min-h-0 flex-1 gap-3 overflow-hidden [&>*]:min-w-0 [&>*]:flex-1">
                        <fieldset className="scrollbar flex flex-col gap-2 overflow-y-auto rounded-xl bg-quaternary/25 p-4">
                            <legend className="sr-only">
                                {trans.fund.import.import_investor.upload.manual.submit}
                            </legend>
                            {FIELD_CONFIGS.map(renderField)}
                            <form.Field name="trang_thai">
                                {(field) => (
                                    <FundImportFormField
                                        label={
                                            trans.fund.import.import_investor.upload.manual
                                                .trang_thai
                                        }
                                        required
                                    >
                                        <FundDropdown
                                            options={[
                                                {
                                                    value: 'active',
                                                    label: trans.fund.investor.status.active,
                                                },
                                                {
                                                    value: 'watch',
                                                    label: trans.fund.investor.status.watch,
                                                },
                                            ]}
                                            value={field.state.value}
                                            onChange={(v) =>
                                                field.handleChange(v as 'active' | 'watch')
                                            }
                                            allLabel={
                                                trans.fund.import.import_investor.upload.manual
                                                    .trang_thai
                                            }
                                        />
                                    </FundImportFormField>
                                )}
                            </form.Field>
                        </fieldset>
                        <fieldset className="scrollbar flex flex-col gap-3 overflow-y-auto rounded-xl bg-quaternary/25 p-4">
                            <div className="flex flex-col gap-1">
                                <span className="inline-flex items-baseline gap-1 font-body-3-highlight text-primary">
                                    <span>
                                        {
                                            trans.fund.import.import_investor.upload.manual
                                                .thesis_title
                                        }
                                    </span>
                                    <span aria-hidden="true" className="text-red">
                                        *
                                    </span>
                                </span>
                                <span className="font-caption text-secondary">
                                    {trans.fund.import.import_investor.upload.manual.thesis_hint}
                                </span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {thesis.map((row, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="min-w-0">
                                            <FundImportCombobox
                                                value={row.sector}
                                                options={sectorSuggestions}
                                                onChange={(value: string) =>
                                                    updateThesis(idx, 'sector', value)
                                                }
                                                placeholder={
                                                    trans.fund.import.import_investor.upload.manual
                                                        .thesis_sector
                                                }
                                                inputClassName={`min-w-0 ${FUND_FORM_INPUT_CLS}`}
                                                ariaLabel={
                                                    trans.fund.import.thesis_sector_list_aria
                                                }
                                            />
                                        </div>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={row.pct}
                                            onChange={(e) =>
                                                updateThesis(idx, 'pct', e.target.value)
                                            }
                                            placeholder="%"
                                            className={`min-w-20 flex-1 ${FUND_FORM_INPUT_CLS}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setThesis((p) => p.filter((_, i) => i !== idx))
                                            }
                                            className="shrink-0 rounded-xl border border-red/35 p-2 text-red transition-colors hover:bg-red/10 disabled:opacity-40"
                                            disabled={thesis.length <= 1}
                                            aria-label={trans.fund.import.remove_thesis_aria}
                                        >
                                            <FaTrash
                                                className="m-auto"
                                                size={12}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    thesis.length < 5 &&
                                    setThesis((p) => [...p, { sector: '', pct: '' }])
                                }
                                className="inline-flex self-start rounded-full border border-quaternary bg-tertiary px-3 py-1 font-caption-highlight text-secondary transition-colors hover:border-highlight/30 hover:text-primary"
                            >
                                + {trans.fund.import.import_investor.upload.manual.add_thesis}
                            </button>
                            {thesisError && (
                                <p role="alert" className="font-caption text-red">
                                    {thesisError}
                                </p>
                            )}
                            {hasAnyThesis && (
                                <div
                                    className={`rounded-xl border px-3 py-2 font-body-3 ${isThesisValid ? 'border-green/30 bg-green/10 text-green' : 'border-red/30 bg-red/10 text-red'}`}
                                >
                                    {trans.fund.import.import_investor.upload.manual.thesis_total.replace(
                                        '{total}',
                                        String(totalPct),
                                    )}
                                </div>
                            )}
                        </fieldset>
                    </div>
                    <div className="flex shrink-0 items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setSource('file')}
                            className="inline-flex items-center justify-center rounded-full bg-tertiary px-5 py-2 font-body-3-highlight text-primary transition-colors hover:bg-quaternary"
                        >
                            {trans.fund.import.import_investor.upload.back}
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full bg-highlight px-5 py-2 font-body-3-highlight text-quaternary transition-colors hover:bg-highlight/80"
                        >
                            {trans.fund.import.import_investor.upload.manual.submit}
                        </button>
                    </div>
                </form>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={FUND_IMPORT_ACCEPT}
                aria-label={trans.fund.import.import_investor.upload.choose_file}
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCsvFile(f);
                    e.target.value = '';
                }}
            />
        </div>
    );
};
