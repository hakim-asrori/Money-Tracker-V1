import { Toaster } from '@/components/ui/sonner';

export default function AppMobileDetailLayout({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div>
            <div className={className}>{children}</div>
            <Toaster position="top-right" />
        </div>
    );
}
