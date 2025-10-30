import { formatNumber } from '@/lib/utils';
import { WalletTransferInterface } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type Props = {};

export const columns = (props: Props): ColumnDef<WalletTransferInterface>[] => {
    return [
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) => {
                return format(
                    row.getValue('created_at'),
                    'E, dd MMM yyyy HH:mm a',
                    {
                        locale: id,
                    },
                );
            },
        },
        {
            accessorKey: 'wallet_origin.name',
            header: 'Wallet Origin',
        },
        {
            accessorKey: 'wallet_target.name',
            header: 'Wallet Target',
        },
        {
            accessorKey: 'amount',
            header: 'Amount',
            cell: ({ row }) => {
                return `Rp ${formatNumber(row.getValue('amount'))}`;
            },
        },
        {
            accessorKey: 'fee',
            header: 'Fee',
            cell: ({ row }) => {
                return `Rp ${formatNumber(row.getValue('fee'))}`;
            },
        },
    ];
};
