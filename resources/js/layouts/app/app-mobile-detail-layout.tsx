import { Toaster } from '@/components/ui/sonner';
import { LoadingProvider } from '@/contexts/loading-context';
import { cn } from '@/lib/utils';

export default function AppMobileDetailLayout({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <LoadingProvider>
            <div className={cn(className, 'pb-10')}>{children}</div>
            <Toaster position="bottom-center" />
        </LoadingProvider>
    );
}
