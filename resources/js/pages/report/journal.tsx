import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn, formatNumber } from '@/lib/utils';
import { dashboard } from '@/routes';
import reports from '@/routes/reports';
import { BreadcrumbItem, JournalInterface, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ChevronLeftIcon,
    DownloadIcon,
    InfoIcon,
    SendHorizonalIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Reports',
        href: reports.journal.index().url,
    },
    {
        title: 'Journals',
        href: reports.journal.index().url,
    },
];

export default function Journal({
    journals,
    type,
}: {
    journals: JournalInterface[];
    type: 'ready' | 'not-ready' | 'empty';
}) {
    const urlSearchString = window.location.search;
    const params = new URLSearchParams(urlSearchString);

    const currentYear = new Date().getFullYear();
    const page = usePage().props as any as SharedData;

    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (page.errors && Object.keys(page.errors).length > 0) {
            setErrors(Object.values(page.errors));
        }
    }, [page.errors]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journals" />
            <Heading title="Journals">
                <div className="flex items-center space-x-2">
                    {(type === 'ready' || type === 'empty') && (
                        <Button variant={'outline'} asChild>
                            <Link href={reports.journal.index().url}>
                                <ChevronLeftIcon /> Back
                            </Link>
                        </Button>
                    )}
                    {type === 'ready' && (
                        <a
                            className={cn(buttonVariants({}))}
                            href={
                                reports.journal.export(
                                    { type: 'excel' },
                                    {
                                        mergeQuery: {
                                            year: params.get('year'),
                                            month: params.get('month'),
                                        },
                                    },
                                ).url
                            }
                            target="_blank"
                        >
                            <DownloadIcon /> Download
                        </a>
                    )}
                </div>
            </Heading>

            {errors.length > 0 && (
                <Alert variant="destructive">
                    <InfoIcon className="mr-2 h-4 w-4" />
                    <AlertDescription>
                        {errors.map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </AlertDescription>
                </Alert>
            )}

            {type === 'ready' ? (
                <Table>
                    <TableHeader className="bg-accent [&_th]:border [&_th]:text-center [&_th]:font-bold">
                        <TableRow>
                            <TableHead rowSpan={2}>Date</TableHead>
                            <TableHead rowSpan={2}>Description</TableHead>
                            <TableHead rowSpan={2}>Account</TableHead>
                            <TableHead colSpan={2}>Balance</TableHead>
                        </TableRow>
                        <TableRow>
                            <TableHead>Debit</TableHead>
                            <TableHead>Credit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="[&_td]:border [&_th]:border">
                        {Object.values(journals).map((journal) =>
                            journal.items.map((item, index) => (
                                <TableRow key={`${journal.date}-${index}`}>
                                    {index === 0 && (
                                        <TableHead
                                            rowSpan={journal.items.length}
                                            className="align-middle"
                                        >
                                            {journal.date}
                                        </TableHead>
                                    )}

                                    <TableCell className="capitalize">
                                        {item.description}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {item.wallet}
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        {item.debet !== '-'
                                            ? `${formatNumber(item.debet)}`
                                            : '-'}
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        {item.credit !== '-'
                                            ? `${formatNumber(item.credit)}`
                                            : '-'}
                                    </TableCell>
                                </TableRow>
                            )),
                        )}
                    </TableBody>
                    {/* <TableFooter>
                        <TableRow>
                            <TableHead className="font-bold">Total</TableHead>
                        </TableRow>
                    </TableFooter> */}
                </Table>
            ) : type === 'empty' ? (
                <Alert variant={'destructive'}>
                    <InfoIcon />
                    <AlertDescription>
                        No journal found for the selected period
                    </AlertDescription>
                </Alert>
            ) : (
                <form action="">
                    <Card>
                        <CardHeader>
                            <CardTitle>Choose Period</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup className="gap-4">
                                <Field>
                                    <FieldLabel>Month</FieldLabel>
                                    <Select name="month">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from(
                                                { length: 12 },
                                                (_, index) => index + 1,
                                            ).map((month) => (
                                                <SelectItem
                                                    key={month}
                                                    value={String(month)}
                                                >
                                                    {new Date(
                                                        currentYear,
                                                        month - 1,
                                                    ).toLocaleString('en', {
                                                        month: 'long',
                                                    })}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel>Year</FieldLabel>
                                    <Select name="year">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from(
                                                {
                                                    length:
                                                        currentYear - 2025 + 1,
                                                },
                                                (_, index) =>
                                                    currentYear - index,
                                            ).map((year) => (
                                                <SelectItem
                                                    key={year}
                                                    value={String(year)}
                                                >
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </FieldGroup>
                        </CardContent>
                        <CardFooter>
                            <Button>
                                Send <SendHorizonalIcon />
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            )}
        </AppLayout>
    );
}
