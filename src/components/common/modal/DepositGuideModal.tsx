'use client';

import { useState } from 'react';

import Image from 'next/image';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

import { Dialog } from '@/components/common/ui/Dialog';

const TOTAL_SLIDES = 3;

type Props = {
    onClose: () => void;
};

export const DepositGuideModal = ({ onClose }: Props) => {
    const [activeSlide, setActiveSlide] = useState(0);

    return (
        <Dialog title={'Hướng dẫn chuyển khoản'} maxWidth="max-w-2xl" onClose={onClose}>
            <div className="flex flex-col gap-6">
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                    >
                        <div className="w-full shrink-0">
                            <div className="flex flex-col gap-4">
                                <h3 className="font-body-2-highlight text-primary">
                                    {'Bước 1: Mở app ngân hàng mà bạn đang sử dụng'}
                                </h3>
                                <div className="flex justify-center bg-secondary rounded-xl p-6">
                                    <Image
                                        src="https://cdn1.finhay.com.vn/wp-content/uploads/2023/01/12105653/sli1.png"
                                        width={340}
                                        height={229}
                                        alt={'Mở app ngân hàng'}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-full shrink-0">
                            <div className="flex flex-col gap-4">
                                <h3 className="font-body-2-highlight text-primary">
                                    {'Bước 2: Tạo lệnh chuyển tiền theo thông tin được cung cấp'}
                                </h3>
                                <div className="flex justify-center bg-secondary rounded-xl p-6">
                                    <Image
                                        src="https://cdn1.finhay.com.vn/wp-content/uploads/2023/01/12105655/sli2.png"
                                        width={340}
                                        height={229}
                                        alt={'Tạo lệnh chuyển tiền'}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-full shrink-0">
                            <div className="flex flex-col gap-4">
                                <h3 className="font-body-2-highlight text-primary">
                                    {'Bước 3: Xác nhận chuyển tiền từ app ngân hàng của bạn'}
                                </h3>
                                <div className="flex justify-center bg-secondary rounded-xl p-6">
                                    <Image
                                        src="https://cdn1.finhay.com.vn/wp-content/uploads/2023/01/12105652/sli3.png"
                                        width={340}
                                        height={229}
                                        alt={'Xác nhận chuyển tiền'}
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
                            <span>{'Trở lại'}</span>
                        </button>
                    )}

                    {activeSlide < TOTAL_SLIDES - 1 ? (
                        <button
                            onClick={() => setActiveSlide((prev) => prev + 1)}
                            className="px-6 py-2.5 bg-highlight hover:opacity-90 text-quaternary font-body-3-highlight rounded-xl transition-opacity flex items-center gap-2"
                            type="button"
                        >
                            <span>{'Tiếp tục'}</span>
                            <FaChevronRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-highlight hover:opacity-90 text-quaternary font-body-3-highlight rounded-xl transition-opacity"
                            type="button"
                        >
                            {'Tôi đã hiểu'}
                        </button>
                    )}
                </div>
            </div>
        </Dialog>
    );
};
