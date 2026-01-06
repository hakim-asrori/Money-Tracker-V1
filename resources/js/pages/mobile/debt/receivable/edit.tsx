import { HeaderSection } from '@/components/mobiles/header';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { showToast } from '@/lib/utils';
import receivables from '@/routes/debt/receivables';
import { DebtInterface, SharedData } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect } from 'react';

export default function Edit({ receivable }: { receivable: DebtInterface }) {
    const page = usePage().props as any as SharedData;

    useEffect(() => {
        if (page.flash.warning || page.flash.error) {
            showToast(page.flash);
        }
    }, [page.flash]);

    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Debt Receivables" />
            <HeaderSection title="Edit Debt" path={receivables.index().url}>
                <span>&nbsp;</span>
            </HeaderSection>

            <Form {...receivables.update.form(receivable)} className="px-4">
                {({ processing, errors }) => (
                    <FieldGroup className="gap-3">
                        <Field>
                            <FieldLabel>Title</FieldLabel>
                            <Input
                                name="title"
                                disabled={processing}
                                defaultValue={receivable.title}
                            />
                            <FieldError>{errors.title}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Target Name</FieldLabel>
                            <Input
                                name="target"
                                disabled={processing}
                                defaultValue={receivable.target.name}
                            />
                            <FieldError>{errors.target}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Description</FieldLabel>
                            <Textarea
                                name="description"
                                disabled={processing}
                                defaultValue={receivable.description}
                            />
                            <FieldError>{errors.description}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Published At</FieldLabel>
                            <Input
                                type="datetime-local"
                                name="published_at"
                                disabled={processing}
                                defaultValue={receivable.published_at}
                                max={format(new Date(), 'yyyy-MM-dd 23:59')}
                            />
                            <FieldError>{errors.published_at}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Due Date</FieldLabel>
                            <Input
                                type="datetime-local"
                                name="due_date"
                                defaultValue={receivable.target.due_date}
                                disabled={processing}
                            />
                            <FieldError>{errors.due_date}</FieldError>
                        </Field>
                        <Field className="mt-2">
                            <Button variant={'lprimary'} disabled={processing}>
                                Update Debt {processing && <Spinner />}
                            </Button>
                        </Field>
                    </FieldGroup>
                )}
            </Form>
        </AppMobileDetailLayout>
    );
}
