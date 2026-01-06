import { HeaderSection } from '@/components/mobiles/header';
import { Button } from '@/components/ui/button';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { showToast } from '@/lib/utils';
import receivables from '@/routes/debt/receivables';
import { SharedData, WalletInterface } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect } from 'react';

export default function Create({ wallet }: { wallet: WalletInterface }) {
    const page = usePage().props as any as SharedData;

    useEffect(() => {
        if (page.flash.warning || page.flash.error) {
            showToast(page.flash);
        }
    }, [page.flash]);

    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Debt Receivables" />
            <HeaderSection title="Create Debt" path={receivables.index().url}>
                <span>&nbsp;</span>
            </HeaderSection>

            <Form {...receivables.store.form()} className="px-4">
                {({ processing, errors }) => (
                    <FieldGroup className="gap-3">
                        <input type="hidden" name="fee" value={0} />
                        <input type="hidden" name="wallet" value={wallet.id} />
                        <Field>
                            <FieldLabel>Title</FieldLabel>
                            <Input name="title" disabled={processing} />
                            <FieldError>{errors.title}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Target Name</FieldLabel>
                            <Input name="target" disabled={processing} />
                            <FieldError>{errors.target}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Target Amount</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    name="amount"
                                    disabled={processing}
                                />
                                <InputGroupAddon>Rp</InputGroupAddon>
                            </InputGroup>
                            <FieldError>{errors.amount}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Description</FieldLabel>
                            <Textarea
                                name="description"
                                disabled={processing}
                            />
                            <FieldError>{errors.description}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Published At</FieldLabel>
                            <Input
                                type="datetime-local"
                                name="published_at"
                                disabled={processing}
                                max={format(new Date(), 'yyyy-MM-dd 23:59')}
                            />
                            <FieldError>{errors.published_at}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Due Date</FieldLabel>
                            <Input
                                type="datetime-local"
                                name="due_date"
                                disabled={processing}
                            />
                            <FieldError>{errors.due_date}</FieldError>
                        </Field>
                        <Field className="mt-2">
                            <Button variant={'lprimary'} disabled={processing}>
                                Create Debt {processing && <Spinner />}
                            </Button>
                        </Field>
                    </FieldGroup>
                )}
            </Form>
        </AppMobileDetailLayout>
    );
}
