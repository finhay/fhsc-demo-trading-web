'use client';

import { useEffect, useRef } from 'react';

import { NETWORK_HEALTH } from '@/constants/common';
import { getMqttService } from '@/services/mqtt';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { useNetworkHealthStore } from '@/stores/common/useNetworkHealthStore';

export function Providers({ children }: { children: React.ReactNode }) {
    const { isInitialized, initFromStorage, initialize } = useAuthStore();
    const { fetchIndexData, startClock, stopClock } = useMarketIndexStore();
    const { recordFailure, setOffline } = useNetworkHealthStore();
    const hiddenAtRef = useRef(0);

    useEffect(() => {
        if (!isInitialized) {
            initFromStorage();
            initialize();
        }
    }, [isInitialized, initFromStorage, initialize]);

    useEffect(() => {
        fetchIndexData();
        startClock();
        return () => stopClock();
    }, []);

    useEffect(() => {
        const tick = () => {
            if (document.visibilityState !== 'visible') return;

            const { isConnected, isConnecting, subscriberCount } =
                getMqttService().getConnectionStatus();
            if (subscriberCount === 0 || isConnected || isConnecting) return;

            recordFailure();
        };

        const id = setInterval(tick, NETWORK_HEALTH.MQTT_WATCHDOG_INTERVAL_MS);
        return () => clearInterval(id);
    }, [recordFailure]);

    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState !== 'visible') {
                hiddenAtRef.current = Date.now();
                return;
            }

            const hiddenMs = hiddenAtRef.current ? Date.now() - hiddenAtRef.current : 0;
            hiddenAtRef.current = 0;
            if (hiddenMs >= NETWORK_HEALTH.RESYNC_AFTER_HIDDEN_MS) fetchIndexData(true);
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, [fetchIndexData]);

    useEffect(() => {
        const onOffline = () => setOffline();
        const onOnline = () => fetchIndexData(true);

        window.addEventListener('offline', onOffline);
        window.addEventListener('online', onOnline);

        return () => {
            window.removeEventListener('offline', onOffline);
            window.removeEventListener('online', onOnline);
        };
    }, [fetchIndexData, setOffline]);

    return <>{children}</>;
}
