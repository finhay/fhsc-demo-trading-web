'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { FaEye, FaEyeSlash } from 'react-icons/fa6';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { AssetDepositModal } from '@/components/tai-san/overview/AssetDepositModal';
import { AssetTransferModal } from '@/components/tai-san/overview/AssetTransferModal';
import { AssetWithdrawModal } from '@/components/tai-san/overview/AssetWithdrawModal';
import { createChartAssetSparkline } from '@/config/assets';
import { ASSET_ACTION_KEYS, ASSET_ACTION_STYLES, GROWTH_TIME_PERIODS } from '@/constants/assets';
import { SUB_ACCOUNT_PERMISSION } from '@/constants/common';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { toast } from '@/hooks/lib/useToast';
import { getAssetSnapshot, getSubAccountDeposit } from '@/services/api/accounts/assets';
import {
    getSubAccountCiBalance,
    getSubAccountWithdrawalAvailableBalance,
} from '@/services/api/payments';
import { useAssetStore } from '@/stores/assets/useAssetStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import type { AssetSnapshot } from '@/types/accounts/assets';
import type { DepositBankAccountItem } from '@/types/accounts/bank';
import type { AssetSummaryProps } from '@/types/pages/assets';
import { hasSubAccountPermission, isSuccessApi } from '@/utils/common';
import { formatDateToTimestamp, formatNumberVN } from '@/utils/format';

type Props = AssetSummaryProps;

export const AssetOverview = ({ data, isLoading }: Props) => {
    const { activeSubAccount } = useAuthStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const { fetchAssetsSummary, setSummaryLoading } = useAssetStore();
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isAmountHidden, setIsAmountHidden] = useState(false);
    const [transferBalance, setTransferBalance] = useState(0);
    const [withdrawBalance, setWithdrawBalance] = useState(0);
    const [depositBankAccount, setDepositBankAccount] = useState<DepositBankAccountItem | null>(
        null,
    );
    const [snapshots, setSnapshots] = useState<AssetSnapshot[]>([]);
    const [isSparklineLoading, setIsSparklineLoading] = useState(false);

    const sparklineRef = useRef<HTMLDivElement>(null);

    const sortedSnapshots = useMemo(
        () =>
            [...snapshots].sort(
                (a, b) =>
                    formatDateToTimestamp(a.snapshot_date) - formatDateToTimestamp(b.snapshot_date),
            ),
        [snapshots],
    );

    const hasSparklineData = !isSparklineLoading && sortedSnapshots.length > 0;
    const chartInstanceRef = useEChartsInstance(sparklineRef, {
        shouldInitialize: hasSparklineData,
    });

    const displayValue = data?.net_asset_value;
    const formattedNetAssetValue = displayValue
        ? `${formatNumberVN(displayValue, { trimTrailingZeros: true })}đ`
        : '0đ';

    const refreshAssetsSummary = () => {
        setSummaryLoading(true);
        setTimeout(() => {
            fetchAssetsSummary();
        }, 500);
    };

    const handleOpenTransfer = async () => {
        if (!activeSubAccount?.sub_account_id) return;
        startLoading();
        try {
            const { error_code, result } = await getSubAccountCiBalance(
                activeSubAccount.sub_account_id,
            );
            if (isSuccessApi(error_code)) {
                setTransferBalance(result.amount);
            }
        } finally {
            stopLoading();
        }
        setIsTransferModalOpen(true);
    };

    const handleOpenWithdraw = async () => {
        if (!activeSubAccount?.sub_account_id) return;
        startLoading();
        try {
            const { error_code, result } = await getSubAccountWithdrawalAvailableBalance(
                activeSubAccount.sub_account_id,
            );
            if (isSuccessApi(error_code)) {
                setWithdrawBalance(result.availableBalance);
            }
        } finally {
            stopLoading();
        }
        setIsWithdrawModalOpen(true);
    };

    const handleOpenDeposit = async () => {
        if (!activeSubAccount?.sub_account_id) return;
        startLoading();
        try {
            const {
                error_code,
                data: depositData,
                message,
            } = await getSubAccountDeposit(activeSubAccount.sub_account_id);
            if (isSuccessApi(error_code)) {
                const bankAccounts = depositData[0].deposit_bank_accounts;
                const selectedBankAccount =
                    bankAccounts
                        .filter((acc) => !acc.is_interruption)
                        .sort((a, b) => a.priority - b.priority)[0] || bankAccounts[0];
                setDepositBankAccount(selectedBankAccount);
                setIsDepositModalOpen(true);
            } else {
                toast.error(message);
            }
        } finally {
            stopLoading();
        }
    };

    const assetActions = [
        {
            key: ASSET_ACTION_KEYS.DEPOSIT,
            label: 'Nạp',
            permission: SUB_ACCOUNT_PERMISSION.DEPOSIT_CASH,
            onClick: handleOpenDeposit,
        },
        {
            key: ASSET_ACTION_KEYS.TRANSFER,
            label: 'Chuyển',
            permission: SUB_ACCOUNT_PERMISSION.TRANSFER_CASH,
            onClick: handleOpenTransfer,
        },
        {
            key: ASSET_ACTION_KEYS.WITHDRAW,
            label: 'Rút',
            permission: SUB_ACCOUNT_PERMISSION.WITHDRAW_CASH,
            onClick: handleOpenWithdraw,
        },
    ].filter((action) => hasSubAccountPermission(activeSubAccount, action.permission));

    useEffect(() => {
        const fetchSparkline = async () => {
            setIsSparklineLoading(true);
            try {
                const periodDays = GROWTH_TIME_PERIODS[0].value;
                const { data: snapshotData, error_code } = await getAssetSnapshot(
                    periodDays,
                    false,
                );
                if (isSuccessApi(error_code)) {
                    setSnapshots(snapshotData || []);
                }
            } catch {
                setSnapshots([]);
            } finally {
                setIsSparklineLoading(false);
            }
        };
        fetchSparkline();
    }, []);

    useEffect(() => {
        if (!hasSparklineData) return;
        const points = sortedSnapshots.map((s) => ({
            value: s.net_asset_value,
            date: s.snapshot_date,
        }));
        chartInstanceRef.current?.setOption(createChartAssetSparkline(points), { notMerge: true });
    }, [hasSparklineData, sortedSnapshots, chartInstanceRef]);

    return (
        <section className="flex flex-col gap-4 bg-secondary rounded-xl p-3 w-full shrink-0">
            <h2 className="font-body-2-highlight text-primary">{'Tổng quan tài sản'}</h2>
            <div className="flex items-end justify-between gap-4 w-full">
                <div className="flex flex-col gap-2 shrink-0">
                    <span className="font-body-3 text-secondary">{'Tài sản ròng (NAV)'}</span>
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <div className="h-8 w-40">
                                <Skeleton height="full" />
                            </div>
                        ) : (
                            <p className="font-heading-3 text-primary whitespace-nowrap">
                                {isAmountHidden ? '******' : formattedNetAssetValue}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsAmountHidden(!isAmountHidden)}
                            className="text-secondary hover:text-primary transition-colors shrink-0"
                            aria-label={isAmountHidden ? 'Hiển thị số tiền' : 'Ẩn số tiền'}
                        >
                            {isAmountHidden ? (
                                <FaEyeSlash size={24} className="text-primary" />
                            ) : (
                                <FaEye size={24} className="text-primary" />
                            )}
                        </button>
                    </div>
                </div>
                {hasSparklineData && (
                    <div className="h-16 w-80 min-w-0 shrink">
                        <div ref={sparklineRef} className="h-full w-full" />
                    </div>
                )}
            </div>
            <nav className="flex items-center gap-3 w-full" aria-label={'Hành động tài sản'}>
                {assetActions.map((action) => (
                    <button
                        key={action.key}
                        type="button"
                        onClick={action.onClick}
                        className={`flex-1 h-10 rounded-full font-body-3-highlight flex items-center justify-center ${ASSET_ACTION_STYLES[action.key]}`}
                    >
                        {action.label}
                    </button>
                ))}
            </nav>
            {isDepositModalOpen && (
                <AssetDepositModal
                    bankAccount={depositBankAccount}
                    onClose={() => {
                        setIsDepositModalOpen(false);
                        refreshAssetsSummary();
                    }}
                />
            )}
            {isTransferModalOpen && (
                <AssetTransferModal
                    availableBalance={transferBalance}
                    onClose={() => setIsTransferModalOpen(false)}
                />
            )}
            {isWithdrawModalOpen && (
                <AssetWithdrawModal
                    availableBalance={withdrawBalance}
                    onClose={() => {
                        setIsWithdrawModalOpen(false);
                        refreshAssetsSummary();
                    }}
                />
            )}
        </section>
    );
};
