<?php



namespace App\Models\Scopes;

trait UserScope
{
    public function scopeByUser($query, int $user_id)
    {
        return $query->where('user_id', $user_id);
    }
}
