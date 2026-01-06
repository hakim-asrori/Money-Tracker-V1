import { HeaderSection } from '@/components/mobiles/header';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { dashboard } from '@/routes';
import indebtedness from '@/routes/debt/indebtedness';
import receivables from '@/routes/debt/receivables';
import { Head, router } from '@inertiajs/react';
import { ChevronRightIcon } from 'lucide-react';

export default function Debt() {
    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Debt" />
            <HeaderSection title="Debt" path={dashboard().url}>
                <span>&nbsp;</span>
            </HeaderSection>

            <div className="space-y-4 px-4">
                <Card onClick={() => router.visit(receivables.index())}>
                    <CardContent className="flex items-center justify-between gap-3">
                        <CardTitle>Receivables</CardTitle>
                        <ChevronRightIcon />
                    </CardContent>
                </Card>
                <Card onClick={() => router.visit(indebtedness.index())}>
                    <CardContent className="flex items-center justify-between gap-3">
                        <CardTitle>Indebtedness</CardTitle>
                        <ChevronRightIcon />
                    </CardContent>
                </Card>
            </div>
        </AppMobileDetailLayout>
    );
}
