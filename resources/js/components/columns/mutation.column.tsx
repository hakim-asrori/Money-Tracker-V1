import { formatNumber, getModelNamePretty } from '@/lib/utils';
import { MutationInterface } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '../ui/badge';

type Props = {};

export const columns = (props: Props): ColumnDef<MutationInterface>[] => {
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
            accessorKey: 'mutable_type',
            header: 'Inquiry',
            cell: ({ row }) => {
                return (
                    <span className="capitalize">
                        {getModelNamePretty(row.getValue('mutable_type'))}
                    </span>
                );
            },
        },
        {
            accessorKey: 'wallet.name',
            header: 'Wallet Name',
        },
        {
            accessorKey: 'type',
            header: 'CR/DB',
            cell: ({ row }) => {
                if (row.original.type === 'cr') {
                    return Badge({ variant: 'default', children: 'Credit' });
                } else {
                    return Badge({ variant: 'destructive', children: 'Debit' });
                }
            },
        },
        {
            accessorKey: 'last_balance',
            header: 'Last Balance',
            cell: ({ row }) => {
                return `Rp ${formatNumber(row.getValue('last_balance'))}`;
            },
        },
        {
            accessorKey: 'amount',
            header: 'Amount',
            cell: ({ row }) => {
                return (
                    <div>
                        {row.original.type === 'cr' ? (
                            <span className="text-green-500">
                                + Rp {formatNumber(row.getValue('amount'))}
                            </span>
                        ) : (
                            <span className="text-destructive">
                                - Rp {formatNumber(row.getValue('amount'))}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'current_balance',
            header: 'Current Balance',
            cell: ({ row }) => {
                return `Rp ${formatNumber(row.getValue('current_balance'))}`;
            },
        },
    ];
};
