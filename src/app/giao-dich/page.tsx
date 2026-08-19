import { Suspense } from 'react';

import type { Metadata } from 'next';

import { Spinner } from '@/components/common/ui/Spinner';
import { TradeView } from '@/components/giao-dich/TradeView';

export const metadata: Metadata = {
    title: 'Giao dịch',
    description: 'Giao dịch',
};

export default function Page() {
    return (
        <Suspense fallback={<Spinner isLoading />}>
            <TradeView />
        </Suspense>
    );
}
