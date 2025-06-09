<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BalanceAccount extends Model
{
    protected $table = 'balance_account';
    protected $fillable = [
        "cid",
        "account_no",
        "br_code",
        "balance",
        "prefix",
        "generate_by",
        "accid",
        "members_id",
        "is_balance"
    ];
}
