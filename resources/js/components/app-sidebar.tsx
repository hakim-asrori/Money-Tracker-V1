import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import category from '@/routes/category';
import income from '@/routes/income';
import mutation from '@/routes/mutation';
import transaction from '@/routes/transaction';
import wallet from '@/routes/wallet';
import walletTransfer from '@/routes/wallet-transfer';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    ArrowLeftRightIcon,
    BookOpen,
    DownloadCloudIcon,
    Folder,
    LayoutDashboardIcon,
    ListCheckIcon,
    ShoppingCartIcon,
    Wallet2Icon,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutDashboardIcon,
    },
    {
        title: 'Categories',
        href: category.index().url,
        icon: ListCheckIcon,
    },
    {
        title: 'Wallet',
        href: '#',
        icon: Wallet2Icon,
        children: [
            {
                title: 'List',
                href: wallet.index().url,
            },
            {
                title: 'Transfer',
                href: walletTransfer.index().url,
            },
        ],
    },
    {
        title: 'Incomes',
        href: income.index().url,
        icon: DownloadCloudIcon,
    },
    {
        title: 'Transactions',
        href: transaction.index().url,
        icon: ShoppingCartIcon,
    },
    // {
    //     title: 'Debts',
    //     href: debt.index().url,
    //     icon: UploadCloudIcon,
    // },
    // {
    //     title: 'Investmans',
    //     href: investman.index().url,
    //     icon: UploadCloudIcon,
    // },
    {
        title: 'Mutations',
        href: mutation.index().url,
        icon: ArrowLeftRightIcon,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
