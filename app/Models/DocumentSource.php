<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes};

class DocumentSource extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'is_active',
    ];
}
