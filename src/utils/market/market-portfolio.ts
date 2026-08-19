import { PORTFOLIO_ACTIVE_RING, PORTFOLIO_CHART } from '@/constants/market';
import type { StockPriceMessage } from '@/proto/stock';
import type { StocksInfoItem } from '@/types/datafeed/stock-info';
import type {
    MarketPortfolioChartItem,
    MarketPortfolioChartSegment,
    MarketPortfolioView,
} from '@/types/pages/market';

export const polarToPoint = (radius: number, deg: number): [number, number] => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [
        PORTFOLIO_CHART.center + radius * Math.cos(rad),
        PORTFOLIO_CHART.center + radius * Math.sin(rad),
    ];
};

export const describeArcPath = (radius: number, startDeg: number, endDeg: number): string => {
    const [sx, sy] = polarToPoint(radius, startDeg);
    const [ex, ey] = polarToPoint(radius, endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${sx.toFixed(3)} ${sy.toFixed(3)} A ${radius} ${radius} 0 ${largeArc} 1 ${ex.toFixed(3)} ${ey.toFixed(3)}`;
};

export const describeDonutSegmentPath = (
    rOuter: number,
    rInner: number,
    startDeg: number,
    endDeg: number,
): string => {
    const [osx, osy] = polarToPoint(rOuter, startDeg);
    const [oex, oey] = polarToPoint(rOuter, endDeg);
    const [iex, iey] = polarToPoint(rInner, endDeg);
    const [isx, isy] = polarToPoint(rInner, startDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return [
        `M ${osx.toFixed(3)} ${osy.toFixed(3)}`,
        `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${oex.toFixed(3)} ${oey.toFixed(3)}`,
        `L ${iex.toFixed(3)} ${iey.toFixed(3)}`,
        `A ${rInner} ${rInner} 0 ${largeArc} 0 ${isx.toFixed(3)} ${isy.toFixed(3)}`,
        'Z',
    ].join(' ');
};

export const buildPortfolioChartSegments = (
    items: MarketPortfolioChartItem[],
): MarketPortfolioChartSegment[] => {
    const total = items.reduce((sum, item) => sum + item.ratio, 0);
    if (total <= 0) return [];
    const { arcStartDeg, arcSpanDeg } = PORTFOLIO_CHART;
    let cursor = arcStartDeg;
    return items.map((item) => {
        const span = (item.ratio / total) * arcSpanDeg;
        const segment = { ...item, start: cursor, end: cursor + span, mid: cursor + span / 2 };
        cursor += span;
        return segment;
    });
};

const getPortfolioArcCenterDeg = (): number =>
    PORTFOLIO_CHART.arcStartDeg + PORTFOLIO_CHART.arcSpanDeg / 2;

export const getPortfolioActiveShift = (
    segments: MarketPortfolioChartSegment[],
    activeSymbol: string,
): number => {
    const active = segments.find((segment) => segment.symbol === activeSymbol) ?? segments[0];
    if (!active) return 0;
    return getPortfolioArcCenterDeg() - active.mid;
};

export const shortestArcDelta = (from: number, to: number, period: number): number => {
    let delta = ((to - from) % period) + period;
    delta %= period;
    if (delta > period / 2) delta -= period;
    return delta;
};

export const easePortfolioChartShift = (t: number): number => 1 - (1 - t) ** 3;

export const shiftPortfolioSegments = (
    segments: MarketPortfolioChartSegment[],
    shiftDeg: number,
): MarketPortfolioChartSegment[] => {
    const { arcStartDeg, arcSpanDeg } = PORTFOLIO_CHART;
    const arcEndDeg = arcStartDeg + arcSpanDeg;
    const wrap = (deg: number) => {
        let offset = (deg - arcStartDeg) % arcSpanDeg;
        if (offset < 0) offset += arcSpanDeg;
        return arcStartDeg + offset;
    };

    const shifted: MarketPortfolioChartSegment[] = [];
    segments.forEach((segment) => {
        const span = segment.end - segment.start;
        const start = wrap(segment.start + shiftDeg);
        const end = start + span;
        if (end <= arcEndDeg + 0.001) {
            shifted.push({ ...segment, start, end, mid: (start + end) / 2 });
            return;
        }
        shifted.push({ ...segment, start, end: arcEndDeg, mid: (start + arcEndDeg) / 2 });
        const remain = end - arcEndDeg;
        shifted.push({
            ...segment,
            start: arcStartDeg,
            end: arcStartDeg + remain,
            mid: arcStartDeg + remain / 2,
        });
    });
    return shifted;
};

export const trimPortfolioSegmentSpan = (
    segment: MarketPortfolioChartSegment,
): [number, number] => {
    const span = segment.end - segment.start;
    const gap = Math.min(PORTFOLIO_CHART.gapDeg, Math.max(0, span - PORTFOLIO_CHART.minSpanDeg));
    return [segment.start + gap / 2, segment.end - gap / 2];
};

export const getPortfolioRaiseOffset = (_midDeg: number, raisePx: number): [number, number] => [
    0,
    -raisePx,
];

export const getPortfolioWallRadialStops = (rBase: number): number[] => {
    const { depthPx, wallRampFromTop } = PORTFOLIO_ACTIVE_RING;
    const rTop = rBase + depthPx;
    return [...wallRampFromTop].reverse().map((f) => (rBase + (1 - f) * depthPx) / rTop);
};

export const getPortfolioEndWallGradientAxis = (
    deg: number,
    raiseX: number,
    raiseY: number,
): [number, number, number, number] => {
    const rad = ((deg - 90) * Math.PI) / 180;
    const nx = -Math.sin(rad);
    const ny = Math.cos(rad);
    const k = raiseX * nx + raiseY * ny;
    const kSafe = Math.abs(k) < 2 ? Math.sign(k || 1) * 2 : k;
    const [px, py] = polarToPoint(PORTFOLIO_CHART.radiusActive, deg);
    const x1 = px + raiseX;
    const y1 = py + raiseY;
    return [x1, y1, x1 - kSafe * nx, y1 - kSafe * ny];
};

export const describePortfolioInnerWallPath = (
    startDeg: number,
    endDeg: number,
    raiseX: number,
    raiseY: number,
): string => {
    const { rInner } = PORTFOLIO_ACTIVE_RING;
    const [tsx, tsy] = polarToPoint(rInner, startDeg);
    const [tex, tey] = polarToPoint(rInner, endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return [
        `M ${(tsx + raiseX).toFixed(3)} ${(tsy + raiseY).toFixed(3)}`,
        `A ${rInner} ${rInner} 0 ${largeArc} 1 ${(tex + raiseX).toFixed(3)} ${(tey + raiseY).toFixed(3)}`,
        `L ${tex.toFixed(3)} ${tey.toFixed(3)}`,
        `A ${rInner} ${rInner} 0 ${largeArc} 0 ${tsx.toFixed(3)} ${tsy.toFixed(3)}`,
        'Z',
    ].join(' ');
};

export const describePortfolioEndWallPath = (
    deg: number,
    raiseX: number,
    raiseY: number,
): string => {
    const { rOuter, rInner } = PORTFOLIO_ACTIVE_RING;
    const [ox, oy] = polarToPoint(rOuter, deg);
    const [ix, iy] = polarToPoint(rInner, deg);
    return [
        `M ${(ox + raiseX).toFixed(3)} ${(oy + raiseY).toFixed(3)}`,
        `L ${(ix + raiseX).toFixed(3)} ${(iy + raiseY).toFixed(3)}`,
        `L ${ix.toFixed(3)} ${iy.toFixed(3)}`,
        `L ${ox.toFixed(3)} ${oy.toFixed(3)}`,
        'Z',
    ].join(' ');
};

export const buildMarketPortfolioView = (
    stocks: StocksInfoItem[],
    quantities: Record<string, number>,
): MarketPortfolioView => {
    let totalCurrent = 0;
    let totalRef = 0;
    const rawRows = stocks
        .map((stock) => {
            const quantity = quantities[stock.symbol] ?? 0;
            const price = stock.price > 0 ? stock.price : stock.reference;
            const marketValue = quantity * price;
            const change = stock.price > 0 ? stock.price_change : 0;
            totalCurrent += marketValue;
            totalRef += quantity * stock.reference;
            return {
                symbol: stock.symbol,
                price,
                reference: stock.reference,
                floor: stock.floor,
                ceiling: stock.ceiling,
                marketValue,
                quantity,
                change,
                changePercent: stock.price > 0 ? stock.price_change_percent : 0,
            };
        })
        .filter((row) => row.marketValue > 0)
        .sort((a, b) => b.marketValue - a.marketValue);
    const rows = rawRows.map(({ quantity, ...row }) => ({
        ...row,
        impactPercent: totalRef > 0 ? ((quantity * row.change) / totalRef) * 100 : 0,
        weightPercent: totalCurrent > 0 ? (row.marketValue / totalCurrent) * 100 : 0,
    }));
    return {
        rows,
        chartItems: rows.map((row) => ({
            symbol: row.symbol,
            ratio: totalCurrent > 0 ? row.marketValue / totalCurrent : 0,
            isUp: row.change >= 0,
        })),
        portfolioChangePercent: totalRef > 0 ? ((totalCurrent - totalRef) / totalRef) * 100 : 0,
    };
};

export const mergePortfolioStockMqttUpdate = (
    stock: StocksInfoItem,
    update: StockPriceMessage,
): StocksInfoItem => ({
    ...stock,
    price: update.price ?? stock.price,
    price_change: update.change ?? stock.price_change,
    price_change_percent: update.changePercent ?? stock.price_change_percent,
    floor: update.floor ?? stock.floor,
    ceiling: update.ceiling ?? stock.ceiling,
    reference: update.reference ?? stock.reference,
});
