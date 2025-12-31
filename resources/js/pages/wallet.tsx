import { columns } from '@/components/columns/wallet.column';
import { DataTable } from '@/components/data-table';
import { DeleteConfirm } from '@/components/delete-confirm';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
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
import wallet from '@/routes/wallet';
import {
    BreadcrumbItem,
    CategoryInterface,
    MetaPagination,
    SharedData,
    WalletInterface,
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
        title: 'Wallets',
        href: wallet.index().url,
    },
];

export default function Wallets({
    wallets,
    filters,
    categories,
}: {
    wallets: MetaPagination<WalletInterface>;
    filters: any;
    categories: CategoryInterface[];
}) {
    const { data, setData, get } = useForm<{
        search: string;
        category: string;
        page: number;
        perPage: number;
    }>({
        search: filters.search || '',
        category: filters.category || '',
        page: filters.page || 1,
        perPage: filters.perPage || 10,
    });

    const page = usePage().props as any as SharedData;
    const [walletSelected, setWalletSelected] = useState<any>();
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
        get(wallet.index().url, {
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
            <Head title="Wallets" />
            <Heading title="Wallets">
                <Button
                    onClick={() =>
                        setShowDialog({
                            title: 'New Wallet',
                            show: true,
                            type: 1,
                        })
                    }
                >
                    <PlusCircleIcon /> New Wallet
                </Button>
            </Heading>

            <div className="flex flex-col items-center gap-5 md:flex-row">
                <Select
                    value={data.category}
                    onValueChange={(e: string) => {
                        setData('category', e);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-1">All Category</SelectItem>
                        {categories.map((type) => (
                            <SelectItem
                                key={type.id}
                                value={type.id.toString()}
                            >
                                {type.name}
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
                data={wallets.data}
                columns={columns({
                    onEdit: (wallet: WalletInterface) => {
                        setShowDialog({
                            title: 'Edit Wallet',
                            show: true,
                            type: 2,
                        });
                        setWalletSelected(wallet);
                    },
                    onDelete: (wallet: WalletInterface) => {
                        setShowConfirm(true);
                        setWalletSelected(wallet);
                    },
                })}
            />
            {wallets.data.length > 0 && (
                <Pagination
                    pagination={wallets}
                    showRowsPerPage
                    changePage={(e) => {
                        setData('page', e);
                    }}
                    changePerPage={(e) => {
                        setData('perPage', e);
                    }}
                />
            )}

            <Dialog
                open={showDialog.show}
                onOpenChange={(e) => {
                    setShowDialog({ ...showDialog, show: e });
                    setWalletSelected(undefined);
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
                    {showDialog.type === 2 && walletSelected ? (
                        <Form
                            {...wallet.update.form({
                                wallet: walletSelected.id,
                            })}
                            resetOnSuccess={['name', 'type']}
                            className="mb-0"
                        >
                            {({ processing, errors }) => (
                                <FormWallet
                                    categories={categories}
                                    processing={processing}
                                    errors={errors}
                                    wallet={walletSelected}
                                />
                            )}
                        </Form>
                    ) : (
                        <Form
                            {...wallet.store.form()}
                            resetOnSuccess={['name', 'type']}
                            className="mb-0"
                        >
                            {({ processing, errors }) => (
                                <FormWallet
                                    categories={categories}
                                    processing={processing}
                                    errors={errors}
                                />
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {walletSelected && showConfirm && (
                <DeleteConfirm
                    show={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    form={wallet.destroy.form({
                        wallet: walletSelected.id,
                    })}
                />
            )}
        </AppLayout>
    );
}

function FormWallet({
    processing,
    errors,
    wallet,
    categories,
}: {
    processing: boolean;
    errors: any;
    wallet?: WalletInterface;
    categories: CategoryInterface[];
}) {
    return (
        <div className="space-y-5">
            <FieldGroup className="gap-3">
                <Field>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Select
                        name="category"
                        defaultValue={wallet?.category.id.toString()}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id.toString()}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError>{errors.category}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input id="name" name="name" defaultValue={wallet?.name} />
                    <FieldError>{errors.name}</FieldError>
                </Field>
                {!wallet && (
                    <Field>
                        <FieldLabel htmlFor="balance">Last Balance</FieldLabel>
                        <Input id="balance" name="balance" />
                        <FieldError>{errors.balance}</FieldError>
                    </Field>
                )}
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
