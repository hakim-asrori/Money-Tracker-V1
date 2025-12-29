import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { formatNumber } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

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
    mutationChart,
    summaries,
}: {
    mutationChart: MutationChart[];
    summaries: {
        totalIncomes: number;
        totalTransactions: number;
        totalTransfers: number;
        totalDebts: number;
    };
}) {
    const chartConfig = {
        transactions: {
            label: 'Transactions',
        },
        total_cr: {
            label: 'Credit',
            color: 'var(--primary)',
        },
        total_db: {
            label: 'Debit',
            color: 'var(--primary)',
        },
    } satisfies ChartConfig;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 [&_[data-slot=card-title]]:line-clamp-1 [&_[data-slot=card-title]]:text-2xl">
                <Card>
                    <CardHeader>
                        <CardDescription>Total Incomes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CardTitle>
                            Rp {formatNumber(summaries.totalIncomes)}
                        </CardTitle>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Total Transfers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CardTitle>
                            Rp {formatNumber(summaries.totalTransfers)}
                        </CardTitle>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Total Transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CardTitle>
                            Rp {formatNumber(summaries.totalTransactions)}
                        </CardTitle>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Total Debts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CardTitle>
                            Rp {formatNumber(summaries.totalDebts)}
                        </CardTitle>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={mutationChart}>
                            <defs>
                                <linearGradient
                                    id="fillTotalDb"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-total_cr)"
                                        stopOpacity={1.0}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-total_cr)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="fillTotalCr"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-total_db)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-total_db)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    });
                                }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) => {
                                            return new Date(
                                                value,
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            });
                                        }}
                                        indicator="dot"
                                    />
                                }
                            />
                            <Area
                                dataKey="total_cr"
                                type="natural"
                                fill="url(#fillTotalCr)"
                                stroke="var(--color-total_cr)"
                                stackId="a"
                            />
                            <Area
                                dataKey="total_db"
                                type="natural"
                                fill="url(#fillTotalDb)"
                                stroke="var(--color-total_db)"
                                stackId="a"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
