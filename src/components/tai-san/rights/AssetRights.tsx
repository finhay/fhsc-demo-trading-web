'use client';

import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Dialog } from '@/components/common/ui/Dialog';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { AssetRegisterModal } from '@/components/tai-san/rights/AssetRegisterModal';
import { AssetRightsDetail } from '@/components/tai-san/rights/AssetRightsDetail';
import { RIGHTS_EVENT_TYPES, RIGHT_STATUS_COLORS } from '@/constants/assets';
import { toast } from '@/hooks/lib/useToast';
import { fetchAccountUserRights, registerAccountUserRight } from '@/services/api/trade/user-rights';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import type { UserRightItem } from '@/types/trade/user-rights';
import { getRightLabel } from '@/utils/assets';
import { isSuccessApi } from '@/utils/common';
import { formatDateOrDash } from '@/utils/format';

const RIGHTS_STATUSES = {
    unregister: 'Chưa đăng ký',
    registered: 'Đã đăng ký',
    expired: 'Hết hạn',
    received: 'Đã nhận',
};

export const AssetRights = () => {
    const { startLoading, stopLoading } = useLoadingStore();
    const { activeSubAccount } = useAuthStore();
    const [rights, setRights] = useState<UserRightItem[]>([]);
    const [selectedRightId, setSelectedRightId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [isListLoading, setIsListLoading] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const selectedRight = useMemo(
        () => rights.find((r) => r.caMastId === selectedRightId),
        [rights, selectedRightId],
    );

    const fetchRights = async () => {
        if (!activeSubAccount?.sub_account_id) return;
        setIsListLoading(true);
        try {
            const { result, error_code } = await fetchAccountUserRights(
                activeSubAccount.sub_account_id,
                {},
            );
            if (isSuccessApi(error_code)) {
                setRights(result);
            }
        } catch {
            setRights([]);
        } finally {
            setIsListLoading(false);
        }
    };

    const handleSelectRight = (id: string) => {
        setSelectedRightId(id);
        setQuantity('');
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setSelectedRightId('');
        setQuantity('');
    };

    const handleRegister = async () => {
        if (!activeSubAccount?.sub_account_id || !selectedRightId || !quantity) return;

        startLoading();
        try {
            const { error_code, message } = await registerAccountUserRight(
                activeSubAccount.sub_account_id,
                {
                    caMastId: selectedRightId,
                    quantity,
                },
            );

            if (isSuccessApi(error_code)) {
                toast.success(message);
                setQuantity('');
                setIsRegisterOpen(false);
                setTimeout(() => {
                    fetchRights();
                }, 2000);
            } else {
                throw new Error(message);
            }
        } catch {
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        fetchRights();
    }, [activeSubAccount?.sub_account_id]);

    return (
        <>
            <AssetRegisterModal
                isOpen={isRegisterOpen}
                selectedRight={selectedRight}
                quantity={quantity}
                onClose={() => setIsRegisterOpen(false)}
                onConfirm={handleRegister}
            />
            {isDetailOpen && (
                <Dialog
                    title={`${'Chi tiết mã'} ${selectedRight?.symbol ?? ''}`.trim()}
                    maxWidth="max-w-2xl"
                    onClose={handleCloseDetail}
                >
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <AssetRightsDetail
                            rights={rights}
                            selectedRightId={selectedRightId}
                            quantity={quantity}
                            onQuantityChange={setQuantity}
                            onOpenRegisterModal={() => setIsRegisterOpen(true)}
                        />
                    </div>
                </Dialog>
            )}
            <section className="flex h-full w-full min-h-0 shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-secondary p-3">
                <h2 className="shrink-0 font-body-2-highlight text-primary">{'Quyền'}</h2>
                <div className="min-h-0 flex-1">
                    {isListLoading ? (
                        <div className="h-full w-full">
                            <Skeleton />
                        </div>
                    ) : rights.length === 0 ? (
                        <div className="flex h-full w-full items-center justify-center">
                            <EmptyState />
                        </div>
                    ) : (
                        <div className="scrollbar h-full overflow-y-auto">
                            <ul className="m-0 flex list-none flex-col gap-3 p-0">
                                {rights.map((right) => {
                                    const statusLabel = getRightLabel(
                                        RIGHTS_STATUSES,
                                        right.userRightRegisterStatus,
                                    );
                                    const typeLabel = getRightLabel(RIGHTS_EVENT_TYPES, right.type);
                                    return (
                                        <li key={right.caMastId}>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectRight(right.caMastId)}
                                                className="flex w-full flex-col gap-3 rounded-2xl border border-tertiary p-4 text-left transition-colors hover:opacity-90"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-body-3-highlight text-primary">
                                                        {right.symbol}
                                                    </span>
                                                    <span
                                                        className={`font-body-3 ${RIGHT_STATUS_COLORS[right.userRightRegisterStatus]}`}
                                                    >
                                                        {statusLabel}
                                                    </span>
                                                </div>
                                                <div className="flex items-start justify-between gap-3">
                                                    <span className="min-w-0 flex-1 font-body-3 text-secondary">
                                                        {typeLabel}
                                                    </span>
                                                    <span className="shrink-0 font-body-3 text-secondary whitespace-nowrap">
                                                        {'Ngày đăng ký cuối cùng'}:{' '}
                                                        {formatDateOrDash(right.reportDate)}
                                                    </span>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};
