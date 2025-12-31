import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

export default function AppMobileDetailLayout({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div>
            <div className={cn(className, 'pb-10')}>{children}</div>
            <Toaster position="top-right" />
        </div>
    );
}
