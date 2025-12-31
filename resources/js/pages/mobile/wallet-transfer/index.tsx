import { HeaderSection } from '@/components/mobiles/header';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { formatNumber, limitString, showToast } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    MetaPagination,
    SharedData,
    WalletInterface,
    WalletTransferInterface,
} from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    ArrowRightLeftIcon,
    ChevronRightIcon,
    HistoryIcon,
    SearchIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import EmptyPng from '@/images/empty.png';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import walletTransferRoute from '@/routes/wallet-transfer';
import { useEffect, useState } from 'react';

export default function WalletTransfers({
    wallets,
    walletTransfers,
    filters,
}: {
    wallets: WalletInterface[];
    walletTransfers: MetaPagination<WalletTransferInterface>;
    filters: any;
}) {
    const page = usePage().props as any as SharedData;
    const { data, setData, get } = useForm<{
        perPage: number;
        page: number;
    }>({
        perPage: filters.perPage || 15,
        page: filters.page || 1,
    });

    const [searchWallet, setSearchWallet] = useState('');

    useEffect(() => {
        showToast(page.flash);
    }, [page.flash]);

    useEffect(() => {
        get(walletTransferRoute.index().url, {
            preserveState: true,
        });
    }, [data]);

    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Transfer" />
            <HeaderSection title="Transfer" path={dashboard().url} />
            <div className="px-4 pt-5">
                <h1 className="mb-3 text-lg font-bold">Histories</h1>
                <div className="space-y-5">
                    {walletTransfers.data.length < 1 ? (
                        <div className="flex flex-col items-center">
                            <img src={EmptyPng} alt="" className="size-52" />
                            <h1 className="font-bold">
                                You not have any transfers
                            </h1>
                            <p className="text-sm">
                                Try to create a new transfer
                            </p>
                        </div>
                    ) : (
                        walletTransfers.data.map((walletTransfer, index) => (
                            <Link
                                href={walletTransferRoute.show(
                                    walletTransfer.id,
                                )}
                                className="flex items-start justify-between gap-2"
                                key={index}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-secondary p-1.5">
                                        <HistoryIcon size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1">
                                            <h1 className="text-sm font-bold">
                                                {limitString(
                                                    walletTransfer.wallet_origin
                                                        .name,
                                                    10,
                                                )}
                                            </h1>
                                            <ChevronRightIcon size={16} />
                                            <h1 className="text-sm font-bold">
                                                {limitString(
                                                    walletTransfer.wallet_target
                                                        .name,
                                                    10,
                                                )}
                                            </h1>
                                        </div>
                                        <p className="text-xs">
                                            {format(
                                                walletTransfer.published_at,
                                                'dd MMM yyyy, HH:mm a',
                                                { locale: id },
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <h1 className="font-bold">
                                    Rp{' '}
                                    {formatNumber(
                                        walletTransfer.amount +
                                            walletTransfer.fee,
                                    )}
                                </h1>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            <div className="fixed bottom-0 w-full">
                <Card className="rounded-none bg-secondary">
                    <CardContent>
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button className="w-full" variant={'lprimary'}>
                                    Transfer Balance <ArrowRightLeftIcon />
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader>
                                    <DrawerTitle>
                                        List of origin wallets
                                    </DrawerTitle>
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
                                                            walletTransferRoute.create(
                                                                {
                                                                    mergeQuery:
                                                                        {
                                                                            origin: wallet.id,
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
                                                    <h1 className="font-bold">
                                                        Rp{' '}
                                                        {formatNumber(
                                                            wallet.balance,
                                                        )}
                                                    </h1>
                                                </div>
                                            ))}
                                    </ScrollArea>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </CardContent>
                </Card>
            </div>
        </AppMobileDetailLayout>
    );
}
