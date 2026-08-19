'use client';

import { MarketMacroVnProduction } from '@/components/thi-truong/macro/vn/MarketMacroVnProduction';
import { MarketMacroVnRetail } from '@/components/thi-truong/macro/vn/MarketMacroVnRetail';
import type { MacroVnRawState } from '@/types/pages/market';

type Props = {
    raw: MacroVnRawState;
};

export const MarketMacroVn = ({ raw }: Props) => {
    return (
        <div className="flex flex-col gap-4">
            <MarketMacroVnProduction iip={raw.iip} pmi={raw.pmi} exportData={raw.exportData} />
            <MarketMacroVnRetail
                serviceRetail={raw.serviceRetail}
                goodsRetail={raw.goodsRetail}
                cpi={raw.cpi}
            />
        </div>
    );
};
