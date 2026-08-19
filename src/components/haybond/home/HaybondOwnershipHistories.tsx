'use client';

import { useRouter } from 'next/router';

import { FaChevronRight, FaCircle } from 'react-icons/fa6';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Spinner } from '@/components/common/ui/Spinner';
import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { formatDate, formatNumberVN } from '@/utils/format';

export const HaybondOwnershipHistories = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { ownershipHistories, ownershipHistoriesDynamic } = useHaybondStore();

    const isLoading = ownershipHistories.isLoading;
    const isEmpty =
        ownershipHistories.content.length === 0 && ownershipHistoriesDynamic.content.length === 0;

    return (
        <div className="bg-secondary flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg">
            <div className="bg-disabled flex w-full shrink-0 items-center justify-between rounded-t-lg px-4 py-2">
                <h3 className="font-body-2-highlight text-primary">
                    {trans.haybond.owned_packages}
                </h3>
                <button
                    type="button"
                    className="text-highlight font-body-3 flex cursor-pointer items-center gap-2"
                    onClick={() => router.push('/haybond/lich-su-so-huu')}
                >
                    <span>{trans.haybond.history}</span>
                    <FaChevronRight size={12} />
                </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col p-4">
                <Spinner isLoading={isLoading} isOverlay={false} />
                {!isLoading && isEmpty && <EmptyState />}
                {!isLoading && !isEmpty && (
                    <>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="font-caption text-secondary">
                                {trans.haybond.product_package}/ <br />
                                {trans.haybond.maturity_date}
                            </span>
                            <span className="font-caption text-secondary mr-8 text-end">
                                {trans.haybond.amount}/ <br />
                                {trans.haybond.profit}
                            </span>
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                            {ownershipHistoriesDynamic.content.map((item) => {
                                const { name, interest_amount, saving_amount } = item;
                                return (
                                    <button
                                        type="button"
                                        key={name}
                                        className="flex cursor-pointer items-center justify-between"
                                        onClick={() =>
                                            router.push('/haybond/chi-tiet-goi-linh-hoat')
                                        }
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="font-body-3-highlight text-primary">
                                                {name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-end">
                                                <span className="font-body-3-highlight text-primary">
                                                    {formatNumberVN(saving_amount, { decimals: 0 })}
                                                    {trans.haybond.currency_unit}
                                                </span>
                                                <span className="font-caption text-green">
                                                    {formatNumberVN(interest_amount, {
                                                        decimals: 0,
                                                    })}
                                                    {trans.haybond.currency_unit}
                                                </span>
                                            </div>
                                            <FaChevronRight size={12} className="text-primary" />
                                        </div>
                                    </button>
                                );
                            })}
                            {ownershipHistories.content.map((item) => {
                                const {
                                    id,
                                    name,
                                    end_date,
                                    saving_amount,
                                    interest_rate,
                                    sell_early,
                                    end_early_interest_rate,
                                } = item;
                                return (
                                    <button
                                        type="button"
                                        key={id}
                                        className="flex cursor-pointer items-center justify-between"
                                        onClick={() =>
                                            router.push({
                                                pathname: '/haybond/lich-su-so-huu/chi-tiet',
                                                query: { id },
                                            })
                                        }
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="font-body-3-highlight text-primary flex items-center gap-1">
                                                {name}{' '}
                                                {sell_early && (
                                                    <FaCircle className="text-red" size={7} />
                                                )}
                                            </span>
                                            <span className="font-caption text-secondary">
                                                {formatDate(end_date)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-end">
                                                <span className="font-body-3-highlight text-primary">
                                                    {formatNumberVN(saving_amount, { decimals: 0 })}
                                                    {trans.haybond.currency_unit}
                                                </span>
                                                <span className="font-caption text-green">
                                                    {`~${formatNumberVN(
                                                        (sell_early
                                                            ? end_early_interest_rate
                                                            : interest_rate) * 100,
                                                        { decimals: 2, trimTrailingZeros: true },
                                                    )} %/${trans.haybond.year}`}
                                                </span>
                                            </div>
                                            <FaChevronRight size={12} className="text-primary" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
