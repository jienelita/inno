<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class IsAdminOrAnySection
{
    public function handle($request, Closure $next)
    {
        if (!Auth::check()) {
            abort(403, 'Unauthorized');
        }

        $role = Auth::user()->is_admin;
        if (!in_array($role, [1, 2, 3])) {
            //1 = admin, 3 = loan section
            abort(403, 'Access denied.');
        }

        return $next($request);
    }
}
