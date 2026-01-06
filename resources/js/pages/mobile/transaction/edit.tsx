import { HeaderSection } from '@/components/mobiles/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { cn, showToast } from '@/lib/utils';
import transactionRouter from '@/routes/transaction';
import { CategoryInterface, SharedData, TransactionInterface } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect } from 'react';

export default function EditTransaction({
    categories,
    transaction,
}: {
    categories: CategoryInterface[];
    transaction: TransactionInterface;
}) {
    const page = usePage().props as any as SharedData;

    useEffect(() => {
        if (page.flash.error || page.flash.warning) {
            showToast(page.flash);
        }
    }, [page.flash]);

    return (
        <AppMobileDetailLayout className="relative min-h-svh space-y-4">
            <Head title="Edit Transaction" />
            <Form
                {...transactionRouter.update.form(transaction)}
                disableWhileProcessing
                className={cn('pb-10')}
            >
                {({ processing, errors }) => (
                    <>
                        <HeaderSection
                            title="Edit"
                            path={transactionRouter.index().url}
                            className={cn(
                                processing && '[&_a]:pointer-events-none',
                            )}
                        >
                            <span>&nbsp;</span>
                        </HeaderSection>

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
                                            defaultValue={transaction.category.id.toString()}
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
                                            defaultValue={transaction.title}
                                        />
                                        <FieldError>{errors.title}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Published At</FieldLabel>
                                        <Input
                                            type="datetime-local"
                                            name="published_at"
                                            disabled={processing}
                                            max={format(
                                                new Date(),
                                                'yyyy-MM-dd 23:59',
                                            )}
                                            defaultValue={format(
                                                transaction.published_at,
                                                'yyyy-MM-dd HH:mm',
                                            )}
                                        />
                                        <FieldError>
                                            {errors.published_at}
                                        </FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Description</FieldLabel>
                                        <Textarea
                                            name="description"
                                            disabled={processing}
                                            defaultValue={
                                                transaction.description
                                            }
                                        />
                                        <FieldError>
                                            {errors.description}
                                        </FieldError>
                                    </Field>
                                    <Field>
                                        <Button
                                            className="w-full"
                                            variant={'lprimary'}
                                            disabled={processing}
                                        >
                                            Update Transaction{' '}
                                            {processing && <Spinner />}
                                        </Button>
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>
                    </>
                )}
            </Form>
        </AppMobileDetailLayout>
    );
}
