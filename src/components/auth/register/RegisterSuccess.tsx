'use client';

import Image from 'next/image';

import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';

export const RegisterSuccess = () => {
    const { closeAuthDialog } = useAuthFlowStore();

    return (
        <section className="flex w-full gap-4 rounded-xl items-stretch justify-center text-primary py-2">
            <section className="flex w-1/2 flex-col gap-4">
                <p className="font-body-3 text-center whitespace-pre-line">
                    {
                        'Tải ứng dụng, xác thực tài khoản để sử dụng đầy đủ\nsản phẩm đầu tư hấp dẫn trên Finhay'
                    }
                </p>
                <figure className="m-0 flex flex-col items-center">
                    <Image
                        src="https://cdn1.finhay.com.vn/vnsc-prod/1777863552264.2024-Gemini_Generated_Image.png"
                        alt={'Hình minh họa đăng ký'}
                        width={240}
                        height={120}
                        className="w-60 h-auto object-cover"
                    />
                </figure>
                <footer className="flex w-full items-center gap-2 font-body-3">
                    <button className="w-1/2 bg-highlight text-quaternary py-2 px-4 rounded-full">
                        {'Tải ứng dụng'}
                    </button>
                    <button
                        type="button"
                        className="w-1/2 bg-success text-highlight py-2 px-4 rounded-full"
                        onClick={closeAuthDialog}
                    >
                        {'Lúc khác'}
                    </button>
                </footer>
            </section>
            <section className="hidden sm:flex w-1/2 flex-col items-center justify-center gap-8 text-center bg-[#54545433] p-4 rounded-xl">
                <p className="font-body-3 text-center whitespace-pre-line">
                    {'Quét mã QR để tải xuống ứng dụng\nFinhay trên điện thoại'}
                </p>
                <figure className="m-0 flex flex-col items-center">
                    <Image
                        src="https://cdn1.finhay.com.vn/vnsc-prod/1741929570552-QR-Radar-Home.png?w=128"
                        alt={'Mã QR tải ứng dụng Finhay'}
                        width={200}
                        height={200}
                        className="w-48 h-48 object-contain rounded-xl"
                    />
                </figure>
            </section>
        </section>
    );
};
