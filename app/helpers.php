<?php

use Illuminate\Support\Facades\Auth;

function hasPermission($feature, $cap)
{
    
    if (auth()->user()->is_admin == 3) {
        return true;
    }
    $permission = session()->all();
    $permissions = $permission['user_role'];
    foreach ($permissions as $permission) {
        if (strtolower($permission->capability) === strtolower($cap) && strtolower($permission->feature_id) === strtolower($feature)) {
             return true;
        }
    }
    return false;
}
