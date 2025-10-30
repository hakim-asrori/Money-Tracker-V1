<?php



namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property int $wallet_id
 * @property string $target_name
 * @property string $target_amount
 * @property string $description
 * @property string $due_date
 * @property string $published_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property string $deleted_at
 */
class Debt extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'wallet_id',
        'type',
        'target_name',
        'target_amount',
        'description',
        'due_date',
        'published_at'
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = ['id' => 'integer', 'user_id' => 'integer', 'wallet_id' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function mutation()
    {
        return $this->morphOne(Mutation::class, 'mutable');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
