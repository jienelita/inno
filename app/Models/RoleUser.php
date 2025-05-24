<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleUser extends Model
{
    protected $table = 'role_user';
    //protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'roles_id'
    ];
}
