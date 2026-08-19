export enum TrackingAction {
    Tap = 'Tap',
    Click = 'Click',
    Open = 'Open',
    Close = 'Close',
    Show = 'Show',
    Collect = 'Collect',
}

export enum TrackingCompany {
    Finhay = 'Finhay',
    VNSC = 'VNSC',
}

export type TrackingApiPayload = {
    user_id: string | null;
    action: string;
    screen_name: string;
    timestamp: number;
    product_name: string;
    source: string;
    device_id: string | null;
    enviroment: string;
    field_name_1: string | null;
    field_name_2: string | null;
    field_name_3: string | null;
    field_name_4: string | null;
    field_name_5: string | null;
    value_1: string | null;
    value_2: string | null;
    value_3: string | null;
    value_4: string | null;
    value_5: string | null;
};
