import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { MetaPaginationWithoutData } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    className,
    pagination,
    perPages = [10, 20, 30, 40, 50],
    changePerPage,
    changePage,
    showRowsPerPage = false,
}: {
    className?: string;
    pagination: MetaPaginationWithoutData;
    perPages?: number[];
    changePerPage?: (page: number) => void;
    changePage?: (page: number) => void;
    showRowsPerPage?: boolean;
}) {
    return (
        <div
            className={cn(
                className,
                'flex flex-col items-start justify-between gap-5 md:flex-row md:items-center',
            )}
        >
            <p className="w-full flex-1 text-center text-sm text-muted-foreground md:text-left">
                {pagination.from} - {pagination.to} of {pagination.total} rows
                selected.
            </p>
            <div className="flex w-full items-center justify-between space-x-6 md:w-auto md:justify-end lg:space-x-8">
                {showRowsPerPage && (
                    <div className="flex items-center gap-3 space-x-2">
                        <p className="hidden text-sm font-medium md:block">
                            Rows per page
                        </p>
                        <Select
                            value={String(pagination.per_page)}
                            onValueChange={(value) => {
                                changePerPage?.(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {perPages.map((pageSize) => (
                                    <SelectItem
                                        key={pageSize}
                                        value={`${pageSize}`}
                                    >
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {pagination.current_page} of {pagination.last_page}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        disabled={pagination.current_page < 2}
                        onClick={() =>
                            changePage?.(pagination.current_page - 1)
                        }
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        disabled={
                            pagination.current_page === pagination.last_page
                        }
                        onClick={() =>
                            changePage?.(pagination.current_page + 1)
                        }
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
