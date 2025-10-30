import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    flash: {
        success?: string;
        error?: string;
        warning?: string;
    };
    [key: string]: unknown;
}

export interface MetaPagination<T> {
    current_page: number;
    data: T[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

export interface CommonColumn {
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface User extends CommonColumn {
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
}

export interface CategoryInterface extends CommonColumn {
    name: string;
    type: number;
    type_desc: string;
    status: boolean;
}

export interface WalletInterface extends CommonColumn {
    name: string;
    balance: number;
    category: CategoryInterface;
}

export interface WalletTransferInterface extends CommonColumn {
    amount: number;
    fee: number;
    published_at: string;
    wallet_origin: WalletInterface;
    wallet_target: WalletInterface;
}

export interface IncomeInterface extends CommonColumn {
    title: string;
    amount: number;
    description: string;
    published_at: string;
    category: CategoryInterface;
    wallet: WalletInterface;
}

export interface TransactionInterface extends CommonColumn {
    title: string;
    amount: number;
    fee: number;
    description: string;
    published_at: string;
    category: CategoryInterface;
    wallet: WalletInterface;
}

export interface MutationInterface extends CommonColumn {
    type: 'cr' | 'db';
    last_balance: number;
    amount: number;
    current_balance: number;
    description: string;
    wallet: WalletInterface;
    mutable:
        | WalletInterface
        | TransactionInterface
        | DebtInterface
        | IncomeInterface
        | WalletTransferInterface;
}
