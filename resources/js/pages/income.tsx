import { columns } from '@/components/columns/income.column';
import { DataTable } from '@/components/data-table';
import { DeleteConfirm } from '@/components/delete-confirm';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/utils';
import { dashboard } from '@/routes';
import income from '@/routes/income';
import {
    BreadcrumbItem,
    CategoryInterface,
    IncomeInterface,
    MetaPagination,
    SharedData,
    WalletInterface,
} from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { PlusCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Incomes',
        href: income.index().url,
    },
];

export default function Income({
    categories,
    wallets,
    incomes,
}: {
    categories: CategoryInterface[];
    wallets: WalletInterface[];
    incomes: MetaPagination<IncomeInterface>;
}) {
    const page = usePage().props as any as SharedData;
    const [showDialog, setShowDialog] = useState<{
        title: string;
        show: boolean;
        type: 1 | 2;
    }>({
        title: '',
        show: false,
        type: 1,
    });
    const [incomeSelected, setIncomeSelected] = useState<IncomeInterface>();
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    useEffect(() => {
        if (page.flash.success) {
            setShowDialog({
                title: '',
                show: false,
                type: 1,
            });
        }
        showToast(page.flash);
    }, [page.flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Incomes" />
            <Heading title="Incomes">
                <Button
                    onClick={() =>
                        setShowDialog({
                            title: 'New Income',
                            show: true,
                            type: 1,
                        })
                    }
                >
                    <PlusCircleIcon /> New Income
                </Button>
            </Heading>

            <DataTable
                columns={columns({
                    onDelete: (income: IncomeInterface) => {
                        setShowConfirm(true);
                        setIncomeSelected(income);
                    },
                    onEdit: (income: IncomeInterface) => {
                        setShowDialog({
                            title: 'Edit Income',
                            show: true,
                            type: 2,
                        });
                        setIncomeSelected(income);
                    },
                })}
                data={incomes.data}
            />

            <Dialog
                open={showDialog.show}
                onOpenChange={(e) => {
                    setShowDialog({ ...showDialog, show: e });
                }}
            >
                <DialogContent
                    className="space-y-5"
                    isShow={false}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>{showDialog.title}</DialogTitle>
                    </DialogHeader>

                    {showDialog.type == 2 && incomeSelected ? (
                        <Form
                            {...income.update.form({
                                income: incomeSelected.id,
                            })}
                            className="m-0"
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <FormIncome
                                    categories={categories}
                                    wallets={wallets}
                                    errors={errors}
                                    processing={processing}
                                    income={incomeSelected}
                                />
                            )}
                        </Form>
                    ) : (
                        <Form
                            {...income.store.form()}
                            className="m-0"
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <FormIncome
                                    categories={categories}
                                    wallets={wallets}
                                    errors={errors}
                                    processing={processing}
                                />
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {incomeSelected && showConfirm && (
                <DeleteConfirm
                    show={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    form={income.destroy.form({
                        income: incomeSelected.id,
                    })}
                />
            )}
        </AppLayout>
    );
}

function FormIncome({
    categories,
    wallets,
    errors,
    processing,
    income,
}: {
    categories: CategoryInterface[];
    wallets: WalletInterface[];
    errors: any;
    processing?: boolean;
    income?: IncomeInterface;
}) {
    return (
        <div className="space-y-5">
            <FieldGroup className="gap-3">
                <Field>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Select
                        name="category"
                        defaultValue={income?.category.id.toString()}
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
                    <FieldError>{errors.category}</FieldError>
                </Field>
                {!income && (
                    <Field>
                        <FieldLabel htmlFor="wallet">Wallet</FieldLabel>
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
                )}
                <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                        type="text"
                        name="title"
                        defaultValue={income?.title}
                    />
                    <FieldError>{errors.title}</FieldError>
                </Field>
                {!income && (
                    <Field>
                        <FieldLabel htmlFor="amount">Amount</FieldLabel>
                        <Input type="number" name="amount" />
                        <FieldError>{errors.amount}</FieldError>
                    </Field>
                )}
                <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Input
                        type="text"
                        name="description"
                        defaultValue={income?.description}
                    />
                    <FieldError>{errors.description}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="published_at">Published At</FieldLabel>
                    <Input
                        type="datetime-local"
                        name="published_at"
                        defaultValue={income?.published_at}
                    />
                    <FieldError>{errors.published_at}</FieldError>
                </Field>
            </FieldGroup>

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={'secondary'} disabled={processing}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                    Save {processing && <Spinner />}
                </Button>
            </DialogFooter>
        </div>
    );
}
