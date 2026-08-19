'use client';

import { useEffect, useRef } from 'react';

import Image from 'next/image';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Skeleton } from '@/components/common/ui/Skeleton';
import { Spinner } from '@/components/common/ui/Spinner';
import { Tooltip } from '@/components/common/ui/Tooltip';
import { useAssetStore } from '@/stores/assets/useAssetStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { isInflowTransaction } from '@/utils/assets';
import { formatNumberVN } from '@/utils/format';

export const AssetTransactions = () => {
    const { activeSubAccount } = useAuthStore();
    const subAccountId = activeSubAccount?.sub_account_id ?? null;

    const {
        transactions,
        isInitialLoading,
        isLoadingMore,
        hasMoreData,
        loadMoreTransactions,
        refetchTransactions,
    } = useAssetStore();

    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (subAccountId) {
            refetchTransactions(subAccountId);
        }
    }, [subAccountId]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || isInitialLoading) return;

        const scrollRoot = sentinel.closest('.overflow-y-auto');
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0]?.isIntersecting &&
                    hasMoreData &&
                    !isLoadingMore &&
                    !isInitialLoading
                ) {
                    loadMoreTransactions();
                }
            },
            {
                root: scrollRoot instanceof Element ? scrollRoot : null,
                rootMargin: '100px',
                threshold: 0,
            },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMoreData, isInitialLoading, isLoadingMore, loadMoreTransactions, transactions.length]);

    return (
        <section className="flex w-full shrink-0 flex-col gap-3 rounded-xl bg-secondary p-3">
            <h2 className="shrink-0 font-body-2-highlight text-primary">{'Lịch sử tiền'}</h2>
            <div className="h-96 overflow-y-auto">
                {isInitialLoading ? (
                    <div className="h-full w-full">
                        <Skeleton />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <EmptyState />
                    </div>
                ) : (
                    <>
                        <ul className="m-0 flex list-none flex-col gap-3 p-0">
                            {transactions.map((transaction, index) => {
                                const isPositive = isInflowTransaction(transaction);
                                const isLastItem = index === transactions.length - 1;
                                return (
                                    <li
                                        key={`${transaction.id}-${index}`}
                                        className="flex flex-col gap-3"
                                    >
                                        <article className="flex w-full flex-col gap-1">
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <div className="flex min-w-0 items-center gap-1">
                                                    <span className="font-body-3 text-primary">
                                                        {transaction.title}
                                                    </span>
                                                    {transaction.description && (
                                                        <Tooltip
                                                            content={
                                                                <span className="block max-w-60 whitespace-normal">
                                                                    {transaction.description}
                                                                </span>
                                                            }
                                                            className="flex shrink-0"
                                                        >
                                                            <Image
                                                                src="/market/ic-information-line.svg"
                                                                width={16}
                                                                height={16}
                                                                alt=""
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                <span
                                                    className={`shrink-0 font-body-3-highlight ${
                                                        isPositive ? 'text-green' : 'text-red'
                                                    }`}
                                                >
                                                    {isPositive ? '+' : '-'}
                                                    {formatNumberVN(Number(transaction.amount), {
                                                        trimTrailingZeros: true,
                                                    })}
                                                    đ
                                                </span>
                                            </div>
                                            <time className="font-body-3 text-secondary">
                                                {transaction.transaction_date}
                                            </time>
                                        </article>
                                        {!isLastItem && (
                                            <hr className="h-px w-full border-0 bg-tertiary" />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                        <div ref={sentinelRef} className="h-px w-full" aria-hidden />
                        <Spinner isLoading={isLoadingMore} isOverlay={false} />
                    </>
                )}
            </div>
        </section>
    );
};
