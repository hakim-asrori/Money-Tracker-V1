<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DebtTarget extends Model
{
    use SoftDeletes;

    const STATUS_UNPAID = 0;
    const STATUS_PAID = 1;

    protected $fillable = [
        'debt_id',
        'user_id',
        'name',
        'amount',
        'paid_amount',
        'remaining_amount',
        'status',
        'due_date',
    ];

    public function debt()
    {
        return $this->belongsTo(Debt::class);
    }

    public function debtPayments()
    {
        return $this->hasMany(DebtPayment::class);
    }

    public function mutation()
    {
        return $this->morphOne(Mutation::class, 'mutable');
    }
}
