import InputError from '@/components/input-error';
import { HeaderSection } from '@/components/mobiles/header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
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
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { cn, formatNumber, showToast } from '@/lib/utils';
import transaction from '@/routes/transaction';
import { CategoryInterface, SharedData, WalletInterface } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { UserPlusIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CreateTransaction({
    wallet,
    categories,
}: {
    wallet: WalletInterface;
    categories: CategoryInterface[];
}) {
    const page = usePage().props as any as SharedData;
    const [amount, setAmount] = useState<number>(0);
    const [fee, setFee] = useState<number>(0);
    const [targets, setTargets] = useState<
        { id: string; user_id?: number; name: string; amount: number }[]
    >([]);
    const [open, setOpen] = useState(false);

    const handleAddTarget = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        if (Number(formData.get('amount')) < 1) {
            toast.error('Amount must be greater than 0');
            return;
        }

        setTargets((prev) => {
            const name = formData.get('name') as string;
            const amount = Number(formData.get('amount'));

            // 1. Cek apakah nama sudah ada (case-insensitive)
            const isExist = prev.find(
                (t) => t.name.toLowerCase() === name.toLowerCase(),
            );

            if (isExist) {
                // 2. Jika ADA: Gunakan map untuk update amount pada item yang sesuai
                return prev.map((target) =>
                    target.name.toLowerCase() === name.toLowerCase()
                        ? { ...target, amount: amount } // atau target.amount + amount jika ingin ditambah
                        : target,
                );
            }

            // 3. Jika TIDAK ADA: Buat objek baru dan gabungkan ke array
            const newData = {
                id: window.crypto.randomUUID(),
                name: name,
                amount: amount,
            };

            return [...prev, newData];
        });

        setOpen(false);
        e.currentTarget.reset();
    };

    useEffect(() => {
        if (page.flash.error || page.flash.warning) {
            showToast(page.flash);
        }
    }, [page.flash]);

    return (
        <AppMobileDetailLayout className="relative min-h-svh space-y-4 bg-secondary">
            <Head title="Transaction" />
            <HeaderSection
                title="Transaction"
                path={transaction.index().url}
                rightNode={
                    <div
                        className="flex justify-end"
                        onClick={() => {
                            setOpen(true);
                        }}
                    >
                        <UserPlusIcon size={20} />
                    </div>
                }
            >
                <span>&nbsp;</span>
            </HeaderSection>

            <Card className="-mt-3 rounded-none border-0">
                <CardHeader>
                    <CardTitle className="text-sm">Source of Funding</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                            <AvatarFallback className="text-lprimary">
                                {wallet.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="line-clamp-1 font-bold capitalize">
                                {wallet.name}
                            </h1>
                            <p className="text-sm">
                                Rp {formatNumber(wallet.balance)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Form
                {...transaction.store.form()}
                disableWhileProcessing
                className={cn(
                    'space-y-4',
                    targets.length < 1 ? 'pb-14' : 'pb-20',
                )}
            >
                {({ processing, errors }) => (
                    <>
                        <input type="hidden" name="wallet" value={wallet.id} />
                        <Card className="rounded-none border-0">
                            <CardContent>
                                <FieldGroup className="gap-3">
                                    <Field>
                                        <FieldLabel htmlFor="category">
                                            Category
                                        </FieldLabel>
                                        <Select
                                            name="category"
                                            disabled={processing}
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
                                        <FieldLabel>Title</FieldLabel>
                                        <Input
                                            name="title"
                                            disabled={processing}
                                        />
                                        <FieldError>{errors.title}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Amount</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                name="amount"
                                                disabled={processing}
                                                defaultValue={0}
                                                onChange={(e) => {
                                                    if (
                                                        isNaN(
                                                            parseInt(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    ) {
                                                        setAmount(0);
                                                        return;
                                                    }
                                                    setAmount(
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    );
                                                }}
                                            />
                                            <InputGroupAddon>
                                                Rp
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <FieldError>{errors.amount}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Fee</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                name="fee"
                                                disabled={processing}
                                                defaultValue={0}
                                                onChange={(e) => {
                                                    if (
                                                        isNaN(
                                                            parseInt(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    ) {
                                                        setFee(0);
                                                        return;
                                                    }
                                                    setFee(
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    );
                                                }}
                                            />
                                            <InputGroupAddon>
                                                Rp
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <FieldError>{errors.fee}</FieldError>
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>
                        <Card className="rounded-none border-0">
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Published At
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    type="datetime-local"
                                    name="published_at"
                                    disabled={processing}
                                    max={format(new Date(), 'yyyy-MM-dd 23:59')}
                                />
                                <InputError message={errors.published_at} />
                            </CardContent>
                        </Card>
                        <Card className="rounded-none border-0">
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    name="description"
                                    disabled={processing}
                                />
                                <InputError message={errors.description} />
                            </CardContent>
                        </Card>
                        {targets.length > 0 && (
                            <Card className="rounded-none border-0">
                                <input type="hidden" name="is_debt" value="1" />
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Split Bill ({targets.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-decimal space-y-2 pl-6">
                                        {targets.map((target, index) => (
                                            <li
                                                key={target.id}
                                                className="text-sm capitalize"
                                            >
                                                <input
                                                    type="hidden"
                                                    name={`targets[${index}][name]`}
                                                    value={target.name}
                                                />
                                                <input
                                                    type="hidden"
                                                    name={`targets[${index}][amount]`}
                                                    value={target.amount}
                                                />
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p>{target.name}</p>
                                                        <h1 className="font-bold">
                                                            Rp{' '}
                                                            {formatNumber(
                                                                target.amount,
                                                            )}
                                                        </h1>
                                                    </div>
                                                    <XIcon
                                                        size={16}
                                                        className="text-destructive"
                                                        onClick={() => {
                                                            if (processing) {
                                                                return;
                                                            }

                                                            setTargets(
                                                                targets.filter(
                                                                    (t) =>
                                                                        t.id !==
                                                                        target.id,
                                                                ),
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                        <Card className="fixed bottom-0 w-full rounded-none">
                            <CardHeader>
                                <h1 className="text-sm">
                                    Total:{' '}
                                    <span className="text-base font-bold">
                                        Rp {formatNumber(amount + fee)}
                                    </span>
                                </h1>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    className="w-full"
                                    variant={'lprimary'}
                                    disabled={processing || amount + fee < 1}
                                >
                                    Create Transaction{' '}
                                    {processing && <Spinner />}
                                </Button>
                            </CardContent>
                        </Card>
                    </>
                )}
            </Form>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Add Target for Split Bill</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => handleAddTarget(e)}
                        className="space-y-4"
                    >
                        <FieldGroup className="gap-3">
                            <Field>
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input name="name" required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="amount">Amount</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        type="number"
                                        inputMode="numeric"
                                        name="amount"
                                        defaultValue={0}
                                        required
                                        min={1}
                                    />
                                    <InputGroupAddon>Rp</InputGroupAddon>
                                </InputGroup>
                            </Field>
                        </FieldGroup>
                        <DialogFooter>
                            <Button variant={'lprimary'}>Add Target</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppMobileDetailLayout>
    );
}
