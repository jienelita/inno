<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeneratedDatabase extends Model
{
    protected $table = 'generated_database';
    protected $fillable = [
        "total_user",
        "generate_by"
    ];

}
