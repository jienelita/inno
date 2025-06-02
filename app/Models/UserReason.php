<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserReason extends Model
{
    protected $table = 'user_reason';
    protected $fillable = [
        "user_id",
        "reason",
        "created_by",
        "stat"
    ];

    public static function statusReturn ($user_id, $stat){
        $return = UserReason::selectraw('users.name, user_reason.reason')
        ->join('users', 'user_reason.created_by', 'users.id')
        ->where('user_reason.user_id', $user_id)
        ->where('user_reason.stat', $stat)
        ->orderby('user_reason.id', 'desc')
        ->first();

        $res = '';
        $name = '';
        if ($return) {
            $res = $return->reason;
            $name = $return->name;
        }
        return [
            'name' => $name,
            'reason' => $res
        ];
    }
}
