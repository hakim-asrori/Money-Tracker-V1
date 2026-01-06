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
import { cn } from '@/lib/utils';
import income from '@/routes/income';
import { CategoryInterface, WalletInterface } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { SaveIcon } from 'lucide-react';

export default function Create({
    categories,
    wallet,
}: {
    categories: CategoryInterface[];
    wallet: WalletInterface;
}) {
    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Create Income" />

            <Form disableWhileProcessing {...income.store.form()}>
                {({ processing, errors }) => (
                    <>
                        <input type="hidden" name="wallet" value={wallet.id} />
                        <HeaderSection
                            title="Create Income"
                            path={income.index().url}
                            className={cn(
                                processing && '[&_a]:pointer-events-none',
                            )}
                        >
                            <span>&nbsp;</span>
                        </HeaderSection>

                        <FieldGroup className="gap-3 px-4">
                            <Field>
                                <FieldLabel htmlFor="category">
                                    Category
                                </FieldLabel>
                                <Select name="category" disabled={processing}>
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
                            <Field>
                                <FieldLabel>Title</FieldLabel>
                                <Input name="title" disabled={processing} />
                                <FieldError>{errors.title}</FieldError>
                            </Field>
                            <Field>
                                <FieldLabel>Amount</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        name="amount"
                                        disabled={processing}
                                        defaultValue={0}
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
                                <FieldLabel>Published at</FieldLabel>
                                <Input
                                    name="published_at"
                                    type="datetime-local"
                                    disabled={processing}
                                    max={format(new Date(), 'yyyy-MM-dd 23:59')}
                                />
                                <FieldError>{errors.published_at}</FieldError>
                            </Field>
                            <Field>
                                <div />
                                <Button
                                    disabled={processing}
                                    variant={'lprimary'}
                                >
                                    {processing ? <Spinner /> : <SaveIcon />}
                                    Save
                                </Button>
                            </Field>
                        </FieldGroup>
                    </>
                )}
            </Form>
        </AppMobileDetailLayout>
    );
}
