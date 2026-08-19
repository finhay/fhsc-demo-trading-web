import { IpoRegistrationBuyInfoData } from '@/types/ipo-hunt';

export const SUBSCRIPTION_FLOW_STEPS = {
    FORM: 'form',
    CONFIRM: 'confirm',
    OTP: 'otp',
} as const;

export const DEFAULT_REGISTRATION_INFO: IpoRegistrationBuyInfoData = {
    company_name: '',
    min_quantity: 0,
    max_quantity: 0,
    step_quantity: 1,
    min_price: 0,
    max_price: null,
    step_price: 1,
    start_at: '',
    end_at: '',
    authorities_method: [],
    authority_at: '',
    conditions_description: [],
    info_url: '',
    is_fix_price: false,
    is_fix_quantity: false,
    require_digital_signature: false,
    deposit_rate: 0,
    contractConditions: [],
};
