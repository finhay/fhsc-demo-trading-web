'use client';

import { Trade247DateRange } from '@/components/giao-dich/shared/Trade247DateRange';
import { type TradePanelFormInstance } from '@/types/pages/trading';

type Props = {
    form: TradePanelFormInstance;
    activeSideKey: string;
};

export const TradePanel247Dates = ({ form, activeSideKey }: Props) => {
    return <Trade247DateRange form={form} isBuySide={activeSideKey === 'buy'} />;
};
