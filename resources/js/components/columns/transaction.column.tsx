import { formatNumber } from '@/lib/utils';
import transaction from '@/routes/transaction';
import { TransactionInterface } from '@/types';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { EditIcon, EyeIcon, MoreVerticalIcon, TrashIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

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
            accessorKey: 'fee',
            header: 'Amount & Fee',
            cell: ({ row }) => {
                return (
                    <div>
                        <h1 className="font-bold">
                            Rp {formatNumber(row.original.amount)}
                        </h1>
                        <p className="text-xs">
                            Fee: Rp {formatNumber(row.original.fee)}
                        </p>
                    </div>
                );
            },
        },

        {
            accessorKey: 'amount',
            header: 'Total',
            cell: ({ row }) => {
                const original = row.original;
                return (
                    <div className="text-base font-bold">
                        Rp {formatNumber(original.amount + original.fee)}
                    </div>
                );
            },
        },
        {
            accessorKey: 'debt',
            header: 'Is Debt',
            cell: ({ row }) => {
                return row.original.debt
                    ? Badge({ variant: 'default', children: 'Yes' })
                    : Badge({ variant: 'secondary', children: 'No' });
            },
        },
        {
            accessorKey: 'id',
            header: '',
            cell: ({ row }) => {
                const original = row.original;

                return (
                    <div className="flex items-center justify-end gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={'ghost'}>
                                    <MoreVerticalIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={transaction.show({
                                            transaction: original.id,
                                        })}
                                    >
                                        <EyeIcon /> Show
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => props.onEdit(original)}
                                >
                                    <EditIcon /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => props.onDelete(original)}
                                >
                                    <TrashIcon /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];
};
