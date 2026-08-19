'use client';

import { Spinner } from '@/components/common/ui/Spinner';
import { useLoadingStore } from '@/stores/common/useLoadingStore';

export const GlobalSpinner = () => {
    const { isLoading } = useLoadingStore();

    return <Spinner isLoading={isLoading} />;
};
