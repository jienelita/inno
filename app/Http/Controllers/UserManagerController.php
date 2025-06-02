<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\RoleGroup;
use App\Models\RoleList;
use App\Models\RolePermission;
use App\Models\RoleUser;
use App\Models\User;
use App\Models\UserImages;
use App\Models\UserReason;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserManagerController extends Controller
{
    public function index()
    {
        return Inertia::render('user/user-manager', [
            'user_list' => User::selectraw('users.id as user_id, users.*')->where('is_admin', '>', 0)->get(),
            'role' => Role::all(),
            'role_group' => RoleGroup::all(),
            'role_list' => RoleList::all(),
        ]);
    }

    public function loanManager()
    {
        return Inertia::render('loans/index', [
            'user' => User::all()
        ]);
    }

    public function updateUser($userid)
    {
        return Inertia::render('user/update-user', [
            'user_details' => User::find($userid)
        ]);
    }

    public function membersList()
    {
        return Inertia::render('user/index', [
            'user_list' => User::selectraw('users.id as user_id, users.*')->where('is_admin',  0)->get()
        ]);
    }

    public function UpdateUserStatus(Request $request)
    {
        $user = User::findOrFail($request->id);
        $user->is_active = $request->status;
        $user->save();
        if ($request->status == 2) {
            $arr = [
                'reason' =>  $request->reason,
                'user_id' => $request->id,
                'created_by' => Auth::user()->id,
                'stat' => 0
            ];

            UserReason::create($arr);
        }
    }

    public function getProfile($user_id)
    {
        $user = UserImages::useravatar($user_id);
        $img = 'avatar.jpg';
        if ($user) {
            $img = $user->imgavata;
        }
        return response()->json([
            'image_name' => $img,
            'reason' => UserReason::statusReturn($user_id, 0)['reason'],
            'disable_by' => UserReason::statusReturn($user_id, 0)['name'],
            'disaproved_by' => UserReason::statusReturn($user_id, 1)['name'],
            'disaproved_res' => UserReason::statusReturn($user_id, 1)['reason'],
        ]);
    }

    public function UpdateUserRole(Request $request)
    {
        if (is_array($request['values']['role'])) {
            $userID = $request['userId'];
            RolePermission::where('user_id', $userID)->delete();
            RoleUser::where('user_id', $userID)->delete();
            foreach ($request['values']['role'] as $roleId) {
                RoleUser::create([
                    'user_id' => $userID,
                    'roles_id' => $roleId,
                ]);
                $role = Role::find($roleId);
                if ($role) {
                    $rolePermissions = json_decode($role->permission);
                    foreach ($rolePermissions as $key => $permissions) {
                        foreach ($permissions as $value) {
                            if (!RolePermission::where('user_id', $userID)->where('feature_id', $key)->where('capability', $value)->exists()) {
                                $permission = new RolePermission();
                                $permission->user_id = $userID;
                                $permission->role_id = $role->id;
                                $permission->feature_id = $key;
                                $permission->capability = $value;
                                $permission->save();
                            }
                        }
                    }
                }
            }
        }
    }

    public function UpdatePassword(Request $request)
    {
        $arr = [
            'password' => Hash::make($request->pass),
        ];
        User::where('id', $request->userId)->update($arr);
    }

    public function UpdateMemberStatus(Request $request)
    {
        $arr = [
            'status' => $request->status,
        ];
        User::where('id', $request->id)->update($arr);
        if($request->status == 2){
            $arr = [
                'user_id' => $request->id,
                'reason' => $request->reason,
                'created_by' => Auth::user()->id,
                'stat' => 1
            ];
            UserReason::create($arr);
        }
    }

    public function saveUser(Request $request)
    {
        $record = $request->records;
        $arr = [
            "email"  => $record['email'],
            "is_active" => 3,
            "password" => Hash::make($record['password']),
            "first_name" => $record['fname'],
            "last_name" => $record['lname'],
            "is_admin" => $record['user_type'],
            "name" => $record['fname'] . ' ' . $record['lname']
        ];
        $last_id = User::create($arr)->id;
        if ($record['user_type'] != 3) {
            if (is_array($record['role'])) {
                foreach ($record['role'] as $roleId) {
                    RoleUser::create([
                        'user_id' => $last_id,
                        'roles_id' => $roleId,
                    ]);
                    $role = Role::find($roleId);
                    if ($role) {
                        $rolePermissions = json_decode($role->permission);
                        foreach ($rolePermissions as $key => $permissions) {
                            foreach ($permissions as $value) {
                                if (!RolePermission::where('user_id', $last_id)->where('feature_id', $key)->where('capability', $value)->exists()) {
                                    $permission = new RolePermission();
                                    $permission->user_id = $last_id;
                                    $permission->role_id = $role->id;
                                    $permission->feature_id = $key;
                                    $permission->capability = $value;
                                    $permission->save();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
//MagrowMPC143_