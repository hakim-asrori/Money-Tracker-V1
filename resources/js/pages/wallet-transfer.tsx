import { columns } from '@/components/columns/wallet-transfer.column';
import { DataTable } from '@/components/data-table';
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
import category from '@/routes/category';
import walletTransfer from '@/routes/wallet-transfer';
import {
    BreadcrumbItem,
    MetaPagination,
    SharedData,
    WalletInterface,
    WalletTransferInterface,
} from '@/types';
import { Form, Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeftRightIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Wallet Transfers',
        href: category.index().url,
    },
];

export default function WalletTransfers({
    wallets,
    walletTransfers,
    filters,
}: {
    wallets: WalletInterface[];
    walletTransfers: MetaPagination<WalletTransferInterface>;
    filters: any;
}) {
    const { data, setData, get } = useForm<{
        origin: string;
        target: string;
        publishedAt: string;
        perPage: number;
        page: number;
    }>({
        origin: filters.origin || '',
        target: filters.target || '',
        publishedAt: filters.publishedAt || '',
        perPage: filters.perPage || 10,
        page: filters.page || 1,
    });
    const page = usePage().props as any as SharedData;
    const [showDialog, setShowDialog] = useState<{
        title: string;
        show: boolean;
        type: 1 | 2;
    }>({
        title: '',
        show: false,
        type: 1,
    });
    const [walletSelected, setWalletSelected] = useState<{
        origin: number;
        destionation: number;
    }>({
        origin: 0,
        destionation: 0,
    });

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
        get(walletTransfer.index().url, {
            preserveState: true,
        });
    }, [data]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet Transfers" />
            <Heading title="Wallet Transfers">
                <Button
                    onClick={() => {
                        setShowDialog({
                            title: 'Transfer Balance',
                            show: true,
                            type: 1,
                        });
                        setWalletSelected({
                            origin: 0,
                            destionation: 0,
                        });
                    }}
                >
                    <ArrowLeftRightIcon /> Transfer Balance
                </Button>
            </Heading>

            <div className="flex flex-col items-center gap-5 md:flex-row">
                <Select
                    value={data.origin}
                    onValueChange={(e: string) => {
                        setData('origin', e);
                        setWalletSelected({
                            ...walletSelected,
                            origin: Number(e),
                        });
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by origin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-1">All Wallet Origin</SelectItem>
                        {wallets.map((wallet) => (
                            <SelectItem
                                key={wallet.id}
                                value={wallet.id.toString()}
                            >
                                {wallet.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={data.target}
                    onValueChange={(e: string) => {
                        setData('target', e);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by target" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-1">All Wallet Target</SelectItem>
                        {wallets
                            .filter(
                                (wallet) => wallet.id !== walletSelected.origin,
                            )
                            .map((wallet) => (
                                <SelectItem
                                    key={wallet.id}
                                    value={wallet.id.toString()}
                                >
                                    {wallet.name}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
                <Input
                    value={data.publishedAt}
                    onChange={(e) => setData('publishedAt', e.target.value)}
                    type="date"
                />
            </div>

            <DataTable columns={columns({})} data={walletTransfers.data} />
            {walletTransfers.data.length > 0 && (
                <Pagination
                    pagination={walletTransfers}
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
                    setWalletSelected({ origin: 0, destionation: 0 });
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

                    <Form
                        {...walletTransfer.store.form()}
                        className="m-0"
                        disableWhileProcessing
                    >
                        {({ processing, errors }) => (
                            <div className="space-y-5">
                                <FieldGroup className="gap-3">
                                    <Field>
                                        <FieldLabel htmlFor="wallet_origin">
                                            Origin Wallet
                                        </FieldLabel>
                                        <Select
                                            name="wallet_origin"
                                            onValueChange={(e) => {
                                                setWalletSelected({
                                                    ...walletSelected,
                                                    origin: Number(e),
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wallets
                                                    .filter(
                                                        (wallet) =>
                                                            wallet.id !==
                                                            walletSelected.destionation,
                                                    )
                                                    .map((wallet) => (
                                                        <SelectItem
                                                            key={wallet.id}
                                                            value={wallet.id.toString()}
                                                        >
                                                            {wallet.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>
                                            {errors.wallet_origin}
                                        </FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="wallet_target">
                                            Destination Wallet
                                        </FieldLabel>
                                        <Select
                                            name="wallet_target"
                                            onValueChange={(e) => {}}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wallets
                                                    .filter(
                                                        (wallet) =>
                                                            wallet.id !==
                                                            walletSelected.origin,
                                                    )
                                                    .map((wallet) => (
                                                        <SelectItem
                                                            key={wallet.id}
                                                            value={wallet.id.toString()}
                                                        >
                                                            {wallet.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>
                                            {errors.wallet_target}
                                        </FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="amount">
                                            Amount
                                        </FieldLabel>
                                        <Input type="number" name="amount" />
                                        <FieldError>{errors.amount}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="fee">
                                            Fee
                                        </FieldLabel>
                                        <Input type="number" name="fee" />
                                        <FieldError>{errors.fee}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="published_at">
                                            Published At
                                        </FieldLabel>
                                        <Input
                                            type="datetime-local"
                                            name="published_at"
                                        />
                                        <FieldError>
                                            {errors.published_at}
                                        </FieldError>
                                    </Field>
                                </FieldGroup>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button
                                            variant={'secondary'}
                                            disabled={processing}
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={processing}>
                                        Transfer {processing && <Spinner />}
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
