import { PRICE_COLOR_VARIANT } from '@/constants/trading';
import type { WatchlistStockItem } from '@/types/accounts/watchlist';
import type { StockPrice, StocksInfoItem } from '@/types/datafeed/stock-info';
import type { DepthRawRow } from '@/types/pages/trading';
import { makeWatchlistItem } from '@/utils/common';
import { formatBoardPrice, formatNumberVN } from '@/utils/format';

const getPriceColorVariant = (
    price: number,
    referencePrice: number,
    ceilingPrice = 0,
    floorPrice = 0,
) => {
    if (ceilingPrice > 0 && price === ceilingPrice) return PRICE_COLOR_VARIANT.PURPLE;
    if (floorPrice > 0 && price === floorPrice) return PRICE_COLOR_VARIANT.BLUE;
    if (price === referencePrice) return PRICE_COLOR_VARIANT.ORANGE;
    if (price < referencePrice) return PRICE_COLOR_VARIANT.RED;
    return PRICE_COLOR_VARIANT.GREEN;
};

export const calculatePriceRows = (dataPrice: StockPrice) => {
    const maxBidVol = Math.max(dataPrice.buyVol1, dataPrice.buyVol2, dataPrice.buyVol3) || 1;
    const maxAskVol = Math.max(dataPrice.sellVol1, dataPrice.sellVol2, dataPrice.sellVol3) || 1;
    const referencePrice = dataPrice.reference || 0;
    const ceilingPrice = dataPrice.ceiling || 0;
    const floorPrice = dataPrice.floor || 0;

    return [
        {
            bidQty: formatNumberVN(dataPrice.buyVol1, { decimals: 0 }),
            bidPrice: dataPrice.buyPrice1 > 0 ? formatBoardPrice(dataPrice.buyPrice1) : '',
            bidDepthPct: (dataPrice.buyVol1 / maxBidVol) * 100,
            askPrice: dataPrice.sellPrice1 > 0 ? formatBoardPrice(dataPrice.sellPrice1) : '',
            askDepthPct: (dataPrice.sellVol1 / maxAskVol) * 100,
            askQty: formatNumberVN(dataPrice.sellVol1, { decimals: 0 }),
            bidPriceVariant: getPriceColorVariant(
                dataPrice.buyPrice1,
                referencePrice,
                ceilingPrice,
                floorPrice,
            ),
            askPriceVariant: getPriceColorVariant(
                dataPrice.sellPrice1,
                referencePrice,
                ceilingPrice,
                floorPrice,
            ),
        },
        {
            bidQty: formatNumberVN(dataPrice.buyVol2, { decimals: 0 }),
            bidPrice: dataPrice.buyPrice2 > 0 ? formatBoardPrice(dataPrice.buyPrice2) : '',
            bidDepthPct: (dataPrice.buyVol2 / maxBidVol) * 100,
            askPrice: dataPrice.sellPrice2 > 0 ? formatBoardPrice(dataPrice.sellPrice2) : '',
            askDepthPct: (dataPrice.sellVol2 / maxAskVol) * 100,
            askQty: formatNumberVN(dataPrice.sellVol2, { decimals: 0 }),
            bidPriceVariant: getPriceColorVariant(
                dataPrice.buyPrice2,
                referencePrice,
                ceilingPrice,
                floorPrice,
            ),
            askPriceVariant: getPriceColorVariant(
                dataPrice.sellPrice2,
                referencePrice,
                ceilingPrice,
                floorPrice,
            ),
        },
        {
            bidQty: formatNumberVN(dataPrice.buyVol3, { decimals: 0 }),
            bidPrice: dataPrice.buyPrice3 > 0 ? formatBoardPrice(dataPrice.buyPrice3) : '',
            bidDepthPct: (dataPrice.buyVol3 / maxBidVol) * 100,
            askPrice: dataPrice.sellPrice3 > 0 ? formatBoardPrice(dataPrice.sellPrice3) : '',
            askDepthPct: (dataPrice.sellVol3 / maxAskVol) * 100,
            askQty: formatNumberVN(dataPrice.sellVol3, { decimals: 0 }),
            bidPriceVariant: getPriceColorVariant(
                dataPrice.buyPrice3,
                referencePrice,
                ceilingPrice,
                floorPrice,
            ),
            askPriceVariant: getPriceColorVariant(
                dataPrice.sellPrice3,
                referencePrice,
                ceilingPrice,
                floorPrice,
            ),
        },
    ];
};

export const buildDepthRawRows = (d: StockPrice): DepthRawRow[] => {
    return [
        {
            buyPrice: d.buyPrice1,
            buyVol: d.buyVol1,
            sellPrice: d.sellPrice1,
            sellVol: d.sellVol1,
        },
        {
            buyPrice: d.buyPrice2,
            buyVol: d.buyVol2,
            sellPrice: d.sellPrice2,
            sellVol: d.sellVol2,
        },
        {
            buyPrice: d.buyPrice3,
            buyVol: d.buyVol3,
            sellPrice: d.sellPrice3,
            sellVol: d.sellVol3,
        },
    ];
};

export const mapWatchlistItemToStock = (item: WatchlistStockItem): StocksInfoItem => ({
    symbol: item.symbol,
    name: item.name,
    exchange: item.exchange,
    stock_type: item.stockType,
    floor: item.floor,
    floorCode: '',
    ceiling: item.ceiling,
    reference: item.reference,
    price: item.price,
    price_change: item.change,
    price_change_percent: item.changePercent,
    volume: item.volume,
    total_volume: item.totalVolume,
    buyPrice1: item.buyPrice1,
    buyPrice2: item.buyPrice2,
    buyPrice3: item.buyPrice3,
    buyVol1: item.buyVol1,
    buyVol2: item.buyVol2,
    buyVol3: item.buyVol3,
    sellPrice1: item.sellPrice1,
    sellPrice2: item.sellPrice2,
    sellPrice3: item.sellPrice3,
    sellVol1: item.sellVol1,
    sellVol2: item.sellVol2,
    sellVol3: item.sellVol3,
    highPrice: item.high,
    lowPrice: item.low,
    mediumPrice: item.average,
    totalValue: item.totalValue,
    foreignBought: item.foreignBought,
    foreignSold: item.foreignSold,
    foreignRemain: item.foreignRemain,
    remainAsk: item.remainAsk ?? 0,
    remainBid: item.remainBid ?? 0,
    pe: 0,
    pb: 0,
    roe: 0,
    companyType: '',
    stockSummary: '',
});

export const mapStockToWatchlistItem = (item: StocksInfoItem): WatchlistStockItem =>
    makeWatchlistItem({
        symbol: item.symbol,
        name: item.name,
        exchange: item.exchange,
        stockType: item.stock_type,
        floor: item.floor,
        ceiling: item.ceiling,
        reference: item.reference,
        price: item.price,
        change: item.price_change,
        changePercent: item.price_change_percent,
        volume: item.volume,
        totalVolume: item.total_volume,
        buyPrice1: item.buyPrice1,
        buyPrice2: item.buyPrice2,
        buyPrice3: item.buyPrice3,
        buyVol1: item.buyVol1,
        buyVol2: item.buyVol2,
        buyVol3: item.buyVol3,
        sellPrice1: item.sellPrice1,
        sellPrice2: item.sellPrice2,
        sellPrice3: item.sellPrice3,
        sellVol1: item.sellVol1,
        sellVol2: item.sellVol2,
        sellVol3: item.sellVol3,
        high: item.highPrice,
        low: item.lowPrice,
        average: item.mediumPrice,
        totalValue: item.totalValue,
        foreignBought: item.foreignBought,
        foreignSold: item.foreignSold,
        foreignRemain: item.foreignRemain,
        remainAsk: item.remainAsk,
        remainBid: item.remainBid,
    });
