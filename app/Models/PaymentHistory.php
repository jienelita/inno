<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentHistory extends Model
{
    protected $table = 'payment_history';
    protected $fillable = [
        "cid",
        "recid",
        "acc_no",
        "chd",
        "trn",
        "trn_desc",
        "trn_mode",
        "trn_amount",
        "balance_amount",
        "trn_date",
    ];
}
