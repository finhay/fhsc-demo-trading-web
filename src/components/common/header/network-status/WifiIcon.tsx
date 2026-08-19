'use client';

import { useNetworkHealthStore } from '@/stores/common/useNetworkHealthStore';
import type { NetworkStatus } from '@/utils/common';

const WIFI_ARCS = {
    outer: 'M14 10C20.6273 10 26 15.3727 26 22H24C24 16.4773 19.5227 12 14 12V10Z',
    middle: 'M14 14.6667C18.05 14.6667 21.3333 17.95 21.3333 22H19.3333C19.3333 20.5855 18.7714 19.229 17.7712 18.2288C16.771 17.2286 15.4145 16.6667 14 16.6667V14.6667Z',
    inner: 'M14 19.3333C14.7072 19.3333 15.3855 19.6143 15.8856 20.1144C16.3857 20.6145 16.6667 21.2928 16.6667 22H14V19.3333Z',
} as const;

export const NETWORK_STATUS_COLOR_CLASS: Record<NetworkStatus, string> = {
    stable: 'text-green',
    unstable: 'text-orange',
    offline: 'text-red',
};

const NETWORK_STATUS_ARC_COLOR_CLASS: Record<
    NetworkStatus,
    Record<keyof typeof WIFI_ARCS, string>
> = {
    stable: { outer: 'text-green', middle: 'text-green', inner: 'text-green' },
    unstable: { outer: 'text-tertiary', middle: 'text-orange', inner: 'text-orange' },
    offline: { outer: 'text-tertiary', middle: 'text-tertiary', inner: 'text-red' },
};

export const WifiIcon = () => {
    const { status } = useNetworkHealthStore();

    if (!status) return null;

    const arcColorClass = NETWORK_STATUS_ARC_COLOR_CLASS[status];

    return (
        <svg
            width={28}
            height={28}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
        >
            <g clipPath="url(#network-wifi-clip)">
                <path d={WIFI_ARCS.outer} fill="currentColor" className={arcColorClass.outer} />
                <path d={WIFI_ARCS.middle} fill="currentColor" className={arcColorClass.middle} />
                <path d={WIFI_ARCS.inner} fill="currentColor" className={arcColorClass.inner} />
            </g>
            <defs>
                <clipPath id="network-wifi-clip">
                    <rect width={16} height={16} fill="white" transform="translate(12 8)" />
                </clipPath>
            </defs>
        </svg>
    );
};
