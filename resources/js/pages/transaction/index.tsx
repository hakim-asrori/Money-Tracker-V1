import { columns } from '@/components/columns/transaction.column';
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
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
import transactionRoute from '@/routes/transaction';
import {
    BreadcrumbItem,
    CategoryInterface,
    MetaPagination,
    SharedData,
    TransactionInterface,
    WalletInterface,
} from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { PlusCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Transactions',
        href: transactionRoute.index().url,
    },
];

export default function Transaction({
    transactions,
    categories,
    wallets,
    transaction,
}: {
    transactions: MetaPagination<TransactionInterface>;
    categories: CategoryInterface[];
    wallets: WalletInterface[];
    transaction?: TransactionInterface;
}) {
    const page = usePage().props as any as SharedData;
    const [showDialog, setShowDialog] = useState<{
        title: string;
        show: boolean;
        type: 1 | 2;
    }>({
        title: transaction ? 'Edit Transaction' : 'New Transaction',
        show: transaction ? true : false,
        type: transaction ? 2 : 1,
    });
    const [transactionSelected, setTransactionSelected] =
        useState<TransactionInterface>(
            transaction || ({} as TransactionInterface),
        );
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />
            <Heading title="Transactions">
                <Button asChild>
                    <Link href={transactionRoute.create()}>
                        <PlusCircleIcon /> New Transaction
                    </Link>
                </Button>
            </Heading>

            <DataTable
                data={transactions.data}
                columns={columns({
                    onDelete: (transaction: TransactionInterface) => {
                        setShowConfirm(true);
                        setTransactionSelected(transaction);
                    },
                    onEdit: (transaction: TransactionInterface) => {
                        setShowDialog({
                            title: 'Edit Transaction',
                            show: true,
                            type: 2,
                        });
                        setTransactionSelected(transaction);
                    },
                })}
            />

            <Dialog
                open={showDialog.show}
                onOpenChange={(e) => {
                    setShowDialog({ ...showDialog, show: e });
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

                    {showDialog.type === 2 && transactionSelected ? (
                        <Form
                            {...transactionRoute.update.form({
                                transaction: transactionSelected.id,
                            })}
                            className="m-0"
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <FormTransaction
                                    categories={categories}
                                    wallets={wallets}
                                    errors={errors}
                                    processing={processing}
                                    transaction={transactionSelected}
                                    fromDetail={transaction ? true : false}
                                />
                            )}
                        </Form>
                    ) : (
                        <div></div>
                    )}
                </DialogContent>
            </Dialog>

            {transactionSelected && showConfirm && (
                <DeleteConfirm
                    show={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    form={transactionRoute.destroy.form({
                        transaction: transactionSelected.id,
                    })}
                />
            )}
        </AppLayout>
    );
}

function FormTransaction({
    categories,
    wallets,
    errors,
    processing,
    transaction,
    fromDetail = false,
}: {
    categories: CategoryInterface[];
    wallets: WalletInterface[];
    errors: any;
    processing: boolean;
    transaction?: TransactionInterface;
    fromDetail?: boolean;
}) {
    return (
        <div className="space-y-5">
            <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Select
                    name="category"
                    defaultValue={transaction?.category.id.toString()}
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
            {!transaction && (
                <Field>
                    <FieldLabel htmlFor="wallet">Wallet</FieldLabel>
                    <Select name="wallet">
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <FieldError>{errors.wallet}</FieldError>
                </Field>
            )}
            <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                    type="text"
                    name="title"
                    defaultValue={transaction?.title}
                />
                <FieldError>{errors.title}</FieldError>
            </Field>
            {!transaction && (
                <>
                    <Field>
                        <FieldLabel htmlFor="amount">Amount</FieldLabel>
                        <Input type="number" name="amount" />
                        <FieldError>{errors.amount}</FieldError>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="fee">Fee</FieldLabel>
                        <Input type="number" name="fee" />
                        <FieldError>{errors.fee}</FieldError>
                    </Field>
                </>
            )}
            <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input
                    type="text"
                    name="description"
                    defaultValue={transaction?.description}
                />
                <FieldError>{errors.description}</FieldError>
            </Field>
            <Field>
                <FieldLabel htmlFor="published_at">Published At</FieldLabel>
                <Input
                    type="datetime-local"
                    name="published_at"
                    defaultValue={transaction?.published_at}
                />
                <FieldError>{errors.published_at}</FieldError>
            </Field>

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={'secondary'} disabled={processing} asChild>
                        <Link
                            href={
                                fromDetail
                                    ? transactionRoute.show({
                                          transaction: transaction?.id || 0,
                                      })
                                    : transactionRoute.index()
                            }
                        >
                            Cancel
                        </Link>
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                    Save {processing && <Spinner />}
                </Button>
            </DialogFooter>
        </div>
    );
}
