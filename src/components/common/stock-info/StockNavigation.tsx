'use client';

import { FC, useEffect } from 'react';

import { RiFullscreenExitLine, RiFullscreenLine } from 'react-icons/ri';

import { STOCK_TYPE, TAB_INFORMATION } from '@/constants/trading';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import { getTabInformationLabel } from '@/utils/stock-info';

const NON_STOCK_TAB_KEYS: string[] = ['CHART', 'STATISTICS'];

type Props = {
    hideFullscreenToggle?: boolean;
};

export const StockNavigation: FC<Props> = ({ hideFullscreenToggle = false }) => {
    const { selectedStock } = useStockInfoStore();
    const { selectedTabInfor, setSelectedTabInfor, isChartFullscreen, toggleChartFullscreen } =
        useTradingStore();

    const isNonStock = !!selectedStock?.stockType && selectedStock.stockType !== STOCK_TYPE.STOCK;
    const tabs = isNonStock
        ? TAB_INFORMATION.filter(({ key }) => NON_STOCK_TAB_KEYS.includes(key))
        : TAB_INFORMATION;

    useEffect(() => {
        if (isNonStock && !NON_STOCK_TAB_KEYS.includes(selectedTabInfor)) {
            setSelectedTabInfor(TAB_INFORMATION[0].key);
        }
    }, [isNonStock, selectedTabInfor, setSelectedTabInfor]);

    return (
        <nav
            className="border-b border-tertiary"
            aria-label={'Điều hướng khu vực biểu đồ và thông tin'}
        >
            <div className="flex items-center justify-between px-3">
                <ul
                    role="tablist"
                    aria-label={'Danh sách tab khu vực biểu đồ'}
                    className="flex list-none items-center gap-6"
                >
                    {tabs.map(({ key }) => (
                        <li
                            key={key}
                            role="presentation"
                            className={`cursor-pointer transition-colors ${
                                selectedTabInfor === key
                                    ? 'body-4-highlight text-primary'
                                    : 'body-4 text-secondary'
                            }`}
                            onClick={() => {
                                setSelectedTabInfor(key);
                            }}
                        >
                            {getTabInformationLabel(key)}
                            <span
                                className={`mt-1.5 block h-0.5 w-full base-quinary ${
                                    selectedTabInfor === key ? '' : 'opacity-0'
                                }`}
                            />
                        </li>
                    ))}
                </ul>
                {!hideFullscreenToggle && (
                    <button
                        type="button"
                        onClick={toggleChartFullscreen}
                        aria-pressed={isChartFullscreen}
                        aria-label={
                            isChartFullscreen ? 'Thu nhỏ biểu đồ' : 'Mở rộng toàn màn hình biểu đồ'
                        }
                        className="shrink-0 cursor-pointer"
                    >
                        {isChartFullscreen ? (
                            <RiFullscreenExitLine size={20} className="text-primary" aria-hidden />
                        ) : (
                            <RiFullscreenLine size={20} className="text-primary" aria-hidden />
                        )}
                    </button>
                )}
            </div>
        </nav>
    );
};
