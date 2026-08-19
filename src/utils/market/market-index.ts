import type { MarketLeaderboardItem } from '@/types/datafeed/trading-data';
import type { MarketBreadthChartData } from '@/types/pages/market';

export const sortTopInfluenceLeaderboard = (
    items: MarketLeaderboardItem[],
): MarketLeaderboardItem[] =>
    [...items].sort((a, b) => (b.influenceScore ?? 0) - (a.influenceScore ?? 0)).slice(0, 5);

export const hasMarketBreadthData = (data: MarketBreadthChartData | null | undefined): boolean => {
    if (!data?.times?.length) return false;
    const arrays = [data.floors, data.declines, data.nochanges, data.advances, data.ceilings];
    return arrays.some((arr) => Array.isArray(arr) && arr.some((v) => v > 0));
};
