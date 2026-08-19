import type { GlobalIndexRawItem } from '@/types/datafeed/finance';

export const mapGlobalIndexPoints = (items: GlobalIndexRawItem[]) =>
    items.map((item) => ({
        index: item.index_name,
        name: item.name,
        indexValue: item.current_ohlc.close,
        change: parseFloat(item.current_ohlc.change),
        changePercent: parseFloat(item.current_ohlc.change_pct),
        values: item.history_ohlc.map((ohlc) => ohlc.close),
    }));
