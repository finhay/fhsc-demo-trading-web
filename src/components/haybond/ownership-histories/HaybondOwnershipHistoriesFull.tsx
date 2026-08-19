'use client';

import { type WheelEvent, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { FaChevronLeft, FaChevronRight, FaCircle } from 'react-icons/fa6';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Spinner } from '@/components/common/ui/Spinner';
import { FilterTabs } from '@/components/haybond/shared/FilterTabs';
import { BTN_OWNERSHIP_HISTORIES } from '@/constants/haybond';
import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { formatDate, formatNumberVN } from '@/utils/format';

export const HaybondOwnershipHistoriesFull = () => {
    const trans = useTranslate();
    const router = useRouter();
    const {
        ownershipHistories,
        ownershipHistoriesDynamic,
        ownershipFilter,
        fetchOwnershipHistories,
        fetchOwnershipHistoriesDynamic,
        resetStore,
    } = useHaybondStore();
    const [selectedBtnKey, setSelectedBtnKey] = useState(
        ownershipFilter || BTN_OWNERSHIP_HISTORIES.KEY_CLOSED,
    );
    const requestFlag = useRef(false);
    const listRef = useRef<HTMLDivElement>(null);

    const filterTabs = [
        { key: BTN_OWNERSHIP_HISTORIES.KEY_ALL, name: trans.haybond.all },
        { key: BTN_OWNERSHIP_HISTORIES.KEY_HOLDING, name: trans.haybond.owning },
        { key: BTN_OWNERSHIP_HISTORIES.KEY_CLOSED, name: trans.haybond.ended },
    ];

    const getTextStatus = (status: string) => {
        switch (status) {
            case 'PROCESSING_CLOSE':
            case 'HOLDING':
                return trans.haybond.owning;
            default:
                return trans.haybond.ended;
        }
    };

    const getStatusClass = (status: string) => {
        if (status === BTN_OWNERSHIP_HISTORIES.KEY_CLOSED) {
            return {
                border: 'border-quaternary',
                bg: 'bg-disabled',
                dot: 'text-gray',
            };
        }
        return {
            border: 'border-green',
            bg: 'bg-success',
            dot: 'text-green',
        };
    };

    const handleFilter = (status: string) => {
        setSelectedBtnKey(status);
        fetchOwnershipHistoriesDynamic({ page: 1, status, isLoadMore: false });
        fetchOwnershipHistories({ page: 1, status, isLoadMore: false });
    };

    const handleWheel = async (event: WheelEvent<HTMLDivElement>) => {
        if (ownershipHistories.page === ownershipHistories.totalPages) return;
        const { deltaY } = event;
        if (deltaY <= 0 || !listRef.current) return;
        const { scrollHeight, clientHeight, scrollTop } = listRef.current;
        const maxScrollTop = scrollHeight - clientHeight;
        if (scrollTop < maxScrollTop - 10 || requestFlag.current) return;
        requestFlag.current = true;
        await fetchOwnershipHistories({
            page: ownershipHistories.page + 1,
            status: selectedBtnKey,
            isLoadMore: true,
        });
        requestFlag.current = false;
    };

    useEffect(() => {
        fetchOwnershipHistoriesDynamic({
            page: 1,
            status: selectedBtnKey,
            isLoadMore: false,
        });
        fetchOwnershipHistories({
            page: 1,
            status: selectedBtnKey,
            isLoadMore: false,
        });
        return () => {
            resetStore();
        };
    }, []);

    const isEmpty =
        ownershipHistories.content.length === 0 && ownershipHistoriesDynamic.content.length === 0;

    return (
        <div className="flex h-full min-h-0 w-full flex-col items-center gap-6">
            <Spinner isLoading={ownershipHistories.isLoading} />
            <div className="relative flex w-full shrink-0 items-center">
                <button
                    type="button"
                    className="text-primary cursor-pointer"
                    onClick={() => router.back()}
                >
                    <FaChevronLeft size={16} />
                </button>
                <h3 className="font-heading-3 text-primary absolute left-1/2 -translate-x-1/2">
                    {trans.haybond.ownership_history}
                </h3>
            </div>
            <FilterTabs items={filterTabs} selectedKey={selectedBtnKey} onSelect={handleFilter} />
            {!ownershipHistories.isLoading && isEmpty && (
                <div className="bg-secondary flex w-80 items-center justify-center rounded py-12">
                    <EmptyState />
                </div>
            )}
            {!ownershipHistories.isLoading && !isEmpty && (
                <div
                    ref={listRef}
                    onWheel={handleWheel}
                    className="flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-3 overflow-y-auto"
                >
                    {ownershipHistoriesDynamic.content.map((item, index) => {
                        const { icon_url, name, saving_amount, end_date, status } = item;
                        const statusClass = getStatusClass(status);
                        return (
                            <button
                                type="button"
                                key={`dynamic-${index}`}
                                className="bg-secondary flex cursor-pointer items-center justify-between rounded p-3"
                                onClick={() => router.push('/haybond/chi-tiet-goi-linh-hoat')}
                            >
                                <div className="flex items-center gap-3">
                                    <Image src={icon_url || ''} width={40} height={40} alt="" />
                                    <div className="flex flex-col items-start">
                                        <span className="font-body-3 text-secondary">{name}</span>
                                        <span className="font-body-3-highlight text-primary">
                                            {formatNumberVN(saving_amount, { decimals: 0 })}đ
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end gap-1">
                                        <div
                                            className={`flex items-center gap-2 rounded-2xl border px-2 py-1 ${statusClass.border} ${statusClass.bg}`}
                                        >
                                            <FaCircle size={6} className={statusClass.dot} />
                                            <span className="font-caption text-primary">
                                                {getTextStatus(status)}
                                            </span>
                                        </div>
                                        <span className="font-caption text-secondary">
                                            {formatDate(end_date)}
                                        </span>
                                    </div>
                                    <FaChevronRight size={12} className="text-primary" />
                                </div>
                            </button>
                        );
                    })}
                    {ownershipHistories.content.map((item) => {
                        const { id, icon_url, name, saving_amount, end_date, status } = item;
                        const statusClass = getStatusClass(status);
                        return (
                            <button
                                type="button"
                                key={id}
                                className="bg-secondary flex cursor-pointer items-center justify-between rounded p-3"
                                onClick={() =>
                                    router.push({
                                        pathname: '/haybond/lich-su-so-huu/chi-tiet',
                                        query: { id },
                                    })
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <Image src={icon_url || ''} width={40} height={40} alt="" />
                                    <div className="flex flex-col items-start">
                                        <span className="font-body-3 text-secondary">{name}</span>
                                        <span className="font-body-3-highlight text-primary">
                                            {formatNumberVN(saving_amount, { decimals: 0 })}đ
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end gap-1">
                                        <div
                                            className={`flex items-center gap-2 rounded-2xl border px-2 py-1 ${statusClass.border} ${statusClass.bg}`}
                                        >
                                            <FaCircle size={6} className={statusClass.dot} />
                                            <span className="font-caption text-primary">
                                                {getTextStatus(status)}
                                            </span>
                                        </div>
                                        <span className="font-caption text-secondary">
                                            {formatDate(end_date)}
                                        </span>
                                    </div>
                                    <FaChevronRight size={12} className="text-primary" />
                                </div>
                            </button>
                        );
                    })}
                    <Spinner isLoading={ownershipHistories.isLoadMore} isOverlay={false} />
                </div>
            )}
        </div>
    );
};
