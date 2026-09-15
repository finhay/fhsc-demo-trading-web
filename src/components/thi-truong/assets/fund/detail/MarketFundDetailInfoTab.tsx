'use client';

import { useMemo, useState } from 'react';

import { FaChevronDown, FaChevronRight, FaFile } from 'react-icons/fa6';

import type { FundListing } from '@/types/pages/fund';
import { formatDate } from '@/utils/format';

const FUND_MODAL_INFO_TAB = {
    target: 'Mục tiêu đầu tư',
    strategy: 'Chiến lược đầu tư',
    method: 'Phương pháp lựa chọn đầu tư',
    allocate: 'Phân bổ tài sản đầu tư',
    risk: 'Các rủi ro liên quan',
    division_plan: 'Kế hoạch phân chia lợi nhuận và chính sách thuế',
    other_documents: 'Xem thêm tài liệu khác',
};

type Props = {
    listing: FundListing | null;
};

export const MarketFundDetailInfoTab = ({ listing }: Props) => {
    const d = FUND_MODAL_INFO_TAB;

    const sections = useMemo(
        () =>
            [
                { key: 'target', title: 'Mục tiêu đầu tư', content: listing?.target },
                { key: 'strategy', title: 'Chiến lược đầu tư', content: listing?.strategy },
                {
                    key: 'method',
                    title: 'Phương pháp lựa chọn đầu tư',
                    content: listing?.method_invest,
                },
                { key: 'allocate', title: 'Phân bổ tài sản đầu tư', content: listing?.allocate },
                { key: 'risk', title: 'Các rủi ro liên quan', content: listing?.risk },
                {
                    key: 'division_plan',
                    title: 'Kế hoạch phân chia lợi nhuận và chính sách thuế',
                    content: listing?.division_plan,
                },
            ].filter((section) => !!section.content),
        [d, listing],
    );

    const [openKey, setOpenKey] = useState<string | null>(sections[0]?.key ?? null);

    const documents = listing?.documents?.filter((doc) => doc.document_url) ?? [];
    const hasOtherDocument = !!listing?.document_url;

    return (
        <div className="flex flex-col gap-4">
            {sections.length > 0 && (
                <div className="flex flex-col divide-y divide-tertiary rounded-2xl base-secondary px-4">
                    {sections.map((section) => {
                        const isOpen = openKey === section.key;
                        return (
                            <div key={section.key} className="flex flex-col py-4">
                                <button
                                    type="button"
                                    onClick={() => setOpenKey(isOpen ? null : section.key)}
                                    className="flex items-center justify-between gap-2 text-left"
                                >
                                    <span className="body-3-highlight text-primary">
                                        {section.title}
                                    </span>
                                    <FaChevronDown
                                        size={14}
                                        className={`shrink-0 text-primary transition-transform duration-300 ${
                                            isOpen ? 'rotate-180' : 'rotate-0'
                                        }`}
                                    />
                                </button>
                                <div
                                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                                        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                    }`}
                                >
                                    <div className="min-h-0 overflow-hidden">
                                        <p className="mt-3 body-4 text-secondary">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {(documents.length > 0 || hasOtherDocument) && (
                <div className="flex flex-col divide-y divide-tertiary rounded-2xl base-secondary px-4">
                    {documents.map((doc) => (
                        <a
                            key={doc.document_url}
                            href={doc.document_url ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 py-4"
                        >
                            <span className="flex items-center gap-2 body-3-highlight text-primary">
                                <FaFile size={20} className="shrink-0 text-secondary" />
                                {doc.last_updated_at
                                    ? `${doc.name} - ${formatDate(doc.last_updated_at)}`
                                    : doc.name}
                            </span>
                            <FaChevronRight size={14} className="shrink-0 text-primary" />
                        </a>
                    ))}
                    {hasOtherDocument && (
                        <a
                            href={listing?.document_url ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 py-4"
                        >
                            <span className="flex items-center gap-2 body-3-highlight text-primary">
                                <FaFile size={20} className="shrink-0 text-secondary" />
                                {'Xem thêm tài liệu khác'}
                            </span>
                            <FaChevronRight size={14} className="shrink-0 text-primary" />
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};
