<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    protected $table = 'roles_permissions';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'feature_id',
        'capability',
        'role_id',
        'created_at',
        'updated_at	'
    ];
}
