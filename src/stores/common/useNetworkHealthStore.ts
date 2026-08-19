import { create } from 'zustand';

import { NETWORK_HEALTH } from '@/constants/common';
import { type NetworkStatus, resolveNetworkStatus } from '@/utils/common';

type NetworkSample = {
    latencyMs: number;
    success: boolean;
};

type NetworkHealthState = {
    status: NetworkStatus | null;
    latencyMs: number;
    avgLatencyMs: number;
    lastCheckedAt: number;
    recordSample: (latencyMs: number, success: boolean) => void;
    recordLatency: (latencyMs: number) => void;
    recordFailure: () => void;
    setOffline: () => void;
    resetStore: () => void;
};

const initialState = {
    status: null as NetworkStatus | null,
    latencyMs: 0,
    avgLatencyMs: 0,
    lastCheckedAt: 0,
};

let samples: NetworkSample[] = [];
let consecutiveFails = 0;
let pendingStatus: NetworkStatus | null = null;
let pendingCount = 0;

const isBrowserOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine);

const computeSuccessRate = (buffer: NetworkSample[]) => {
    if (buffer.length === 0) return 1;
    const successCount = buffer.filter((sample) => sample.success).length;
    return successCount / buffer.length;
};

const applyHysteresis = (
    currentStatus: NetworkStatus | null,
    computed: NetworkStatus,
): NetworkStatus | null => {
    if (computed === 'offline') {
        pendingStatus = null;
        pendingCount = 0;
        return 'offline';
    }

    if (currentStatus === null) {
        pendingStatus = null;
        pendingCount = 0;
        return computed;
    }

    if (computed === currentStatus) {
        pendingStatus = null;
        pendingCount = 0;
        return currentStatus;
    }

    if (pendingStatus === computed) {
        pendingCount += 1;
        if (pendingCount >= 2) {
            pendingStatus = null;
            pendingCount = 0;
            return computed;
        }
        return currentStatus;
    }

    pendingStatus = computed;
    pendingCount = 1;
    return currentStatus;
};

export const useNetworkHealthStore = create<NetworkHealthState>((set, get) => ({
    ...initialState,

    recordSample: (latencyMs, success) => {
        consecutiveFails = success ? 0 : consecutiveFails + 1;

        samples = [...samples, { latencyMs, success }].slice(-NETWORK_HEALTH.SAMPLE_WINDOW);

        const { avgLatencyMs: prevAvg } = get();
        const avgLatencyMs =
            prevAvg === 0
                ? latencyMs
                : Math.round(
                      prevAvg * (1 - NETWORK_HEALTH.EWMA_ALPHA) +
                          latencyMs * NETWORK_HEALTH.EWMA_ALPHA,
                  );

        const computed = resolveNetworkStatus({
            avgLatencyMs,
            successRate: computeSuccessRate(samples),
            consecutiveFails,
            isOnline: isBrowserOnline(),
        });

        const nextStatus = applyHysteresis(get().status, computed);

        set({
            latencyMs,
            avgLatencyMs,
            lastCheckedAt: Date.now(),
            status: nextStatus,
        });
    },

    recordLatency: (latencyMs) => get().recordSample(latencyMs, true),

    recordFailure: () => {
        consecutiveFails += 1;

        const { avgLatencyMs } = get();
        samples = [...samples, { latencyMs: avgLatencyMs, success: false }].slice(
            -NETWORK_HEALTH.SAMPLE_WINDOW,
        );

        const computed = resolveNetworkStatus({
            avgLatencyMs,
            successRate: computeSuccessRate(samples),
            consecutiveFails,
            isOnline: isBrowserOnline(),
        });

        set({
            lastCheckedAt: Date.now(),
            status: applyHysteresis(get().status, computed),
        });
    },

    setOffline: () => {
        pendingStatus = null;
        pendingCount = 0;
        set({
            status: 'offline',
            lastCheckedAt: Date.now(),
        });
    },

    resetStore: () => {
        samples = [];
        consecutiveFails = 0;
        pendingStatus = null;
        pendingCount = 0;
        set(initialState);
    },
}));
