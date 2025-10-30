import { columns } from '@/components/columns/mutation.column';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import mutation from '@/routes/mutation';
import { BreadcrumbItem, MetaPagination, MutationInterface } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Mutation',
        href: mutation.index().url,
    },
];

export default function Mutation({
    mutations,
}: {
    mutations: MetaPagination<MutationInterface>;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mutations" />
            <Heading title="Mutations" />
            <DataTable columns={columns({})} data={mutations.data} />
        </AppLayout>
    );
}
