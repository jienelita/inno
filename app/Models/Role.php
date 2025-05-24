<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'role';
    protected $primaryKey = 'id';
    protected $fillable = [
        "role_name",
        "created_by",
        "permission"
    ];

}
