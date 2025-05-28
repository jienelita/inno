<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Middleware;

class ShareInertiaData extends Middleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    // public function handle(Request $request, Closure $next): Response
    // {
    //     return $next($request);
    // }
    public function share($request)
    {
        $user = auth()->user();

        // return array_merge(parent::share($request), [
        //     'user_role' => session('user_role', []), // array of objects: [{feature_id, capability}, ...]
        //     'is_admin' => $user ? $user->is_admin : null,
        // ]);
        return array_merge(parent::share($request), [
            'user_role' => collect(session('user_role', []))->map(function ($perm) {
                // If it's a model, get attributes only
                return [
                    'feature_id' => $perm->feature_id,
                    'capability' => $perm->capability,
                ];
            })->values()->all(),
            'is_admin' => $user ? $user->is_admin : null,
        ]);
    }
}
