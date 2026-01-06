import { type ClassValue, clsx } from 'clsx';
import { toast } from 'sonner';
import Swal, { SweetAlertIcon } from 'sweetalert2';
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

export const limitString = (str: string, limit: number = 20) => {
    if (str.length > limit) {
        return str.substring(0, limit) + '...';
    }
    return str;
};

export const swalConfirm = async ({
    title = 'Are you sure?',
    message = "You won't be able to revert this!",
    icon = 'warning',
    confirmButtonText = 'Delete',
    cancelButtonText = 'Cancel',
    confirmValue = 'delete',
    confirmButtonColor = '#e7000b',
    placeholder = '',
}: {
    title?: string;
    message?: string;
    icon?: SweetAlertIcon;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmValue?: string;
    confirmButtonColor?: string;
    placeholder?: string;
}): Promise<boolean> => {
    const result = await Swal.fire({
        icon: icon,
        title: title,
        text: message,
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off',
            required: 'required',
            placeholder,
        },
        showCancelButton: true,
        cancelButtonText,
        confirmButtonColor,
        confirmButtonText,
        showLoaderOnConfirm: true,
        preConfirm: async (text: string) => {
            if (text.toLowerCase() === confirmValue) {
                return true;
            } else {
                Swal.showValidationMessage('Kata Kunci Salah!');
                return false;
            }
        },
        allowOutsideClick: () => !Swal.isLoading(),
    });

    return result.isConfirmed;
};
