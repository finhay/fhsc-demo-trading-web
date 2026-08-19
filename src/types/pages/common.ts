import type { IndexRealtime } from '@/types/common';

export type SortableColMeta = {
    align?: 'left' | 'right';
};

export type BuildMarketPageTitleParams = {
    exchange: string;
    marketIndexes: Array<IndexRealtime | null | undefined> | null | undefined;
    pageSuffix: string;
    fallbackTitle: string;
    fallbackDisplayName?: string;
};
