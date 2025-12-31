import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/sonner';
import { dashboard } from '@/routes';
import mutation from '@/routes/mutation';
import { Link } from '@inertiajs/react';
import {
    ArrowRightLeftIcon,
    HistoryIcon,
    HomeIcon,
    UserIcon,
    WalletIcon,
} from 'lucide-react';

export default function AppMobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="relative overflow-x-hidden"
            >
                <Toaster position="top-right" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    {children}
                </div>

                <div className="fixed bottom-5 w-full px-4">
                    <div className="rounded-full border bg-white/70 p-2 shadow dark:bg-primary/70">
                        <div className="flex items-center justify-between gap-2">
                            <Link
                                href={dashboard()}
                                className="rounded-full bg-lprimary p-2 text-white"
                            >
                                <HomeIcon size={20} />
                            </Link>
                            <Link
                                href={mutation.index()}
                                className="rounded-full p-2"
                            >
                                <HistoryIcon size={20} />
                            </Link>
                            <Link
                                href={mutation.index()}
                                className="rounded-full p-2"
                            >
                                <ArrowRightLeftIcon size={20} />
                            </Link>
                            <Link
                                href={mutation.index()}
                                className="rounded-full p-2"
                            >
                                <WalletIcon size={20} />
                            </Link>
                            <Link
                                href={mutation.index()}
                                className="rounded-full p-2"
                            >
                                <UserIcon size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </AppContent>
        </AppShell>
    );
}
