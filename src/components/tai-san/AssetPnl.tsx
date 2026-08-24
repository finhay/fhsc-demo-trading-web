'use client';

import { EmptyState } from '@/components/common/feature/EmptyState';

/**
 * Simulator chưa có endpoint lãi/lỗ đã chốt theo lệnh bán. Giữ khối để bố cục không đổi,
 * luôn hiển thị trạng thái rỗng.
 */
export const AssetPnl = () => {
    return (
        <section className="flex h-full w-full min-h-0 shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-secondary p-3">
            <h2 className="shrink-0 font-body-2-highlight text-primary">{'Lãi/lỗ đã chốt'}</h2>
            <div className="min-h-0 flex-1">
                <div className="flex h-full w-full items-center justify-center">
                    <EmptyState />
                </div>
            </div>
        </section>
    );
};
