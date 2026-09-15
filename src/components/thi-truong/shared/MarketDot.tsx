import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';

type Props = {
    alwaysActive?: boolean;
};

export const MarketDot = ({ alwaysActive = false }: Props) => {
    const { isInTradingSession } = useMarketIndexStore();
    const isActive = alwaysActive || isInTradingSession;
    return (
        <span className="relative flex h-3 w-3 shrink-0" aria-hidden="true">
            {isActive && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full base-red opacity-75 [animation-duration:2s]" />
            )}
            <span className="relative flex h-3 w-3 items-center justify-center rounded-full">
                <span className={`h-2 w-2 rounded-full ${isActive ? 'base-red' : 'base-quaternary'}`} />
            </span>
        </span>
    );
};
