export type NewsEventItem = {
    news_id: number;
    title: string;
    content: string;
    symbols: string;
    created_at: string;
    is_read: boolean;
    favorite: number;
};

export type NewsEventResponse = {
    error_code: string;
    message: string;
    data: {
        news: NewsEventItem[];
        next_page: number;
    };
};

export type PutFavoriteNewsEventResponse = {
    error_code: string;
    message: string;
    data: {
        success: boolean;
    };
};
