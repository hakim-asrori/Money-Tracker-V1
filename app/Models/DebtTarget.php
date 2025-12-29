<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes};

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
        return $this->belongsTo(Debt::class)->withTrashed();
    }

    public function debtPayments()
    {
        return $this->hasMany(DebtPayment::class)->withTrashed();
    }

    public function mutation()
    {
        return $this->morphOne(Mutation::class, 'mutable')->withTrashed();
    }
}
