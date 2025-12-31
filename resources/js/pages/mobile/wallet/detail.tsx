import { EmptyData } from '@/components/mobiles/empty';
import { HeaderSection } from '@/components/mobiles/header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CardWallet } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { cn, formatNumber, limitString, showToast } from '@/lib/utils';
import walletRouter from '@/routes/wallet';
import {
    CategoryInterface,
    MetaPagination,
    MutationInterface,
    SharedData,
    WalletInterface,
} from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowDownIcon, ArrowUpIcon, EditIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Wallet({
    wallet,
    mutations,
    categories,
}: {
    wallet: WalletInterface;
    mutations: MetaPagination<MutationInterface>;
    categories: CategoryInterface[];
}) {
    const page = usePage().props as any as SharedData;
    const [showDialog, setShowDialog] = useState({
        title: '',
        show: false,
        type: 1,
    });

    useEffect(() => {
        if (page.flash.success) {
            setShowDialog({
                ...showDialog,
                show: false,
            });
        }

        showToast(page.flash);
    }, [page.flash]);

    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Detail Wallet" />
            <HeaderSection
                title="Detail Wallet"
                path={walletRouter.index().url}
                rightNode={
                    <div
                        className="flex justify-end"
                        onClick={() =>
                            setShowDialog({
                                ...showDialog,
                                show: true,
                                title: 'Edit Wallet',
                            })
                        }
                    >
                        <EditIcon size={20} />
                    </div>
                }
            >
                <span>&nbsp;</span>
            </HeaderSection>

            <div className="space-y-5 px-4">
                <CardWallet wallet={wallet} />

                <div className="space-y-3">
                    {wallet.mutations.length < 1 ? (
                        EmptyData({ title: 'No history mutations' })
                    ) : (
                        <>
                            <h1 className="text-lg font-bold">
                                History Mutations
                            </h1>
                            <ScrollArea className="h-[60vh] py-2">
                                {mutations.data.map((mutation) => (
                                    <div
                                        className={cn(
                                            'mb-3 flex items-start justify-between gap-4 border-b pb-3',
                                        )}
                                        key={mutation.id}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                {mutation.type === 'cr' ? (
                                                    <AvatarFallback className="bg-green-200 text-green-700">
                                                        <ArrowDownIcon
                                                            size={20}
                                                        />
                                                    </AvatarFallback>
                                                ) : (
                                                    <AvatarFallback className="bg-red-200 text-red-700">
                                                        <ArrowUpIcon
                                                            size={20}
                                                        />
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div>
                                                <h1 className="text-sm font-bold">
                                                    {limitString(
                                                        mutation.description,
                                                        25,
                                                    )}
                                                </h1>
                                                <h1 className="text-xs">
                                                    {format(
                                                        mutation.created_at,
                                                        'dd MMM yyyy, HH:mm a',
                                                    )}
                                                </h1>
                                            </div>
                                        </div>
                                        <h1 className="text-lg font-bold">
                                            Rp {formatNumber(mutation.amount)}
                                        </h1>
                                    </div>
                                ))}
                            </ScrollArea>
                        </>
                    )}
                </div>
            </div>

            <Dialog
                open={showDialog.show}
                onOpenChange={(e) => setShowDialog({ ...showDialog, show: e })}
            >
                <DialogContent
                    onInteractOutside={(e) => e.preventDefault()}
                    isShow={false}
                >
                    <DialogHeader>
                        <DialogTitle>{showDialog.title}</DialogTitle>
                    </DialogHeader>
                    <Form {...walletRouter.update(wallet.id)}>
                        {({ errors, processing }) => (
                            <div className="space-y-4">
                                <FieldGroup className="gap-3">
                                    <Field>
                                        <FieldLabel htmlFor="category">
                                            Category
                                        </FieldLabel>
                                        <Select
                                            name="category"
                                            defaultValue={wallet.category.id.toString()}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.id.toString()}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>
                                            {errors.category}
                                        </FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="name">
                                            Name
                                        </FieldLabel>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={wallet.name}
                                        />
                                        <FieldError>{errors.name}</FieldError>
                                    </Field>
                                </FieldGroup>
                                <DialogFooter className="mb-0">
                                    <DialogClose asChild>
                                        <Button
                                            variant={'secondary'}
                                            disabled={processing}
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button disabled={processing}>
                                        Save {processing && <Spinner />}
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </AppMobileDetailLayout>
    );
}
