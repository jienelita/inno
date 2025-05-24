<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;

class OtpController extends Controller
{
    public function resend(Request $request)
    {
        $user = $request->user();

        $otp = rand(100000, 999999);

        $arr = [
            'otp' => $otp
        ];
        User::where('id', $user->id)->update($arr);

        Mail::raw("Your OTP code is: {$otp}", function ($message) use ($user) {
            //$email = $user->email;    
            $message->to('jienelpestanas@gmail.com')
                ->subject('Your OTP Code');
        });
        //         $data = array(
        //             'details' => 'a',
        //             'sid' => '23',
        //             'emailto' => 'jienelpestanas@gmail.com',
        //             'hasdate' => 'null'
        //         );
        //         $return = Mail::send('email', ['details' => $data], function ($message)  use ($user) {
        //             $message->to('sarominesjienel@gmail.com', 'WISP Billing')->subject('Magrow WISP Billing');
        //             $message->from('magrowmpc@info.com', 'Magrow MPC');
        //         });
        // echo '<pre>';
        //         print_r($return);

        return response()->json(['message' => 'OTP sent successfully.', 'body' => ' Please check your email.' ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|digits:6',
        ]);
        $user = $request->user();
        $inputCode = $request->code;
        $data = User::where('otp', $inputCode)->where('id', $user->id)->first();
        
        if ($inputCode == $data->otp) {
            $arr = [
                'email_verified_at' => date('Y-m-d H:i:s'),
                'is_active' => 1
            ];
            User::where('id', $user->id)->update($arr);
            return response()->json(['success' => true, 'message' => 'OTP is valid.']);

        }
        return response()->json(['success' => false, 'message' => 'Invalid OTP.'], 422);
    }
}
