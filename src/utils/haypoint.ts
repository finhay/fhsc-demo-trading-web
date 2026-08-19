import { UIEvent } from 'react';

import { DEFAULT_PARAMS } from '@/constants/haypoint';
import { ClaimRewardBody, RewardItem } from '@/types/reward';

export const isNearScrollBottom = <T extends HTMLElement>(e: UIEvent<T>): boolean => {
    const SCROLL_THRESHOLD = 50;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    return scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;
};

export const parseVoucherName = (name: string) => {
    const parts = name.split(']');
    if (parts.length < 2) {
        return { brandName: '', description: name };
    }

    return {
        brandName: parts[0] + ']',
        description: parts.slice(1).join(']').trim(),
    };
};

export const formatClaimBody = (reward: RewardItem, brandId: string): ClaimRewardBody => ({
    partner_id: DEFAULT_PARAMS.PARTNER_ID,
    items: [
        {
            amount: 1,
            item: {
                id: reward.id,
                point_cost: reward.point_cost,
                name: reward.name,
                image: reward.images?.[0] || '',
                brand: {
                    id: brandId,
                    name: reward.name,
                    image: reward.brand_image,
                },
            },
        },
    ],
});
