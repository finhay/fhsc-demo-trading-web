'use client';

import { useMemo, useState } from 'react';

import { FaChevronDown, FaChevronRight, FaFile } from 'react-icons/fa6';

import { useTranslate } from '@/hooks/useTranslate';
import type { FundListing } from '@/types/pages/fund';
import { formatDate } from '@/utils/format';

type Props = {
    listing: FundListing | null;
};

export const MarketFundDetailInfoTab = ({ listing }: Props) => {
    const trans = useTranslate();
    const d = trans.market.assets.fund_modal.detail.info_tab;

    const sections = useMemo(
        () =>
            [
                { key: 'target', title: d.target, content: listing?.target },
                { key: 'strategy', title: d.strategy, content: listing?.strategy },
                { key: 'method', title: d.method, content: listing?.method_invest },
                { key: 'allocate', title: d.allocate, content: listing?.allocate },
                { key: 'risk', title: d.risk, content: listing?.risk },
                { key: 'division_plan', title: d.division_plan, content: listing?.division_plan },
            ].filter((section) => !!section.content),
        [d, listing],
    );

    const [openKey, setOpenKey] = useState<string | null>(sections[0]?.key ?? null);

    const documents = listing?.documents?.filter((doc) => doc.document_url) ?? [];
    const hasOtherDocument = !!listing?.document_url;

    return (
        <div className="flex flex-col gap-4">
            {sections.length > 0 && (
                <div className="flex flex-col divide-y divide-tertiary rounded-2xl bg-secondary px-4">
                    {sections.map((section) => {
                        const isOpen = openKey === section.key;
                        return (
                            <div key={section.key} className="flex flex-col py-4">
                                <button
                                    type="button"
                                    onClick={() => setOpenKey(isOpen ? null : section.key)}
                                    className="flex items-center justify-between gap-2 text-left"
                                >
                                    <span className="font-body-2-highlight text-primary">
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
                                        <p className="mt-3 font-body-3 text-secondary">
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
                <div className="flex flex-col divide-y divide-tertiary rounded-2xl bg-secondary px-4">
                    {documents.map((doc) => (
                        <a
                            key={doc.document_url}
                            href={doc.document_url ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 py-4"
                        >
                            <span className="flex items-center gap-2 font-body-2-highlight text-primary">
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
                            <span className="flex items-center gap-2 font-body-2-highlight text-primary">
                                <FaFile size={20} className="shrink-0 text-secondary" />
                                {d.other_documents}
                            </span>
                            <FaChevronRight size={14} className="shrink-0 text-primary" />
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};
