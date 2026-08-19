'use client';

import { useState } from 'react';

import Image from 'next/image';

import { FaChevronRight } from 'react-icons/fa6';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { IpoDetailModal } from '@/components/ipo/modal/IpoDetailModal';
import { IpoEmptyState } from '@/components/ipo/opportunity/IpoEmptyState';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchIpoRegistrationBuyDetail } from '@/services/api/ipo-hunt';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useIpoStore } from '@/stores/ipo/useIpoStore';
import { IpoRegistrationBuyDetailData, IpoRegistrationBuyItem } from '@/types/ipo-hunt';
import { isSuccessApi } from '@/utils/common';
import { formatDate } from '@/utils/format';
import { getRegistrationStatusColor } from '@/utils/ipo';

export const IpoRegisteredList = () => {
    const trans = useTranslate();
    const { startLoading, stopLoading } = useLoadingStore();
    const [selectedRegistration, setSelectedRegistration] = useState<IpoRegistrationBuyItem | null>(
        null,
    );
    const [registrationDetail, setRegistrationDetail] =
        useState<IpoRegistrationBuyDetailData | null>(null);

    const { registrationList, isLoadingRegistrationList } = useIpoStore();

    const handleOpenRegistrationDetail = async (registration: IpoRegistrationBuyItem) => {
        startLoading();
        try {
            const { error_code, data, message } = await fetchIpoRegistrationBuyDetail(
                registration.id,
            );
            if (isSuccessApi(error_code)) {
                setSelectedRegistration(registration);
                setRegistrationDetail(data);
            } else {
                toast.error(message);
            }
        } catch {
        } finally {
            stopLoading();
        }
    };

    return (
        <section className="bg-secondary rounded-xl px-4 py-6 flex flex-col gap-6 w-96 min-h-0">
            <header>
                <h2 className="font-body-2-highlight text-primary">
                    {trans.ipo.sections.registered.title}
                </h2>
            </header>
            <div className="scrollbar flex flex-col gap-8 flex-1 min-h-0 overflow-y-auto w-full">
                {isLoadingRegistrationList ? (
                    <Skeleton />
                ) : registrationList.length > 0 ? (
                    <ul className="flex flex-col gap-8 list-none">
                        {registrationList.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center gap-3 w-full cursor-pointer"
                                onClick={() => handleOpenRegistrationDetail(item)}
                            >
                                <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden relative">
                                    <Image
                                        src={item.logo_url}
                                        alt={item.symbol}
                                        width={64}
                                        height={64}
                                        className="w-16 h-16 object-cover rounded-full"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col gap-2">
                                    <div className="flex items-center gap-4">
                                        <span className="font-body-2-highlight text-primary">
                                            {item.symbol}
                                        </span>
                                        <div className="bg-disabled px-4 py-1 rounded-full flex items-center">
                                            <span
                                                className={`font-caption ${getRegistrationStatusColor(item.status)}`}
                                            >
                                                {item.statusAsText}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="font-body-3 text-secondary truncate">
                                        {trans.ipo.sections.registered.registration_date}
                                        {formatDate(item.created_at)}
                                    </p>
                                </div>
                                <FaChevronRight className="shrink-0 text-secondary" size={16} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <IpoEmptyState
                        title={trans.ipo.sections.registered.empty_title}
                        description={trans.ipo.sections.registered.empty_description}
                    />
                )}
            </div>
            {registrationDetail && selectedRegistration && (
                <IpoDetailModal
                    item={selectedRegistration}
                    data={registrationDetail}
                    onClose={() => setRegistrationDetail(null)}
                />
            )}
        </section>
    );
};
