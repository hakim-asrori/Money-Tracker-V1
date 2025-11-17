import { columns } from '@/components/columns/receivable.column';
import { DataTable } from '@/components/data-table';
import { DeleteConfirm } from '@/components/delete-confirm';
import Heading from '@/components/heading';
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
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { formatNumber, showToast } from '@/lib/utils';
import { dashboard } from '@/routes';
import debt from '@/routes/debt';
import {
    BreadcrumbItem,
    DebtInterface,
    MetaPagination,
    SharedData,
    WalletInterface,
} from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Calendar,
    ChevronRightIcon,
    InfoIcon,
    PlusCircleIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Debts',
        href: debt.receivables.index().url,
    },
];

export default function Debt({
    debts,
    wallets,
}: {
    debts: MetaPagination<DebtInterface>;
    wallets: WalletInterface[];
}) {
    const page = usePage().props as any as SharedData;
    const [showDialog, setShowDialog] = useState<{
        title: string;
        show: boolean;
        type: 1 | 2 | 3;
    }>({
        title: '',
        show: false,
        type: 1,
    });
    const [debtSelected, setDebtSelected] = useState<DebtInterface>();
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [showDetail, setShowDetail] = useState<boolean>(false);

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
            <Head title={'Receivables'} />
            <Heading title={'Receivables'}>
                <Button
                    onClick={() =>
                        setShowDialog({
                            title: 'Create New Receivable',
                            show: true,
                            type: 1,
                        })
                    }
                >
                    <PlusCircleIcon /> New Receivable
                </Button>
            </Heading>

            <DataTable
                data={debts.data}
                columns={columns({
                    onDetail: (e: DebtInterface) => {
                        setShowDetail(true);
                        setDebtSelected(e);
                    },
                    onDelete: (e: DebtInterface) => {
                        setShowConfirm(true);
                        setDebtSelected(e);
                    },
                    onEdit: (e: DebtInterface) => {
                        setShowDialog({
                            title: 'Edit Receivable',
                            show: true,
                            type: 2,
                        });
                        setDebtSelected(e);
                    },
                    onPayment: (e: DebtInterface) => {
                        setShowDialog({
                            title: `Payment: ${e.title}`,
                            show: true,
                            type: 3,
                        });
                        setDebtSelected(e);
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

                    {showDialog.type == 2 && debtSelected ? (
                        <Form
                            {...debt.receivables.update.form({
                                receivable: debtSelected.id,
                            })}
                            className="m-0"
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <FormDebt
                                    wallets={wallets}
                                    errors={errors}
                                    processing={processing}
                                    debt={debtSelected}
                                />
                            )}
                        </Form>
                    ) : showDialog.type == 3 && debtSelected ? (
                        <Form
                            {...debt.receivables.payment.form({
                                receivable: debtSelected.id,
                            })}
                        >
                            {({ processing, errors }) => (
                                <FormPayment
                                    processing={processing}
                                    errors={errors}
                                    debt={debtSelected}
                                    wallets={wallets}
                                />
                            )}
                        </Form>
                    ) : (
                        <Form
                            {...debt.receivables.store.form()}
                            className="m-0"
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <FormDebt
                                    wallets={wallets}
                                    errors={errors}
                                    processing={processing}
                                />
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {debtSelected && showConfirm && (
                <DeleteConfirm
                    show={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    form={debt.receivables.destroy.form({
                        receivable: debtSelected.id,
                    })}
                />
            )}

            {debtSelected && (
                <DetailDebt
                    show={showDetail}
                    onClose={(e) => {
                        setShowDetail(e);
                        setTimeout(() => {
                            setDebtSelected(undefined);
                        }, 1000);
                    }}
                    debt={debtSelected}
                />
            )}
        </AppLayout>
    );
}

function FormDebt({
    wallets,
    errors,
    processing,
    debt,
}: {
    wallets: WalletInterface[];
    errors: any;
    processing: boolean;
    debt?: DebtInterface;
}) {
    return (
        <div className="space-y-5">
            <FieldGroup className="gap-3">
                {!debt && (
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
                        defaultValue={debt?.title}
                    />
                    <FieldError>{errors.title}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="target">Target Name</FieldLabel>
                    <Input
                        type="text"
                        name="target"
                        defaultValue={debt?.target.name}
                    />
                    <FieldError>{errors.target}</FieldError>
                </Field>
                {!debt && (
                    <>
                        <Field>
                            <FieldLabel htmlFor="amount">
                                Target Amount
                            </FieldLabel>
                            <Input
                                type="number"
                                name="amount"
                                defaultValue={'0'}
                            />
                            <FieldError>{errors.amount}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="fee">Fee</FieldLabel>
                            <Input
                                type="number"
                                name="fee"
                                defaultValue={'0'}
                            />
                            <FieldError>{errors.fee}</FieldError>
                        </Field>
                    </>
                )}
                <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Input
                        type="text"
                        name="description"
                        defaultValue={debt?.description}
                    />
                    <FieldError>{errors.description}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="published_at">Published At</FieldLabel>
                    <Input
                        type="datetime-local"
                        name="published_at"
                        defaultValue={debt?.published_at}
                    />
                    <FieldError>{errors.published_at}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
                    <Input
                        type="datetime-local"
                        name="due_date"
                        defaultValue={debt?.target.due_date}
                    />
                    <FieldError>{errors.due_date}</FieldError>
                </Field>
            </FieldGroup>

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={'secondary'} disabled={processing}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                    Save {processing && <Spinner />}
                </Button>
            </DialogFooter>
        </div>
    );
}

function FormPayment({
    processing,
    errors,
    debt,
    wallets,
}: {
    processing: boolean;
    errors: any;
    debt: DebtInterface;
    wallets: WalletInterface[];
}) {
    const [amount, setAmount] = useState(0);

    return (
        <div className="space-y-5">
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
            <Field>
                <FieldLabel htmlFor="amount">Amount</FieldLabel>
                <InputGroup>
                    <InputGroupInput
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            setAmount(Number(e.target.value));
                        }}
                        name="amount"
                    />
                    <InputGroupAddon align={'inline-end'}>
                        <Button
                            variant={'link'}
                            size={'sm'}
                            disabled={processing}
                            type="button"
                            onClick={() =>
                                setAmount(debt.target.remaining_amount)
                            }
                        >
                            All Remaining
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
                <FieldError>{errors.amount}</FieldError>
            </Field>
            <Field>
                <FieldLabel htmlFor="note">Note</FieldLabel>
                <Input type="text" name="note" />
                <FieldError>{errors.description}</FieldError>
            </Field>
            <Field>
                <FieldLabel htmlFor="paid_at">Paid At</FieldLabel>
                <Input type="datetime-local" name="paid_at" />
                <FieldError>{errors.paid_at}</FieldError>
            </Field>

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={'secondary'} disabled={processing}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                    Send {processing && <Spinner />}
                </Button>
            </DialogFooter>
        </div>
    );
}

function DetailDebt({
    show,
    debt,
    onClose,
}: {
    show: boolean;
    debt: DebtInterface;
    onClose: (e: boolean) => void;
}) {
    const isMobile = useIsMobile();

    return (
        <Drawer open={show} onOpenChange={onClose}>
            <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
                <DrawerHeader className="items-start">
                    <DrawerTitle>Detail: {debt.title}</DrawerTitle>
                    <DrawerDescription>
                        Description: {debt.description}
                    </DrawerDescription>
                </DrawerHeader>
                <ScrollArea className="h-[75vh] px-4 md:h-[60vh]">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Card className="gap-4 py-4 shadow-none">
                                <CardHeader className="px-4">
                                    <div className="flex items-center gap-1.5">
                                        <InfoIcon className="size-5" />
                                        <CardTitle>Information</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4">
                                    <Table className="[&_tr]:[&>th]:font-bold">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>Wallet</TableCell>
                                                <TableHead>
                                                    {debt.wallet.name}
                                                </TableHead>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    Target Name
                                                </TableCell>
                                                <TableHead>
                                                    {debt.target.name}
                                                </TableHead>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    Target Amount
                                                </TableCell>
                                                <TableHead>
                                                    {' '}
                                                    <span className="text-2xl">
                                                        Rp{' '}
                                                        {formatNumber(
                                                            debt.target.amount,
                                                        )}
                                                    </span>
                                                </TableHead>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="gap-2 border-green-500 py-4 text-green-500 shadow-none">
                                    <CardHeader className="items-center px-4">
                                        <h1>Paid {!isMobile && 'Amount'}</h1>
                                    </CardHeader>
                                    <CardContent className="px-4 text-center">
                                        <h1 className="line-clamp-1 text-xl font-bold md:text-2xl">
                                            Rp{' '}
                                            {formatNumber(
                                                debt.target.paid_amount,
                                            )}
                                        </h1>
                                    </CardContent>
                                </Card>
                                <Card className="gap-2 border-amber-500 py-4 text-amber-500 shadow-none">
                                    <CardHeader className="items-center px-4">
                                        <h1>
                                            Remaining {!isMobile && 'Amount'}
                                        </h1>
                                    </CardHeader>
                                    <CardContent className="px-4 text-center">
                                        <h1 className="line-clamp-1 text-xl font-bold md:text-2xl">
                                            Rp{' '}
                                            {formatNumber(
                                                debt.target.remaining_amount,
                                            )}
                                        </h1>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="gap-4 py-4 shadow-none">
                                <CardHeader className="px-4">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 px-4 text-sm">
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
                                                    debt.published_at,
                                                    'dd MMM yyyy HH:mm',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {debt.target.due_date && (
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <div className="flex items-center justify-center rounded-full bg-secondary p-2">
                                                <Calendar className="size-5 flex-shrink-0" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    Due Date
                                                </p>
                                                <p>
                                                    {format(
                                                        debt.target.due_date,
                                                        'dd MMM yyyy HH:mm',
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <div className="flex items-center justify-center rounded-full bg-secondary p-2">
                                            <Calendar className="size-5 flex-shrink-0" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Created
                                            </p>
                                            <p>
                                                {format(
                                                    debt.created_at,
                                                    'dd MMM yyyy HH:mm',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="col-span-full space-y-3">
                            <h1 className="font-semibold">Payment History</h1>
                            <div className="space-y-3">
                                {debt.target.debt_payments?.map((payment) => (
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
                                        <div className="flex w-full flex-col items-start justify-between md:flex-row md:items-center">
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
                                            <div className="hidden rounded-full bg-secondary p-2 md:block">
                                                <ChevronRightIcon />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground">
                                                    Wallet Name
                                                </p>
                                                <p className="font-semibold">
                                                    {payment.wallet_target.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DrawerFooter className="items-end px-0">
                        <DrawerClose asChild>
                            <Button variant="outline" size={'sm'}>
                                Close
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </ScrollArea>
            </DrawerContent>
        </Drawer>
    );
}
