'use client';

import { useMemo } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { useAssetStore } from '@/stores/assets/useAssetStore';
import { formatNumberVN } from '@/utils/format';

type DebtRow = {
    label: string;
    value: string;
};

type DebtAmountRow = {
    label: string;
    amount: number;
};

const toDebtRows = (rows: DebtAmountRow[]): DebtRow[] =>
    rows
        .filter((row) => row.amount > 0)
        .map((row) => ({
            label: row.label,
            value: formatNumberVN(row.amount, { trimTrailingZeros: true }),
        }));

export const AssetDebt = () => {
    const { assetsSummary, isSummaryLoading } = useAssetStore();
    // Simulator không có margin/ứng trước — hai tiểu khoản này luôn rỗng.
    const normalAsset = null;
    const marginAsset = null;
    const isLoading = false;

    const buildSummaryRows = (): DebtRow[] => {
        const debt = assetsSummary?.debt;
        return toDebtRows([
            {
                label: 'Tổng nợ',
                amount: (debt?.total || 0) - (debt?.secure_amount || 0),
            },
            {
                label: 'Nợ phí lưu ký',
                amount: (debt?.cidepo_fee_acr || 0) + (debt?.cidepo_fee || 0),
            },
            {
                label: 'Nợ ứng trước tiền bán',
                amount: debt?.advance_amt || 0,
            },
            {
                label: 'Nợ ký quỹ margin',
                amount: debt?.owe_deposit || 0,
            },
        ]);
    };

    type SubAccountDebt = {
        cidepo_fee_acr?: number;
        cidepo_fee?: number;
        advanced_amount?: number;
        t0_debt_amount?: number;
        margin_amount?: number;
    };

    const buildDebtRows = (asset: SubAccountDebt | null, includeMargin = false): DebtRow[] => {
        const rows = [
            {
                label: 'Nợ phí lưu ký',
                amount: (asset?.cidepo_fee_acr || 0) + (asset?.cidepo_fee || 0),
            },
            {
                label: 'Nợ ứng trước tiền bán',
                amount: asset?.advanced_amount || 0,
            },
        ];

        if (includeMargin) {
            rows.push({
                label: 'Nợ ký quỹ margin',
                amount: (asset?.t0_debt_amount || 0) + (asset?.margin_amount || 0),
            });
        }

        return toDebtRows(rows);
    };

    const sections = useMemo(
        () => [
            {
                key: 'summary',
                title: 'Nợ',
                rows: buildSummaryRows(),
                isLoading: isSummaryLoading,
            },
            {
                key: 'normal',
                title: 'Tiểu khoản thường',
                rows: buildDebtRows(normalAsset),
                isLoading,
            },
            {
                key: 'margin',
                title: 'Tiểu khoản margin',
                rows: buildDebtRows(marginAsset, true),
                isLoading,
            },
        ],
        [assetsSummary, isSummaryLoading, normalAsset, marginAsset, isLoading],
    );

    const isAllEmpty =
        !isSummaryLoading && !isLoading && sections.every((section) => section.rows.length === 0);

    return (
        <section className="flex flex-col base-secondary rounded-xl p-3 gap-8 w-full shrink-0">
            {isAllEmpty ? (
                <div className="h-96 w-full">
                    <h2 className="body-3-highlight text-primary">{'Nợ'}</h2>
                    <EmptyState description={'Bạn đang không có khoản nợ nào!'} />
                </div>
            ) : (
                sections.map((section) => {
                    const isEmptySection = !section.isLoading && section.rows.length === 0;
                    if (section.key === 'summary' && isEmptySection) return null;
                    return (
                        <div key={section.key} className="flex flex-col gap-3 w-full">
                            <h3 className="body-3 text-primary">
                                {isEmptySection ? `${section.title} (0)` : section.title}
                            </h3>
                            {section.isLoading ? (
                                <div className="h-24 w-full">
                                    <Skeleton />
                                </div>
                            ) : (
                                <dl className="flex flex-col gap-3 w-full m-0">
                                    {section.rows.map((item) => (
                                        <div
                                            key={`${section.key}-${item.label}`}
                                            className="flex items-center justify-between w-full gap-4"
                                        >
                                            <dt className="body-4 text-secondary">
                                                {item.label}
                                            </dt>
                                            <dd className="body-4 text-primary m-0">
                                                {item.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            )}
                        </div>
                    );
                })
            )}
        </section>
    );
};
