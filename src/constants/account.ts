import {
    RiDeviceLine,
    RiFacebookCircleLine,
    RiGitMergeLine,
    RiHeadphoneFill,
    RiLinkedinBoxLine,
    RiProjectorLine,
    RiYoutubeLine,
} from 'react-icons/ri';

export const ACCOUNT_TABS = {
    INFO: 'info',
    API: 'api',
    DEVICE: 'device',
    SUPPORT: 'support',
} as const;

export const DEFAULT_SCOPES = ['read:market', 'read:account'];

export const ACCOUNT_DASHBOARD_MENU_ITEMS = [
    {
        tab: ACCOUNT_TABS.INFO,
        icon: RiProjectorLine,
    },
    {
        tab: ACCOUNT_TABS.API,
        icon: RiGitMergeLine,
    },
    {
        tab: ACCOUNT_TABS.DEVICE,
        icon: RiDeviceLine,
    },
    {
        tab: ACCOUNT_TABS.SUPPORT,
        icon: RiHeadphoneFill,
    },
];

export const ACCOUNT_SOCIAL_CHANNELS = [
    {
        key: 'facebook',
        icon: RiFacebookCircleLine,
        href: 'https://www.facebook.com/Finhay.OfficialFanpage/',
    },
    {
        key: 'youtube',
        icon: RiYoutubeLine,
        href: 'https://www.youtube.com/@Finhay',
    },
    {
        key: 'linkedin',
        icon: RiLinkedinBoxLine,
        href: 'https://www.linkedin.com/company/finhay',
    },
];
