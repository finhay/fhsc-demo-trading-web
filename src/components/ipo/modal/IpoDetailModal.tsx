'use client';

import Image from 'next/image';
import Link from 'next/link';

import { FaArrowRight, FaXmark } from 'react-icons/fa6';

import { Dialog } from '@/components/common/ui/Dialog';
import { IpoInfoSection } from '@/components/ipo/opportunity/IpoInfoSection';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { payIpoRegistrationBuyRemainingBalance } from '@/services/api/ipo-hunt';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useIpoStore } from '@/stores/ipo/useIpoStore';
import { IpoRegistrationBuyDetailData, IpoRegistrationBuyItem } from '@/types/ipo-hunt';
import { isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { getRegistrationStatusConfig } from '@/utils/ipo';

type Props = {
    item: IpoRegistrationBuyItem;
    data: IpoRegistrationBuyDetailData;
    onClose: () => void;
};

export const IpoDetailModal = ({ item, data, onClose }: Props) => {
    const trans = useTranslate();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const { refetchLists } = useIpoStore();

    const statusConfig = getRegistrationStatusConfig(data.status);

    const registrationInfo = [
        {
            label: trans.ipo.modal.detail.quantity,
            value: `${formatNumberVN(data.quantity, { decimals: 0 })}cp`,
        },
        { label: trans.ipo.modal.detail.price, value: `${formatNumberVN(data.price)}đ` },
        {
            label: trans.ipo.modal.detail.paid_deposit,
            value: `${formatNumberVN(data.pay_in_advance, { trimTrailingZeros: true })}đ`,
        },
    ];

    const paymentInfo = [
        {
            label: trans.ipo.modal.detail.purchase_amount,
            value: `${formatNumberVN(data.result?.spent_amount || 0, { trimTrailingZeros: true })}đ`,
        },
        {
            label: trans.ipo.modal.detail.deposit,
            value: `${formatNumberVN(data.pay_in_advance, { trimTrailingZeros: true })}đ`,
        },
        {
            label: trans.ipo.modal.detail.payment_needed,
            value: `${formatNumberVN(data.result?.final_payment_amount || 0, { trimTrailingZeros: true })}đ`,
        },
    ];

    const allocationInfo = [
        {
            label: trans.ipo.modal.detail.quantity,
            value: `${formatNumberVN(data.result?.quantity, { decimals: 0 })}cp`,
        },
        {
            label: trans.ipo.modal.detail.distribution_price,
            value: `${formatNumberVN(data.result?.distribution_price)}đ`,
        },
        {
            label: trans.ipo.modal.detail.purchase_amount,
            value: `${formatNumberVN(data.result?.spent_amount, { trimTrailingZeros: true })}đ`,
        },
        {
            label: trans.ipo.modal.detail.bonus,
            value: `${formatNumberVN(data.result?.bonus, { trimTrailingZeros: true })}đ`,
        },
    ];

    const handlePayment = async () => {
        startLoading();
        try {
            const { error_code, message } = await payIpoRegistrationBuyRemainingBalance(data.id);
            if (isSuccessApi(error_code)) {
                toast.success(message);
                refetchLists();
            } else {
                toast.error(message);
            }
        } catch {
        } finally {
            stopLoading();
            onClose();
        }
    };

    return (
        <Dialog maxWidth="max-w-5xl" maxHeight="h-[60vh]" onClose={onClose}>
            <div className="flex gap-4 items-start w-full shrink-0">
                <div className="bg-white rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <Image
                        src={item.logo_url}
                        alt={item.symbol}
                        width={58}
                        height={58}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col gap-1 flex-1 justify-center min-w-0">
                    <h2 id="order-detail-modal-title" className="font-heading-3 text-primary">
                        {trans.ipo.modal.detail.title}
                        {item.symbol}
                    </h2>
                    <p className="font-body-2 text-secondary truncate">{item.company_name}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-primary hover:text-highlight transition-colors flex-shrink-0"
                    aria-label={trans.ipo.common.close}
                    type="button"
                >
                    <FaXmark size={20} />
                </button>
            </div>
            <div className="flex gap-3 flex-1 min-h-0 w-full">
                <section
                    className="bg-secondary flex flex-col gap-6 flex-1 p-3 rounded-xl overflow-y-auto"
                    aria-label={trans.ipo.modal.detail.registration_info}
                >
                    <div
                        className={`flex items-center border ${statusConfig.badgeClass} px-4 py-1 rounded-full self-start`}
                    >
                        <span className="font-caption">{item.statusAsText}</span>
                    </div>
                    <p className="font-body-2 text-primary">
                        {
                            trans.ipo.modal.detail.registration_status[
                                statusConfig.messageKey as keyof typeof trans.ipo.modal.detail.registration_status
                            ]
                        }
                    </p>
                    {data.result && (
                        <IpoInfoSection
                            title={trans.ipo.modal.detail.registration_info}
                            items={registrationInfo}
                        />
                    )}
                    <Link
                        href={data.info_url}
                        target="_blank"
                        className="w-fit bg-tertiary font-body-3-highlight text-highlight flex gap-3 items-center p-3 rounded-xl"
                    >
                        {trans.ipo.modal.detail.view_full_info}
                        {item.symbol}
                        <FaArrowRight className="text-highlight flex-shrink-0" size={20} />
                    </Link>
                </section>
                <section
                    className="bg-secondary flex flex-col gap-6 flex-1 p-3 rounded-xl overflow-y-auto"
                    aria-label={trans.ipo.modal.detail.payment_section}
                >
                    {data.result ? (
                        <>
                            <IpoInfoSection
                                title={trans.ipo.modal.detail.payment_section}
                                items={paymentInfo}
                            />
                            <div className="font-body-3 text-secondary whitespace-pre-line">
                                {data.result.note}
                            </div>
                            {data.result.require_final_payment ? (
                                <button
                                    onClick={handlePayment}
                                    disabled={isLoading}
                                    className="w-2/3 mx-auto rounded-full bg-highlight py-2 font-body-3-highlight text-quaternary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {trans.ipo.modal.detail.confirm_button}
                                </button>
                            ) : (
                                <button className="w-2/3 cursor-not-allowed mx-auto rounded-full bg-tertiary py-2 font-body-3-highlight text-disabled">
                                    {trans.ipo.modal.detail.payment_completed}
                                </button>
                            )}
                            <IpoInfoSection
                                title={trans.ipo.modal.detail.allocation_section_title}
                                items={allocationInfo}
                            />
                        </>
                    ) : (
                        <IpoInfoSection
                            title={trans.ipo.modal.detail.registration_info}
                            items={registrationInfo}
                        />
                    )}
                </section>
            </div>
        </Dialog>
    );
};
