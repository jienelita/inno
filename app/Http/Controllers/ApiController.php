<?php

namespace App\Http\Controllers;

use App\Models\BalanceAccount;
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

            $this->writeLog($request->input('loan_data'));

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

            $arr = [
                "user_id" => $loanData['useridData'],
                "image_name" => str_replace("uploads/loan_docs/", "", $employeeIdPath),
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 0,
                'image_mapping' => 1
            ];

            UserImages::create($arr);

            return response()->json([
                'message' => 'Loan submitted successfully!',
                'files' => [
                    'employee_id' => $employeeIdPath,
                    'co_maker_id' => $coMakerIdPath,
                    'selfie' => $selfiePath,
                    'signature' => $signatureFilename,
                ]
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
}
