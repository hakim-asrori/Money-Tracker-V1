<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes};

class Document extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'source_id',
        'transaction_id',
        'original_image',
        'raw_text',
    ];
}
