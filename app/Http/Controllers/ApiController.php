<?php

namespace App\Http\Controllers;

use App\Models\BalanceAccount;
use App\Models\PaymentHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ApiController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)
            //->orWhere('username', $request->username) // Optional: if you have username column
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('mobile-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    public function paymenthistory($userid)
    {
        return response()->json([BalanceAccount::where('members_id', $userid)->get()]);
        //->map(function ($balance) use ($userid) {print_r($balance);})
    }

    public function details($accountNo)
    {
        return response()->json(PaymentHistory::where('acc_no', $accountNo)->get());
    }

    public function loanDetails($loan_id, $userid){
        if($loan_id == 1){
            $loan_code = 79;
        }
        return response()->json(BalanceAccount::where('members_id', $userid)->where('accid', $loan_code)->where('is_balance', 1)->first());
    }
}
