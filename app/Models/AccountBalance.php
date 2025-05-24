<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountBalance extends Model
{
    //
    protected $table = 'account_balance';
    protected $fillable = [
        "cid",
        "user_id",
        "net_cash",
        "la_capital_share",
        "apl_ca"
    ];
}
