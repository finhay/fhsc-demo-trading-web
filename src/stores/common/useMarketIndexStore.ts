import { create } from 'zustand';

import { DEFAULT_EXCHANGE, INDEX_LIST, NETWORK_HEALTH } from '@/constants/common';
import { IndexData } from '@/proto/stock';
import { fetchIndexRealtime } from '@/services/api/datafeed/index-data';
import { useNetworkHealthStore } from '@/stores/common/useNetworkHealthStore';
import { IndexRealtime } from '@/types/common';
import { isSuccessApi } from '@/utils/common';
import { isPreSessionHours, isWithinTradingHours } from '@/utils/market/market-shared';

type MarketIndexState = {
    data: IndexRealtime[];
    exchange: string;
    isInitialized: boolean;
    isLoading: boolean;
    now: number;
    isInTradingSession: boolean;
    isPreSession: boolean;
};

type MarketIndexActions = {
    setExchange: (exchange: string) => void;
    updateFromMQTT: (indexChange: IndexData) => void;
    startClock: () => void;
    stopClock: () => void;
    fetchIndexData: (silent?: boolean) => Promise<void>;
    resetStore: () => void;
};

const initialState: MarketIndexState = {
    data: [],
    exchange: DEFAULT_EXCHANGE,
    isInitialized: false,
    isLoading: false,
    now: 0,
    isInTradingSession: false,
    isPreSession: false,
};

let clockInterval: ReturnType<typeof setInterval> | null = null;
let lastHealthSampleAt = 0;
let mqttLagBaselineMs: number | null = null;

const readClock = () => {
    const date = new Date();
    return {
        now: date.getTime(),
        isInTradingSession: isWithinTradingHours(date),
        isPreSession: isPreSessionHours(date),
    };
};

const recordMqttHealth = (createdAt?: number) => {
    if (!createdAt) return;

    const receivedAt = Date.now();
    if (receivedAt - lastHealthSampleAt < NETWORK_HEALTH.MQTT_SAMPLE_THROTTLE_MS) return;
    lastHealthSampleAt = receivedAt;

    const rawLagMs = receivedAt - createdAt;
    if (mqttLagBaselineMs === null || rawLagMs < mqttLagBaselineMs) {
        mqttLagBaselineMs = rawLagMs;
    }

    useNetworkHealthStore.getState().recordLatency(Math.max(0, rawLagMs - mqttLagBaselineMs));
};

export const useMarketIndexStore = create<MarketIndexState & MarketIndexActions>((set) => ({
    ...initialState,

    setExchange: (exchange: string) => set({ exchange }),

    updateFromMQTT: (indexChange: IndexData) => {
        recordMqttHealth(indexChange.createdAt);

        set((state) => {
            const currentData = Array.isArray(state.data) ? state.data : [];
            const index = currentData.findIndex((item) => item?.index === indexChange.name);
            if (index === -1 || !currentData[index]) return state;

            const prev = currentData[index];
            const MINUTE_MS = 60_000;
            const normalizedTime =
                Math.floor((indexChange.createdAt ?? Date.now()) / MINUTE_MS) * MINUTE_MS;

            const times = Array.isArray(prev.times) ? [...prev.times] : [];
            const values = Array.isArray(prev.values) ? [...prev.values] : [];
            const volumes = Array.isArray(prev.volumes) ? [...prev.volumes] : [];
            const advancesArr = Array.isArray(prev.advancesArr) ? [...prev.advancesArr] : [];
            const declinesArr = Array.isArray(prev.declinesArr) ? [...prev.declinesArr] : [];
            const nochangesArr = Array.isArray(prev.nochangesArr) ? [...prev.nochangesArr] : [];
            const ceilings = Array.isArray(prev.ceilings) ? [...prev.ceilings] : [];
            const floors = Array.isArray(prev.floors) ? [...prev.floors] : [];

            const lastIdx = times.length - 1;
            const deltaQuantity = Math.max(
                0,
                (indexChange.allQuantity ?? 0) - (prev.allQuantity ?? 0),
            );

            if (lastIdx >= 0 && times[lastIdx] === normalizedTime) {
                values[lastIdx] = indexChange.indexValue;
                volumes[lastIdx] = (volumes[lastIdx] ?? 0) + deltaQuantity;
                advancesArr[lastIdx] = indexChange.advances;
                declinesArr[lastIdx] = indexChange.declines;
                nochangesArr[lastIdx] = indexChange.nochanges;
                ceilings[lastIdx] = indexChange.ceiling;
                floors[lastIdx] = indexChange.floor;
            } else {
                times.push(normalizedTime);
                values.push(indexChange.indexValue);
                volumes.push(deltaQuantity);
                advancesArr.push(indexChange.advances);
                declinesArr.push(indexChange.declines);
                nochangesArr.push(indexChange.nochanges);
                ceilings.push(indexChange.ceiling);
                floors.push(indexChange.floor);
            }

            const updated = [...currentData];
            updated[index] = {
                ...prev,
                advances: indexChange.advances,
                declines: indexChange.declines,
                nochanges: indexChange.nochanges,
                change: indexChange.change,
                changePercent: indexChange.changePercent,
                reference: indexChange.reference,
                sessionInExchange: indexChange.sessionInExchange,
                ceiling: indexChange.ceiling,
                floor: indexChange.floor,
                allQuantity: indexChange.allQuantity,
                allValue: indexChange.allValue,
                indexValue: indexChange.indexValue,
                values,
                volumes,
                times,
                advancesArr,
                declinesArr,
                nochangesArr,
                ceilings,
                floors,
            };
            return { data: updated };
        });
    },

    startClock: () => {
        if (clockInterval) return;
        set(readClock());
        clockInterval = setInterval(() => set(readClock()), 1000);
    },

    stopClock: () => {
        if (clockInterval) clearInterval(clockInterval);
        clockInterval = null;
    },

    fetchIndexData: async (silent = false) => {
        if (!silent) set({ isLoading: true });
        const startedAt = performance.now();
        let success = false;
        try {
            const indexList = Array.isArray(INDEX_LIST) ? INDEX_LIST : [];
            const { result, error_code } = await fetchIndexRealtime(indexList.join(','));
            success = isSuccessApi(error_code);
            if (success) {
                set({
                    data: Array.isArray(result) ? result : [],
                    isInitialized: true,
                });
            }
        } catch {
            success = false;
        } finally {
            const latencyMs = Math.round(performance.now() - startedAt);
            useNetworkHealthStore.getState().recordSample(latencyMs, success);
            if (!silent) set({ isLoading: false });
        }
    },

    resetStore: () => {
        lastHealthSampleAt = 0;
        mqttLagBaselineMs = null;
        set({ data: [], isInitialized: false, isLoading: false });
    },
}));
