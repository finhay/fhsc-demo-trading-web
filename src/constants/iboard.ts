import type { ColumnKey, ExchangeTab, LeafColumn } from '@/types/pages/iboard';

export const PRICE_BOARD_TABS: ExchangeTab[] = [
    {
        key: 'vn30',
        type: 'single',
        option: { value: 'VN30', label: 'VN30' },
    },
    {
        key: 'hose',
        type: 'single',
        option: { value: 'HOSE', label: 'HOSE' },
    },
    {
        key: 'hnx30',
        type: 'single',
        option: { value: 'HNX30', label: 'HNX30' },
    },
    {
        key: 'hnx',
        type: 'single',
        option: { value: 'HNX', label: 'HNX' },
    },
    {
        key: 'upcom',
        type: 'single',
        option: { value: 'UPCOM', label: 'UPCOM' },
    },
    {
        key: 'warrant',
        type: 'single',
        option: { value: 'WARRANT', label: 'Chứng quyền' },
    },
    {
        key: 'etf',
        type: 'single',
        option: { value: 'ETF', label: 'ETF' },
    },
    {
        key: 'bond',
        type: 'single',
        option: { value: 'BOND', label: 'Trái phiếu' },
    },
    {
        key: 'odd-lot-group',
        type: 'dropdown',
        defaultLabel: 'Lô lẻ',
        options: [
            { value: 'LO-LE-HOSE', label: 'Lô lẻ HOSE' },
            { value: 'LO-LE-HNX', label: 'Lô lẻ HNX' },
            { value: 'LO-LE-UPCOM', label: 'Lô lẻ UPCOM' },
        ],
    },
];

export const LEAF_COLUMNS: LeafColumn[] = [
    { key: 'symbol', label: 'Mã' },
    { key: 'reference', label: 'TC' },
    { key: 'ceiling', label: 'Trần' },
    { key: 'floor', label: 'Sàn' },
    { key: 'totalVol', label: 'Tổng KL' },
    { key: 'totalVal', label: 'Tổng GT' },
    { key: 'bid3', label: 'Giá 3' },
    { key: 'bid3Vol', label: 'KL 3' },
    { key: 'bid2', label: 'Giá 2' },
    { key: 'bid2Vol', label: 'KL 2' },
    { key: 'bid1', label: 'Giá 1' },
    { key: 'bid1Vol', label: 'KL 1' },
    { key: 'price', label: 'Giá' },
    { key: 'vol', label: 'KL' },
    { key: 'change', label: '+/-' },
    { key: 'changePercent', label: '%' },
    { key: 'offer1', label: 'Giá 1' },
    { key: 'offer1Vol', label: 'KL 1' },
    { key: 'offer2', label: 'Giá 2' },
    { key: 'offer2Vol', label: 'KL 2' },
    { key: 'offer3', label: 'Giá 3' },
    { key: 'offer3Vol', label: 'KL 3' },
    { key: 'high', label: 'Cao' },
    { key: 'medium', label: 'TB' },
    { key: 'low', label: 'Thấp' },
    { key: 'foreignBought', label: 'Mua' },
    { key: 'foreignSold', label: 'Bán' },
    { key: 'foreignRemain', label: 'Dư' },
];

export const IBOARD_COLUMN_WIDTH_PX: Record<ColumnKey, number> = {
    symbol: 83,
    reference: 55,
    ceiling: 55,
    floor: 55,
    totalVol: 113,
    totalVal: 113,
    bid3: 55,
    bid3Vol: 73,
    bid2: 55,
    bid2Vol: 73,
    bid1: 55,
    bid1Vol: 73,
    price: 55,
    vol: 63,
    change: 63,
    changePercent: 63,
    offer1: 55,
    offer1Vol: 73,
    offer2: 55,
    offer2Vol: 73,
    offer3: 55,
    offer3Vol: 73,
    high: 55,
    medium: 55,
    low: 55,
    foreignBought: 73,
    foreignSold: 73,
    foreignRemain: 93,
};

export const IBOARD_TERTIARY_BG_COLUMN_KEYS = new Set<ColumnKey>([
    'reference',
    'ceiling',
    'floor',
    'totalVol',
    'totalVal',
    'price',
    'vol',
    'change',
    'changePercent',
    'high',
    'medium',
    'low',
]);

export const IBOARD_BID_ASK_PRICE_KEYS = new Set<ColumnKey>([
    'bid1',
    'bid2',
    'bid3',
    'offer1',
    'offer2',
    'offer3',
]);

export const ODD_LOT_EXCHANGES = new Set(['LO-LE-HOSE', 'LO-LE-HNX', 'LO-LE-UPCOM']);
export const INDEX_EXCHANGES = new Set(['VN30', 'HNX30']);
export const TYPE_EXCHANGES = new Set(['WARRANT', 'ETF', 'BOND']);
