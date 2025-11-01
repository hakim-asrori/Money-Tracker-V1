import { type ClassValue, clsx } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function showToast(flash: any) {
    if (flash.success) {
        toast.success('Success', {
            description: flash.success,
        });
    }

    if (flash.warning) {
        toast.warning('Warning', {
            description: flash.warning,
        });
    }

    if (flash.error) {
        toast.error('Ooops', {
            description: flash.error,
        });
    }
}

export function formatNumber(num: number | string) {
    return Intl.NumberFormat('id-ID').format(Number(num));
}

export const getModelNamePretty = (type: string) => {
    const rawName = type.split('\\').pop(); // WalletTransfer
    return rawName?.replace(/([a-z])([A-Z])/g, '$1 $2'); // Wallet Transfer
};
