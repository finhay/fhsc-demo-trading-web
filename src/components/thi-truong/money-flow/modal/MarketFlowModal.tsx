'use client';

import { useRef, useState } from 'react';

import { Dialog } from '@/components/common/ui/Dialog';
import { Dropdown } from '@/components/common/ui/Dropdown';
import { MarketFlowHeader } from '@/components/thi-truong/money-flow/modal/MarketFlowHeader';
import { MarketFlowHistory } from '@/components/thi-truong/money-flow/modal/MarketFlowHistory';
import { MarketFlowModalTopNet } from '@/components/thi-truong/money-flow/modal/MarketFlowModalTopNet';
import { TRADING_FLOW_EXCHANGES, TRADING_FLOW_HISTORY_PERIODS } from '@/constants/market';
import {
    fetchForeignTradingStats,
    fetchProprietaryTradingStats,
} from '@/services/api/datafeed/trading-data';
import type { ForeignTradingStatsData, TradingStatsPeriod } from '@/types/datafeed/trading-data';
import type { TradingFlowTab } from '@/types/pages/market';
import { isSuccessApi } from '@/utils/common';

const FLOW_MODAL = {
    title_foreign: 'Giao dịch khối ngoại',
    title_proprietary: 'Giao dịch tự doanh',
    today: 'Hôm nay',
    buy_value: 'GT mua',
    sell_value: 'GT bán',
    net_value: 'GT ròng',
    history_title: 'Lịch sử giao dịch',
    legend_net: 'Mua/bán ròng',
    legend_cumulative: 'GTGD ròng luỹ kế (bên phải)',
    period_1y: '1 năm',
    period_3y: '3 năm',
    period_5y: '5 năm',
    period_ytd: 'Từ đầu năm',
    tab_symbol: 'Mã',
    tab_sector: 'Ngành',
};

type Props = {
    activeTab: TradingFlowTab;
    isForeign: boolean;
    activeExchange: string;
    stats: ForeignTradingStatsData | null;
    initialStats: ForeignTradingStatsData | null;
    onClose: () => void;
};

const buildStatsKey = (exchange: string, period: TradingStatsPeriod) => `${exchange}-${period}`;

export const MarketFlowModal = ({
    activeTab,
    isForeign,
    activeExchange,
    stats,
    initialStats,
    onClose,
}: Props) => {
    const [modalPeriod, setModalPeriod] = useState<TradingStatsPeriod>('YTD');
    const [modalExchange, setModalExchange] = useState(activeExchange);
    const [modalStats, setModalStats] = useState<ForeignTradingStatsData | null>(initialStats);
    const [isModalStatsLoading, setIsModalStatsLoading] = useState(false);

    const requestedStatsKeyRef = useRef(buildStatsKey(activeExchange, 'YTD'));

    const loadModalStats = async (exchange: string, period: TradingStatsPeriod) => {
        const statsKey = buildStatsKey(exchange, period);
        requestedStatsKeyRef.current = statsKey;
        setIsModalStatsLoading(true);

        const fetcher = isForeign ? fetchForeignTradingStats : fetchProprietaryTradingStats;
        try {
            const { data, error_code } = await fetcher(exchange, period);
            if (requestedStatsKeyRef.current !== statsKey) return;
            setModalStats(isSuccessApi(error_code) ? (data ?? null) : null);
        } catch {
            if (requestedStatsKeyRef.current !== statsKey) return;
            setModalStats(null);
        } finally {
            if (requestedStatsKeyRef.current === statsKey) {
                setIsModalStatsLoading(false);
            }
        }
    };

    const handleChangePeriod = async (nextPeriod: TradingStatsPeriod) => {
        if (nextPeriod === modalPeriod) return;
        setModalPeriod(nextPeriod);
        await loadModalStats(modalExchange, nextPeriod);
    };

    const handleChangeExchange = async (nextExchange: string) => {
        if (nextExchange === modalExchange) return;
        setModalExchange(nextExchange);
        await loadModalStats(nextExchange, modalPeriod);
    };

    const modalSessions = modalStats?.previous_session_details ?? [];

    return (
        <Dialog
            onClose={onClose}
            maxWidth="max-w-7xl"
            maxHeight="h-[90vh] max-h-[90vh]"
            panelClassName="bg-primary gap-4 p-6"
            bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
            headerContent={<MarketFlowHeader activeTab={activeTab} stats={stats} />}
        >
            <div className="bg-secondary flex min-h-0 w-full flex-1 flex-col gap-4 rounded-2xl p-4">
                <div className="flex min-h-0 flex-1 basis-0 flex-col gap-5">
                    <div className="flex shrink-0 items-center justify-between gap-4">
                        <h3 className="font-body-2-highlight text-primary">
                            {'Lịch sử giao dịch'}
                        </h3>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1">
                                {TRADING_FLOW_HISTORY_PERIODS.map((item) => {
                                    const isActive = modalPeriod === item.value;
                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() => handleChangePeriod(item.value)}
                                            className={`rounded-full px-3 py-1 transition-colors ${
                                                isActive
                                                    ? 'bg-tertiary font-body-3-highlight text-primary'
                                                    : 'font-body-3 text-secondary'
                                            }`}
                                        >
                                            {FLOW_MODAL[item.labelKey]}
                                        </button>
                                    );
                                })}
                            </div>
                            <Dropdown
                                options={TRADING_FLOW_EXCHANGES}
                                value={modalExchange}
                                onChange={handleChangeExchange}
                            />
                        </div>
                    </div>
                    <MarketFlowHistory
                        isLoading={isModalStatsLoading}
                        sessions={modalSessions}
                        period={modalPeriod}
                    />
                </div>
                <div className="bg-tertiary h-px w-full" aria-hidden />

                <div className="flex min-h-0 flex-1 basis-0 flex-col">
                    <MarketFlowModalTopNet
                        isForeign={isForeign}
                        activeExchange={modalExchange}
                        period={modalPeriod}
                    />
                </div>
            </div>
        </Dialog>
    );
};
