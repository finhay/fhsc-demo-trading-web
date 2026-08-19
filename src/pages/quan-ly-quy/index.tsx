import { useCallback, useEffect, useMemo, useRef } from 'react';

import { FundNavigation } from '@/components/quan-ly-quy/common/FundNavigation';
import { FundImport } from '@/components/quan-ly-quy/import/FundImport';
import { FundInvestor } from '@/components/quan-ly-quy/investor/FundInvestor';
import { FundInvestorDetailModal } from '@/components/quan-ly-quy/modal/FundInvestorDetailModal';
import { FundOverview } from '@/components/quan-ly-quy/overview/FundOverview';
import { FundPortfolio } from '@/components/quan-ly-quy/portfolio/FundPortfolio';
import { FundVaultGate } from '@/components/quan-ly-quy/vault/FundVaultGate';
import { FUND_MARKET_METADATA_CHUNK_SIZE, FUND_TAB } from '@/constants/fund';
import { useMQTT } from '@/hooks/useMQTT';
import { useTranslate } from '@/hooks/useTranslate';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { StockPriceMessage } from '@/proto/stock';
import { fetchStocksMetadataBySymbolsV4 } from '@/services/api/datafeed/stock-info';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useFundDataStore } from '@/stores/fund/useFundDataStore';
import { useFundTradeStore } from '@/stores/fund/useFundTradeStore';
import { useFundVaultStore } from '@/stores/fund/useFundVaultStore';
import { isSuccessApi } from '@/utils/common';

export default function QuanLyQuy() {
    const trans = useTranslate();
    const { activeTab, loadData, resetStore, holdings, setPrices, setStockNames } =
        useFundDataStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const { resetStore: resetImport } = useFundTradeStore();
    const { status: vaultStatus } = useFundVaultStore();

    const pendingPricesRef = useRef<Record<string, number>>({});
    const rafRef = useRef<number | null>(null);

    const symbols = useMemo(() => Array.from(new Set(holdings.map((h) => h.ma_ck))), [holdings]);
    const mqttTopics = useMemo(() => symbols.map((sym) => `/stock-price/${sym}`), [symbols]);

    const handleMQTTMessage = useCallback(
        (_topic: string, message: Buffer) => {
            try {
                const update = StockPriceMessage.decode(new Uint8Array(message));
                if (!update.symbol || !update.price) return;
                pendingPricesRef.current[update.symbol] = update.price;
                if (rafRef.current != null) return;
                rafRef.current = requestAnimationFrame(() => {
                    rafRef.current = null;
                    const current = useFundDataStore.getState().prices;
                    setPrices({ ...current, ...pendingPricesRef.current });
                    pendingPricesRef.current = {};
                });
            } catch {}
        },
        [setPrices],
    );

    useMQTT(mqttTopics, handleMQTTMessage, mqttTopics.length > 0);

    useEffect(() => {
        if (symbols.length === 0) return;
        const load = async () => {
            startLoading();
            try {
                const chunks: string[][] = [];
                for (let i = 0; i < symbols.length; i += FUND_MARKET_METADATA_CHUNK_SIZE) {
                    chunks.push(symbols.slice(i, i + FUND_MARKET_METADATA_CHUNK_SIZE));
                }
                const responses = await Promise.all(
                    chunks.map((c) => fetchStocksMetadataBySymbolsV4(c)),
                );
                const prices: Record<string, number> = {};
                const names: Record<string, string> = {};
                responses.forEach(({ result, error_code }) => {
                    if (!isSuccessApi(error_code)) return;
                    result.forEach((s) => {
                        if (s.symbol && s.price) prices[s.symbol] = s.price;
                        if (s.symbol && s.name) names[s.symbol] = s.name;
                    });
                });
                if (Object.keys(prices).length > 0) setPrices(prices);
                if (Object.keys(names).length > 0) setStockNames(names);
            } catch {
            } finally {
                stopLoading();
            }
        };
        load();
    }, [symbols]);

    useEffect(() => {
        if (vaultStatus === 'unlocked') loadData();
    }, [vaultStatus, loadData]);
    useEffect(() => {
        return () => {
            resetStore();
            resetImport();
        };
    }, [resetStore, resetImport]);

    return (
        <DefaultLayout
            title={trans.fund.common.title}
            metaDescription={trans.fund.common.meta_description}
        >
            <div className="flex h-full w-full flex-col">
                <div className="bg-primary flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                    <FundVaultGate>
                        <div className="flex min-h-0 w-full flex-1 flex-col gap-2 overflow-hidden">
                            <FundNavigation />
                            <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
                                <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                                    <div className="scrollbar flex min-h-0 w-full flex-1 flex-col gap-2">
                                        {activeTab === FUND_TAB.DASHBOARD && <FundOverview />}
                                        {activeTab === FUND_TAB.CLIENTS && <FundInvestor />}
                                        {activeTab === FUND_TAB.PORTFOLIO && <FundPortfolio />}
                                        {activeTab === FUND_TAB.IMPORT && <FundImport />}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </FundVaultGate>
                </div>
                <FundInvestorDetailModal />
            </div>
        </DefaultLayout>
    );
}
