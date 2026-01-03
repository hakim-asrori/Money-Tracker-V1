import { HeaderSection } from '@/components/mobiles/header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { formatNumber, limitString, showToast } from '@/lib/utils';
import { dashboard } from '@/routes';
import income from '@/routes/income';
import {
    IncomeInterface,
    MetaPagination,
    SharedData,
    WalletInterface,
} from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Income({
    incomes,
    wallets,
}: {
    incomes: MetaPagination<IncomeInterface>;
    wallets: WalletInterface[];
}) {
    const page = usePage().props as any as SharedData;
    const [searchWallet, setSearchWallet] = useState('');
    const [incomeSelected, setIncomeSelected] = useState<IncomeInterface>();

    useEffect(() => {
        showToast(page.flash);
    }, [page.flash]);

    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Incomes" />
            <HeaderSection
                title="Incomes"
                path={dashboard().url}
                rightNode={
                    <Drawer>
                        <DrawerTrigger className="flex justify-end">
                            <PlusIcon />
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle>List of wallets</DrawerTitle>
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
                                                        income.create({
                                                            mergeQuery: {
                                                                wallet: wallet.id,
                                                            },
                                                        }),
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

            <div className="px-4">
                {incomes.data.map((income, index) => (
                    <Card key={index} onClick={() => setIncomeSelected(income)}>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-2">
                                <h1>Wallet</h1>
                                <h1 className="font-bold">
                                    {income.wallet.name}
                                </h1>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <h1>Category</h1>
                                <Badge>{income.category.name}</Badge>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <h1>Title</h1>
                                <h1 className="line-clamp-1 font-bold">
                                    {income.title}
                                </h1>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <h1>Amount</h1>
                                <h1 className="line-clamp-1 font-bold">
                                    Rp {formatNumber(income.amount)}
                                </h1>
                            </div>
                        </CardContent>
                        <Separator />
                        <CardFooter>
                            <h1 className="text-sm font-medium">
                                {format(
                                    income.published_at,
                                    'dd MMM yyyy, HH:mm',
                                )}
                            </h1>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog
                open={Boolean(incomeSelected)}
                onOpenChange={(e) => setIncomeSelected(undefined)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detail</DialogTitle>
                    </DialogHeader>
                    {incomeSelected && (
                        <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <h1 className="text-sm">Wallet</h1>
                                <h1 className="font-bold">
                                    {incomeSelected.wallet.name}
                                </h1>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <h1 className="text-sm">Category</h1>
                                <Badge>{incomeSelected.category.name}</Badge>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <h1 className="text-sm">Title</h1>
                                <h1 className="line-clamp-1 font-bold">
                                    {incomeSelected.title}
                                </h1>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <h1 className="text-sm">Amount</h1>
                                <h1 className="line-clamp-1 font-bold">
                                    Rp {formatNumber(incomeSelected.amount)}
                                </h1>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <h1 className="text-sm">Published at</h1>
                                <h1 className="line-clamp-1 font-bold">
                                    {format(
                                        incomeSelected.published_at,
                                        'dd MMM yyyy, HH:mm',
                                    )}
                                </h1>
                            </div>
                            <div className="mt-5">
                                <h1 className="text-sm">Description</h1>
                                <h1 className="font-medium">
                                    {incomeSelected.description}
                                </h1>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppMobileDetailLayout>
    );
}
