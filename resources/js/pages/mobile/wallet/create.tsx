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
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { cn } from '@/lib/utils';
import wallet from '@/routes/wallet';
import { CategoryInterface } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { SaveIcon } from 'lucide-react';

export default function Wallet({
    categories,
}: {
    categories: CategoryInterface[];
}) {
    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Create Wallet" />
            <Form disableWhileProcessing {...wallet.store.form()}>
                {({ processing, errors }) => (
                    <>
                        <HeaderSection
                            title="Create Wallet"
                            path={wallet.index().url}
                            className={cn(
                                processing && '[&_a]:pointer-events-none',
                            )}
                        >
                            <span>&nbsp;</span>
                        </HeaderSection>
                        <div className="px-4">
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
                                    <FieldError>{errors.category}</FieldError>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="name">Name</FieldLabel>
                                    <Input
                                        id="name"
                                        name="name"
                                        disabled={processing}
                                    />
                                    <FieldError>{errors.name}</FieldError>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="balance">
                                        Last Balance
                                    </FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            id="balance"
                                            name="balance"
                                            disabled={processing}
                                            defaultValue={0}
                                            type="number"
                                        />
                                        <InputGroupAddon>Rp</InputGroupAddon>
                                    </InputGroup>
                                    <FieldError>{errors.balance}</FieldError>
                                </Field>
                                <Field>
                                    <Button disabled={processing}>
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <SaveIcon />
                                        )}
                                        Save
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </div>
                    </>
                )}
            </Form>
        </AppMobileDetailLayout>
    );
}
