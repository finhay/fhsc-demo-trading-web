import type { MetalProviderItem } from '@/types/datafeed/finance';
import { formatNumberVN } from '@/utils/format';

type MetalProviderGroup = {
    provider: string;
    providerIcon: string | null;
    items: MetalProviderItem[];
};

export const formatMetalPrice = (value: number) =>
    value ? formatNumberVN(value / 1000, { decimals: 2 }) : '--';

export const formatMetalChangePercent = (value: number | null | undefined) => {
    if (value == null) return null;
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${sign}${formatNumberVN(Math.abs(value), { decimals: 2 })}%`;
};

export const groupMetalProviders = (items: MetalProviderItem[]): MetalProviderGroup[] => {
    const map = new Map<string, MetalProviderGroup>();
    items.forEach((item) => {
        const key = item.provider || item.index;
        const existing = map.get(key);
        if (existing) {
            existing.items.push(item);
            return;
        }
        map.set(key, {
            provider: item.provider,
            providerIcon: item.provider_icon,
            items: [item],
        });
    });
    return Array.from(map.values());
};
