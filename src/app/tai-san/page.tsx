import type { Metadata } from 'next';

import { AssetView } from '@/components/tai-san/AssetView';

export const metadata: Metadata = {
    title: 'Tài sản',
    description: 'Tài sản',
};

export default function Page() {
    return <AssetView />;
}
