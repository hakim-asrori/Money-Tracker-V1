<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mutation extends Model
{
    const TYPE_CR = 'cr';
    const TYPE_DB = 'db';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'wallet_id',
        'mutable_type',
        'mutable_id',
        'type',
        'last_balance',
        'amount',
        'current_balance',
        'description',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = ['id' => 'integer', 'user_id' => 'integer', 'wallet_id' => 'integer', 'mutable_id' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function mutable()
    {
        return $this->morphTo()->withTrashed();
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class)->withTrashed();
    }
}
