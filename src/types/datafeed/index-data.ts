export type IndexRealtimeData = {
    index: string;
    indexValue: number;
    allQuantity: number;
    change: number;
    changePercent: number;
    reference: number;
    values: number[];
    volumes: number[];
    times: number[];
    allValue: number;
    advances: number;
    declines: number;
    nochanges: number;
    advancesArr: number[];
    declinesArr: number[];
    nochangesArr: number[];
    ceiling: number;
    floor: number;
    ceilings: number[];
    floors: number[];
    sessionInExchange: string;
    name: string;
};

export type IndexRealtimeResponse = {
    result: IndexRealtimeData[];
    error_code: string;
    message: string;
};
