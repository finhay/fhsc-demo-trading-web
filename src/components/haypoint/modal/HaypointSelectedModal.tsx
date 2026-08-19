'use client';

import Image from 'next/image';

import { HAYPOINT_ASSETS } from '@/constants/haypoint';
import { useTranslate } from '@/hooks/useTranslate';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useExchangeFlowStore } from '@/stores/haypoint/useExchangeFlowStore';
import { useOfficeListStore } from '@/stores/haypoint/useOfficeListStore';
import { usePointStore } from '@/stores/haypoint/usePointStore';
import { RewardItem } from '@/types/reward';
import { formatNumberVN } from '@/utils/format';

export const HaypointSelectedModal = () => {
    const trans = useTranslate();
    const { startLoading, stopLoading } = useLoadingStore();
    const { points } = usePointStore();
    const { rewardList, setSelectedReward } = useExchangeFlowStore();
    const { fetchOwnedRewardOffices } = useOfficeListStore();

    const handleSelectReward = async (reward: RewardItem) => {
        startLoading();
        try {
            await fetchOwnedRewardOffices(reward.id);
            setSelectedReward(reward);
        } finally {
            stopLoading();
        }
    };

    if (!rewardList.length) return null;

    return (
        <div className="w-full flex-1 min-h-0">
            <div className="flex gap-3 h-full min-h-0">
                <article className="bg-secondary flex flex-col gap-6 rounded-xl w-1/2 flex-1 min-h-0 overflow-hidden">
                    <figure className="bg-quinary h-48 rounded-tl-xl rounded-tr-xl overflow-hidden relative m-0">
                        <Image
                            src={rewardList[0]?.images?.[0] || ''}
                            alt={rewardList[0]?.name}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                    </figure>
                    <header className="flex gap-4 px-6">
                        <div className="flex items-center justify-center overflow-hidden">
                            <Image
                                src={rewardList[0]?.brand_image}
                                alt={`Logo ${rewardList[0]?.name}`}
                                width={48}
                                height={36}
                                className="object-contain rounded-full"
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <h3 className="font-heading-4 text-primary">{rewardList[0]?.name}</h3>
                            <p className="font-body-3 text-secondary">{rewardList[0]?.subtitle}</p>
                        </div>
                    </header>
                    <section className="px-6 flex-1 min-h-0 overflow-y-auto">
                        <h4 className="font-body-3-highlight text-primary">
                            {trans.haypoint.brand_intro}
                        </h4>
                        <div
                            className="font-body-3 text-secondary leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: rewardList[0]?.note || '' }}
                        />
                    </section>
                </article>
                <aside className="bg-secondary flex flex-col gap-6 rounded-xl p-6 w-1/2">
                    <h3 className="font-heading-4 text-primary">
                        {trans.haypoint.pick_voucher_value}
                    </h3>
                    <fieldset className="border-none overflow-y-auto">
                        <legend className="sr-only">{trans.haypoint.pick_voucher_value}</legend>
                        <div className="grid grid-cols-3 gap-3" role="group">
                            {[...(rewardList ?? [])]
                                .sort((a, b) => a.point_cost - b.point_cost)
                                .map((item) => {
                                    const isAffordable = item.point_cost <= points;
                                    return (
                                        <button
                                            key={`${item.id}-${item.name}`}
                                            onClick={() => handleSelectReward(item)}
                                            disabled={!isAffordable}
                                            className={`
                                    rounded-xl py-3 px-4 font-body-3
                                    ${
                                        isAffordable
                                            ? 'bg-[#18311F] text-primary'
                                            : 'bg-tertiary text-secondary cursor-not-allowed'
                                    }
                                `}
                                            type="button"
                                            aria-label={trans.haypoint.pick_value_currency.replace(
                                                '{price}',
                                                formatNumberVN(item.point_cost, { decimals: 0 }),
                                            )}
                                        >
                                            {formatNumberVN(item.point_cost, { decimals: 0 })}đ
                                        </button>
                                    );
                                })}
                        </div>
                    </fieldset>
                    <dl className="flex items-center justify-between">
                        <dt className="font-body-3 text-secondary">
                            {trans.haypoint.your_haypoint}
                        </dt>
                        <dd className="flex items-center gap-2">
                            <span className="font-body-3-highlight text-primary">
                                {formatNumberVN(points, { decimals: 0 })}
                            </span>
                            <Image
                                src={HAYPOINT_ASSETS.POINT_ICON}
                                alt={trans.haypoint.pts_reward_icon}
                                width={24}
                                height={24}
                            />
                        </dd>
                    </dl>
                </aside>
            </div>
        </div>
    );
};
