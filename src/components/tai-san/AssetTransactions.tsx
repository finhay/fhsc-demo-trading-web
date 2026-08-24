'use client';

import { EmptyState } from '@/components/common/feature/EmptyState';

/**
 * Bản demo không có dòng tiền thật nên simulator không cung cấp lịch sử tiền.
 * Giữ khối để bố cục cột trái không đổi, luôn hiển thị trạng thái rỗng.
 */
export const AssetTransactions = () => {
    return (
        <section className="flex w-full shrink-0 flex-col gap-3 rounded-xl bg-secondary p-3">
            <h2 className="shrink-0 font-body-2-highlight text-primary">{'Lịch sử tiền'}</h2>
            <div className="h-96 overflow-y-auto">
                <div className="flex h-full w-full items-center justify-center">
                    <EmptyState />
                </div>
            </div>
        </section>
    );
};
