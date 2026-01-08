<?php

namespace App\Exports;

use App\Models\Mutation;
use Maatwebsite\Excel\Concerns\{FromCollection, WithHeadings, WithMapping};

class JournalExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $year;
    protected int $month;
    protected int $userId;

    public function __construct(int $year, int $month, int $userId)
    {
        $this->year = $year;
        $this->month = $month;
        $this->userId = $userId;
    }

    public function collection()
    {
        return Mutation::query()
            ->with(['wallet', 'mutable'])
            ->where('user_id', $this->userId)
            ->where(function ($query) {
                $query->whereMonth('created_at', $this->month);
                $query->whereYear('created_at', $this->year);
            })
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Date',
            'Description',
            'Account',
            'Debit',
            'Credit',
        ];
    }

    public function map($row): array
    {
        return [
            $row->created_at->format('Y-m-d'),
            $row->mutable->title ?? $row->description,
            $row->wallet->name ?? 'Unknown',
            $row->type === 'db' ? $row->amount : '-',
            $row->type === 'cr' ? $row->amount : '-',
        ];
    }
}
