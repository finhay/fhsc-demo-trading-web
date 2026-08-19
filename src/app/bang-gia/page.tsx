import type { Metadata } from 'next';

import { IBoardView } from '@/components/bang-gia/IBoardView';

export const metadata: Metadata = {
    title: 'Bảng giá',
    description: 'Bảng giá',
};

export default function Page() {
    return <IBoardView />;
}
