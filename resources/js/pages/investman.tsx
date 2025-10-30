import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import investman from '@/routes/investman';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Investman',
        href: investman.index().url,
    },
];

export default function Investman() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Investmans" />
            <Heading title="Investmans">
                <Button></Button>
            </Heading>
        </AppLayout>
    );
}
