<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property int $wallet_id
 * @property string $title
 * @property string $profit_gain
 * @property string $profit_loss
 * @property string $status
 * @property string $purchase_at
 * @property string $sold_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property string $deleted_at
 */
class Investman extends Model
{

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'wallet_id',
        'title',
        'profit_gain',
        'profit_loss',
        'status',
        'purchase_at',
        'sold_at',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = ['id' => 'integer', 'user_id' => 'integer', 'wallet_id' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];
}
