import { columns } from '@/components/columns/category.column';
import { DataTable } from '@/components/data-table';
import { DeleteConfirm } from '@/components/delete-confirm';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/utils';
import { dashboard } from '@/routes';
import category from '@/routes/category';
import {
    BreadcrumbItem,
    CategoryInterface,
    MetaPagination,
    SharedData,
} from '@/types';
import { Form, Head, useForm, usePage } from '@inertiajs/react';
import { PlusCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Categories',
        href: category.index().url,
    },
];

export default function Category({
    categoryTypes,
    categories,
    filters,
}: {
    categoryTypes: {
        key: number;
        value: string;
    }[];
    categories: MetaPagination<CategoryInterface>;
    filters: any;
}) {
    const { data, setData, get } = useForm<{
        search: string;
        type: string;
    }>({
        search: filters.search || '',
        type: filters.type || '-1',
    });

    const page = usePage().props as any as SharedData;
    const [categorySelected, setCategorySelected] =
        useState<CategoryInterface>();
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<{
        title: string;
        show: boolean;
        type: 1 | 2;
    }>({
        title: '',
        show: false,
        type: 1,
    });

    const handleFilter = () => {
        get(category.index().url, {
            preserveState: true,
        });
    };

    useEffect(() => {
        if (page.flash.success) {
            setShowDialog({
                title: '',
                show: false,
                type: 1,
            });
        }
        showToast(page.flash);
    }, [page.flash]);

    useEffect(() => {
        handleFilter();
    }, [data]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <Heading title="Categories">
                <Button
                    onClick={() =>
                        setShowDialog({
                            title: 'New Category',
                            show: true,
                            type: 1,
                        })
                    }
                >
                    <PlusCircleIcon /> New Category
                </Button>
            </Heading>

            <div className="flex flex-col items-center gap-5 md:flex-row">
                <Select
                    value={data.type}
                    onValueChange={(e: string) => {
                        setData('type', e);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-1">All Type</SelectItem>
                        {categoryTypes.map((type) => (
                            <SelectItem
                                key={type.key}
                                value={type.key.toString()}
                            >
                                {type.value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Input
                    value={data.search}
                    onChange={(e) => {
                        setData('search', e.target.value);
                    }}
                    placeholder="Filter by name"
                />
            </div>

            <DataTable
                data={categories.data}
                columns={columns({
                    onEdit: (category: CategoryInterface) => {
                        setShowDialog({
                            title: 'Edit Category',
                            show: true,
                            type: 2,
                        });
                        setCategorySelected(category);
                    },
                    onDelete: (category: CategoryInterface) => {
                        setShowConfirm(true);
                        setCategorySelected(category);
                    },
                })}
            />

            <Dialog
                open={showDialog.show}
                onOpenChange={(e) => {
                    setShowDialog({ ...showDialog, show: e });
                    setCategorySelected(undefined);
                }}
            >
                <DialogContent
                    className="space-y-5"
                    isShow={false}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>{showDialog.title}</DialogTitle>
                    </DialogHeader>
                    {showDialog.type === 2 && categorySelected ? (
                        <Form
                            {...category.update.form({
                                category: categorySelected.id,
                            })}
                            resetOnSuccess={['name', 'type']}
                            className="mb-0"
                        >
                            {({ processing, errors }) => (
                                <FormCategory
                                    processing={processing}
                                    errors={errors}
                                    categoryTypes={categoryTypes}
                                    category={categorySelected}
                                />
                            )}
                        </Form>
                    ) : (
                        <Form
                            {...category.store.form()}
                            resetOnSuccess={['name', 'type']}
                            className="mb-0"
                        >
                            {({ processing, errors }) => (
                                <FormCategory
                                    processing={processing}
                                    errors={errors}
                                    categoryTypes={categoryTypes}
                                />
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
            {categorySelected && showConfirm && (
                <DeleteConfirm
                    show={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    form={category.destroy.form({
                        category: categorySelected.id,
                    })}
                />
            )}
        </AppLayout>
    );
}

function FormCategory({
    processing,
    errors,
    categoryTypes,
    category,
}: {
    processing: boolean;
    errors: any;
    categoryTypes: { key: number; value: string }[];
    category?: CategoryInterface;
}) {
    return (
        <div className="space-y-5">
            <FieldGroup className="gap-3">
                <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={category?.name}
                    />
                    <FieldError>{errors.name}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="type">Type</FieldLabel>
                    <Select
                        name="type"
                        defaultValue={category?.type.toString()}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                            {categoryTypes.map((type) => (
                                <SelectItem
                                    key={type.key}
                                    value={type.key.toString()}
                                >
                                    {type.value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError>{errors.type}</FieldError>
                </Field>
            </FieldGroup>
            <DialogFooter className="mb-0">
                <DialogClose asChild>
                    <Button variant={'secondary'} disabled={processing}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button disabled={processing}>
                    Save {processing && <Spinner />}
                </Button>
            </DialogFooter>
        </div>
    );
}
