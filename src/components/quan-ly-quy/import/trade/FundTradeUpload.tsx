import { useForm } from '@tanstack/react-form';

import { useEffect, useRef, useState } from 'react';

import { FaFileArrowUp } from 'react-icons/fa6';

import { FundDropdown } from '@/components/quan-ly-quy/common/FundDropdown';
import { FundImportCombobox } from '@/components/quan-ly-quy/import/FundImportCombobox';
import { FundImportFormField } from '@/components/quan-ly-quy/import/FundImportFormField';
import { FundImportRadio } from '@/components/quan-ly-quy/import/FundImportRadio';
import {
    FUND_FORM_DATE_CLS,
    FUND_FORM_INPUT_CLS,
    FUND_IMPORT_ACCEPT,
    FUND_STOCK_ORDER_TYPES,
    FUND_VOLUME_ORDER_TYPES,
    TRADE_ORDER_TYPE,
    TRADE_ORDER_TYPE_OPTIONS_VI,
    type TradeOrderType,
} from '@/constants/fund';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { useFundTradeStore } from '@/stores/fund/useFundTradeStore';
import {
    buildSectorSuggestions,
    createTradeFieldConfigs,
    isSupportedFundImportFile,
} from '@/utils/fund/fund';

type Props = { prefillSource?: 'file' | 'manual' };

export const FundTradeUpload = ({ prefillSource = 'file' }: Props) => {
    const trans = useTranslate();
    const { investorRows, holdings } = useFundDataStore();
    const { parseFile, createManualOrder, error, tradeDraft, setTradeDraft, missingInvestorCodes } =
        useFundTradeStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const [source, setSource] = useState<'file' | 'manual'>(prefillSource);
    const [isDragging, setIsDragging] = useState(false);

    const today = new Date().toISOString().slice(0, 10);

    const form = useForm({
        defaultValues: {
            ma_gd: tradeDraft?.ma_gd ?? '',
            ngay_gd: tradeDraft?.ngay_gd ?? today,
            ngay_khop: tradeDraft?.ngay_khop ?? today,
            ma_ndt: tradeDraft?.ma_ndt ?? '',
            loai_lenh: (tradeDraft?.loai_lenh ?? TRADE_ORDER_TYPE.BUY) as TradeOrderType,
            ma_ck: tradeDraft?.ma_ck ?? '',
            nganh: tradeDraft?.nganh ?? '',
            khoi_luong: tradeDraft?.khoi_luong ?? '',
            gia_khop: tradeDraft?.gia_khop ?? '',
            phi_gd: tradeDraft?.phi_gd ?? '',
            thue: tradeDraft?.thue ?? '',
            tong_tien: tradeDraft?.tong_tien ?? '',
        },
        onSubmit: async ({ value }) => {
            const khoiLuong = Number(value.khoi_luong);
            const giaKhop = Number(value.gia_khop);
            const phiGd = Number(value.phi_gd || 0);
            const thue = Number(value.thue || 0);
            const tongTien = Number(value.tong_tien);
            const isStockOrder = FUND_STOCK_ORDER_TYPES.includes(value.loai_lenh);
            const isVolumeOrder = FUND_VOLUME_ORDER_TYPES.includes(value.loai_lenh);

            await createManualOrder({
                ma_gd: value.ma_gd.trim(),
                ma_ndt: value.ma_ndt.trim().toUpperCase(),
                ngay_gd: value.ngay_gd,
                ngay_khop: isStockOrder ? value.ngay_khop : '',
                ma_ck: isStockOrder ? value.ma_ck.trim().toUpperCase() : '',
                nganh: isStockOrder ? value.nganh.trim() : '',
                loai_lenh: value.loai_lenh,
                khoi_luong: isVolumeOrder ? khoiLuong : 0,
                gia_khop: isVolumeOrder ? giaKhop : 0,
                phi_gd: phiGd,
                thue,
                tong_tien: tongTien,
            });
        },
    });

    const [loaiLenh, setLoaiLenh] = useState<TradeOrderType>(
        (tradeDraft?.loai_lenh as TradeOrderType) ?? TRADE_ORDER_TYPE.BUY,
    );
    const isStockOrder = FUND_STOCK_ORDER_TYPES.includes(loaiLenh);
    const isVolumeOrder = FUND_VOLUME_ORDER_TYPES.includes(loaiLenh);

    const [calcInputs, setCalcInputs] = useState({
        khoi_luong: tradeDraft?.khoi_luong ?? '',
        gia_khop: tradeDraft?.gia_khop ?? '',
        phi_gd: tradeDraft?.phi_gd ?? '',
        thue: tradeDraft?.thue ?? '',
    });
    const updateCalcInput = (field: keyof typeof calcInputs, v: string) =>
        setCalcInputs((prev) => ({ ...prev, [field]: v }));

    const sectorSuggestions = buildSectorSuggestions(investorRows, holdings);
    const investorCodeSet = new Set(investorRows.map((r) => r.ma_ndt.trim().toUpperCase()));
    const FIELD_CONFIGS = createTradeFieldConfigs(
        trans.fund.import.steps.upload.manual,
        {
            required: trans.fund.import.steps.upload.manual.errors.required,
            sector_not_in_data: trans.fund.import.steps.upload.manual.errors.sector_not_in_data,
            no_sectors_in_data: trans.fund.import.steps.upload.manual.errors.no_sectors_in_data,
            investor_not_found: trans.fund.import.steps.upload.manual.errors.investor_not_found,
        },
        {
            isStockOrder,
            isVolumeOrder,
            onCalcChange: updateCalcInput,
            allowedSectors: sectorSuggestions,
            investorCodeSet,
        },
    );

    const uploadCsvFile = async (file: File) => {
        if (!isSupportedFundImportFile(file.name)) {
            toast.error(trans.fund.import.errors.invalid_file);
            return;
        }
        await parseFile(file);
    };

    const onFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadCsvFile(file);
    };

    const renderField = (cfg: (typeof FIELD_CONFIGS)[number]) => (
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
                    {cfg.name === 'nganh' ? (
                        <FundImportCombobox
                            value={String(field.state.value)}
                            options={sectorSuggestions}
                            onChange={(val) => {
                                field.handleChange(val);
                                cfg.onChangeSideEffect?.(val);
                            }}
                            onBlur={field.handleBlur}
                            placeholder={cfg.placeholder}
                            inputClassName={FUND_FORM_INPUT_CLS}
                            ariaLabel={trans.fund.import.trade_sector_list_aria}
                        />
                    ) : (
                        <input
                            type={cfg.type ?? 'text'}
                            min={cfg.min}
                            value={String(field.state.value)}
                            onChange={(e) => {
                                field.handleChange(e.target.value);
                                cfg.onChangeSideEffect?.(e.target.value);
                            }}
                            onBlur={field.handleBlur}
                            placeholder={cfg.placeholder}
                            className={
                                cfg.type === 'date' ? FUND_FORM_DATE_CLS : FUND_FORM_INPUT_CLS
                            }
                        />
                    )}
                </FundImportFormField>
            )}
        </form.Field>
    );

    useEffect(() => {
        return () => {
            const { step } = useFundTradeStore.getState();
            if (step === 'upload') {
                setTradeDraft(form.state.values);
            } else {
                setTradeDraft(null);
            }
        };
    }, []);

    useEffect(() => {
        if (!isVolumeOrder) {
            form.setFieldValue('tong_tien', '');
            return;
        }
        const kl = Number(calcInputs.khoi_luong) || 0;
        const gk = Number(calcInputs.gia_khop) || 0;
        const phi = Number(calcInputs.phi_gd) || 0;
        const thue = Number(calcInputs.thue) || 0;
        if (kl <= 0 || gk <= 0) return;
        const result = loaiLenh === TRADE_ORDER_TYPE.BUY ? -(kl * gk + phi) : kl * gk - phi - thue;
        form.setFieldValue('tong_tien', String(result));
    }, [loaiLenh, isVolumeOrder, calcInputs]);

    useEffect(() => {
        form.validateField('ngay_khop', 'change');
        form.validateField('ma_ck', 'change');
        form.validateField('nganh', 'change');
        form.validateField('khoi_luong', 'change');
        form.validateField('gia_khop', 'change');
    }, [loaiLenh]);

    useEffect(() => {
        form.validateField('ma_ndt', 'change');
        form.validateField('nganh', 'change');
    }, [investorRows, holdings]);

    useEffect(() => {
        setSource(prefillSource);
    }, [prefillSource]);

    useEffect(() => {
        if (!error) return;
        if (error === 'unknown_investors' && missingInvestorCodes.length > 0) {
            toast.error(
                trans.fund.import.errors.unknown_investors.replace(
                    '{codes}',
                    missingInvestorCodes.join(', '),
                ),
            );
            return;
        }
        const rawMsg = trans.fund.import.errors[error as keyof typeof trans.fund.import.errors];
        toast.error(typeof rawMsg === 'string' ? rawMsg : error);
    }, [error, missingInvestorCodes]);

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 rounded-xl bg-secondary p-5">
            {source === 'file' && (
                <div
                    className="flex shrink-0 flex-col gap-2"
                    role="radiogroup"
                    aria-label={trans.fund.import.steps.upload.sources.file_title}
                >
                    <FundImportRadio
                        selected
                        onClick={() => setSource('file')}
                        title={trans.fund.import.steps.upload.sources.file_title}
                        sub={trans.fund.import.steps.upload.sources.file_subtitle}
                    />
                    <FundImportRadio
                        selected={false}
                        onClick={() => setSource('manual')}
                        title={trans.fund.import.steps.upload.sources.manual_title}
                        sub={trans.fund.import.steps.upload.sources.manual_subtitle}
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
                    onDrop={onFileDrop}
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
                                {trans.fund.import.steps.upload.choose_file}
                            </p>
                            <p className="font-caption text-secondary">
                                {trans.fund.import.steps.upload.drag_drop}
                            </p>
                        </div>
                        <p className="font-caption text-tertiary">
                            {trans.fund.import.steps.upload.file_format}
                        </p>
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden"
                >
                    <div className="scrollbar flex min-h-0 flex-1 flex-wrap content-start gap-2 overflow-y-auto rounded-xl bg-quaternary/25 p-4 [&>*]:w-full md:[&>*]:w-[calc(50%-0.25rem)]">
                        {FIELD_CONFIGS.slice(0, 3).map(renderField)}
                        <form.Field name="loai_lenh">
                            {(field) => (
                                <FundImportFormField
                                    label={trans.fund.import.steps.upload.manual.loai_lenh}
                                    required
                                >
                                    <FundDropdown
                                        options={TRADE_ORDER_TYPE_OPTIONS_VI}
                                        value={field.state.value}
                                        onChange={(val) => {
                                            field.handleChange(val as TradeOrderType);
                                            setLoaiLenh(val as TradeOrderType);
                                        }}
                                        allLabel={trans.fund.import.steps.upload.manual.loai_lenh}
                                    />
                                </FundImportFormField>
                            )}
                        </form.Field>
                        {FIELD_CONFIGS.slice(3).map(renderField)}
                    </div>
                    <div className="flex shrink-0 items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setSource('file')}
                            className="inline-flex items-center justify-center rounded-full bg-tertiary px-5 py-2 font-body-3-highlight text-primary transition-colors hover:bg-quaternary"
                        >
                            {trans.fund.import.steps.upload.back}
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full bg-highlight px-5 py-2 font-body-3-highlight text-quaternary transition-colors hover:bg-highlight/80"
                        >
                            {trans.fund.import.steps.upload.manual.submit}
                        </button>
                    </div>
                </form>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={FUND_IMPORT_ACCEPT}
                aria-label={trans.fund.import.steps.upload.choose_file}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadCsvFile(file);
                    e.target.value = '';
                }}
            />
        </div>
    );
};
