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
import debt from '@/routes/debt';
import income from '@/routes/income';
import reports from '@/routes/reports';
import transaction from '@/routes/transaction';
import wallet from '@/routes/wallet';
import walletTransfer from '@/routes/wallet-transfer';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    DownloadCloudIcon,
    LayoutDashboardIcon,
    ListCheckIcon,
    ReceiptTextIcon,
    ShoppingCartIcon,
    UploadCloudIcon,
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
    {
        title: 'Debts',
        href: '#',
        icon: UploadCloudIcon,
        children: [
            {
                title: 'Receivables',
                href: debt.receivables.index().url,
            },
            // {
            //     title: 'Indebtedness',
            //     href: debt.indebtedness.index().url,
            // },
        ],
    },
    // {
    //     title: 'Investmans',
    //     href: investman.index().url,
    //     icon: UploadCloudIcon,
    // },
    {
        title: 'Reports',
        href: '#',
        icon: ReceiptTextIcon,
        children: [
            {
                title: 'Journals',
                href: reports.journal.index().url,
            },
            {
                title: 'Mutations',
                href: reports.mutation().url,
            },
        ],
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
