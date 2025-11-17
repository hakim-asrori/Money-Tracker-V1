import { DeleteConfirm } from '@/components/delete-confirm';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { formatNumber, showToast } from '@/lib/utils';
import { dashboard } from '@/routes';
import transactionRoute from '@/routes/transaction';
import {
    BreadcrumbItem,
    DebtTargetInterface,
    SharedData,
    TransactionInterface,
    WalletInterface,
} from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Calendar,
    ChevronLeftIcon,
    ChevronRightIcon,
    DollarSignIcon,
    EditIcon,
    ListIcon,
    ReceiptTextIcon,
    TrashIcon,
    UsersIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TransactionShow({
    transaction,
    wallets,
}: {
    transaction: TransactionInterface;
    wallets: WalletInterface[];
}) {
    const page = usePage().props as any as SharedData;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Transactions',
            href: transactionRoute.index().url,
        },
        {
            title: transaction.title,
            href: transactionRoute.show({ transaction }).url,
        },
    ];

    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [targetSelected, setTargetSelected] = useState<DebtTargetInterface>();
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    useEffect(() => {
        if (page.flash.success) {
            setShowDialog(false);
        }
        showToast(page.flash);
    }, [page.flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={transaction.title} />
            <Heading title={transaction.title}>
                <div className="flex items-center gap-2">
                    <Button
                        variant={'destructive'}
                        onClick={() => setShowConfirm(true)}
                    >
                        <TrashIcon /> Delete
                    </Button>
                    <Button variant={'secondary'} asChild>
                        <Link
                            href={
                                transactionRoute.index().url +
                                `?edit=${transaction.id}`
                            }
                        >
                            <EditIcon /> Edit
                        </Link>
                    </Button>
                    <Button variant={'outline'} asChild>
                        <Link href={transactionRoute.index().url}>
                            <ChevronLeftIcon /> Back
                        </Link>
                    </Button>
                </div>
            </Heading>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ReceiptTextIcon />
                                Transaction Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Title
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {transaction.title}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-4">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Amount
                                    </span>
                                    <span className="text-sm font-semibold">
                                        Rp {formatNumber(transaction.amount)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-4">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Fee
                                    </span>
                                    <span className="text-sm font-semibold">
                                        Rp {formatNumber(transaction.fee)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-4">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Description
                                    </span>
                                    <span className="text-sm font-normal">
                                        {transaction.description}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-4">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Total
                                    </span>
                                    <span className="text-lg font-bold">
                                        Rp{' '}
                                        {formatNumber(
                                            transaction.amount +
                                                transaction.fee,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                    Name
                                </p>
                                <p className="font-semibold">
                                    {transaction.category.name}
                                </p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                    Type
                                </p>
                                <p className="font-medium">
                                    {transaction.category.type_desc}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="flex items-center justify-center rounded-full bg-secondary p-2">
                                    <Calendar className="size-5 flex-shrink-0" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">
                                        Published
                                    </p>
                                    <p>
                                        {format(
                                            transaction.published_at,
                                            'dd MMM yyyy HH:mm',
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-3 text-muted-foreground">
                                <div className="flex items-center justify-center rounded-full bg-secondary p-2">
                                    <Calendar className="size-5 flex-shrink-0" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">
                                        Created
                                    </p>
                                    <p>
                                        {format(
                                            transaction.created_at,
                                            'dd MMM yyyy HH:mm',
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-3 text-muted-foreground">
                                <div className="flex items-center justify-center rounded-full bg-secondary p-2">
                                    <Calendar className="size-5 flex-shrink-0" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">
                                        Last Updated
                                    </p>
                                    <p>
                                        {format(
                                            transaction.updated_at,
                                            'dd MMM yyyy HH:mm',
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {transaction.debt && (
                <Card className="mt-5 shadow-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UsersIcon />
                            Distribution Targets (
                            {transaction.debt.targets.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transaction.debt.targets.map((target, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                            <div>
                                                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                                    Name
                                                </p>
                                                <p className="font-semibold">
                                                    {target.name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                                    Amount
                                                </p>
                                                <p className="font-semibold">
                                                    Rp{' '}
                                                    {formatNumber(
                                                        target.amount,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                                    Paid
                                                </p>
                                                <p className="font-semibold text-green-600">
                                                    Rp{' '}
                                                    {formatNumber(
                                                        target.paid_amount,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                                    Remaining
                                                </p>
                                                <p className="font-semibold text-orange-600">
                                                    Rp{' '}
                                                    {formatNumber(
                                                        target.remaining_amount,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {target.status === 0 && (
                                                <Button
                                                    className="gap-2"
                                                    size={'sm'}
                                                    onClick={() => {
                                                        setShowDialog(true);
                                                        setTargetSelected(
                                                            target,
                                                        );
                                                    }}
                                                >
                                                    <DollarSignIcon />
                                                    Pay Now
                                                </Button>
                                            )}
                                            {target.status === 1 && (
                                                <Badge className="bg-green-50 font-semibold text-green-600">
                                                    Completed
                                                </Badge>
                                            )}
                                            {target.debt_payments!.length >
                                                0 && (
                                                <Button
                                                    size={'sm'}
                                                    variant={'ghost'}
                                                    onClick={() => {
                                                        setTargetSelected(
                                                            target,
                                                        );
                                                        setShowHistory(true);
                                                    }}
                                                >
                                                    <ListIcon /> Check History
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {showDialog && targetSelected && (
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent
                        isShow={false}
                        onInteractOutside={(e) => e.preventDefault()}
                    >
                        <DialogHeader>
                            <DialogTitle>
                                Payment {targetSelected?.name}
                            </DialogTitle>
                        </DialogHeader>

                        <Form
                            {...transactionRoute.debt.payment.form({
                                target: targetSelected.id,
                            })}
                            disableWhileProcessing
                        >
                            {({ processing, errors, wasSuccessful }) => {
                                if (wasSuccessful) {
                                    setShowDialog(false);
                                    setTargetSelected(undefined);
                                }

                                return (
                                    <div className="space-y-5">
                                        <Field>
                                            <FieldLabel htmlFor="wallet">
                                                Wallet Target
                                            </FieldLabel>
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
                                            <FieldError>
                                                {errors.wallet}
                                            </FieldError>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="amount">
                                                Amount
                                            </FieldLabel>
                                            <Input
                                                id="amount"
                                                type="number"
                                                name="amount"
                                            />
                                            <FieldError>
                                                {errors.amount}
                                            </FieldError>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="note">
                                                Notes
                                            </FieldLabel>
                                            <Input
                                                id="note"
                                                type="text"
                                                name="note"
                                            />
                                            <FieldError>
                                                {errors.note}
                                            </FieldError>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="paid_at">
                                                Paid At
                                            </FieldLabel>
                                            <Input
                                                type="datetime-local"
                                                name="paid_at"
                                                id="paid_at"
                                            />
                                            <FieldError>
                                                {errors.paid_at}
                                            </FieldError>
                                        </Field>

                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button
                                                    variant={'secondary'}
                                                    disabled={processing}
                                                >
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                Save {processing && <Spinner />}
                                            </Button>
                                        </DialogFooter>
                                    </div>
                                );
                            }}
                        </Form>
                    </DialogContent>
                </Dialog>
            )}

            {showHistory && targetSelected && (
                <Dialog open={showHistory} onOpenChange={setShowHistory}>
                    <DialogContent
                        isShow={false}
                        onInteractOutside={(e) => e.preventDefault()}
                        className="p-0"
                    >
                        <DialogHeader className="p-6">
                            <DialogTitle>
                                Payment History of {targetSelected?.name}
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] min-h-[40vh] px-6 pb-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <Card className="gap-4 py-4 shadow-none">
                                    <CardHeader className="px-4">
                                        <CardTitle>Paid</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4">
                                        <CardTitle className="text-lg font-bold text-green-600">
                                            Rp{' '}
                                            {formatNumber(
                                                targetSelected.paid_amount,
                                            )}
                                        </CardTitle>
                                    </CardContent>
                                </Card>
                                <Card className="gap-4 py-4 shadow-none">
                                    <CardHeader className="px-4">
                                        <CardTitle>Remaining</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4">
                                        <CardTitle className="text-lg font-bold text-amber-600">
                                            Rp{' '}
                                            {formatNumber(
                                                targetSelected.remaining_amount,
                                            )}
                                        </CardTitle>
                                    </CardContent>
                                </Card>
                                <div className="col-span-full space-y-5">
                                    {targetSelected.debt_payments?.map(
                                        (payment) => (
                                            <div
                                                className="space-y-2 rounded-lg border p-4"
                                                key={payment.id}
                                            >
                                                <div>
                                                    <p className="text-xs font-semibold text-muted-foreground">
                                                        Paid At
                                                    </p>
                                                    <p className="font-semibold">
                                                        {format(
                                                            payment.paid_at,
                                                            'dd MMMM yyyy, HH:mm',
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex w-full items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold text-muted-foreground">
                                                            Amount
                                                        </p>
                                                        <p className="font-semibold">
                                                            Rp{' '}
                                                            {formatNumber(
                                                                payment.amount,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-full bg-secondary p-2">
                                                        <ChevronRightIcon />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-muted-foreground">
                                                            Wallet Name
                                                        </p>
                                                        <p className="font-semibold">
                                                            {
                                                                payment
                                                                    .wallet_target
                                                                    .name
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter className="px-6 pb-6">
                            <DialogClose asChild>
                                <Button variant={'secondary'}>Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {showConfirm && (
                <DeleteConfirm
                    show={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    form={transactionRoute.destroy.form({
                        transaction: transaction.id,
                    })}
                />
            )}
        </AppLayout>
    );
}
