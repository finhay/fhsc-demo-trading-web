export type AssetsSummary = {
    net_asset_value: number;
    products: {
        total: number;
        stock: number;
        fund: number;
        saving: number | null;
        bond: number;
        child_savings: number;
        hay0: number;
        hay0_interest: number;
        hay0_depositing: number;
        hay0_withdrawing: number;
        /** CP/tiền chờ về từ quyền — optional để an toàn khi BE chưa ship */
        receivable?: {
            stock: number;
            cash: number;
        };
    };
    money: {
        total: number;
        ci_balance: number;
        ca_receiving: number;
        emk_amt: number;
        receiving_amt: number;
        baldefovd: number;
    };
    debt: {
        total: number;
        secure_amount: number;
        advance_amt: number;
        sms_fee_amt: number;
        cidepo_fee_acr: number;
        owe_deposit: number;
        cidepo_fee: number;
    };
    pnl: {
        stock: {
            pnl: number;
            pnl_rate: number;
        };
        fund: {
            pnl: number;
            pnl_rate: number;
        };
        child_savings: {
            pnl: number;
            pnl_rate: number;
        };
    };
};

export type AssetsSummaryResponse = {
    error_code: string;
    message: string;
    data: AssetsSummary;
};

export type AssetSnapshot = {
    user_id: number;
    cash_value: number;
    stock_value: number;
    fund_value: number;
    saving_value: number;
    child_saving_value: number;
    bond_value: number;
    debt_value: number;
    snapshot_date: string;
    hay0_value: number;
    net_asset_value: number;
};

export type AssetSnapshotResponse = {
    error_code: string;
    message: string;
    data: AssetSnapshot[];
};
