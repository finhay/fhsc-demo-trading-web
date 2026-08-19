'use client';

import { useState } from 'react';

import Image from 'next/image';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

import { Dialog } from '@/components/common/ui/Dialog';
import { useTranslate } from '@/hooks/useTranslate';

const TOTAL_SLIDES = 3;

type Props = {
    onClose: () => void;
};

export const DepositGuideModal = ({ onClose }: Props) => {
    const trans = useTranslate();
    const [activeSlide, setActiveSlide] = useState(0);

    return (
        <Dialog title={trans.deposit_guide_modal.title} maxWidth="max-w-2xl" onClose={onClose}>
            <div className="flex flex-col gap-6">
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                    >
                        <div className="w-full shrink-0">
                            <div className="flex flex-col gap-4">
                                <h3 className="font-body-2-highlight text-primary">
                                    {trans.deposit_guide_modal.step1_title}
                                </h3>
                                <div className="flex justify-center bg-secondary rounded-xl p-6">
                                    <Image
                                        src="https://cdn1.finhay.com.vn/wp-content/uploads/2023/01/12105653/sli1.png"
                                        width={340}
                                        height={229}
                                        alt={trans.deposit_guide_modal.step1_alt}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-full shrink-0">
                            <div className="flex flex-col gap-4">
                                <h3 className="font-body-2-highlight text-primary">
                                    {trans.deposit_guide_modal.step2_title}
                                </h3>
                                <div className="flex justify-center bg-secondary rounded-xl p-6">
                                    <Image
                                        src="https://cdn1.finhay.com.vn/wp-content/uploads/2023/01/12105655/sli2.png"
                                        width={340}
                                        height={229}
                                        alt={trans.deposit_guide_modal.step2_alt}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-full shrink-0">
                            <div className="flex flex-col gap-4">
                                <h3 className="font-body-2-highlight text-primary">
                                    {trans.deposit_guide_modal.step3_title}
                                </h3>
                                <div className="flex justify-center bg-secondary rounded-xl p-6">
                                    <Image
                                        src="https://cdn1.finhay.com.vn/wp-content/uploads/2023/01/12105652/sli3.png"
                                        width={340}
                                        height={229}
                                        alt={trans.deposit_guide_modal.step3_alt}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    {activeSlide > 0 && (
                        <button
                            onClick={() => setActiveSlide((prev) => prev - 1)}
                            className="px-6 py-2.5 bg-tertiary hover:bg-quaternary text-primary font-body-3-highlight rounded-xl transition-colors flex items-center gap-2"
                            type="button"
                        >
                            <FaChevronLeft size={14} />
                            <span>{trans.deposit_guide_modal.back}</span>
                        </button>
                    )}

                    {activeSlide < TOTAL_SLIDES - 1 ? (
                        <button
                            onClick={() => setActiveSlide((prev) => prev + 1)}
                            className="px-6 py-2.5 bg-highlight hover:opacity-90 text-quaternary font-body-3-highlight rounded-xl transition-opacity flex items-center gap-2"
                            type="button"
                        >
                            <span>{trans.deposit_guide_modal.next}</span>
                            <FaChevronRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-highlight hover:opacity-90 text-quaternary font-body-3-highlight rounded-xl transition-opacity"
                            type="button"
                        >
                            {trans.deposit_guide_modal.understood}
                        </button>
                    )}
                </div>
            </div>
        </Dialog>
    );
};
