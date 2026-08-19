'use client';

import { useEffect, useState } from 'react';

import { StockProfileInfo } from '@/components/common/stock-info/profile/StockProfileInfo';
import { StockProfileShareholders } from '@/components/common/stock-info/profile/StockProfileShareholders';
import {
    fetchStockListing,
    fetchStockOwnership,
    fetchStockProfile,
} from '@/services/api/datafeed/stock-info';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type {
    StockListingData,
    StockMajorShareholder,
    StockProfileData,
} from '@/types/datafeed/stock-info';
import { isSuccessApi } from '@/utils/common';

export const StockProfile = () => {
    const { selectedStock } = useStockInfoStore();
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<StockProfileData | null>(null);
    const [listing, setListing] = useState<StockListingData | null>(null);
    const [shareholders, setShareholders] = useState<StockMajorShareholder[]>([]);

    useEffect(() => {
        const symbol = selectedStock?.symbol;
        if (!symbol) {
            setProfile(null);
            setListing(null);
            setShareholders([]);
            return;
        }

        let isActive = true;
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const [profileRes, listingRes, ownershipRes] = await Promise.all([
                    fetchStockProfile(symbol),
                    fetchStockListing(symbol),
                    fetchStockOwnership(symbol),
                ]);
                if (!isActive) return;

                setProfile(isSuccessApi(profileRes.error_code) ? profileRes.data : null);
                setListing(isSuccessApi(listingRes.error_code) ? listingRes.data : null);
                setShareholders(
                    isSuccessApi(ownershipRes.error_code) &&
                        Array.isArray(ownershipRes.data?.major_shareholders)
                        ? ownershipRes.data.major_shareholders
                        : [],
                );
            } catch {
                if (!isActive) return;
                setProfile(null);
                setListing(null);
                setShareholders([]);
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        fetchAll();
        return () => {
            isActive = false;
        };
    }, [selectedStock?.symbol]);

    return (
        <section
            className="flex h-full min-h-0 gap-3 overflow-hidden"
            aria-label={'Hồ sơ doanh nghiệp'}
        >
            <StockProfileInfo isLoading={isLoading} profile={profile} listing={listing} />
            <StockProfileShareholders isLoading={isLoading} shareholders={shareholders} />
        </section>
    );
};
