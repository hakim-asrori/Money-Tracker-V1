import { EmptyData } from '@/components/mobiles/empty';
import { HeaderSection } from '@/components/mobiles/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { formatNumber, limitString, showToast, swalConfirm } from '@/lib/utils';
import { dashboard } from '@/routes';
import transactionRouter from '@/routes/transaction';
import {
    DebtTargetInterface,
    MetaPagination,
    SharedData,
    TransactionInterface,
    WalletInterface,
} from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    DollarSignIcon,
    EditIcon,
    MoreVerticalIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Transaction({
    wallets,
    transactions,
}: {
    wallets: WalletInterface[];
    transactions: MetaPagination<TransactionInterface>;
}) {
    const page = usePage().props as any as SharedData;
    const [searchWallet, setSearchWallet] = useState('');
    const [transactionSelected, setTransactionSelected] =
        useState<TransactionInterface>();
    const [errors, setErrors] = useState<any>({});
    const [amount, setAmount] = useState(0);
    const [targetSelected, setTargetSelected] = useState<DebtTargetInterface>();

    const handleDelete = async (transaction: TransactionInterface) => {
        const confirmed = await swalConfirm({ placeholder: "entry 'delete'" });

        if (!confirmed) return;

        router.delete(transactionRouter.destroy(transaction.id), {
            onSuccess: () => {
                showToast(page.flash);
            },
        });
    };

    const clearState = () => {
        setTransactionSelected(undefined);
        setTargetSelected(undefined);
        setErrors({});
        setAmount(0);
    };

    useEffect(() => {
        showToast(page.flash);
    }, [page.flash]);

    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Transactions" />
            <HeaderSection
                title="Transactions"
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
                                                        transactionRouter.create(
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
                {transactions.data.length < 1 ? (
                    <EmptyData title="Transactions not found" />
                ) : (
                    transactions.data.map((transaction, index) => (
                        <Card key={index}>
                            <CardHeader className="flex-row items-center justify-between">
                                <h1
                                    className="text-sm font-medium"
                                    onClick={() =>
                                        router.visit(
                                            transactionRouter.show(
                                                transaction.id,
                                            ),
                                        )
                                    }
                                >
                                    {format(
                                        transaction.published_at,
                                        'dd MMM yyyy, HH:mm a',
                                    )}
                                </h1>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <MoreVerticalIcon size={20} />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>
                                            Actions
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={transactionRouter.edit(
                                                    transaction.id,
                                                )}
                                            >
                                                <EditIcon /> Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        {transaction.debt &&
                                            transaction.debt.targets.reduce(
                                                (total, target) =>
                                                    total +
                                                    target.remaining_amount,
                                                0,
                                            ) > 0 && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setTransactionSelected(
                                                            transaction,
                                                        )
                                                    }
                                                >
                                                    <DollarSignIcon /> Payment
                                                </DropdownMenuItem>
                                            )}
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() =>
                                                handleDelete(transaction)
                                            }
                                        >
                                            <Trash2Icon /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <Separator />
                            <CardContent
                                className="space-y-2 text-sm"
                                onClick={() =>
                                    router.visit(
                                        transactionRouter.show(transaction.id),
                                    )
                                }
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h1>Wallet</h1>
                                    <h1 className="font-bold">
                                        {transaction.wallet.name}
                                    </h1>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <h1>Category</h1>
                                    <Badge>{transaction.category.name}</Badge>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <h1>Title</h1>
                                    <h1 className="line-clamp-1 font-bold capitalize">
                                        {transaction.title}
                                    </h1>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <h1>Split Bill</h1>
                                    <h1 className="line-clamp-1 font-bold capitalize">
                                        {transaction.debt ? 'Yes' : 'No'}
                                    </h1>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <h1>Total</h1>
                                    <h1 className="line-clamp-1 font-bold">
                                        Rp{' '}
                                        {formatNumber(
                                            transaction.amount +
                                                transaction.fee,
                                        )}
                                    </h1>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Drawer
                open={Boolean(transactionSelected)}
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
                            e.preventDefault();

                            const formData = new FormData(e.currentTarget);
                            if (!formData.get('target')) {
                                setErrors({
                                    target: 'Target is required',
                                });
                                return;
                            }

                            router.post(
                                transactionRouter.debt.payment({
                                    target: formData.get('target') as string,
                                }),
                                formData,
                                {
                                    onSuccess: () => {
                                        clearState();
                                        e.currentTarget.reset();
                                    },
                                    onError: (e) => {
                                        setErrors(e);
                                    },
                                },
                            );
                        }}
                    >
                        <ScrollArea className="h-[52vh] px-4 pb-4">
                            <FieldGroup className="gap-3">
                                <Field>
                                    <FieldLabel htmlFor="target">
                                        Target
                                    </FieldLabel>
                                    <Select
                                        name="target"
                                        onValueChange={(e) => {
                                            setTargetSelected(
                                                transactionSelected?.debt?.targets.find(
                                                    (target) =>
                                                        target.id.toString() ===
                                                        e,
                                                ),
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transactionSelected?.debt?.targets
                                                .filter(
                                                    (target) =>
                                                        target.remaining_amount >
                                                        0,
                                                )
                                                .map((target) => (
                                                    <SelectItem
                                                        key={target.id}
                                                        value={target.id.toString()}
                                                    >
                                                        {target.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{errors.target}</FieldError>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="wallet">
                                        Wallet
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
                                    <FieldError>{errors.wallet}</FieldError>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="amount">
                                        Wallet
                                    </FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            value={amount}
                                            name="amount"
                                        />
                                        <InputGroupAddon>Rp</InputGroupAddon>
                                        <InputGroupAddon
                                            align={'inline-end'}
                                            onClick={() => {
                                                setAmount(
                                                    targetSelected?.amount || 0,
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
                                    <Textarea name="note" defaultValue={'-'} />
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
                                    />
                                    <FieldError>{errors.paid_at}</FieldError>
                                </Field>
                            </FieldGroup>
                        </ScrollArea>
                        <DrawerFooter className="flex-row justify-end">
                            <DrawerClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DrawerClose>
                            <Button type="submit" variant={'lprimary'}>
                                Save
                            </Button>
                        </DrawerFooter>
                    </form>
                </DrawerContent>
            </Drawer>
        </AppMobileDetailLayout>
    );
}
