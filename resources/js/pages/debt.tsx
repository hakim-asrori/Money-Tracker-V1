import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/utils';
import { dashboard } from '@/routes';
import debt from '@/routes/debt';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { PlusCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Debts',
        href: debt.receivables.index().url,
    },
];

export default function Debt({}: {}) {
    const page = usePage().props as any as SharedData;
    const [showDialog, setShowDialog] = useState<{
        title: string;
        show: boolean;
        type: 1 | 2;
    }>({
        title: '',
        show: false,
        type: 1,
    });
    // const [incomeSelected, setIncomeSelected] = useState<IncomeInterface>();
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    useEffect(() => {
        if (page.flash.success) {
            setShowDialog({
                title: '',
                show: false,
                type: 1,
            });
        }

        showToast(page.flash);
    }, [page.flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Debts" />
            <Heading title="Debts">
                <Button
                    onClick={() =>
                        setShowDialog({
                            title: 'New Income',
                            show: true,
                            type: 1,
                        })
                    }
                >
                    <PlusCircleIcon /> New Debt
                </Button>
            </Heading>
        </AppLayout>
    );
}
