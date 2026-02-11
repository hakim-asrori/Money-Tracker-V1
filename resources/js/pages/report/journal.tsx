import Heading from '@/components/heading';
import { buttonVariants } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn, formatNumber } from '@/lib/utils';
import { dashboard } from '@/routes';
import reports from '@/routes/reports';
import { BreadcrumbItem, JournalEntryInterface } from '@/types';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { DownloadIcon } from 'lucide-react';

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
    summary,
}: {
    journals: JournalEntryInterface[];
    summary: {
        totalDebit: number;
        totalCredit: number;
    };
}) {
    const urlSearchString = window.location.search;
    const params = new URLSearchParams(urlSearchString);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journals" />
            <Heading title="Journals">
                <div className="flex items-center space-x-2">
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
                </div>
            </Heading>

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
                    {journals.map((journal) =>
                        journal.lines.map((line, index) => (
                            <TableRow key={journal.id}>
                                {index === 0 && (
                                    <TableHead
                                        rowSpan={journal.lines.length}
                                        className="align-middle"
                                    >
                                        {format(
                                            journal.journal_date,
                                            'dd MMMM yyyy',
                                        )}
                                    </TableHead>
                                )}

                                <TableCell className="capitalize">
                                    {line.account.name}
                                </TableCell>
                                <TableCell className="capitalize">
                                    {line.account.code}
                                </TableCell>
                                <TableHead>
                                    {line.debit
                                        ? `${formatNumber(line.debit)}`
                                        : '-'}
                                </TableHead>
                                <TableHead>
                                    {line.credit
                                        ? `${formatNumber(line.credit)}`
                                        : '-'}
                                </TableHead>
                            </TableRow>
                        )),
                    )}
                </TableBody>
                <TableFooter className="[&_td]:border [&_th]:border">
                    <TableRow>
                        <TableHead colSpan={3}>Total</TableHead>
                        <TableHead>
                            {formatNumber(summary.totalDebit)}
                        </TableHead>
                        <TableHead>
                            {formatNumber(summary.totalCredit)}
                        </TableHead>
                    </TableRow>
                </TableFooter>
            </Table>
        </AppLayout>
    );
}
