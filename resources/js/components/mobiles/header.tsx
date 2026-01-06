import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { BellIcon, ChevronLeftIcon } from 'lucide-react';

export function HeaderApp() {
    return (
        <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-extrabold">
                {import.meta.env.VITE_APP_NAME}
            </h1>
            <div>
                <BellIcon size={18} />
            </div>
        </div>
    );
}

export function HeaderSection({
    path = '/',
    title,
    rightNode,
    className,
    children,
}: {
    path?: string;
    title: string;
    rightNode?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className={cn(className, 'mb-10')}>
            <div className="fixed top-0 z-50 w-screen bg-white">
                <div className={cn('grid grid-cols-3 items-center gap-3 p-4')}>
                    <Link href={path} className="font-bold">
                        <ChevronLeftIcon />
                    </Link>
                    <h1 className="text-center font-semibold">{title}</h1>
                    {rightNode}
                </div>
            </div>
            {children}
        </div>
    );
}
