export type GetPointResponse = {
    error_code: string;
    message: string;
    popup_message?: string | null;
    data: {
        amount: number;
    };
};

export type PointHistoryItem = {
    user_id: number;
    created_at: string;
    extra_data: string | null;
    point: number;
    source: string;
    description: string;
};

export type GetPointHistoriesResponse = {
    error_code: string;
    message: string;
    popup_message?: string | null;
    data: {
        histories: PointHistoryItem[];
        next_offset: number;
    };
};

export type RewardItem = {
    point_cost: number;
    expired_time: string;
    brand_image: string;
    brand_banner: string;
    is_available: boolean;
    id: string;
    subtitle: string;
    name: string;
    price: number;
    quantity: number;
    images: string[];
    note: string;
    offices: OfficeItem[];
};

export type GetListingRewardResponse = {
    error_code: string;
    message: string;
    popup_message?: string | null;
    data: {
        content: RewardItem[];
        page: number;
        size: number;
        total_page: number;
        total_element: number;
    };
};

export type GetRewardDetailResponse = {
    error_code: string;
    message: string;
    popup_message?: string | null;
    data: RewardItem;
};

export type GetOwnedRewardResponse = {
    error_code: string;
    message: string;
    popup_message?: string | null;
    data: OwnedRewardItem;
};

export type OwnedRewardItem = {
    transaction_id: string;
    code_display_type: string;
    expired_date: string;
    expired_time: number;
    code_image: string;
    is_valid: boolean;
    created_at: string;
    reward_id: string;
    id: number;
    name: string;
    image: string;
    url: string;
    code: string;
    price: number;
    brand: {
        id: string;
        name: string;
        image: string;
        banner: string;
    };
    offices: OfficeItem[];
    serial: string;
    token: string;
    pin: string;
    status: string;
    note: string;
};

export type GetOwnedRewardsResponse = {
    error_code: string;
    message: string;
    popup_message?: string | null;
    data: OwnedRewardItem[];
};

export type BrandItem = {
    cat_id: string;
    cat_title: string;
    parent_cat_id: string | null;
    gift_count: number;
    id: string;
    name: string;
    description: string;
    banner: string;
    image: string;
};

export type GetListingBrandResponse = {
    error_code: string;
    message: string;
    popup_message?: string | null;
    data: {
        content: BrandItem[];
        page: number;
        size: number;
        total_page: number;
        total_element: number;
    };
};

export type CategoryItem = {
    id: string;
    name: string;
    image: string;
};

export type GetListingCategoryResponse = {
    error_code: string;
    message: string;
    popup_message?: string | null;
    data: {
        content: CategoryItem[];
        page: number;
        size: number;
        total_page: number;
        total_element: number;
    };
};

export type ClaimRewardItemBrand = {
    id: string;
    name: string;
    image: string;
};

export type ClaimRewardItem = {
    id: string;
    point_cost: number;
    name: string;
    image: string;
    brand: ClaimRewardItemBrand;
};

export type ClaimRewardBody = {
    partner_id: number;
    items: {
        amount: number;
        item: ClaimRewardItem;
    }[];
};

export type ClaimRewardResponse = {
    error_code: string;
    message: string;
    popup_message?: string | null;
    data: OwnedRewardItem[];
};

export type GetOwnedRewardOfficesResponse = {
    error_code: string;
    message: string;
    popup_message?: string | null;
    data: {
        content: OfficeItem[];
        page: number;
        size: number;
        total_page: number;
        total_element: number;
    };
};

export type PatchOwnedRewardMarkUsedResponse = {
    error_code: string;
    message: string;
};

export type OfficeItem = {
    id: string;
    address: string;
    latitude: string;
    longitude: string;
    code: string;
    phone: string;
    city: string;
};
