'use client';

import {
    NETWORK_STATUS_COLOR_CLASS,
    WifiIcon,
} from '@/components/common/header/network-status/WifiIcon';
import { useTranslate } from '@/hooks/useTranslate';
import { useNetworkHealthStore } from '@/stores/common/useNetworkHealthStore';

export const StatusBadge = () => {
    const trans = useTranslate();
    const { status, avgLatencyMs } = useNetworkHealthStore();

    if (!status) return null;

    const colorClass = NETWORK_STATUS_COLOR_CLASS[status];

    return (
        <div
            className={`flex items-center gap-1 ${colorClass}`}
            title={`~${avgLatencyMs}ms`}
            aria-label={trans.network[status]}
        >
            <WifiIcon />
            <span className="font-body-3">{trans.network[status]}</span>
        </div>
    );
};
