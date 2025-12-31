import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { WalletTransferInterface } from '@/types';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { CheckCircle2Icon } from 'lucide-react';

export default function WalletTransferCreate({
    walletTransfer,
}: {
    walletTransfer: WalletTransferInterface;
}) {
    return (
        <AppMobileDetailLayout className="relative min-h-svh space-y-4 bg-secondary">
            <Head title="Detail Transfer" />

            <div className="space-y-5 px-4 pt-10">
                <div className="flex flex-col items-center justify-center gap-5">
                    <div className="flex size-[4.5rem] animate-pulse items-center justify-center rounded-full bg-lsecondary duration-300">
                        <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
                            <CheckCircle2Icon className="size-12 text-lprimary" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-lg font-bold">
                            Transfer Successfully
                        </h1>
                        <h1 className="text-sm">
                            {format(
                                walletTransfer.published_at,
                                'dd MMMM yyyy, HH:mm a',
                            )}
                        </h1>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardDescription>Total Transfer</CardDescription>
                        <CardTitle>Rp {walletTransfer.amount}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="fixed bottom-0 w-full">
                <Card className="rounded-none">
                    <CardContent>
                        <Button className="w-full" variant={'lsecondary'}>
                            <CheckCircle2Icon /> Finished
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppMobileDetailLayout>
    );
}
