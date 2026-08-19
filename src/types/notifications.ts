export type NotificationExtraData = {
    imageUrl?: string;
    extraContent?: string;
    isSaved?: boolean;
    source?: string;
    hasCTA: boolean;
    ctaType?: string;
    ctaTitle?: string;
    ctaDestination?: string;
    ctaDestinationURL?: string;
    symbol?: string;
    price?: number;
    orderSide?: string;
    childTab?: string;
    appVersion?: string;
};

export type Notification = {
    notificationId: number;
    userId: number;
    title: string;
    content: string;
    createdAt: string;
    status: string;
    extraData?: NotificationExtraData;
    isShowFeedback?: boolean;
};

export type NotificationsResponse = {
    data: {
        results: Notification[];
        page_total?: number;
        total?: number;
        current_page?: number;
        next_page?: number;
        previous_page?: number;
    };
    error_code: string;
    message: string;
};

export type MqttPrefixResponse = {
    data: {
        prefix: string;
    };
    error_code: string;
    message: string;
};
