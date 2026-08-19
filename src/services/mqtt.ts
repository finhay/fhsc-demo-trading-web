import mqtt, { MqttClient } from 'mqtt';

export const MQTT_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_MQTT_WSS,
    BASE_URL_2: process.env.NEXT_PUBLIC_MQTT_WSS_2,
    CONNECT_TIMEOUT: 4000,
    RECONNECT_PERIOD: 1000,
    MAX_RECONNECT_PERIOD: 30000,
    KEEPALIVE: 30,
    CLEAN_SESSION: true,
};

type MessageHandler = (topic: string, message: Buffer) => void;

class MQTTService {
    private static instances: Map<string, MQTTService> = new Map();
    private baseUrl: string;
    private client: MqttClient | null = null;
    private subscribers: Map<string, Set<MessageHandler>> = new Map();
    private isConnecting = false;
    private isConnected = false;
    private reconnectAttempts = 0;

    private constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.registerLifecycleListeners();
    }

    private registerLifecycleListeners(): void {
        if (typeof window === 'undefined') return;

        document.addEventListener('visibilitychange', this.handleRecover);
        window.addEventListener('online', this.handleRecover);
        window.addEventListener('focus', this.handleRecover);
    }

    private handleRecover = (): void => {
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
            return;
        }

        if (this.subscribers.size === 0) return;

        if (this.isConnected && this.client?.connected) return;

        this.reconnectAttempts = 0;
        this.forceReconnect();
    };

    private cleanupClient(): void {
        if (this.client) {
            this.client.removeAllListeners();
            this.client.end(true);
            this.client = null;
        }
        this.isConnected = false;
        this.isConnecting = false;
    }

    private forceReconnect(): void {
        this.cleanupClient();
        this.connect().catch((err) => {
            console.error('[MQTT] Reconnect error:', err);
        });
    }

    static getInstance(baseUrl: string = MQTT_CONFIG.BASE_URL || ''): MQTTService {
        if (!MQTTService.instances.has(baseUrl)) {
            MQTTService.instances.set(baseUrl, new MQTTService(baseUrl));
        }
        return MQTTService.instances.get(baseUrl)!;
    }

    private connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnected && this.client) {
                resolve();
                return;
            }

            if (this.isConnecting) {
                const checkConnection = setInterval(() => {
                    if (this.isConnected) {
                        clearInterval(checkConnection);
                        resolve();
                    } else if (!this.isConnecting) {
                        clearInterval(checkConnection);
                        reject(new Error('Connection failed'));
                    }
                }, 100);
                return;
            }

            if (!this.baseUrl) {
                reject(new Error('MQTT URL not configured'));
                return;
            }

            if (this.client) {
                this.client.removeAllListeners();
                this.client.end(true);
                this.client = null;
            }

            this.isConnecting = true;

            const clientId = `vnsc_web_${Math.random().toString(16).slice(3)}_${Date.now()}`;

            this.client = mqtt.connect(this.baseUrl, {
                clientId,
                clean: MQTT_CONFIG.CLEAN_SESSION,
                connectTimeout: MQTT_CONFIG.CONNECT_TIMEOUT,
                reconnectPeriod: MQTT_CONFIG.RECONNECT_PERIOD,
                keepalive: MQTT_CONFIG.KEEPALIVE,
            });

            this.client.on('connect', () => {
                this.isConnected = true;
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                if (this.client) {
                    this.client.options.reconnectPeriod = MQTT_CONFIG.RECONNECT_PERIOD;
                }

                const topics = Array.from(this.subscribers.keys());
                if (topics.length > 0) {
                    this.client?.subscribe(topics, (err: Error | null) => {
                        if (err) {
                            console.error('[MQTT] Resubscribe error:', err);
                        }
                    });
                }

                resolve();
            });

            this.client.on('message', (topic, message) => {
                const handlers = this.subscribers.get(topic);
                if (handlers) {
                    handlers.forEach((handler) => {
                        try {
                            handler(topic, message);
                        } catch (error: unknown) {
                            console.error('[MQTT] Handler error:', error);
                        }
                    });
                }
            });

            this.client.on('error', (err) => {
                this.isConnecting = false;
                reject(err);
            });

            this.client.on('close', () => {
                this.isConnected = false;
            });

            this.client.on('reconnect', () => {
                this.reconnectAttempts++;

                if (this.client) {
                    this.client.options.reconnectPeriod = Math.min(
                        MQTT_CONFIG.RECONNECT_PERIOD * 2 ** this.reconnectAttempts,
                        MQTT_CONFIG.MAX_RECONNECT_PERIOD,
                    );
                }
            });

            this.client.on('offline', () => {
                this.isConnected = false;
            });
        });
    }

    async subscribe(topic: string, handler: MessageHandler): Promise<void> {
        if (!this.isConnected) {
            await this.connect();
        }

        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
        }
        this.subscribers.get(topic)!.add(handler);

        return new Promise((resolve, reject) => {
            this.client?.subscribe(topic, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async subscribeMultiple(topics: string[], handler: MessageHandler): Promise<void> {
        if (!this.isConnected) {
            await this.connect();
        }

        topics.forEach((topic) => {
            if (!this.subscribers.has(topic)) {
                this.subscribers.set(topic, new Set());
            }
            this.subscribers.get(topic)!.add(handler);
        });

        return new Promise((resolve, reject) => {
            this.client?.subscribe(topics, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    unsubscribe(topic: string, handler: MessageHandler): void {
        const handlers = this.subscribers.get(topic);
        if (handlers) {
            handlers.delete(handler);

            if (handlers.size === 0) {
                this.subscribers.delete(topic);
                this.client?.unsubscribe(topic, (err?: Error) => {
                    if (err) {
                        console.error('[MQTT] Unsubscribe error:', err);
                    }
                });
            }
        }
    }

    unsubscribeMultiple(topics: string[], handler: MessageHandler): void {
        const topicsToUnsubscribe: string[] = [];

        topics.forEach((topic) => {
            const handlers = this.subscribers.get(topic);
            if (handlers) {
                handlers.delete(handler);

                if (handlers.size === 0) {
                    this.subscribers.delete(topic);
                    topicsToUnsubscribe.push(topic);
                }
            }
        });

        if (topicsToUnsubscribe.length > 0) {
            this.client?.unsubscribe(topicsToUnsubscribe, (err?: Error) => {
                if (err) {
                    console.error('[MQTT] Unsubscribe error:', err);
                }
            });
        }
    }

    disconnect(): void {
        if (typeof window !== 'undefined') {
            document.removeEventListener('visibilitychange', this.handleRecover);
            window.removeEventListener('online', this.handleRecover);
            window.removeEventListener('focus', this.handleRecover);
        }

        if (this.client) {
            this.cleanupClient();
            this.subscribers.clear();
        }
    }

    getConnectionStatus(): {
        isConnected: boolean;
        isConnecting: boolean;
        subscriberCount: number;
    } {
        return {
            isConnected: this.isConnected,
            isConnecting: this.isConnecting,
            subscriberCount: this.subscribers.size,
        };
    }
}

export const mqttService = MQTTService.getInstance();

export const getMqttService = (baseUrl?: string): MQTTService => MQTTService.getInstance(baseUrl);
