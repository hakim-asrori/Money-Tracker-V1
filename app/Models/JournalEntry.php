<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes};

class JournalEntry extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'description',
        'journal_date',
    ];

    public function lines()
    {
        return $this->hasMany(JournalLine::class);
    }
}
