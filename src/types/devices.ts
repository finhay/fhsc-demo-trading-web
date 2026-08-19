export type DeviceType = 'IOS' | 'ANDROID' | 'WEB';

export type UserDevice = {
    device_id: string;
    device_type: DeviceType | string;
    user_agent: string;
    app_os: string | null;
    app_version: string | null;
    ip: string;
    login_time: string;
    logout_time: string | null;
    refresh_token_expired_at: string;
};

export type GetUserDevicesResponse = {
    error_code: string;
    message: string;
    data: UserDevice[];
};

export type RevokeUserDeviceResponse = {
    error_code: string;
    message: string;
};
