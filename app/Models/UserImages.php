<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserImages extends Model
{
    //
    protected $table = 'users_images';
    protected $fillable = [
        "user_id",
        "image_name",
        "image_tag",
        "loan_id",
        "show_img",
        "image_mapping",
        "original_name"
    ];

    public static function useravatar($user_id){
        return UserImages::selectraw('image_name as imgavata')->where('user_id', $user_id)->where('image_tag', 1)->first();
    }
}
