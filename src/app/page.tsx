import type { Metadata } from 'next';

import { MarketView } from '@/components/thi-truong/MarketView';

// Next không áp `title.template` của root layout cho chính segment gốc,
// nên trang chủ phải ghi đủ title để đồng bộ với các route còn lại.
export const metadata: Metadata = {
    title: 'Thị trường | FHSC Demo Trading',
    description: 'Thị trường',
};

export default function Page() {
    return <MarketView />;
}
