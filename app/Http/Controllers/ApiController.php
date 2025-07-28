<?php

namespace App\Http\Controllers;

use App\Models\BalanceAccount;
use App\Models\Chat;
use App\Models\LoanApplication;
use App\Models\PaymentHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\UserImages;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Laravel\Facades\Image;

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

    public function loanDetails($loan_id, $userid)
    {
        if ($loan_id == 1) {
            $loan_code = 87;
        } elseif ($loan_id == 2) {
            $loan_code = 79;
        } else {
            $loan_code = 73;
        }
        return response()->json(BalanceAccount::where('members_id', $userid)->where('accid', $loan_code)->where('is_balance', 1)->first());
    }

    public function loanSubmit(Request $request)
    {
        // Step 1: Validate incoming request
        // Step 4: Optionally save loan data
        $loanData = json_decode($request->input('loan_data'), true);

        $validator = Validator::make($request->all(), [
            'loan_data' => 'required|string',
            'signature' => 'required|string',
            'employee_id' => 'required|file|mimes:jpg,jpeg|max:5120',
            'co_maker_id' => ($loanData['loanform'] > 1 ? 'required|' : 'nullable|') . 'file|mimes:jpg,jpeg|max:5120', //$loanData['loanform']'required|file|mimes:jpg,jpeg|max:5120',
            'selfie' => 'required|file|mimes:jpg,jpeg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $storagePath = public_path('uploads/loan_docs');
            if (!file_exists($storagePath)) {
                mkdir($storagePath, 0755, true);
            }

            $saveResizedImage = function ($file, $name) use ($storagePath) {
                $img = Image::read($file);
                $img->scale(1200, 1200, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
                $filename = uniqid($name . '_') . '.jpg';
                $img->save($storagePath . '/' . $filename, 90); // 90% quality
                return 'uploads/loan_docs/' . $filename;
            };

            // Step 2: Handle image uploads
            $employeeIdPath =  $saveResizedImage($request->file('employee_id'), 'employee_id');
            $coMakerIdPath = '';
            if ($loanData['loanform'] > 1) {
                $coMakerIdPath = $saveResizedImage($request->file('co_maker_id'), 'co_maker_id');
            }
            $selfiePath = $saveResizedImage($request->file('selfie'), 'selfie');

            // Step 3: Save base64 signature as an image file
            $signatureData = $request->input('signature');
            if (preg_match('/^data:image\\/png;base64,/', $signatureData)) {
                $signatureData = substr($signatureData, strpos($signatureData, ',') + 1);
            }

            $signatureBinary = base64_decode($signatureData);
            $signatureFilename = 'signatures/' . uniqid('sig_') . '.png';
            Storage::disk('public')->put($signatureFilename, $signatureBinary);



            // Example insert (customize to your DB schema)
            $loan_details = [
                'loan_amount' => $loanData['amount'],
                'payment_mode' => $this->paymentMode($loanData['paymentMode']), //
                'term' => $loanData['termMonths'],
                'netProceeds' => $loanData['netProceeds'],
                'interestPerPayment' => $loanData['interestPerPayment'],
                'totalInterest' => $loanData['totalInterest'],
                'serviceFee' => $loanData['serviceFee'],
                'capitalRetention' => $loanData['capitalRetention'],
                'insurance' => $loanData['insuranceFee'],
            ];

            $arr = [
                "user_id" => $loanData['useridData'],
                "status" => 0,
                "loan_code" => $loanData['loanform'],
                "loan_details" => json_encode($loan_details),
                "is_mobile_app" => 1
            ];

            $loan_id = LoanApplication::create($arr)->id;

            //Magrow ID with signature
            $arr = [
                "user_id" => $loanData['useridData'],
                "image_name" => str_replace("uploads/loan_docs/", "", $employeeIdPath),
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 0,
                'image_mapping' => 1,
                'original_name' => "Magrow Id"
            ];
            UserImages::create($arr);

            //signatureFilename
            $arr = [
                "user_id" => $loanData['useridData'],
                "image_name" => str_replace("signatures/", "", $signatureFilename),
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 0,
                'image_mapping' => 4,
                'original_name' => "Signature"
            ];
            UserImages::create($arr);

            //selfie
            $arr = [
                "user_id" => $loanData['useridData'],
                "image_name" => str_replace("uploads/loan_docs/", "", $selfiePath),
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 0,
                'image_mapping' => 3,
                'original_name' => "Selfie"
            ];
            UserImages::create($arr);

            //comaker or valid id
            if ($loanData['loanform'] > 1) {
                if ($loanData['loanform'] == 2) {
                    $imagemap = 6;
                    $original_name = "Co-maker Id";
                } else {
                    $imagemap = 7;
                    $original_name = "Valid Id";
                }
                $arr = [
                    "user_id" => $loanData['useridData'],
                    "image_name" => str_replace("uploads/loan_docs/", "", $coMakerIdPath),
                    "image_tag" => 2,
                    'loan_id' => $loan_id,
                    'show_img' => 0,
                    'image_mapping' => $imagemap,
                    'original_name' => $original_name
                ];
                UserImages::create($arr);
            }

            return response()->json([
                'message' => 'Loan submitted successfully!',
                'id' => $loan_id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function writeLog($message)
    {
        $logFile = 'log.txt';
        $timestamp = date('Y-m-d H:i:s');
        $entry = "[$timestamp] $message" . "\n";
        file_put_contents($logFile, $entry, FILE_APPEND);
    }
    private function paymentMode($paymentMode)
    {
        switch ($paymentMode) {
            case 'Weekly':
                return 1;
            case 'Semi-monthly':
                return 2;
            case 'Monthly':
                return 3;
            case 'Quarterly':
                return 4;
            default:
                return 1;
        };
    }

    public function myApplications($user_id)
    {
        return LoanApplication::where('user_id', $user_id)->latest()->get();
    }
    public function loanInfo($id)
    {
        $loan = LoanApplication::with('uploads')->where('id', $id)->first();

        if (!$loan) {
            return response()->json(['message' => 'Loan not found'], 404);
        }
        return response()->json($loan);
    }
    public function profile($id)
    {
        $user = User::where('id', $id)->first();
        $image = UserImages::where('user_id', $id)->where('image_tag', 1)->latest()->first();

        return response()->json([
            'user' => $user,
            'avatar' => $image ? asset('storage/avatars/' . $image->image_name) : null,
        ]);
    }
    public function UpdateUser(Request $request, $id)
    {

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => "required|email|unique:users,email,$id",
            'phone_number' => 'nullable|string|max:20',
            'current_address' => 'nullable|string|max:255',
            'password' => 'nullable|min:6|confirmed', // optional password update

        ]);

        $this->writeLog(json_encode($request->all()));
        $otp = rand(100000, 999999);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($request->memberType == 'new') {
            $cid = '';
        } else {
            $cid = $request->cid;
        }

        $user->name = $request->first_name . ' ' . $request->last_name;
        $user->last_name = $request->last_name;
        $user->first_name = $request->first_name;
        $user->email = $request->email;
        $user->phone_number = $request->phone_number;
        $user->current_address = $request->current_address;

        if ($request->is_update == 1) {
            $user->otp = $otp;
            $user->is_active = 2;
            if ($request->memberType != 'new') {
                $user->cid = $cid;
            }else{
                $user->cid = null;
            }
        }

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    public function updateAvatar(Request $request, $id)
    {
        $user = UserImages::where('user_id', $id)->where('image_tag', 1)->first();

        // if (!$user) {
        //     return response()->json(['message' => 'User not found.'], 404);
        // }

        if (!$request->hasFile('avatar')) {
            return response()->json(['message' => 'No avatar uploaded.'], 400);
        }

        $file = $request->file('avatar');

        $validated = $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png|max:5120', // max 5MB
        ]);

        // Delete old avatar if needed
        if ($user->image_name && Storage::disk('public')->exists('avatars/' . $user->image_name)) {
            Storage::disk('public')->delete('avatars/' . $user->image_name);
        }

        $filename = 'avatar_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('avatars', $filename, 'public');

        $user->image_name = $filename;
        $user->image_tag = 1;
        $user->is_mobile_app = 1;
        $user->save();

        return response()->json([
            'message' => 'Avatar updated successfully.',
            'avatar' => asset('storage/avatars/' . $filename),
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|min:6|max:6',
        ]);

        $user = User::where('id', $request->user_id)
            ->where('otp', $request->otp)
            ->first();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid OTP.',
            ], 400);
        }

        // If OTP is valid, mark phone as verified
        User::where('id', $user->id)
            ->update(
                [
                    'phone_number_verified_at' => now(),
                    'otp' => null,
                    'is_active' => 3,
                    'status' => 0
                ]
            );

        return response()->json([
            'status' => true,
            'message' => 'Phone number verified successfully.',
        ]);
    }

    public function ChatStore(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'message' => 'required|string',
        ]);

        $msg = Chat::create([
            'user_id' => $request->user_id,
            'message' => $request->message,
        ]);

        return response()->json(['status' => true, 'message' => $msg]);
    }

    public function ChatFetch($userId)
    {
        $messages = Chat::where('user_id', $userId)
                    ->orWhere('receiver_id', $userId)
                    ->orderBy('created_at')
                    ->get();
        return response()->json($messages);
    }
}
