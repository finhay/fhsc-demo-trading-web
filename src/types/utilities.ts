export type OrderFileItem = {
    id: number;
    isValid: boolean;
    message: string;
    order_side: string;
    order_type: string;
    price: number;
    quantity: number;
    symbol: string;
};

export type OrderFileListResponse = {
    error_code: string;
    message: string;
    data: OrderFileItem[];
};
