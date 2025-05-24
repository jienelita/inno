<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserReason extends Model
{
    protected $table = 'user_reason';
    protected $fillable = [
        "user_id",
        "reason",
        "created_by"
    ];
}
