export type ExchangeOption = {
    value: string;
    label: string;
};

export type ExchangeTab =
    | {
          key: string;
          type: 'single';
          option: ExchangeOption;
      }
    | {
          key: string;
          type: 'dropdown';
          defaultLabel: string;
          options: ExchangeOption[];
      };

export type ColumnKey =
    | 'symbol'
    | 'reference'
    | 'ceiling'
    | 'floor'
    | 'totalVol'
    | 'totalVal'
    | 'bid3'
    | 'bid3Vol'
    | 'bid2'
    | 'bid2Vol'
    | 'bid1'
    | 'bid1Vol'
    | 'price'
    | 'vol'
    | 'change'
    | 'changePercent'
    | 'offer1'
    | 'offer1Vol'
    | 'offer2'
    | 'offer2Vol'
    | 'offer3'
    | 'offer3Vol'
    | 'high'
    | 'medium'
    | 'low'
    | 'foreignBought'
    | 'foreignSold'
    | 'foreignRemain';

export type LeafColumn = {
    key: ColumnKey;
    label: string;
};

export type IboardDisplayRow = {
    _raw: import('@/proto/stock').StockPriceMessage;
    symbol: string;
} & {
    [K in Exclude<ColumnKey, 'symbol'>]: number | null;
};

export type IboardRealtimeCellBgMap = Record<string, Partial<Record<string, string>>>;
