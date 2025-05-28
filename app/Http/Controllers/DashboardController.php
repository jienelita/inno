<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard()
    {
    //     $role = session()->all();
    //    echo '<pre>';
    //     print_r($role);
    //     echo '</pre>';
    //     die();
        return Inertia::render('dashboard', [
            'user' => User::find(Auth::user()->id)
        ]);
    }
}
