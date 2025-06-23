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
       // dd($request);
        $request->validate([
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            //'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'password' => ['required'],
        ]);
        $explode = explode(" ", $request['full_name']);
        if(count($explode) > 1){
            $fnamne = $explode[0];
            $lnamne = $explode[1];
        }else{
            $fnamne = $explode[0];
            $lnamne = '';
        }
        $arr = [
            "cid" => null,
            "email" => $request['email'],
            "first_name" => $fnamne,
            "last_name" => $lnamne,
            "name" =>  $request['full_name'],
            "middle_name" => null,
            "is_admin" => 0,
            "password" => Hash::make($request['password']),
            "bithdate" => null,
            "phone_number" => null,
            "birth_place" => null,
            "current_address" => null,
            "permanent_address" => null,
            "is_active" => 1,
        ];

        $user = User::create($arr);
        // if ($request->file) {
        //     $imageName = time() . '.' . $request->file->extension();
        //     $request->file->move(public_path('images'), $imageName);
        //     $arr = [
        //         "user_id" => $user->id,
        //         "image_name" => $imageName,
        //         "image_tag" => 1
        //     ];
        //     UserImages::create($arr);
        // }
        event(new Registered($user));

        Auth::login($user);
        sleep(2);
        return to_route('dashboard');
    }
}
