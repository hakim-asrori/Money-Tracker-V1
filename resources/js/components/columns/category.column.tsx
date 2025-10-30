import { CategoryInterface } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { EditIcon, TrashIcon } from 'lucide-react';
import { Button } from '../ui/button';

type Props = {
    onEdit: (row: CategoryInterface) => void;
    onDelete: (row: CategoryInterface) => void;
};

export const columns = (props: Props): ColumnDef<CategoryInterface>[] => {
    return [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'type_desc',
            header: 'Type',
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
