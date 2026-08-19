'use client';

import { Dialog } from '@/components/common/ui/Dialog';
import { MarketExchangeRate } from '@/components/thi-truong/currency/modal/MarketExchangeRate';
import { MarketInterbank } from '@/components/thi-truong/currency/modal/MarketInterbank';
import { MarketInterestCards } from '@/components/thi-truong/currency/modal/MarketInterestCards';
import { MarketOmo } from '@/components/thi-truong/currency/modal/MarketOmo';
import type { MacroLiquidityRawState } from '@/types/pages/market';

type Props = {
    onClose: () => void;
    raw: MacroLiquidityRawState;
};

export const MarketCurrencyModal = ({ onClose, raw }: Props) => {
    return (
        <Dialog
            title={'Tiền tệ'}
            onClose={onClose}
            maxWidth="max-w-7xl"
            maxHeight="h-[90vh]"
            panelClassName="bg-primary gap-4 p-4"
        >
            <div className="scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto">
                <MarketExchangeRate initialChart={raw.exchangeChart} />
                <MarketInterbank points={raw.interbank} />
                <MarketOmo items={raw.omo} />
                <MarketInterestCards depositData={raw.deposit} loanItems={raw.loan} />
            </div>
        </Dialog>
    );
};
