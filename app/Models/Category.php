<?php



namespace App\Models;

use App\Enums\CategoryTypeConstant;
use App\Models\Scopes\UserScope;
use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy([UserObserver::class])]
class Category extends Model
{
    use SoftDeletes, UserScope;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'name',
        'type',
        'status'
    ];

    protected $hidden = [
        'user_id'
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = ['id' => 'integer', 'user_id' => 'integer', 'type' => 'integer', 'status' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    protected $appends = ['type_desc'];

    public function getTypeDescAttribute()
    {
        return CategoryTypeConstant::getMessage($this->type);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wallets()
    {
        return $this->hasMany(Wallet::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
