<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoanLog extends Model
{
    protected $table = 'loan_log';
    protected $fillable = [
        'update_by',
        'loan_id',
        'status',
        'log_message'
    ];
}
