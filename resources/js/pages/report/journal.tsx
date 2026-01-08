import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import { formatNumber } from '@/lib/utils';
import { dashboard, journal } from '@/routes';
import { BreadcrumbItem, JournalInterface } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ChevronLeftIcon,
    DownloadIcon,
    InfoIcon,
    SendHorizonalIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Reports',
        href: journal().url,
    },
    {
        title: 'Journals',
        href: journal().url,
    },
];

export default function Journal({
    journals,
    type,
}: {
    journals: JournalInterface[];
    type: 'ready' | 'not-ready' | 'empty';
}) {
    const currentYear = new Date().getFullYear();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journals" />
            <Heading title="Journals">
                <div className="space-x-2">
                    {(type === 'ready' || type === 'empty') && (
                        <Button variant={'outline'} asChild>
                            <Link href={journal().url}>
                                <ChevronLeftIcon /> Back
                            </Link>
                        </Button>
                    )}
                    {type === 'ready' && (
                        <Button>
                            <DownloadIcon /> Download
                        </Button>
                    )}
                </div>
            </Heading>

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
                                            ? `Rp ${formatNumber(item.debet)}`
                                            : '-'}
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        {item.credit !== '-'
                                            ? `Rp ${formatNumber(item.credit)}`
                                            : '-'}
                                    </TableCell>
                                </TableRow>
                            )),
                        )}
                    </TableBody>
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
