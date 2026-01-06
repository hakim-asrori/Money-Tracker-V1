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
import incomeRouter from '@/routes/income';
import { CategoryInterface, IncomeInterface } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { SaveIcon } from 'lucide-react';

export default function Edit({
    categories,
    income,
}: {
    categories: CategoryInterface[];
    income: IncomeInterface;
}) {
    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Edit Income" />

            <Form disableWhileProcessing {...incomeRouter.update.form(income)}>
                {({ processing, errors }) => (
                    <>
                        <HeaderSection
                            title="Edit Income"
                            path={incomeRouter.index().url}
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
                                <Select
                                    name="category"
                                    disabled={processing}
                                    defaultValue={income.category.id.toString()}
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
                            <Field>
                                <FieldLabel>Title</FieldLabel>
                                <Input
                                    name="title"
                                    disabled={processing}
                                    defaultValue={income.title}
                                />
                                <FieldError>{errors.title}</FieldError>
                            </Field>
                            <Field>
                                <FieldLabel>Description</FieldLabel>
                                <Textarea
                                    name="description"
                                    disabled={processing}
                                    defaultValue={income.description}
                                />
                                <FieldError>{errors.description}</FieldError>
                            </Field>
                            <Field>
                                <FieldLabel>Published at</FieldLabel>
                                <Input
                                    name="published_at"
                                    type="datetime-local"
                                    disabled={processing}
                                    defaultValue={income.published_at}
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
