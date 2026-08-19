'use client';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { FaChevronRight } from 'react-icons/fa6';

import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { formatNumberVN } from '@/utils/format';

export const HaybondPackagesDynamic = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { packagesDynamic, isLoadingPackages } = useHaybondStore();
    const { setPackage, openBuy } = useHaybondFlexStore();

    const handleOpenOrderBuy = (id: number, name: string, interestRate: number) => {
        setPackage({ id, name, interest_rate: interestRate });
        openBuy(id);
    };

    if (isLoadingPackages) return null;

    return (
        <>
            {packagesDynamic.map((item) => {
                const { icon_url, interest_rate, name, id, description } = item;
                return (
                    <div key={id} className="bg-secondary flex flex-col gap-4 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Image src={icon_url || ''} alt="" width={40} height={40} />
                                <span className="font-body-1-highlight text-primary ml-2">
                                    {name}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="text-primary cursor-pointer"
                                onClick={() =>
                                    router.push({
                                        pathname: '/haybond/flexible/chi-tiet-goi',
                                        query: { id },
                                    })
                                }
                            >
                                <FaChevronRight size={14} />
                            </button>
                        </div>
                        <span className="font-body-3 text-primary">{description}</span>
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.yield_rate}{' '}
                            <span className="text-primary">
                                ~{' '}
                                {formatNumberVN(interest_rate * 100, {
                                    decimals: 2,
                                    trimTrailingZeros: true,
                                })}{' '}
                                %/{trans.haybond.year}
                            </span>
                        </span>
                        <div className="border-tertiary flex justify-end border-t pt-3">
                            <button
                                type="button"
                                className="bg-highlight text-quaternary font-body-3-highlight w-24 cursor-pointer rounded-full px-4 py-2"
                                onClick={() => handleOpenOrderBuy(id, name, interest_rate)}
                            >
                                {trans.haybond.buy_package}
                            </button>
                        </div>
                    </div>
                );
            })}
        </>
    );
};
