'use client';

import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Dialog } from '@/components/common/ui/Dialog';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { AssetRightsDetail } from '@/components/tai-san/rights/AssetRightsDetail';
import { RIGHT_EVENT_TYPE_LABELS, RIGHT_STATUS_COLOR_BY_LABEL } from '@/constants/assets';
import { fetchPaperAccountRights } from '@/services/api/paper-trading/rights';
import { usePaperAccountStore } from '@/stores/paper-trading/usePaperAccountStore';
import type { PaperRightItem } from '@/types/paper-trading/rights';
import { isSuccessApi } from '@/utils/common';
import { formatDateOrDash, getDateRange } from '@/utils/format';

/** Filter cố định 1 năm theo contract — không còn dropdown kỳ hạn trên UI. */
const RIGHTS_RANGE_DAYS = 365;

export const AssetRights = () => {
    const { accountId } = usePaperAccountStore();
    const [rights, setRights] = useState<PaperRightItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isListLoading, setIsListLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedRight, setSelectedRight] = useState<PaperRightItem | null>(null);

    const { fromDate, toDate } = useMemo(() => getDateRange(RIGHTS_RANGE_DAYS), []);

    const fetchRights = async (nextPage: number, append: boolean) => {
        if (!accountId) return;

        if (append) setIsLoadingMore(true);
        else setIsListLoading(true);

        try {
            const { data, error_code } = await fetchPaperAccountRights(accountId, {
                from_date: fromDate,
                to_date: toDate,
                page: nextPage,
            });

            if (isSuccessApi(error_code)) {
                const items = data?.data ?? [];
                setRights((prev) => (append ? [...prev, ...items] : items));
                setPage(data?.page ?? nextPage);
                setTotalPages(data?.totalPages ?? 0);
            } else if (!append) {
                setRights([]);
                setTotalPages(0);
            }
        } catch {
            if (!append) {
                setRights([]);
                setTotalPages(0);
            }
        } finally {
            setIsListLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        setRights([]);
        setPage(1);
        setTotalPages(0);
        fetchRights(1, false);
    }, [accountId, fromDate, toDate]);

    const handleSelectRight = (item: PaperRightItem) => {
        setSelectedRight(item);
    };

    const handleCloseDetail = () => {
        setSelectedRight(null);
    };

    const handleLoadMore = () => {
        if (isLoadingMore || page >= totalPages) return;
        fetchRights(page + 1, true);
    };

    const canLoadMore = page < totalPages;

    return (
        <>
            {selectedRight && (
                <Dialog
                    title={`Chi tiết mã ${selectedRight.symbol}`.trim()}
                    maxWidth="max-w-2xl"
                    onClose={handleCloseDetail}
                >
                    <div className="min-h-0 flex-1 overflow-y-auto p-1">
                        <AssetRightsDetail right={selectedRight} />
                    </div>
                </Dialog>
            )}
            <section className="flex h-96 w-full shrink-0 flex-col gap-3 overflow-hidden rounded-xl base-secondary p-3">
                <h2 className="shrink-0 body-4-highlight text-primary">{'Quyền'}</h2>
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
                                    const typeLabel =
                                        RIGHT_EVENT_TYPE_LABELS[right.event_type] ??
                                        right.event_type;
                                    const statusColor =
                                        RIGHT_STATUS_COLOR_BY_LABEL[right.status] ??
                                        'text-secondary';

                                    return (
                                        <li key={right.camast_id}>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectRight(right)}
                                                className="flex w-full cursor-pointer flex-col gap-3 rounded-2xl border border-tertiary p-4 text-left transition-colors hover:opacity-90"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="body-4-highlight text-primary truncate">
                                                        {right.symbol}
                                                    </span>
                                                    <span
                                                        className={`body-4 shrink-0 ${statusColor}`}
                                                    >
                                                        {right.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-start justify-between gap-3">
                                                    <span className="min-w-0 flex-1 body-4 text-secondary truncate">
                                                        {typeLabel}
                                                    </span>
                                                    <span className="shrink-0 body-5 text-secondary whitespace-nowrap">
                                                        {'Ngày đăng ký cuối cùng'}:{' '}
                                                        {formatDateOrDash(right.record_date)}
                                                    </span>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                            {canLoadMore && (
                                <div className="flex justify-center py-3">
                                    <button
                                        type="button"
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                        className="body-4 text-highlight hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isLoadingMore ? 'Đang tải…' : 'Tải thêm'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};
