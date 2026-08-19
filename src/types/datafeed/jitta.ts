export type JittaScoreItem = {
    symbol: string;
    name: string;
    exchange: string;
    score: string;
    sector_code: string;
    industry_code: string;
    loss_change_percent: number;
    valuation_percent: number;
    valuation_type: string;
};

export type JittaScoreResponse = {
    error_code: string;
    message: string;
    data: JittaScoreItem[];
};

export type JittaBySymbolData = {
    symbol: string;
    name: string;
    exchange: string;
    score: string;
    sector: {
        code: string;
        name: string;
        total_symbol: number;
    };
    industry: {
        code: string;
        name: string;
        total_symbol: number;
    };
    sector_ranking: number;
    industry_ranking: number;
    country_ranking: number;
    total_symbol: number;
    loss_chance_percent: number;
    valuation_type: string;
    valuation_percent: number | null;
    related: Array<{
        symbol: string;
        name: string;
        exchange: string;
        score: string;
        sector_code: string;
        industry_code: string;
        loss_chance_percent: number;
        valuation_type: string;
        valuation_percent: number | null;
    }>;
};

export type JittaBySymbolResponse = {
    error_code: string;
    message: string;
    data: JittaBySymbolData;
};
