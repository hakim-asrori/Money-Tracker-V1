import { HeaderApp } from '@/components/mobiles/header';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppMobileLayout from '@/layouts/app/app-mobile-layout';
import { formatNumber, showToast } from '@/lib/utils';
import debt from '@/routes/debt';
import income from '@/routes/income';
import transaction from '@/routes/transaction';
import walletTransfer from '@/routes/wallet-transfer';
import { DocumentSourceInterface, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRightLeftIcon,
    BanknoteIcon,
    HandCoinsIcon,
    ShoppingCartIcon,
    TrendingUpDownIcon,
    UploadCloudIcon,
} from 'lucide-react';
import { useEffect } from 'react';

export default function Dashboard({
    summaries,
    documentSources,
}: {
    summaries: {
        totalIncomes: number;
        totalTransactions: number;
        totalTransfers: number;
        totalDebts: number;
        totalBalance: number;
    };
    documentSources: DocumentSourceInterface[];
}) {
    const { auth, flash } = usePage<SharedData>().props;

    useEffect(() => {
        showToast(flash);
    }, [flash]);

    return (
        <AppMobileLayout documentSources={documentSources}>
            <Head title="Dashboard" />
            <HeaderApp />
            <div className="text-sm">
                <h1>
                    Hello,{' '}
                    <strong className="text-lprimary">{auth.user.name}</strong>{' '}
                    👋
                </h1>
                <b>{auth.user.email}</b>
            </div>
            <Card className="py-2">
                <CardHeader className="px-2">
                    <Card className="bg-lprimary">
                        <CardContent>
                            <CardDescription className="text-white">
                                Total Balance
                            </CardDescription>
                            <CardTitle className="text-2xl text-white">
                                Rp {formatNumber(summaries.totalBalance)}
                            </CardTitle>
                        </CardContent>
                    </Card>
                </CardHeader>
                <CardContent className="grid grid-cols-4 items-center justify-center gap-4 px-2">
                    <Link
                        href={income.index()}
                        className="flex w-full flex-col items-center gap-0.5"
                    >
                        <div className="rounded-full bg-muted p-2.5">
                            <HandCoinsIcon size={20} />
                        </div>
                        <div>
                            <h1 className="text-xs font-semibold">Incomes</h1>
                        </div>
                    </Link>
                    <Link
                        href={transaction.index()}
                        className="flex w-full flex-col items-center gap-0.5"
                    >
                        <div className="rounded-full bg-muted p-2.5">
                            <ShoppingCartIcon size={20} />
                        </div>
                        <div>
                            <h1 className="text-xs font-semibold">
                                Transactions
                            </h1>
                        </div>
                    </Link>
                    <Link
                        href={walletTransfer.index()}
                        className="flex w-full flex-col items-center gap-0.5"
                    >
                        <div className="rounded-full bg-muted p-2.5">
                            <ArrowRightLeftIcon size={20} />
                        </div>
                        <div>
                            <h1 className="text-xs font-semibold">Transfers</h1>
                        </div>
                    </Link>
                    <Link
                        href={debt.index()}
                        className="flex w-full flex-col items-center gap-0.5"
                    >
                        <div className="rounded-full bg-muted p-2.5">
                            <UploadCloudIcon size={20} />
                        </div>
                        <div>
                            <h1 className="text-xs font-semibold">Debts</h1>
                        </div>
                    </Link>
                </CardContent>
            </Card>

            <h1 className="text-xl font-bold">Summaries</h1>
            <div className="grid grid-cols-2 gap-4 [&_[data-slot=card-content]]:space-y-1 [&_[data-slot=card-title]]:text-lprimary [&_svg]:text-lprimary">
                <Card>
                    <CardHeader className="font-bold">
                        <TrendingUpDownIcon size={30} />
                    </CardHeader>
                    <CardContent>
                        <CardTitle>Total Income</CardTitle>
                        <CardDescription>
                            Rp {formatNumber(summaries.totalIncomes)}
                        </CardDescription>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="font-bold">
                        <BanknoteIcon size={30} />
                    </CardHeader>
                    <CardContent>
                        <CardTitle>Total Transaction</CardTitle>
                        <CardDescription>
                            Rp {formatNumber(summaries.totalTransactions)}
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        </AppMobileLayout>
    );
}
