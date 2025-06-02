<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoanApplication extends Model
{
    protected $table = 'loan_application';
    protected $fillable = [
        "user_id",
        "loan_code",
        "status",
        "loan_details",
        "reason",
        'approve_by',
        'acc_status',
        'reason_deny',
        'check_by'
    ];

    public static function LoanDetails()
    {
        return LoanApplication::selectraw('users.id as user_id, users.name, loan_application.*')
            ->join('users', 'users.id', 'loan_application.user_id')
            ->orderBy('loan_application.id', 'desc');
    }

    public static function LoanView($id)
    {
        return LoanApplication::selectraw('users.id as user_id, users.*, loan_application.*')
            ->join('users', 'users.id', 'loan_application.user_id')
            ->where('loan_application.id', $id)->first();
    }
    public static function approve($approve_by, $table_name)
    {
        return LoanApplication::selectraw('users.name, loan_application.approve_by')
            ->join('users', 'users.id', 'loan_application.'.$table_name)
            ->where('users.id', $approve_by)->first();
    }
}
