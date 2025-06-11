<?php

namespace App\Http\Controllers;

use App\Models\BalanceAccount;
use App\Models\LoanApplication;
use App\Models\User;
use App\Models\UserReason;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard()
    {
        if (Auth::user()->is_admin > 0) {
            return Inertia::render('dashboard-admin', [
                'user' => User::find(Auth::user()->id),
                'loan_application' => LoanApplication::LoanCount()->count(),
                'loan_application_approved' => LoanApplication::LoanCount(1)->count(),
                'loan_application_disapproved' => LoanApplication::LoanCount(2)->count(),
                'total_members' => User::membersCount(1)->count(),
                'total_members_approved' => User::membersCount(2)->count(),
                'total_members_application' => User::membersCount(0)->count()
            ]);
        } else {
            return Inertia::render('dashboard', 
            [
                'user' => User::find(Auth::user()->id),
                'disaproved_res' => UserReason::statusReturn(Auth::user()->id, 1)['reason'],
                'balance_account' => BalanceAccount::where('members_id', Auth::user()->id)->orderby('is_balance', 'asc')->get()
            ]);
        }
    }
}
