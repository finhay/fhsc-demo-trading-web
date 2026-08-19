'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

// `redirect()` không dùng được ở not-found.tsx — Next đã trả status 404 trước khi render,
// nên phải điều hướng phía client (giữ đúng hành vi trang 404 cũ).
export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

    return null;
}
