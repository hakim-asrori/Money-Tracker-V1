import { columns } from '@/components/columns/mutation.column';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { getModelNamePretty } from '@/lib/utils';
import { dashboard } from '@/routes';
import mutation from '@/routes/mutation';
import { BreadcrumbItem, MetaPagination, MutationInterface } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Reports',
        href: mutation.index().url,
    },
    {
        title: 'Mutations',
        href: mutation.index().url,
    },
];

export default function Mutation({
    mutations,
    filters,
    inquiryGroups,
    walletGroups,
}: {
    mutations: MetaPagination<MutationInterface>;
    filters: any;
    inquiryGroups: string[];
    walletGroups: Record<number, string>[];
}) {
    const { data, setData, get } = useForm<{
        search: string;
        type: string;
        wallet: string;
        inquiry: string;
        page: number;
        perPage: number;
    }>({
        search: filters.search || '',
        type: filters.type || '-1',
        wallet: filters.wallet || '-1',
        inquiry: filters.inquiry || '-1',
        page: filters.page || 1,
        perPage: filters.perPage || 10,
    });

    const handleFilter = () => {
        get(mutation.index().url, {
            preserveState: true,
        });
    };

    useEffect(() => {
        handleFilter();
    }, [data]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mutations" />
            <Heading title="Mutations" />

            <div className="flex flex-col items-center gap-5 md:flex-row">
                <Select
                    value={data.inquiry}
                    onValueChange={(e: string) => {
                        setData('inquiry', e);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by inquiry" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-1">All Inquiry</SelectItem>
                        {inquiryGroups.map((group) => (
                            <SelectItem key={group} value={group.toString()}>
                                {getModelNamePretty(group)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={data.wallet}
                    onValueChange={(e: string) => {
                        setData('wallet', e);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by wallet" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-1">All Wallet</SelectItem>
                        {Object.entries(walletGroups).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                                {String(value)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={data.type}
                    onValueChange={(e: string) => {
                        setData('type', e);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-1">All Type</SelectItem>
                        {[
                            { key: 'cr', value: 'Credit' },
                            { key: 'db', value: 'Debit' },
                        ].map(({ key, value }) => (
                            <SelectItem key={key} value={key}>
                                {String(value)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataTable columns={columns({})} data={mutations.data} />
            {mutations.data.length > 0 && (
                <Pagination
                    pagination={mutations}
                    showRowsPerPage
                    changePage={(e) => {
                        setData('page', e);
                    }}
                    changePerPage={(e) => {
                        setData('perPage', e);
                    }}
                />
            )}
        </AppLayout>
    );
}
