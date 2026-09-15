'use client';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Tooltip } from '@/components/common/ui/Tooltip';
import { MarketFlowTreemapNodes } from '@/components/thi-truong/money-flow/MarketFlowTreemapNodes';
import type {
    TradingFlowTopNetSide,
    TradingFlowTreemapCell,
    TradingFlowTreemapColorMode,
} from '@/types/pages/market';
import { formatNumberVN } from '@/utils/format';

type Props = {
    side: TradingFlowTopNetSide;
    totalBillion: number;
    items: TradingFlowTreemapCell[];
    colorMode?: TradingFlowTreemapColorMode;
    onCellClick?: (key: string) => void;
};

export const MarketFlowTreemapSide = ({
    side,
    totalBillion,
    items,
    colorMode,
    onCellClick,
}: Props) => {
    const isBuy = side === 'buy';
    const sideLabel = isBuy ? 'Mua' : 'Bán';
    const totalLabel = `${formatNumberVN(Math.abs(totalBillion), { decimals: 2 })} ${'tỷ đồng'}`;

    return (
        <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-1 grid-rows-[auto_1fr] gap-1">
            <Tooltip
                content={totalLabel}
                align="start"
                className="base-secondary flex min-w-0 items-center gap-2 rounded-tl-lg rounded-br-lg px-1.5 py-1"
            >
                <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        isBuy ? 'bg-success' : 'bg-error'
                    }`}
                    aria-label={sideLabel}
                >
                    <span
                        className={`body-5-highlight leading-none ${
                            isBuy ? 'text-green' : 'text-red'
                        }`}
                    >
                        {sideLabel.charAt(0)}
                    </span>
                </span>
                <span className="body-5 text-tertiary min-w-0 flex-1 truncate whitespace-nowrap">
                    {totalLabel}
                </span>
            </Tooltip>
            <div
                className={`min-h-0 min-w-0 overflow-hidden ${
                    isBuy ? 'rounded-l-xl' : 'rounded-r-xl'
                }`}
            >
                {items.length === 0 ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <EmptyState />
                    </div>
                ) : (
                    <MarketFlowTreemapNodes
                        side={side}
                        items={items}
                        colorMode={colorMode}
                        onCellClick={onCellClick}
                    />
                )}
            </div>
        </div>
    );
};
