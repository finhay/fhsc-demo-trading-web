'use client';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Spinner } from '@/components/common/ui/Spinner';
import type { StockListingData, StockProfileData } from '@/types/datafeed/stock-info';
import { getAvatarUrl } from '@/utils/common';
import { formatDateOrDash, formatNumberVN, formatPercentVN } from '@/utils/format';

type Props = {
    isLoading: boolean;
    profile: StockProfileData | null;
    listing: StockListingData | null;
};

type InfoItem = {
    label: string;
    value: string;
};

const InfoRow = ({ label, value }: InfoItem) => (
    <div className="flex w-full items-start justify-between gap-4 overflow-hidden">
        <p className="shrink-0 body-4 text-secondary">{label}</p>
        <p className="text-right body-4-highlight text-primary">{value || '—'}</p>
    </div>
);

const Divider = () => <div className="h-px w-full shrink-0 base-tertiary" />;

export const StockProfileInfo = ({ isLoading, profile, listing }: Props) => {
    const [hasLogoError, setHasLogoError] = useState(false);

    useEffect(() => {
        setHasLogoError(false);
    }, [profile?.symbol]);

    const sectorLabel = useMemo(
        () =>
            profile?.sector
                ?.slice()
                .sort((a, b) => a.level - b.level)
                .map((item) => item.name)
                .filter(Boolean)
                .join(', ') || '—',
        [profile?.sector],
    );

    const basicRows: InfoItem[] = [
        { label: 'Mã SIC', value: profile?.symbol ?? '—' },
        { label: 'Sàn', value: listing?.exchange ?? '—' },
        { label: 'Ngành', value: sectorLabel },
    ];

    const listingRows: InfoItem[] = [
        { label: 'Ngày niêm yết', value: formatDateOrDash(listing?.listing_date) },
        {
            label: 'Giá TC chào sàn',
            value:
                listing?.listing_reference_price != null
                    ? formatNumberVN(listing.listing_reference_price, {
                          decimals: 2,
                          trimTrailingZeros: true,
                      })
                    : '—',
        },
        {
            label: 'CP niêm yết',
            value:
                listing?.listed_shares != null
                    ? formatNumberVN(listing.listed_shares, { decimals: 0 })
                    : '—',
        },
    ];

    const shareRows: InfoItem[] = [
        {
            label: 'CP lưu hành',
            value:
                listing?.outstanding_shares != null
                    ? formatNumberVN(listing.outstanding_shares, { decimals: 0 })
                    : '—',
        },
        {
            label: 'CP quỹ',
            value:
                listing?.treasury_shares != null
                    ? formatNumberVN(listing.treasury_shares, { decimals: 0 })
                    : '—',
        },
        {
            label: 'CP trôi nổi',
            value:
                listing?.free_float != null
                    ? formatNumberVN(listing.free_float, { decimals: 0 })
                    : '—',
        },
        {
            label: 'Tỷ lệ trôi nổi',
            value: listing?.free_float_pct != null ? formatPercentVN(listing.free_float_pct) : '—',
        },
    ];

    return (
        <aside
            className="flex h-full min-h-0 min-w-0 basis-2/5 flex-col overflow-hidden rounded-2xl border border-tertiary"
            aria-label={'Thông tin doanh nghiệp'}
        >
            {isLoading ? (
                <div className="flex h-full min-h-0 items-center justify-center" role="status">
                    <Spinner isLoading isOverlay={false} />
                </div>
            ) : !profile && !listing ? (
                <EmptyState />
            ) : (
                <div className="scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                    {profile?.symbol && !hasLogoError ? (
                        <Image
                            key={profile.symbol}
                            src={getAvatarUrl(profile.symbol)}
                            alt={profile.name_vn || profile.symbol}
                            width={32}
                            height={32}
                            className="size-8 shrink-0 rounded-full object-cover"
                            onError={() => setHasLogoError(true)}
                        />
                    ) : null}
                    <p className="body-5 text-primary">
                        {profile?.about || 'Không có thông tin về mã cổ phiếu'}
                    </p>
                    <Divider />
                    {basicRows.map((row) => (
                        <InfoRow key={row.label} {...row} />
                    ))}
                    <Divider />
                    {listingRows.map((row) => (
                        <InfoRow key={row.label} {...row} />
                    ))}
                    <Divider />
                    {shareRows.map((row) => (
                        <InfoRow key={row.label} {...row} />
                    ))}
                </div>
            )}
        </aside>
    );
};
