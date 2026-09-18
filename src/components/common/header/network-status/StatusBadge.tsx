'use client';

import {
    NETWORK_STATUS_COLOR_CLASS,
    WifiIcon,
} from '@/components/common/header/network-status/WifiIcon';
import { useNetworkHealthStore } from '@/stores/common/useNetworkHealthStore';

const NETWORK = {
    stable: 'Ổn định',
    unstable: 'Không ổn định',
    offline: 'Mất kết nối',
};

export const StatusBadge = () => {
    const { status, avgLatencyMs } = useNetworkHealthStore();

    if (!status) return null;

    const colorClass = NETWORK_STATUS_COLOR_CLASS[status];

    return (
        <div
            className={`flex items-center gap-1 ${colorClass}`}
            title={`~${avgLatencyMs}ms`}
            aria-label={NETWORK[status]}
        >
            <WifiIcon />
            <span className="body-4">{NETWORK[status]}</span>
        </div>
    );
};
