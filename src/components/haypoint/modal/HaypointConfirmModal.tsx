'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Checkbox } from '@/components/common/ui/Checkbox';
import { HaypointStore } from '@/components/haypoint/HaypointStore';
import { HAYPOINT_ASSETS, VOUCHER_GRADIENT } from '@/constants/haypoint';
import { useTranslate } from '@/hooks/useTranslate';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useExchangeFlowStore } from '@/stores/haypoint/useExchangeFlowStore';
import { useOfficeListStore } from '@/stores/haypoint/useOfficeListStore';
import { formatNumberVN } from '@/utils/format';

export const HaypointConfirmModal = () => {
    const trans = useTranslate();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();

    const [isAgreedToTerms, setIsAgreedToTerms] = useState<boolean>(false);

    const { selectedReward, proceedToOtpStep } = useExchangeFlowStore();
    const { offices, isLoadingMore, hasMore, searchOffices, loadMoreOffices } =
        useOfficeListStore();

    const handleSearchOffices = async (keyword: string) => {
        startLoading();
        try {
            await searchOffices(keyword);
        } finally {
            stopLoading();
        }
    };

    if (!selectedReward) return null;

    return (
        <div className="w-full flex-1 min-h-0">
            <div className="flex gap-3 h-full min-h-0">
                <section
                    className="bg-secondary flex flex-col gap-8 rounded-xl p-3 w-1/2 h-full overflow-hidden min-h-0"
                    aria-labelledby="stores-title"
                >
                    <HaypointStore
                        offices={offices}
                        onSearchOffice={handleSearchOffices}
                        onLoadMore={loadMoreOffices}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        inputId="store-search-confirm"
                    />
                </section>
                <aside className="bg-secondary flex flex-col gap-6 rounded-xl p-3 w-1/2">
                    <article
                        className="rounded-xl p-4 flex flex-col gap-6"
                        style={{
                            background: VOUCHER_GRADIENT.SUBTLE,
                        }}
                    >
                        <header className="flex items-center gap-4">
                            <div className="flex items-center justify-center overflow-hidden bg-quinary rounded-full w-12 h-12">
                                <Image
                                    src={selectedReward.brand_image}
                                    alt={`Logo ${selectedReward.name}`}
                                    width={48}
                                    height={48}
                                    className="object-contain rounded-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                                <p className="font-body-3 text-secondary">
                                    {selectedReward.subtitle}
                                </p>
                                <h3 className="font-heading-4 text-primary">
                                    {selectedReward.name}
                                </h3>
                            </div>
                        </header>
                        <dl className="flex items-center justify-between">
                            <dt className="font-body-3 text-primary">{trans.haypoint.pts_cost}</dt>
                            <dd className="flex items-center gap-2">
                                <span className="font-heading-4 text-primary">
                                    {formatNumberVN(selectedReward.price, { decimals: 0 })}
                                </span>
                                <Image
                                    src={HAYPOINT_ASSETS.POINT_ICON}
                                    alt={trans.haypoint.pts_reward_icon}
                                    width={24}
                                    height={24}
                                />
                            </dd>
                        </dl>
                    </article>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!isAgreedToTerms) return;
                            startLoading();
                            try {
                                await proceedToOtpStep();
                            } finally {
                                stopLoading();
                            }
                        }}
                        className="flex flex-col gap-6"
                    >
                        <fieldset className="border-none p-0 m-0">
                            <Checkbox
                                id="terms-agreement"
                                label={
                                    <>
                                        {trans.haypoint.agree_prefix}
                                        <Link
                                            target="_blank"
                                            href={HAYPOINT_ASSETS.TERMS_PDF}
                                            className="text-highlight"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {trans.haypoint.svc_terms}
                                        </Link>
                                    </>
                                }
                                checked={isAgreedToTerms}
                                onChange={(e) => setIsAgreedToTerms(e.target.checked)}
                            />
                        </fieldset>
                        <button
                            type="submit"
                            disabled={!isAgreedToTerms || isLoading}
                            className={`
                        w-2/3 mx-auto py-3 rounded-full font-body-3-highlight
                        ${
                            isAgreedToTerms && !isLoading
                                ? 'bg-highlight text-quaternary cursor-pointer'
                                : 'bg-disabled text-tertiary cursor-not-allowed'
                        }
                    `}
                        >
                            {trans.haypoint.redeem_voucher}
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    );
};
