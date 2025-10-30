import { formatNumber } from '@/lib/utils';
import { TransactionInterface } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { EditIcon, TrashIcon } from 'lucide-react';
import { Button } from '../ui/button';

type Props = {
    onEdit: (row: TransactionInterface) => void;
    onDelete: (row: TransactionInterface) => void;
};

export const columns = (props: Props): ColumnDef<TransactionInterface>[] => {
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
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => {
                return (
                    <span className="capitalize">{row.getValue('title')}</span>
                );
            },
        },
        {
            accessorKey: 'category.name',
            header: 'Category',
        },
        {
            accessorKey: 'wallet.name',
            header: 'Wallet',
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
        {
            accessorKey: 'id',
            header: '',
            cell: ({ row }) => {
                const original = row.original;

                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant={'outline'}
                            size={'sm'}
                            onClick={() => props.onEdit(original)}
                        >
                            <EditIcon /> Edit
                        </Button>
                        <Button
                            variant={'destructive'}
                            size={'sm'}
                            onClick={() => props.onDelete(original)}
                        >
                            <TrashIcon /> Delete
                        </Button>
                    </div>
                );
            },
        },
    ];
};
