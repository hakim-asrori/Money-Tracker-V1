<?php



namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes};

/**
 * @property int $id
 * @property int $user_id
 * @property int $wallet_id
 * @property int $category_id
 * @property string $title
 * @property string $amount
 * @property string $fee
 * @property string $description
 * @property string $published_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property string $deleted_at
 */
class Transaction extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'wallet_id',
        'category_id',
        'title',
        'amount',
        'fee',
        'description',
        'published_at',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = ['id' => 'integer', 'user_id' => 'integer', 'wallet_id' => 'integer', 'category_id' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime', 'deleted_at' => 'datetime', 'published_at' => 'datetime'];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class)->withTrashed();
    }

    public function mutation()
    {
        return $this->morphOne(Mutation::class, 'mutable')->withTrashed();
    }

    public function category()
    {
        return $this->belongsTo(Category::class)->withTrashed();
    }

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    public function debt()
    {
        return $this->hasOne(Debt::class)->withTrashed();
    }

    public function document()
    {
        return $this->hasOne(Document::class)->withTrashed();
    }
}
