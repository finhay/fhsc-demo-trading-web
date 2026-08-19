'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { Spinner } from '@/components/common/ui/Spinner';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchHayBondDynamicPackagesDetail } from '@/services/api/bond-enterprise/packages';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';
import type { HaybondPackageDetail as PackageDetailData } from '@/types/bond-enterprise/packages';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

export const HaybondFlexiblePackageDetail = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState<PackageDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isOverlayLoading, setPackage, openBuy } = useHaybondFlexStore();

    const handleOpenOrderBuy = (packageId: number, name: string, interestRate: number) => {
        setPackage({ id: packageId, name, interest_rate: interestRate });
        openBuy(packageId);
    };

    const fetchDetail = async () => {
        if (!id || typeof id !== 'string') return;
        setIsLoading(true);
        try {
            const {
                error_code,
                message,
                data: detail,
            } = await fetchHayBondDynamicPackagesDetail(id);
            if (isSuccessApi(error_code)) {
                setData(detail);
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.something_went_wrong));
            router.push('/haybond');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (router.isReady) {
            fetchDetail();
        }
    }, [router.isReady, id]);

    return (
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-6 overflow-y-auto">
            <Spinner isLoading={isLoading || isOverlayLoading} />
            {data && (
                <>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Image src={data.icon_url || ''} width={72} height={72} alt="" />
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-heading-1 text-primary">{data.name}</h3>
                                    <span className="border-highlight bg-secondary font-body-3 text-primary rounded-full border px-3 py-1">
                                        {formatNumberVN(data.interest_rate * 100, {
                                            decimals: 2,
                                            trimTrailingZeros: true,
                                        })}
                                        %/{trans.haybond.year}
                                    </span>
                                </div>
                                <span className="font-body-2 text-secondary">
                                    {data.description}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="bg-highlight text-quaternary font-body-2-highlight w-44 cursor-pointer rounded-full px-4 py-2"
                            onClick={() =>
                                handleOpenOrderBuy(data.id, data.name, data.interest_rate)
                            }
                        >
                            {trans.haybond.buy_package}
                        </button>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-body-2-highlight text-primary">
                            {trans.haybond.general_info}
                        </h3>
                        <ul className="list-disc space-y-1 pl-6">
                            {data.additionalInfo.map((item, index) => (
                                <li key={index} className="font-body-2 text-secondary">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-body-2-highlight text-primary">
                            {trans.haybond.est_profit}
                        </h3>
                        <Image
                            src={data.chart_url || ''}
                            alt=""
                            width={1200}
                            height={400}
                            className="h-auto w-full"
                        />
                    </div>
                </>
            )}
        </div>
    );
};
