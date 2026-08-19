'use client';

import { useEffect, useState } from 'react';

import { Spinner } from '@/components/common/ui/Spinner';
import { HaybondHistoryRowBuy } from '@/components/haybond/flexible-ownership-detail/HaybondHistoryRowBuy';
import { HaybondHistoryRowCoupon } from '@/components/haybond/flexible-ownership-detail/HaybondHistoryRowCoupon';
import { HaybondHistoryRowSell } from '@/components/haybond/flexible-ownership-detail/HaybondHistoryRowSell';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchHayBondDynamicInvestmentHistories } from '@/services/api/bond-enterprise/packages';
import type { HaybondInvestmentHistoryItem } from '@/types/bond-enterprise/packages';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

export const HaybondHistoryDynamic = () => {
    const trans = useTranslate();
    const [histories, setHistories] = useState<HaybondInvestmentHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistories = async () => {
        setIsLoading(true);
        try {
            const { error_code, message, data } = await fetchHayBondDynamicInvestmentHistories();
            if (isSuccessApi(error_code)) {
                setHistories(data ?? []);
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.something_went_wrong));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistories();
    }, []);

    return (
        <div className="bg-secondary flex min-h-0 flex-1 flex-col overflow-hidden rounded">
            <div className="bg-disabled shrink-0 rounded-t px-4 py-2">
                <h3 className="font-body-2-highlight text-primary">
                    {trans.haybond.invest_history}
                </h3>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto p-4">
                <Spinner isLoading={isLoading} isOverlay={false} />
                {!isLoading &&
                    histories.map((item, index) => {
                        if (item.type === 'SELL') {
                            return <HaybondHistoryRowSell key={index} data={item} />;
                        }
                        if (item.type === 'BUY') {
                            return <HaybondHistoryRowBuy key={index} data={item} />;
                        }
                        if (item.type === 'COUPON') {
                            return <HaybondHistoryRowCoupon key={index} data={item} />;
                        }
                        return null;
                    })}
            </div>
        </div>
    );
};
