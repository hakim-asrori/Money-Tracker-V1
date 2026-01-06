import { HeaderSection } from '@/components/mobiles/header';
import { CardWallet } from '@/components/ui/card';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { cn, showToast } from '@/lib/utils';
import { dashboard } from '@/routes';
import walletRoute from '@/routes/wallet';
import { MetaPagination, SharedData, WalletInterface } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { useEffect } from 'react';

export default function Wallet({
    wallets,
}: {
    wallets: MetaPagination<WalletInterface>;
}) {
    const page = usePage().props as any as SharedData;

    useEffect(() => {
        showToast(page.flash);
    }, [page.flash]);

    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Wallets" />
            <HeaderSection
                title="Wallets"
                path={dashboard().url}
                rightNode={
                    <div
                        className="flex justify-end"
                        onClick={() => router.visit(walletRoute.create())}
                    >
                        <PlusIcon size={20} />
                    </div>
                }
            >
                <span>&nbsp;</span>
            </HeaderSection>

            <div className="space-y-5 px-4">
                {wallets.data.map((wallet, index) => (
                    <CardWallet
                        key={index}
                        wallet={wallet}
                        className={cn(
                            index % 2 === 0 && 'bg-lprimary text-white',
                            'z-30',
                        )}
                        onClick={() =>
                            router.visit(walletRoute.show(wallet.id))
                        }
                    />
                ))}
            </div>
        </AppMobileDetailLayout>
    );
}
