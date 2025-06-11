<?php

namespace App\Models;

use Carbon\Carbon;
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
            ->join('users', 'users.id', 'loan_application.' . $table_name)
            ->where('users.id', $approve_by)->first();
    }
    public static function LoanCount($status = null)
    {
        $query = LoanApplication::query()
            ->whereBetween('created_at', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth(),
            ]);

        if (!is_null($status)) {
            if ($status == 1) {
                $query->where(function ($q) {
                    $q->where('status', 1)->orWhere('status', 5);
                });
            } else {
                $query->where('status', $status);
            }
        }

        return $query->get();
    }
}
