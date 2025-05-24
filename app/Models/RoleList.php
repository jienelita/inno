<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleList extends Model
{
    protected $table = 'role_list';
    protected $fillable = [
        "name",
        "slug",
    ];
}
