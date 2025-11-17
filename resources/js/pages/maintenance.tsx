import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Maintenance() {
    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={'Maintenance'} />
            <Heading title={'Maintenance'} />
        </AppLayout>
    );
}
