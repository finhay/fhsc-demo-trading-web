'use client';

import dynamic from 'next/dynamic';

// react-pdf (pdfjs) chạm DOMMatrix ngay khi module được evaluate nên phải load client-only,
// nếu không prerender sẽ throw "DOMMatrix is not defined".
export const PDFViewer = dynamic(
    () => import('@/components/common/feature/PDFViewerContent').then((m) => m.PDFViewerContent),
    { ssr: false },
);
