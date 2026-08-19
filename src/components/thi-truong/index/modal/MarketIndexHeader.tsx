'use client';

import { FaXmark } from 'react-icons/fa6';

import { InputSearch } from '@/components/common/feature/InputSearch';
import { useTranslate } from '@/hooks/useTranslate';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { formatNumberVN } from '@/utils/format';

type Props = {
    selectedIndex: string;
    onSelectIndex: (index: string) => void;
    onSelectStock: (symbol: string) => void;
    onClose: () => void;
};

export const MarketIndexHeader = ({
    selectedIndex,
    onSelectIndex,
    onSelectStock,
    onClose,
}: Props) => {
    const trans = useTranslate();
    const { data } = useMarketIndexStore();

    const indexData = data.find((item) => item?.index === selectedIndex);
    const changePercent = indexData?.changePercent ?? 0;
    const statsColorClass =
        changePercent === 0 ? 'text-orange' : changePercent > 0 ? 'text-green' : 'text-red';

    return (
        <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-8">
                <div className="flex w-fit max-w-full shrink-0 flex-col gap-2 justify-center">
                    <div className="flex items-center gap-3">
                        <InputSearch
                            inputId="index-search"
                            value={selectedIndex}
                            includeIndices
                            onSelectIndex={onSelectIndex}
                            onSelectStock={(stock) => onSelectStock(stock.symbol)}
                            variant="pill"
                            className="w-auto"
                            inputClassName="font-body-3-highlight w-28"
                            placeholder={selectedIndex}
                        />
                        <div
                            className={`flex items-center gap-1.5 whitespace-nowrap ${statsColorClass}`}
                        >
                            <span className="font-body-1-highlight">
                                {formatNumberVN(indexData?.indexValue ?? 0, { decimals: 2 })}
                            </span>
                            <span className="font-body-3">
                                {changePercent > 0 ? '+' : ''}
                                {formatNumberVN(changePercent, { decimals: 2 })}%
                            </span>
                        </div>
                    </div>
                    <p className="font-caption text-secondary">
                        {trans.market.index.detail.title_prefix} {selectedIndex}
                    </p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="text-primary hover:text-highlight transition-colors flex-shrink-0"
                aria-label={trans.dialog.close}
                type="button"
            >
                <FaXmark size={20} />
            </button>
        </div>
    );
};
