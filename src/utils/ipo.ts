import type { IpoRegistrationStatusConfig, IpoTimeLeft } from '@/types/pages/ipo';

export const calculateTimeLeft = (endDate: string): IpoTimeLeft => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
};

export const getRegistrationStatusColor = (status: string): string =>
    status === 'FAILED' || status === 'LOSE' || status === 'EXPIRED' ? 'text-red' : 'text-green';

export const calculateTotalValue = (quantity: number, price: number): number | null => {
    if (!quantity || !price || isNaN(quantity) || isNaN(price)) return null;
    return quantity * price;
};

export const calculateDeposit = (totalValue: number | null, depositRate: number): number | null => {
    if (totalValue === null) return null;
    return (totalValue * depositRate) / 100;
};

export const getRegistrationStatusConfig = (status: string): IpoRegistrationStatusConfig => {
    switch (status) {
        case 'WON':
            return {
                badgeClass: 'border-green text-green bg-green/10',
                messageKey: 'won',
            };
        case 'COMPLETED':
            return {
                badgeClass: 'border-green text-green bg-green/10',
                messageKey: 'completed',
            };
        case 'SUCCESS':
            return {
                badgeClass: 'border-green text-green bg-green/10',
                messageKey: 'success',
            };
        case 'SENT':
            return {
                badgeClass: 'border-green text-green bg-green/10',
                messageKey: 'sent',
            };
        case 'LOSE':
            return {
                badgeClass: 'border-red text-red bg-red/10',
                messageKey: 'lose',
            };
        case 'FAILED':
            return {
                badgeClass: 'border-red text-red bg-red/10',
                messageKey: 'failed',
            };
        case 'EXPIRED':
            return {
                badgeClass: 'border-red text-red bg-red/10',
                messageKey: 'expired',
            };
        default:
            return {
                badgeClass: 'border-red text-red bg-red/10',
                messageKey: 'default',
            };
    }
};
