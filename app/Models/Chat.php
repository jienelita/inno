<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $table = 'chats';
    protected $fillable = [
        "user_id",
        "receiver_id",
        "message",
        "sender"
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
