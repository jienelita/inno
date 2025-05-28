<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\RoleGroup;
use App\Models\RoleList;
use App\Models\RoleUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RoleManagerController extends Controller
{
    public function index()
    {
        return Inertia::render('user/role/index', [
            'role' => Role::all(),
            'role_group' => RoleGroup::all(),
            'role_list' => RoleList::all(),
        ]);
    }
    public function saveRole(Request $request)
    {
        if (request()->ajax()) {
            $features = RoleList::all();
            foreach ($features as $feature) {
                if ($request->has('permissions.' . $feature->slug)) {
                    $name = $feature->slug;

                    foreach ($request['permissions'][$name] as $cap) {
                        $permissions[$name][] = $cap;
                    }
                }
            }
            $array = [
                'created_by' => Auth::user()->Password_ID,
                'role_name' => $request->rolename,
                'permission' => json_encode($permissions),
            ];
            Role::create($array);
        }
    }

    public function listofRoles($group_id)
    {
        if ($group_id > 0) {
            return response()->json(RoleList::where('group_id', $group_id)->get());
        } else {
            return response()->json(Role::all());
        }
    }

    public function UserAssignRole($userID){
        return response()->json(RoleUser::Join('role', 'role.id', 'role_user.roles_id')->where('role_user.user_id', $userID)->get());
    }

   
}
