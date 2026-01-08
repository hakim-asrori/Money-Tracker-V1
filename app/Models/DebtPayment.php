<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes};

class DebtPayment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'debt_target_id',
        'wallet_origin_id',
        'wallet_target_id',
        'user_id',
        'amount',
        'note',
        'paid_at'
    ];

    protected $casts = [
        'paid_at' => 'datetime'
    ];

    public function walletOrigin()
    {
        return $this->belongsTo(Wallet::class, 'wallet_origin_id')->withTrashed();
    }

    public function walletTarget()
    {
        return $this->belongsTo(Wallet::class, 'wallet_target_id')->withTrashed();
    }

    public function mutation()
    {
        return $this->morphOne(Mutation::class, 'mutable')->withTrashed();
    }
}
