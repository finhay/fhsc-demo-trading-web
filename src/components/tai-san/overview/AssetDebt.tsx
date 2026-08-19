'use client';

import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { SUB_ACCOUNT_TYPE } from '@/constants/common';
import { useTranslate } from '@/hooks/useTranslate';
import { getSubAccountAssetSummary } from '@/services/api/trade/assets';
import { useAssetStore } from '@/stores/assets/useAssetStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import type { SubAccountAsset } from '@/types/trade/assets';
import { isSuccessApi } from '@/utils/common';
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
    const trans = useTranslate();
    const { subAccounts } = useAuthStore();
    const { assetsSummary, isSummaryLoading } = useAssetStore();
    const [normalAsset, setNormalAsset] = useState<SubAccountAsset | null>(null);
    const [marginAsset, setMarginAsset] = useState<SubAccountAsset | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const normalSubAccount = subAccounts.find(
        (account) => account.account_type === SUB_ACCOUNT_TYPE.NORMAL,
    );
    const marginSubAccount = subAccounts.find(
        (account) => account.account_type === SUB_ACCOUNT_TYPE.MARGIN,
    );

    const buildSummaryRows = (): DebtRow[] => {
        const debt = assetsSummary?.debt;
        return toDebtRows([
            {
                label: trans.assets.debt.total,
                amount: (debt?.total || 0) - (debt?.secure_amount || 0),
            },
            {
                label: trans.assets.debt.custody,
                amount: (debt?.cidepo_fee_acr || 0) + (debt?.cidepo_fee || 0),
            },
            {
                label: trans.assets.debt.advance,
                amount: debt?.advance_amt || 0,
            },
            {
                label: trans.assets.debt.margin,
                amount: debt?.owe_deposit || 0,
            },
        ]);
    };

    const buildDebtRows = (asset: SubAccountAsset | null, includeMargin = false): DebtRow[] => {
        const rows = [
            {
                label: trans.assets.debt.custody,
                amount: (asset?.cidepo_fee_acr || 0) + (asset?.cidepo_fee || 0),
            },
            {
                label: trans.assets.debt.advance,
                amount: asset?.advanced_amount || 0,
            },
        ];

        if (includeMargin) {
            rows.push({
                label: trans.assets.debt.margin,
                amount: (asset?.t0_debt_amount || 0) + (asset?.margin_amount || 0),
            });
        }

        return toDebtRows(rows);
    };

    const sections = useMemo(
        () => [
            {
                key: 'summary',
                title: trans.assets.debt.heading,
                rows: buildSummaryRows(),
                isLoading: isSummaryLoading,
            },
            {
                key: 'normal',
                title: trans.assets.debt.normal_account,
                rows: buildDebtRows(normalAsset),
                isLoading,
            },
            {
                key: 'margin',
                title: trans.assets.debt.margin_account,
                rows: buildDebtRows(marginAsset, true),
                isLoading,
            },
        ],
        [assetsSummary, isSummaryLoading, normalAsset, marginAsset, isLoading, trans],
    );

    useEffect(() => {
        const fetchSubAccountAssets = async () => {
            setIsLoading(true);
            try {
                const [normalResult, marginResult] = await Promise.all([
                    normalSubAccount?.sub_account_id
                        ? getSubAccountAssetSummary(normalSubAccount.sub_account_id)
                        : Promise.resolve(null),
                    marginSubAccount?.sub_account_id
                        ? getSubAccountAssetSummary(marginSubAccount.sub_account_id)
                        : Promise.resolve(null),
                ]);

                if (normalResult && isSuccessApi(normalResult.error_code)) {
                    setNormalAsset(normalResult.data.asset);
                } else {
                    setNormalAsset(null);
                }

                if (marginResult && isSuccessApi(marginResult.error_code)) {
                    setMarginAsset(marginResult.data.asset);
                } else {
                    setMarginAsset(null);
                }
            } catch {
                setNormalAsset(null);
                setMarginAsset(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubAccountAssets();
    }, [normalSubAccount?.sub_account_id, marginSubAccount?.sub_account_id]);

    const isAllEmpty =
        !isSummaryLoading && !isLoading && sections.every((section) => section.rows.length === 0);

    return (
        <section className="flex flex-col bg-secondary rounded-xl p-3 gap-8 w-full shrink-0">
            {isAllEmpty ? (
                <div className="h-96 w-full">
                    <h2 className="font-body-2-highlight text-primary">
                        {trans.assets.debt.heading}
                    </h2>
                    <EmptyState description={trans.assets.debt.empty} />
                </div>
            ) : (
                sections.map((section) => {
                    const isEmptySection = !section.isLoading && section.rows.length === 0;
                    if (section.key === 'summary' && isEmptySection) return null;
                    return (
                        <div key={section.key} className="flex flex-col gap-3 w-full">
                            <h3 className="font-body-2 text-primary">
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
                                            <dt className="font-body-3 text-secondary">
                                                {item.label}
                                            </dt>
                                            <dd className="font-body-3 text-primary m-0">
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
