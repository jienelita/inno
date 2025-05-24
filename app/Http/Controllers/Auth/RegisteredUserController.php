<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserImages;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {

        //  dd($request);
        $request->validate([
            //'email' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $arr = [
            "cid" => $request->cid,
            "email" => $request->email,
            "first_name" => $request->first_name,
            "last_name" => $request->last_name,
            "name" =>  $request->first_name.' '. $request->last_name,
            "middle_name" => $request->middle_name,
            "is_admin" => 0,
            "password" => Hash::make($request->password),
            "bithdate" => $request->bithdate,
            "phone_number" => $request->phone_number,
            "birth_place" => $request->birth_place,
            "current_address" => $request->current_address,
            "permanent_address" => $request->permanent_address,
        ];

        $user = User::create($arr);
        if ($request->file) {
            $imageName = time() . '.' . $request->file->extension();
            $request->file->move(public_path('images'), $imageName);
            $arr = [
                "user_id" => $user->id,
                "image_name" => $imageName,
                "image_tag" => 1
            ];
            UserImages::create($arr);
        }
        event(new Registered($user));

        Auth::login($user);
        sleep(2);
        return to_route('dashboard');
    }
}
