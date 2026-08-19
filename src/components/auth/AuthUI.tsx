'use client';

import Image from 'next/image';

export const AuthUI = () => {
    return (
        <aside className="hidden sm:flex w-1/2 flex-col items-center justify-center gap-4 text-center text-primary bg-[#54545433] p-4 rounded-xl">
            <p className="font-body-2-highlight">{'Chỉ trong 1 phút'}</p>
            <Image
                src="https://cdn1.finhay.com.vn/vnsc-prod/1777863552264.2024-Gemini_Generated_Image.png"
                alt={'Hình minh họa đăng ký'}
                width={240}
                height={120}
                className="w-60 h-auto object-cover"
            />
            <p className="font-body-3 text-center whitespace-pre-line">
                {'Tài sản của bạn đã được bảo vệ tuyệt đối và\ntiếp cận các cơ hội sinh lời tối đa'}
            </p>
        </aside>
    );
};
