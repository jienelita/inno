<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserImages;
use App\Models\UserReason;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserManagerController extends Controller
{
    public function index()
    {
        return Inertia::render('user/user-manager', [
            'user_list' => User::selectraw('users.id as user_id, users.*')->where('is_admin', '>', 0)->get()
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
        if($request->status == 2){
            $arr = [
                'reason' =>  $request->reason,
                'user_id' => $request->id,
                'created_by' => Auth::user()->id
            ];

             UserReason::create($arr);
        }
    }
    public function getProfile($user_id)
    {
        $user = UserImages::useravatar($user_id);
        $reason = UserReason::selectraw('users.name, user_reason.reason')->join('users', 'user_reason.user_id', 'users.id')->where('user_reason.user_id', $user_id)->orderby('user_reason.id', 'desc')->first();
        $res = '';
        $name = '';
        if($reason){
            $res = $reason->reason;
            $name = $reason->name;
        }
        $img = 'avatar.jpg';
        if ($user) {
            $img = $user->imgavata;
        }
        return response()->json([
            'image_name' => $img,
            'reason' => $res,
            'disable_by' => $name,
        ]);
    }
    public function saveUser(Request $request){
        dd($request);
    }
}
//MagrowMPC143_