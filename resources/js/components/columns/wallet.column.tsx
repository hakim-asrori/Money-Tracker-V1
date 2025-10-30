import { formatNumber } from '@/lib/utils';
import { WalletInterface } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { EditIcon, TrashIcon } from 'lucide-react';
import { Button } from '../ui/button';

type Props = {
    onEdit: (row: WalletInterface) => void;
    onDelete: (row: WalletInterface) => void;
};

export const columns = (props: Props): ColumnDef<WalletInterface>[] => {
    return [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'category.name',
            header: 'Category',
        },
        {
            accessorKey: 'balance',
            header: 'Balance',
            cell: ({ row }) => {
                return `Rp ${formatNumber(row.getValue('balance'))}`;
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
