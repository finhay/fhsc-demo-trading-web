export type UserRightRegisterPayload = {
    caMastId: string;
    quantity: string;
};

export type UserRightRegisterResponse = {
    error_code: string;
    message: string;
    result?: {
        status: string;
    };
};

export type UserRightEventType =
    | 'STOCK_RIGHT'
    | 'STOCK_DIVIDEND'
    | 'CASH_DIVIDEND'
    | 'SHAREHOLDER_MEETING'
    | 'BONUS_SHARES';

export type UserRightRegisterStatus = 'UNREGISTER' | 'REGISTERED' | 'EXPIRED' | 'RECEIVED';

export type UserRightStatus = 'COMPLETED' | 'ALLOCATION_COMPLETED' | 'PENDING';

export type UserRightItem = {
    accountId: string;
    depositoryNumber: string;
    fullName: string;
    ownNumberOfShare: number;
    ratio: string;
    status: UserRightStatus;
    userRightRegisterStatus: UserRightRegisterStatus;
    caMastId: string;
    amount: number;
    symbol: string;
    toSymbol: string;
    numberOfWaitingStock: number;
    waitingAmountForReturn: number;
    rightOffRate: number | null;
    buyPrice: number;
    allowRegister: boolean;
    totalStocksCanBuy: number;
    totalPayAmount: number;
    startDate: string | null;
    finishDate: string | null;
    startDateTransfer: string | null;
    actionDate: string;
    finishDateTransfer: string | null;
    reportDate: string;
    type: UserRightEventType;
    stockName: string;
    totalVolume: number;
    totalValue: number;
    referencePrice: number;
    closePrice: number;
    ceilingPrice: number;
    floorPrice: number;
    predictPrice: number;
    changePrice: number;
    hasRead: boolean;
};

export type UserRightsFilters = {
    symbol?: string;
    fromDate?: string;
    toDate?: string;
    catType?: string;
    status?: string;
};

export type UserRightsResponse = {
    error_code: string;
    message: string;
    result: UserRightItem[];
};
