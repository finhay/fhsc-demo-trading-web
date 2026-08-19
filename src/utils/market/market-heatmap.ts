import type { StockPriceMessage } from '@/proto/stock';
import type {
    HeatmapSector,
    HeatmapSectorStockItem,
    HeatmapTreemapNode,
} from '@/types/pages/market';

const getStockColor = (
    price: number,
    ceiling: number,
    floor: number,
    changePercent: number,
): string => {
    if (price >= ceiling) return '#b354e3';
    if (price <= floor) return '#2994ff';
    if (changePercent > 0) return '#3ac45c';
    if (changePercent < 0) return '#eb4337';
    return '#e98e00';
};

export const getStockChangeColor = (
    price: number,
    ceiling: number,
    floor: number,
    changePercent: number,
): string => {
    if (price >= ceiling) return 'text-purple';
    if (price <= floor) return 'text-blue';
    if (changePercent > 0) return 'text-green';
    if (changePercent < 0) return 'text-red';
    return 'text-orange';
};

export const filterHeatmapSectors = (sectors: HeatmapSector[]): HeatmapSector[] =>
    sectors
        .map((sector) => ({
            ...sector,
            stocks: sector.stocks.filter((stock) => stock.totalVolume > 0),
        }))
        .filter((sector) => sector.stocks.length > 0);

export const mergeHeatmapStockMqttUpdate = (
    stock: HeatmapSectorStockItem,
    update: StockPriceMessage,
): HeatmapSectorStockItem => ({
    ...stock,
    price: update.price ?? stock.price,
    changePercent: Number.isFinite(update.changePercent)
        ? (update.changePercent ?? stock.changePercent)
        : stock.changePercent,
    totalValue: update.totalVal || stock.totalValue,
    totalVolume: update.totalVol || stock.totalVolume,
    reference: update.reference ?? stock.reference,
    floor: update.floor ?? stock.floor,
    ceiling: update.ceiling ?? stock.ceiling,
});

export const buildEChartsTreemapData = (sectors: HeatmapSector[]): HeatmapTreemapNode[] => {
    const sectorPalette = [
        '#5470c6',
        '#91cc75',
        '#fac858',
        '#ee6666',
        '#73c0de',
        '#3ba272',
        '#fc8452',
        '#9a60b4',
        '#ea7ccc',
    ];
    const nodes: HeatmapTreemapNode[] = [];

    sectors.forEach((sector, sectorIndex) => {
        const filtered = sector.stocks.filter((s) => s.totalValue > 0);
        const top40 = [...filtered].sort((a, b) => b.totalValue - a.totalValue).slice(0, 50);

        const sectorValue =
            sector.totalValue > 0
                ? sector.totalValue
                : top40.reduce((acc, s) => acc + (s.totalValue || 0), 0);

        if (sectorValue <= 0) return;

        const sectorColor =
            top40.length === 0 ? sectorPalette[sectorIndex % sectorPalette.length] : '#1e1f21';

        const children = top40.map((stock) => {
            const pct = Number.isFinite(stock.changePercent) ? stock.changePercent : 0;
            const color = getStockColor(
                stock.price,
                stock.ceiling,
                stock.floor,
                stock.changePercent,
            );
            return {
                name: stock.symbol,
                value: Math.max(stock.totalValue || 0, 1),
                symbol: stock.symbol,
                stockName: stock.name,
                changePercent: pct,
                price: stock.price,
                ceiling: stock.ceiling,
                floor: stock.floor,
                totalValue: stock.totalValue,
                totalVolume: stock.totalVolume,
                itemStyle: { color },
                emphasis: { itemStyle: { color: `${color}cc` } },
            };
        });

        nodes.push({
            name: sector.name,
            value: sectorValue,
            itemStyle: { color: sectorColor },
            children,
        });
    });

    return nodes;
};
