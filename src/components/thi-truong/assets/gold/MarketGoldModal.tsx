'use client';

import { useMemo } from 'react';

import { Dialog } from '@/components/common/ui/Dialog';
import { MarketGoldChart } from '@/components/thi-truong/assets/gold/MarketGoldChart';
import { MarketGoldSummary } from '@/components/thi-truong/assets/gold/MarketGoldSummary';
import { MarketMetalProviders } from '@/components/thi-truong/assets/gold/MarketMetalProviders';
import { MarketSilverChart } from '@/components/thi-truong/assets/gold/MarketSilverChart';
import { MarketSilverSummary } from '@/components/thi-truong/assets/gold/MarketSilverSummary';
import { GLOBAL_GOLD_INDEX, GLOBAL_SILVER_INDEX } from '@/constants/market';
import { useTranslate } from '@/hooks/useTranslate';
import type {
    GoldChartItem,
    GoldItem,
    MetalProviderItem,
    SilverChartItem,
    SilverItem,
} from '@/types/datafeed/finance';

type Props = {
    onClose: () => void;
    goldItems: GoldItem[];
    silverItems: SilverItem[];
    providers: MetalProviderItem[];
    goldChartItems: GoldChartItem[];
    silverChartItems: SilverChartItem[];
};

export const MarketGoldModal = ({
    onClose,
    goldItems,
    silverItems,
    providers,
    goldChartItems,
    silverChartItems,
}: Props) => {
    const trans = useTranslate();

    const { goldCards, goldGlobal, silverGlobal, silverCards, goldProviders } = useMemo(() => {
        const goldGlobalItem = goldItems.find((item) => item.index === GLOBAL_GOLD_INDEX) ?? null;
        const goldCardItems = goldItems.filter((item) => item.index !== GLOBAL_GOLD_INDEX);
        const silverGlobalItem =
            silverItems.find((item) => item.index === GLOBAL_SILVER_INDEX) ?? null;
        const silverCardItems = providers.slice(-2);
        const goldProviderItems = providers.slice(0, -2);

        return {
            goldCards: goldCardItems,
            goldGlobal: goldGlobalItem,
            silverGlobal: silverGlobalItem,
            silverCards: silverCardItems,
            goldProviders: goldProviderItems,
        };
    }, [goldItems, silverItems, providers]);

    return (
        <Dialog
            onClose={onClose}
            title={trans.market.assets.modal.title}
            maxWidth="max-w-7xl"
            maxHeight="max-h-[90vh]"
            panelClassName="bg-primary gap-3 p-4"
        >
            <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-3">
                    <MarketGoldSummary items={goldCards} />
                    <MarketGoldChart globalItem={goldGlobal} initialChartData={goldChartItems} />
                    <MarketMetalProviders items={goldProviders} />
                </div>
                <div className="flex min-w-0 flex-col gap-3">
                    <MarketSilverSummary items={silverCards} />
                    <MarketSilverChart
                        globalItem={silverGlobal}
                        initialChartData={silverChartItems}
                    />
                </div>
            </div>
        </Dialog>
    );
};
