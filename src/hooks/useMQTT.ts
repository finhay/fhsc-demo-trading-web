import { useCallback, useEffect, useMemo, useRef } from 'react';

import { getMqttService } from '@/services/mqtt';

type MessageHandler = (topic: string, message: Buffer) => void;

export const useMQTT = (
    topic: string | string[],
    handler: MessageHandler,
    enabled: boolean = true,
    baseUrl?: string,
) => {
    const handlerRef = useRef(handler);
    const topicsRef = useRef(topic);
    const mqttService = useMemo(() => getMqttService(baseUrl), [baseUrl]);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        topicsRef.current = topic;
    }, [topic]);

    useEffect(() => {
        if (!enabled) return;

        const topics = Array.isArray(topicsRef.current) ? topicsRef.current : [topicsRef.current];

        const validTopics = topics.filter((t) => t && t.trim() !== '');

        if (validTopics.length === 0) return;

        let isMounted = true;

        const messageHandler: MessageHandler = (topic, message) => {
            if (isMounted) {
                handlerRef.current(topic, message);
            }
        };

        const subscribe = async () => {
            try {
                if (validTopics.length === 1) {
                    await mqttService.subscribe(validTopics[0], messageHandler);
                } else {
                    await mqttService.subscribeMultiple(validTopics, messageHandler);
                }
            } catch (error: unknown) {
                console.error('Subscribe error:', error);
            }
        };

        subscribe();

        return () => {
            isMounted = false;
            if (validTopics.length === 1) {
                mqttService.unsubscribe(validTopics[0], messageHandler);
            } else {
                mqttService.unsubscribeMultiple(validTopics, messageHandler);
            }
        };
    }, [enabled, topic, mqttService]);

    const getStatus = useCallback(() => {
        return mqttService.getConnectionStatus();
    }, [mqttService]);

    return { getStatus };
};
