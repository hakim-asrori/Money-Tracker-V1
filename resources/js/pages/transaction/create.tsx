import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/utils';
import { dashboard } from '@/routes';
import transaction from '@/routes/transaction';
import {
    BreadcrumbItem,
    CategoryInterface,
    SharedData,
    User,
    WalletInterface,
} from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ChevronLeftIcon, PlusIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Transactions',
        href: transaction.index().url,
    },
    {
        title: 'New Transaction',
        href: transaction.create().url,
    },
];

export default function CreateTransaction({
    wallets,
    categories,
    users,
}: {
    wallets: WalletInterface[];
    categories: CategoryInterface[];
    users: User[];
}) {
    const page = usePage().props as any as SharedData;

    useEffect(() => {
        if (page.flash.error || page.flash.warning) {
            showToast(page.flash);
        }
    }, [page.flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Transaction" />
            <Heading title="New Transaction">
                <Button variant={'outline'} asChild>
                    <Link href={transaction.index()}>
                        <ChevronLeftIcon /> Back
                    </Link>
                </Button>
            </Heading>

            <Form
                {...transaction.store.form()}
                className="m-0"
                disableWhileProcessing
            >
                {({ processing, errors }) => (
                    <div className="space-y-5">
                        <Card>
                            <CardHeader>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="category">
                                            Category
                                        </FieldLabel>
                                        <Select name="category">
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
                                        <FieldLabel htmlFor="wallet">
                                            Wallet
                                        </FieldLabel>
                                        <Select name="wallet">
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wallets.map((wallet) => (
                                                    <SelectItem
                                                        key={wallet.id}
                                                        value={wallet.id.toString()}
                                                    >
                                                        {wallet.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{errors.wallet}</FieldError>
                                    </Field>
                                    <Field className="md:col-span-full">
                                        <FieldLabel htmlFor="title">
                                            Title
                                        </FieldLabel>
                                        <Input type="text" name="title" />
                                        <FieldError>{errors.title}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="amount">
                                            Amount
                                        </FieldLabel>
                                        <Input type="number" name="amount" />
                                        <FieldError>{errors.amount}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="fee">
                                            Fee
                                        </FieldLabel>
                                        <Input
                                            type="number"
                                            name="fee"
                                            defaultValue={0}
                                        />
                                        <FieldError>{errors.fee}</FieldError>
                                    </Field>
                                    <Field className="md:col-span-full">
                                        <FieldLabel htmlFor="description">
                                            Description
                                        </FieldLabel>
                                        <Input type="text" name="description" />
                                        <FieldError>
                                            {errors.description}
                                        </FieldError>
                                    </Field>
                                    <Field className="md:col-span-full">
                                        <FieldLabel htmlFor="published_at">
                                            Published At
                                        </FieldLabel>
                                        <Input
                                            type="datetime-local"
                                            name="published_at"
                                        />
                                        <FieldError>
                                            {errors.published_at}
                                        </FieldError>
                                    </Field>
                                </div>
                            </CardHeader>
                        </Card>

                        <FormSplitBill users={users} errors={errors} />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                Save {processing && <Spinner />}
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </AppLayout>
    );
}

function FormSplitBill({ users, errors }: { users: User[]; errors: any }) {
    const [useSplitBill, setUseSplitBill] = useState(false);
    const [targets, setTargets] = useState<
        { id: string; user_id?: number; name: string; amount: number }[]
    >([{ id: window.crypto.randomUUID(), name: '', amount: 0 }]);

    type TargetError = {
        [field: string]: string;
    };
    const parsedErrors = Object.entries(errors).reduce<TargetError[]>(
        (acc, [key, value]) => {
            const parts = key.split('.'); // ["targets", "0", "name"]

            if (parts[0] === 'targets') {
                const index = Number(parts[1]);
                const field = parts[2];

                if (!acc[index]) acc[index] = {};
                acc[index][field] = value as string;
            }

            return acc;
        },
        [],
    );

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div className="space-y-1">
                    <FieldLabel htmlFor="published_at">
                        Use Split Bill
                    </FieldLabel>
                    <Switch
                        name="is_debt"
                        value={useSplitBill ? '1' : '0'}
                        defaultValue={'0'}
                        onCheckedChange={(e) => setUseSplitBill(e)}
                    />
                    <FieldError>{errors.is_debt}</FieldError>
                </div>
                {useSplitBill && (
                    <div>
                        <Button
                            type="button"
                            variant={'outline'}
                            onClick={() =>
                                setTargets([
                                    ...targets,
                                    {
                                        id: window.crypto.randomUUID(),
                                        name: '',
                                        amount: 0,
                                    },
                                ])
                            }
                        >
                            <PlusIcon /> Add Target
                        </Button>
                    </div>
                )}
            </CardHeader>
            {useSplitBill && (
                <CardContent>
                    {JSON.stringify(errors.targets)}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Amount</TableHead>
                                {targets.length > 1 && <TableHead></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {targets.map((target, index) => (
                                <TableRow key={target.id}>
                                    <TableCell>
                                        <Input
                                            type="text"
                                            name={`targets[${index}][name]`}
                                        />
                                        <FieldError>
                                            {parsedErrors[index]?.name}
                                        </FieldError>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            name={`targets[${index}][amount]`}
                                        />
                                        <FieldError>
                                            {parsedErrors[index]?.amount}
                                        </FieldError>
                                    </TableCell>
                                    {targets.length > 1 && (
                                        <TableCell className="text-end">
                                            <Button
                                                size={'sm'}
                                                variant={'destructive'}
                                                onClick={() => {
                                                    setTargets((prevs) =>
                                                        prevs.filter(
                                                            (_, i) =>
                                                                _.id !==
                                                                target.id,
                                                        ),
                                                    );
                                                }}
                                            >
                                                <XIcon />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            )}
        </Card>
    );
}
