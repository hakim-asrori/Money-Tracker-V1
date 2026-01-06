import { HeaderSection } from '@/components/mobiles/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import {
    cn,
    formatNumber,
    limitString,
    showToast,
    swalConfirm,
} from '@/lib/utils';
import { dashboard } from '@/routes';
import receivableRouter from '@/routes/debt/receivables';
import {
    DebtInterface,
    MetaPagination,
    SharedData,
    WalletInterface,
} from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Calendar,
    ChevronRightIcon,
    DollarSignIcon,
    EditIcon,
    InfoIcon,
    MoreVerticalIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon,
    UserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Index({
    wallets,
    debts,
}: {
    wallets: WalletInterface[];
    debts: MetaPagination<DebtInterface>;
}) {
    const page = usePage().props as any as SharedData;
    const [searchWallet, setSearchWallet] = useState('');
    const [debtSelected, setDebtSelected] = useState<DebtInterface>();
    const [debtPayment, setDebtPayment] = useState<DebtInterface>();
    const [errors, setErrors] = useState<any>({});
    const [amount, setAmount] = useState(0);
    const [isDisabled, setIsDisabled] = useState(false);

    const handleDelete = async (debt: DebtInterface) => {
        const confirmed = await swalConfirm({ placeholder: "entry 'delete'" });

        if (!confirmed) return;

        router.delete(receivableRouter.destroy(debt.id), {
            onSuccess: () => {
                showToast(page.flash);
            },
        });
    };

    const clearState = () => {
        setDebtPayment(undefined);
        setErrors({});
        setAmount(0);
    };

    useEffect(() => {
        showToast(page.flash);
    }, [page.flash]);

    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Debt Receivables" />
            <HeaderSection
                title="Debt Receive"
                path={dashboard().url}
                rightNode={
                    <Drawer>
                        <DrawerTrigger className="flex justify-end">
                            <PlusIcon />
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle>Choose wallet</DrawerTitle>
                            </DrawerHeader>
                            <Separator className="mb-5" />
                            <div className="px-4 pb-5">
                                <InputGroup className="mb-5">
                                    <InputGroupInput
                                        placeholder="Search wallets..."
                                        onChange={(e) =>
                                            setSearchWallet(e.target.value)
                                        }
                                    />
                                    <InputGroupAddon>
                                        <SearchIcon />
                                    </InputGroupAddon>
                                </InputGroup>

                                <ScrollArea className="h-[50vh]">
                                    {wallets
                                        .filter((wallet) =>
                                            wallet.name
                                                .toLowerCase()
                                                .includes(
                                                    searchWallet.toLowerCase(),
                                                ),
                                        )
                                        .map((wallet, index) => (
                                            <div
                                                key={index}
                                                className="mb-3 flex items-center justify-between gap-3 border-b pb-3"
                                                onClick={() => {
                                                    router.visit(
                                                        receivableRouter.create(
                                                            {
                                                                mergeQuery: {
                                                                    wallet: wallet.id,
                                                                },
                                                            },
                                                        ),
                                                    );
                                                }}
                                            >
                                                <h1 className="text-sm font-medium">
                                                    {limitString(
                                                        wallet.name,
                                                        20,
                                                    )}
                                                </h1>
                                            </div>
                                        ))}
                                </ScrollArea>
                            </div>
                        </DrawerContent>
                    </Drawer>
                }
            >
                <span>&nbsp;</span>
            </HeaderSection>

            <div className="space-y-4 px-4">
                {debts.data.map((debt, index) => {
                    const progress =
                        ((debt.amount - debt.total_remaining_amount) /
                            debt.amount) *
                        100;

                    return (
                        <Card key={index}>
                            <CardHeader className="flex-row items-start justify-between">
                                <div
                                    className="space-y-1"
                                    onClick={() => setDebtSelected(debt)}
                                >
                                    <h1 className="line-clamp-1 font-bold">
                                        {debt.title}
                                    </h1>
                                    <div className="line-clamp-1 flex gap-1">
                                        <UserIcon size={18} />
                                        <p className="text-sm">
                                            {debt.targets
                                                .map((target) => target.name)
                                                .join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {debt.total_remaining_amount > 0 ? (
                                        <Badge variant={'lwarning'}>
                                            Waiting
                                        </Badge>
                                    ) : (
                                        <Badge variant={'lsuccess'}>Paid</Badge>
                                    )}

                                    {!debt.transaction && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <MoreVerticalIcon size={16} />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>
                                                    Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={receivableRouter.edit(
                                                            debt.id,
                                                        )}
                                                    >
                                                        <EditIcon /> Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                {debt.total_remaining_amount >
                                                    0 && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setDebtPayment(debt)
                                                        }
                                                    >
                                                        <DollarSignIcon />{' '}
                                                        Payment
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDelete(debt)
                                                    }
                                                >
                                                    <Trash2Icon /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent
                                className="space-y-1"
                                onClick={() => setDebtSelected(debt)}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm">Origin</p>
                                    <h1 className="text-sm font-bold">
                                        {debt.transaction
                                            ? 'Transaction'
                                            : 'Debt'}
                                    </h1>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm">Wallet</p>
                                    <h1 className="text-sm font-bold">
                                        {debt.wallet.name}
                                    </h1>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm">Total Amount</p>
                                    <h1 className="text-sm font-bold">
                                        Rp {formatNumber(debt.amount)}
                                    </h1>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm">Remaining</p>
                                    <h1
                                        className={cn(
                                            'text-sm font-bold',
                                            debt.total_remaining_amount > 0
                                                ? 'text-lwarning'
                                                : 'text-lsuccess',
                                        )}
                                    >
                                        Rp{' '}
                                        {formatNumber(
                                            debt.total_remaining_amount,
                                        )}
                                    </h1>
                                </div>
                                <Separator className="my-2" />
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm">Progress</p>
                                        <h1 className="text-sm font-bold">
                                            {progress.toFixed(2)}%
                                        </h1>
                                    </div>
                                    <Progress
                                        className={cn(
                                            progress >= 100 &&
                                                '[&_[data-slot=progress-indicator]]:bg-green-500',
                                        )}
                                        value={progress}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {debtSelected && (
                <DetailDebt
                    show={Boolean(debtSelected)}
                    onClose={(e) => {
                        setDebtSelected(undefined);
                    }}
                    debt={debtSelected}
                />
            )}

            <Drawer
                open={Boolean(debtPayment)}
                onOpenChange={() => {
                    clearState();
                }}
            >
                <DrawerContent onInteractOutside={(e) => e.preventDefault()}>
                    <DrawerHeader>
                        <DrawerTitle>Payment Debt</DrawerTitle>
                    </DrawerHeader>
                    <form
                        onSubmit={(e) => {
                            setIsDisabled(true);
                            e.preventDefault();

                            const formData = new FormData(e.currentTarget);

                            router.post(
                                receivableRouter.payment(
                                    debtPayment?.id as number,
                                ),
                                formData,
                                {
                                    onSuccess: () => {
                                        clearState();
                                        e.currentTarget.reset();
                                    },
                                    onError: (e) => {
                                        setErrors(e);
                                        console.log(e);
                                    },
                                    onFinish: () => {
                                        setIsDisabled(false);
                                    },
                                },
                            );
                        }}
                    >
                        <ScrollArea className="h-[52vh] px-4 pb-4">
                            <FieldGroup className="gap-3">
                                <Field>
                                    <FieldLabel htmlFor="wallet">
                                        Wallet
                                    </FieldLabel>
                                    <Select name="wallet" disabled={isDisabled}>
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
                                    <FieldLabel htmlFor="amount">
                                        Amount
                                    </FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            value={amount}
                                            name="amount"
                                            disabled={isDisabled}
                                        />
                                        <InputGroupAddon>Rp</InputGroupAddon>
                                        <InputGroupAddon
                                            align={'inline-end'}
                                            onClick={() => {
                                                setAmount(
                                                    debtPayment?.target
                                                        .remaining_amount || 0,
                                                );
                                            }}
                                        >
                                            All Debt
                                        </InputGroupAddon>
                                    </InputGroup>
                                    <FieldError>{errors.amount}</FieldError>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="note">Note</FieldLabel>
                                    <Textarea
                                        name="note"
                                        defaultValue={'-'}
                                        disabled={isDisabled}
                                    />
                                    <FieldError>{errors.note}</FieldError>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="paid_at">
                                        Paid At
                                    </FieldLabel>
                                    <Input
                                        type="datetime-local"
                                        name="paid_at"
                                        max={format(
                                            new Date(),
                                            'yyyy-MM-dd 23:59',
                                        )}
                                        disabled={isDisabled}
                                    />
                                    <FieldError>{errors.paid_at}</FieldError>
                                </Field>
                            </FieldGroup>
                        </ScrollArea>
                        <DrawerFooter className="flex-row justify-end">
                            <DrawerClose asChild disabled={isDisabled}>
                                <Button variant="secondary">Cancel</Button>
                            </DrawerClose>
                            <Button
                                type="submit"
                                variant={'lprimary'}
                                disabled={isDisabled}
                            >
                                Save {isDisabled && <Spinner />}
                            </Button>
                        </DrawerFooter>
                    </form>
                </DrawerContent>
            </Drawer>
        </AppMobileDetailLayout>
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
                                                    'dd MMM yyyy HH:mm a',
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
                                                        'dd MMM yyyy HH:mm a',
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
                                                    'dd MMM yyyy HH:mm a',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {debt.target.debt_payments?.length! > 0 && (
                            <div className="col-span-full space-y-3">
                                <h1 className="font-semibold">
                                    Payment History
                                </h1>
                                <div className="space-y-3">
                                    {debt.target.debt_payments?.map(
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
                                                            'dd MMM yyyy, HH:mm a',
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
                        )}
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
