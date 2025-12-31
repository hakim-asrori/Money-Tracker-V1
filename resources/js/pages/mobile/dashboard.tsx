import { HeaderApp } from '@/components/mobiles/header';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppMobileLayout from '@/layouts/app/app-mobile-layout';
import { formatNumber } from '@/lib/utils';
import { dashboard } from '@/routes';
import walletTransfer from '@/routes/wallet-transfer';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRightLeftIcon,
    BanknoteIcon,
    GitBranchIcon,
    HandCoinsIcon,
    ShoppingCartIcon,
    TrendingUpDownIcon,
    UploadCloudIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type MutationChart = {
    date: string;
    total_db: number;
    total_cr: number;
};

export default function Dashboard({
    summaries,
}: {
    summaries: {
        totalIncomes: number;
        totalTransactions: number;
        totalTransfers: number;
        totalDebts: number;
        totalBalance: number;
    };
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppMobileLayout>
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
                    <Link className="flex w-full flex-col items-center gap-0.5">
                        <div className="rounded-full bg-lsecondary p-2.5">
                            <HandCoinsIcon size={20} />
                        </div>
                        <div>
                            <h1 className="text-xs font-semibold">Incomes</h1>
                        </div>
                    </Link>
                    <Link className="flex w-full flex-col items-center gap-0.5">
                        <div className="rounded-full bg-lsecondary p-2.5">
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
                        <div className="rounded-full bg-lsecondary p-2.5">
                            <ArrowRightLeftIcon size={20} />
                        </div>
                        <div>
                            <h1 className="text-xs font-semibold">Transfers</h1>
                        </div>
                    </Link>
                    <Link className="flex w-full flex-col items-center gap-0.5">
                        <div className="rounded-full bg-lsecondary p-2.5">
                            <UploadCloudIcon size={20} />
                        </div>
                        <div>
                            <h1 className="text-xs font-semibold">Debts</h1>
                        </div>
                    </Link>
                </CardContent>
            </Card>

            <h1 className="text-xl font-bold">Summaries</h1>
            <div className="grid grid-cols-2 gap-4 [&_[data-slot=card-content]]:space-y-1 [&_[data-slot=card-title]]:text-lprimary [&_svg]:text-lime-800">
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
                        <ArrowRightLeftIcon size={30} />
                    </CardHeader>
                    <CardContent>
                        <CardTitle>Total Transfer</CardTitle>
                        <CardDescription>
                            Rp {formatNumber(summaries.totalTransfers)}
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
                <Card>
                    <CardHeader className="font-bold">
                        <GitBranchIcon size={30} />
                    </CardHeader>
                    <CardContent>
                        <CardTitle>Total Debt</CardTitle>
                        <CardDescription>
                            Rp {formatNumber(summaries.totalDebts)}
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        </AppMobileLayout>
    );
}
