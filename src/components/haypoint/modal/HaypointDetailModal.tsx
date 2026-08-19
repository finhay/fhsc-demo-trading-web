'use client';

import Image from 'next/image';

import { FaRegCopy } from 'react-icons/fa6';

import { Dialog } from '@/components/common/ui/Dialog';
import { HaypointStore } from '@/components/haypoint/HaypointStore';
import { HaypointNameDisplay } from '@/components/haypoint/brand/HaypointNameDisplay';
import { HAYPOINT_ASSETS, VOUCHER_GRADIENT } from '@/constants/haypoint';
import { useTranslate } from '@/hooks/useTranslate';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useMyVouchersStore } from '@/stores/haypoint/useMyVouchersStore';
import { useOfficeListStore } from '@/stores/haypoint/useOfficeListStore';
import { usePointStore } from '@/stores/haypoint/usePointStore';

export const HaypointDetailModal = () => {
    const trans = useTranslate();
    const { startLoading, stopLoading } = useLoadingStore();
    const { selectedVoucher, isDetailOpen, resetStore, fetchOwnedRewards } = useMyVouchersStore();
    const { offices, isLoadingMore, hasMore, searchOffices, loadMoreOffices } =
        useOfficeListStore();
    const { fetchPointBalance } = usePointStore();

    const handleSearchOffices = async (keyword: string) => {
        startLoading();
        try {
            await searchOffices(keyword);
        } finally {
            stopLoading();
        }
    };

    const handleClose = () => {
        resetStore();
        fetchPointBalance();
        fetchOwnedRewards();
    };

    if (!isDetailOpen || !selectedVoucher) return null;

    return (
        <Dialog
            title={trans.haypoint.your_vouchers}
            maxWidth="max-w-6xl"
            maxHeight="h-[80vh]"
            onClose={handleClose}
            onBack={handleClose}
        >
            <div className="flex gap-3 flex-1 w-full min-h-0">
                <aside
                    className="bg-quinary flex flex-col gap-6 rounded-xl p-3 flex-1"
                    aria-labelledby="voucher-code-title"
                >
                    <header className="flex items-center">
                        <h2
                            id="voucher-code-title"
                            className="font-body-1-highlight text-quaternary"
                        >
                            {trans.haypoint.voucher_code}
                        </h2>
                    </header>
                    <figure className="flex flex-col items-center justify-center gap-2 m-0">
                        <Image
                            src={HAYPOINT_ASSETS.URBOX_LOGO}
                            alt={`Logo ${selectedVoucher?.brand?.name}`}
                            width={103}
                            height={38}
                            className="object-contain rounded-xl overflow-hidden"
                        />

                        <Image
                            src={selectedVoucher?.code_image}
                            alt={`${trans.haypoint.voucher_code} ${selectedVoucher?.name}`}
                            width={200}
                            height={200}
                            className="w-60 h-auto object-cover"
                        />
                    </figure>
                    <dl className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <dt className="font-body-3 text-tertiary">
                                {trans.haypoint.voucher_code_lbl}
                            </dt>
                            <dd className="flex items-center gap-2">
                                <span className="font-body-3 text-quaternary">
                                    {selectedVoucher?.code}
                                </span>
                                <button
                                    onClick={() =>
                                        navigator.clipboard.writeText(selectedVoucher?.code)
                                    }
                                    className="text-primary hover:text-highlight transition-colors bg-transparent border-none p-0"
                                    aria-label={trans.haypoint.copy_voucher_code}
                                    type="button"
                                >
                                    <FaRegCopy
                                        size={18}
                                        className="cursor-pointer text-green"
                                        aria-hidden="true"
                                    />
                                </button>
                            </dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="font-body-3 text-tertiary">
                                {trans.haypoint.pin_serial}
                            </dt>
                            <dd className="flex items-center gap-2">
                                <span className="font-body-3 text-quaternary">
                                    {selectedVoucher?.pin || selectedVoucher?.serial}
                                </span>
                                <button
                                    onClick={() =>
                                        navigator.clipboard.writeText(
                                            selectedVoucher?.pin || selectedVoucher?.serial,
                                        )
                                    }
                                    className="text-primary hover:text-highlight transition-colors bg-transparent border-none p-0"
                                    aria-label={trans.haypoint.copy_pin_serial}
                                    type="button"
                                >
                                    <FaRegCopy
                                        size={18}
                                        className="cursor-pointer text-green"
                                        aria-hidden="true"
                                    />
                                </button>
                            </dd>
                        </div>
                    </dl>
                </aside>
                <article className="relative bg-secondary flex flex-col rounded-xl flex-1 h-full flex-1 overflow-hidden">
                    <figure className="bg-quinary h-48 rounded-tl-xl rounded-tr-xl overflow-hidden relative m-0">
                        <Image
                            src={selectedVoucher?.image}
                            alt={selectedVoucher?.name}
                            fill
                            sizes="100vw"
                            className="object-cover w-full h-auto"
                            priority
                        />
                    </figure>
                    <div className="px-6 absolute top-28 left-0 right-0 z-10">
                        <div
                            className="relative rounded-xl p-6 flex flex-col gap-3"
                            style={{
                                background: VOUCHER_GRADIENT.SOLID,
                            }}
                        >
                            <header className="flex items-start gap-4">
                                <div className="bg-white rounded-full w-16 h-16 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                    <Image
                                        src={selectedVoucher?.brand?.image}
                                        alt={`Logo ${selectedVoucher?.brand?.name}`}
                                        width={48}
                                        height={48}
                                        className="object-contain rounded-full overflow-hidden w-full h-full"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <div className="text-primary flex flex-col gap-1">
                                        <HaypointNameDisplay name={selectedVoucher?.name || ''} />
                                    </div>
                                </div>
                            </header>
                            <dl className="flex flex-col gap-2 font-caption text-primary">
                                <div className="flex items-center gap-1">
                                    <dt>{trans.haypoint.expires_label}</dt>
                                    <dd>{selectedVoucher?.expired_date}</dd>
                                </div>
                                <div className="flex items-center gap-1">
                                    <dt>{trans.haypoint.issued_date}</dt>
                                    <dd>{selectedVoucher?.created_at}</dd>
                                </div>
                                <div className="flex items-center gap-1">
                                    <dt>{trans.haypoint.hotline}</dt>
                                    <dd>1900 299 232</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                    <section className="flex flex-col gap-3 flex-1 min-h-0 px-6 pb-6 pt-36">
                        <h3 className="font-body-3-highlight text-primary">
                            {trans.haypoint.terms_apply}
                        </h3>
                        <div
                            className="font-body-3 text-secondary leading-relaxed overflow-y-auto flex-1"
                            dangerouslySetInnerHTML={{ __html: selectedVoucher?.note || '' }}
                        />
                    </section>
                </article>
                <aside
                    className="bg-secondary flex flex-col gap-6 rounded-xl p-3 flex-1 min-h-0"
                    aria-labelledby="stores-list-title"
                >
                    <HaypointStore
                        offices={offices}
                        onSearchOffice={handleSearchOffices}
                        onLoadMore={loadMoreOffices}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        inputId="store-search-voucher"
                    />
                </aside>
            </div>
        </Dialog>
    );
};
