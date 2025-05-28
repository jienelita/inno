<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        if (Auth::check() == true) {

            if (auth()->user()->is_admin == 3) {
                return [
                    ...parent::share($request),
                    'name' => config('app.name'),
                    'quote' => ['message' => trim($message), 'author' => trim($author)],
                    'auth' => [
                        'user' => $request->user(),
                    ],
                    'is_admin' => auth()->user()->is_admin,
                    'ziggy' => fn(): array => [
                        ...(new Ziggy)->toArray(),
                        'location' => $request->url(),
                    ],
                    'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
                ];
            } else {
                $permission = session()->all();
                $permissions = $permission['user_role'];
                $user = $request->user();

                return [
                    ...parent::share($request),
                    'name' => config('app.name'),
                    'quote' => ['message' => trim($message), 'author' => trim($author)],
                    'auth' => [
                        'user' => $request->user(),
                    ],
                    'user_role' => $user
                        ? $permissions->map(fn($perm) => [
                            'feature_id' => $perm->feature_id,
                            'capability' => $perm->capability,
                        ])->values()->all()
                        : [],
                    'is_admin' => auth()->user()->is_admin,
                    'ziggy' => fn(): array => [
                        ...(new Ziggy)->toArray(),
                        'location' => $request->url(),
                    ],
                    'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
                ];
            }
        } else {
            return [
                ...parent::share($request),
                'name' => config('app.name'),
                'quote' => ['message' => trim($message), 'author' => trim($author)],
                'auth' => [
                    'user' => $request->user(),
                ],
                'ziggy' => fn(): array => [
                    ...(new Ziggy)->toArray(),
                    'location' => $request->url(),
                ],
                'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            ];
        }
    }
}
