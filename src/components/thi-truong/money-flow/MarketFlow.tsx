'use client';

import { useEffect, useState } from 'react';

import { FaArrowRight } from 'react-icons/fa6';

import { MarketFlowChart } from '@/components/thi-truong/money-flow/MarketFlowChart';
import { MarketFlowStats } from '@/components/thi-truong/money-flow/MarketFlowStats';
import { MarketFlowTopNet } from '@/components/thi-truong/money-flow/MarketFlowTopNet';
import { MarketFlowModal } from '@/components/thi-truong/money-flow/modal/MarketFlowModal';
import { TRADING_FLOW_BLOCK_TABS, TRADING_FLOW_EXCHANGES } from '@/constants/market';
import { useMQTT } from '@/hooks/useMQTT';
import {
    fetchForeignTradingStats,
    fetchProprietaryTradingStats,
} from '@/services/api/datafeed/trading-data';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import type { ForeignTradingStatsData } from '@/types/datafeed/trading-data';
import type { ForeignTradeRealtimeMessage, TradingFlowTab } from '@/types/pages/market';
import { isSuccessApi } from '@/utils/common';
import { formatDate } from '@/utils/format';
import {
    buildForeignTradingMqttTopic,
    mergeForeignTradingRealtimeStats,
} from '@/utils/market/market-flow';

export const MarketFlow = () => {
    const [activeTab, setActiveTab] = useState<TradingFlowTab>(TRADING_FLOW_BLOCK_TABS[0]);
    const [activeExchange, setActiveExchange] = useState<string>(TRADING_FLOW_EXCHANGES[0].value);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<ForeignTradingStatsData | null>(null);
    const [modalStats, setModalStats] = useState<ForeignTradingStatsData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { startLoading, stopLoading } = useLoadingStore();

    const sessions = (stats?.previous_session_details ?? []).slice(-10);

    const isForeign = activeTab === TRADING_FLOW_BLOCK_TABS[0];

    const mqttTopicForeign =
        !isForeign || !activeExchange ? '' : buildForeignTradingMqttTopic(activeExchange);

    const handleMQTTForeignTrading = (_topic: string, message: Buffer) => {
        const update: ForeignTradeRealtimeMessage = JSON.parse(message.toString());
        setStats((prev) => (prev ? mergeForeignTradingRealtimeStats(prev, update) : prev));
    };

    const fetchStats = isForeign ? fetchForeignTradingStats : fetchProprietaryTradingStats;

    const fetchData = async () => {
        setIsLoading(true);
        const { data, error_code } = await fetchStats(activeExchange);
        setStats(isSuccessApi(error_code) ? (data ?? null) : null);
        setIsLoading(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleOpenModal = async () => {
        startLoading();
        try {
            const { data, error_code } = await fetchStats(activeExchange, 'YTD');
            setModalStats(isSuccessApi(error_code) ? (data ?? null) : null);
        } catch {
            setModalStats(null);
        } finally {
            setIsModalOpen(true);
            stopLoading();
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, activeExchange]);

    useMQTT(mqttTopicForeign, handleMQTTForeignTrading, !isLoading && !!stats && isForeign);

    return (
        <section className="base-secondary flex shrink-0 flex-col gap-3 rounded-xl p-4">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                        {TRADING_FLOW_BLOCK_TABS.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`body-3-highlight transition-colors ${
                                    activeTab === tab ? 'text-primary' : 'text-secondary'
                                }`}
                            >
                                {tab === 'foreign' ? 'Khối ngoại' : 'Tự doanh'}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={handleOpenModal}
                        className="text-highlight flex shrink-0 items-center gap-2 transition-colors hover:text-highlight/80"
                    >
                        <span className="body-5-highlight">{'Xem thêm'}</span>
                        <FaArrowRight size={16} aria-hidden />
                    </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center">
                        {TRADING_FLOW_EXCHANGES.map((exchange) => {
                            const isActive = activeExchange === exchange.value;
                            return (
                                <button
                                    key={exchange.value}
                                    type="button"
                                    onClick={() => setActiveExchange(exchange.value)}
                                    className={`rounded-full px-3 py-1 transition-colors ${
                                        isActive
                                            ? 'base-tertiary body-5-highlight text-primary'
                                            : 'body-5 text-secondary'
                                    }`}
                                >
                                    {exchange.label}
                                </button>
                            );
                        })}
                    </div>
                    {!isForeign && (
                        <div className="border-tertiary flex shrink-0 items-center justify-center rounded-full border px-3 py-1">
                            <p className="body-5 text-secondary whitespace-nowrap">
                                {'Dữ liệu ngày'}{' '}
                                <span className="text-primary">
                                    {stats?.trading_date ? formatDate(stats.trading_date) : '--'}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-3 lg:h-64 lg:flex-row lg:items-stretch">
                <MarketFlowStats stats={stats} showDot={isForeign} isLoading={isLoading} />
                <MarketFlowChart sessions={sessions} isLoading={isLoading} />
            </div>
            <MarketFlowTopNet
                isForeign={isForeign}
                activeExchange={activeExchange}
                showDot={isForeign}
            />
            {isModalOpen && (
                <MarketFlowModal
                    activeTab={activeTab}
                    isForeign={isForeign}
                    activeExchange={activeExchange}
                    stats={stats}
                    initialStats={modalStats}
                    onClose={handleCloseModal}
                />
            )}
        </section>
    );
};
