import { columns } from '@/components/columns/receivable.column';
import { DataTable } from '@/components/data-table';
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
import debt from '@/routes/debt';
import {
    BreadcrumbItem,
    DebtInterface,
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
        title: 'Debts',
        href: debt.receivables.index().url,
    },
];

export default function Debt({
    title,
    debts,
    wallets,
}: {
    title: string;
    debts: MetaPagination<DebtInterface>;
    wallets: WalletInterface[];
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
    const [debtSelected, setDebtSelected] = useState<DebtInterface>();
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    const onEdit = (debt: DebtInterface) => {
        setShowDialog({
            title: 'Edit Debt',
            show: true,
            type: 2,
        });
        // setIncomeSelected(income);
    };

    const onDelete = (debt: DebtInterface) => {
        setShowConfirm(true);
        // setIncomeSelected(income);
    };

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
            <Head title={title} />
            <Heading title={title}>
                <Button
                    onClick={() =>
                        setShowDialog({
                            title: 'Create New Receivable',
                            show: true,
                            type: 1,
                        })
                    }
                >
                    <PlusCircleIcon /> New Receivable
                </Button>
            </Heading>

            <DataTable
                data={debts.data}
                columns={columns({
                    onDelete,
                    onEdit,
                })}
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

                    {showDialog.type == 2 && debtSelected ? (
                        <Form
                            {...debt.receivables.update.form({
                                receivable: debtSelected.id,
                            })}
                            className="m-0"
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <FormDebt
                                    wallets={wallets}
                                    errors={errors}
                                    processing={processing}
                                    debt={debtSelected}
                                />
                            )}
                        </Form>
                    ) : (
                        <Form
                            {...debt.receivables.store.form()}
                            className="m-0"
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <FormDebt
                                    wallets={wallets}
                                    errors={errors}
                                    processing={processing}
                                />
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function FormDebt({
    wallets,
    errors,
    processing,
    debt,
}: {
    wallets: WalletInterface[];
    errors: any;
    processing: boolean;
    debt?: DebtInterface;
}) {
    return (
        <div className="space-y-5">
            <FieldGroup className="gap-3">
                {!debt && (
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
                        defaultValue={debt?.title}
                    />
                    <FieldError>{errors.title}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="target">Target Name</FieldLabel>
                    <Input
                        type="text"
                        name="target"
                        defaultValue={debt?.target.name}
                    />
                    <FieldError>{errors.target}</FieldError>
                </Field>
                {!debt && (
                    <>
                        <Field>
                            <FieldLabel htmlFor="amount">
                                Target Amount
                            </FieldLabel>
                            <Input
                                type="number"
                                name="amount"
                                defaultValue={'0'}
                            />
                            <FieldError>{errors.amount}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="fee">Fee</FieldLabel>
                            <Input
                                type="number"
                                name="fee"
                                defaultValue={'0'}
                            />
                            <FieldError>{errors.fee}</FieldError>
                        </Field>
                    </>
                )}
                <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Input
                        type="text"
                        name="description"
                        defaultValue={debt?.description}
                    />
                    <FieldError>{errors.description}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="published_at">Published At</FieldLabel>
                    <Input
                        type="datetime-local"
                        name="published_at"
                        defaultValue={debt?.published_at}
                    />
                    <FieldError>{errors.published_at}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
                    <Input
                        type="datetime-local"
                        name="due_date"
                        defaultValue={debt?.target.due_date}
                    />
                    <FieldError>{errors.due_date}</FieldError>
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
