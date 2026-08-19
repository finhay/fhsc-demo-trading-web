import { FaBuildingColumns, FaCoins, FaHandHoldingDollar } from 'react-icons/fa6';

import { MACRO_LIQUIDITY_TREND_COLOR } from '@/constants/market';
import { MacroLiquidityStatRow } from '@/types/pages/market';

export const MarketCurrencyRow = ({ row }: { row: MacroLiquidityStatRow }) => (
    <>
        {row.icon && (
            <span className={`shrink-0 ${row.iconClassName ?? 'text-secondary'}`}>
                {row.icon === 'coins' && <FaCoins />}
                {row.icon === 'building' && <FaBuildingColumns />}
                {row.icon === 'omo' && <FaHandHoldingDollar />}
            </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-body-3-highlight text-primary truncate">{row.title}</span>
            <span className="font-caption text-tertiary">{row.subtitle}</span>
        </div>
        <div className="flex shrink-0 flex-col items-end">
            <span className="font-body-3-highlight text-primary">{row.value}</span>
            {row.change ? (
                <span className={`font-caption ${MACRO_LIQUIDITY_TREND_COLOR[row.change.trend]}`}>
                    {row.change.trend === 'up' ? '+' : row.change.trend === 'down' ? '-' : ''}
                    {row.change.text}
                </span>
            ) : row.valueSuffix ? (
                <span className="font-caption text-tertiary">{row.valueSuffix}</span>
            ) : null}
        </div>
    </>
);
