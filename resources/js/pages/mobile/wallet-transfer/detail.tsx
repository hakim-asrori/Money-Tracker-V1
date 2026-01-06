import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { formatNumber } from '@/lib/utils';
import walletTransferRouter from '@/routes/wallet-transfer';
import { WalletTransferInterface } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { CheckCircle2Icon } from 'lucide-react';

export default function WalletTransferCreate({
    walletTransfer,
}: {
    walletTransfer: WalletTransferInterface;
}) {
    return (
        <AppMobileDetailLayout className="relative min-h-svh space-y-4 overflow-hidden bg-white">
            <Head title="Detail Transfer" />

            <div className="absolute -top-[55%] -left-8 z-20 h-screen w-[calc(100%+4rem)] rounded-full bg-lprimary" />
            <div className="absolute top-32 left-[50%] z-30 size-52 translate-x-[-50%] rounded-full bg-black/10" />

            <div className="relative z-40 space-y-5 px-4 pt-10">
                <div className="flex flex-col items-center justify-center gap-5">
                    <div className="flex size-[4.5rem] animate-pulse items-center justify-center rounded-full bg-lprimary duration-300">
                        <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
                            <CheckCircle2Icon className="size-12 text-lprimary" />
                        </div>
                    </div>
                    <div className="text-center text-white">
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

                <Card className="shadow-xs">
                    <CardHeader className="text-center">
                        <CardDescription>Total Transfer</CardDescription>
                        <CardTitle className="text-2xl">
                            Rp{' '}
                            {formatNumber(
                                walletTransfer.amount + walletTransfer.fee,
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Card>
                            <CardContent className="space-y-2">
                                <h1 className="text-sm font-medium">
                                    Source Wallet
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarFallback>
                                            {walletTransfer.wallet_origin.name.charAt(
                                                0,
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h1 className="font-bold capitalize">
                                        {walletTransfer.wallet_origin.name}
                                    </h1>
                                </div>
                            </CardContent>
                            <Separator className="mx-auto data-[orientation=horizontal]:w-[calc(100%-2rem)]" />
                            <CardContent className="space-y-2">
                                <h1 className="text-sm font-medium">
                                    Wallet Destination
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarFallback>
                                            {walletTransfer.wallet_target.name.charAt(
                                                0,
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h1 className="font-bold capitalize">
                                        {walletTransfer.wallet_target.name}
                                    </h1>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                    <Separator className="mx-auto data-[orientation=horizontal]:w-[calc(100%-2rem)]" />
                    <CardContent className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <h1 className="text-sm">Amount</h1>
                            <h1 className="font-bold">
                                Rp {formatNumber(walletTransfer.amount)}
                            </h1>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <h1 className="text-sm">Fee</h1>
                            <h1 className="font-bold">
                                Rp {formatNumber(walletTransfer.fee)}
                            </h1>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="fixed bottom-4 w-full px-4">
                <Button className="w-full" variant={'lprimary'} asChild>
                    <Link href={walletTransferRouter.index()}>
                        <CheckCircle2Icon /> Finished
                    </Link>
                </Button>
            </div>
        </AppMobileDetailLayout>
    );
}
