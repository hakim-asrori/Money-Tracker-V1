<?php



namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes};

/**
 * @property int $id
 * @property int $user_id
 * @property int $category_id
 * @property string $name
 * @property string $balance
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property string $deleted_at
 */
class Wallet extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'balance',
    ];

    protected $hidden = ['category_id', 'user_id'];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = ['id' => 'integer', 'user_id' => 'integer', 'category_id' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function category()
    {
        return $this->belongsTo(Category::class)->withTrashed();
    }

    public function mutation()
    {
        return $this->morphOne(Mutation::class, 'mutable')->withTrashed();
    }

    public function mutations()
    {
        return $this->hasMany(Mutation::class, 'wallet_id')->withTrashed();
    }

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }
}
