import { formatNumber } from '@/lib/utils';
import transaction from '@/routes/transaction';
import { DebtInterface } from '@/types';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    CheckCircleIcon,
    EditIcon,
    EyeIcon,
    MoreVerticalIcon,
    TrashIcon,
    WalletIcon,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Label } from '../ui/label';

type Props = {
    onEdit: (row: DebtInterface) => void;
    onDetail: (row: DebtInterface) => void;
    onDelete: (row: DebtInterface) => void;
    onPayment: (row: DebtInterface) => void;
};

export const columns = (props: Props): ColumnDef<DebtInterface>[] => {
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
                    <div>
                        <Label>{row.getValue('title')}</Label>
                        {row.original.transaction && (
                            <p>
                                Transaction:{' '}
                                {row.original.transaction.title}{' '}
                            </p>
                        )}
                    </div>
                );
            },
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
            accessorKey: 'target.remaining_amount',
            header: 'Remaining',
            cell: ({ row }) => {
                return row.original.total_remaining_amount > 0 ? (
                    <div className="font-semibold text-amber-500">
                        Rp {formatNumber(row.original.total_remaining_amount)}
                    </div>
                ) : (
                    <div className="flex items-center gap-1 font-semibold text-green-500">
                        <CheckCircleIcon size={16} />
                        <span>Paid</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'id',
            header: '',
            cell: ({ row }) => {
                const original = row.original;

                return original.transaction ? (
                    <div className="flex items-center justify-end">
                        <Badge variant={'outline'} asChild>
                            <Link
                                href={transaction.show({
                                    id: original.transaction.id,
                                })}
                            >
                                Action In Transaction
                            </Link>
                        </Badge>
                    </div>
                ) : (
                    <div className="flex items-center justify-end gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={'ghost'}>
                                    <MoreVerticalIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onClick={() => props.onDetail(original)}
                                >
                                    <EyeIcon /> Show
                                </DropdownMenuItem>
                                {original.total_remaining_amount > 0 && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            props.onPayment(original)
                                        }
                                    >
                                        <WalletIcon /> Payment
                                    </DropdownMenuItem>
                                )}
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
