import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { LoadingProvider } from '@/contexts/loading-context';
import { limitString } from '@/lib/utils';
import { dashboard } from '@/routes';
import document from '@/routes/document';
import mutation from '@/routes/mutation';
import wallet from '@/routes/wallet';
import { DocumentSourceInterface } from '@/types';
import { Link, router } from '@inertiajs/react';
import {
    HistoryIcon,
    HomeIcon,
    ScanTextIcon,
    UserIcon,
    WalletIcon,
} from 'lucide-react';
import { useState } from 'react';

export default function AppMobileLayout({
    children,
    documentSources,
}: {
    children: React.ReactNode;
    documentSources?: DocumentSourceInterface[];
}) {
    const [showDrawer, setShowDrawer] = useState({
        open: false,
        title: '',
        type: 1,
    });

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="relative overflow-x-hidden"
            >
                <Toaster position="top-right" />
                <LoadingProvider>
                    <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                        {children}
                    </div>
                </LoadingProvider>

                <div className="fixed bottom-5 w-full px-4">
                    <div className="rounded-full border bg-white/70 p-2 shadow dark:bg-muted">
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
                            <div
                                onClick={() =>
                                    setShowDrawer({
                                        open: true,
                                        title: 'Choose Source',
                                        type: 1,
                                    })
                                }
                                className="rounded-full p-2"
                            >
                                <ScanTextIcon size={20} />
                            </div>
                            <Link
                                href={wallet.index()}
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

            <Drawer
                open={showDrawer.open}
                onOpenChange={(e) =>
                    setShowDrawer({ open: e, title: '', type: 1 })
                }
            >
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{showDrawer.title}</DrawerTitle>
                    </DrawerHeader>
                    {documentSources && documentSources.length > 0 && (
                        <DataSourceSection sources={documentSources} />
                    )}
                </DrawerContent>
            </Drawer>
        </AppShell>
    );
}

function DataSourceSection({
    sources,
}: {
    sources: DocumentSourceInterface[];
}) {
    return (
        <ScrollArea className="h-[50vh] px-4 pb-4">
            {sources.map((source, index) => (
                <div
                    key={index}
                    className="mb-3 flex items-center justify-between gap-3 border-b pb-3"
                    onClick={() => {
                        router.visit(
                            document.create({
                                mergeQuery: {
                                    source: source.id,
                                },
                            }),
                        );
                    }}
                >
                    <h1 className="text-sm font-medium">
                        {limitString(source.name, 20)}
                    </h1>
                    {source.logo === '-' ? (
                        <Avatar>
                            <AvatarFallback>
                                {source.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <img src={source.logo} className="h-6" alt="Logo" />
                    )}
                </div>
            ))}
        </ScrollArea>
    );
}
