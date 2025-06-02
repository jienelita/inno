<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserReason;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard()
    {
        if (Auth::user()->is_admin > 0) {
            return Inertia::render('dashboard-admin', [
                'user' => User::find(Auth::user()->id)
            ]);
        } else {
            return Inertia::render('dashboard', 
            [
                'user' => User::find(Auth::user()->id),
                'disaproved_res' => UserReason::statusReturn(Auth::user()->id, 1)['reason'],
            ]);
        }
    }
}
