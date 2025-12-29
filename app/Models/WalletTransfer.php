<?php



namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes};

/**
 * @property int $id
 * @property int $user_id
 * @property int $wallet_origin_id
 * @property int $wallet_target_id
 * @property string $amount
 * @property string $fee
 * @property string $published_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property string $deleted_at
 */
class WalletTransfer extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'wallet_origin_id',
        'wallet_target_id',
        'amount',
        'fee',
        'published_at',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = ['id' => 'integer', 'user_id' => 'integer', 'wallet_origin_id' => 'integer', 'wallet_target_id' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

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

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }
}
