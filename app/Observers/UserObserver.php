<?php

namespace App\Observers;

use Illuminate\Support\Facades\Auth;

class UserObserver
{
    public function creating($model)
    {
        $model->user_id = Auth::check() ? Auth::user()->id : null;
    }
}
