<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleGroup extends Model
{
    protected $table = 'role_list_group';
    protected $fillable = [
        "group_name",
        "created_by",
    ];
}
