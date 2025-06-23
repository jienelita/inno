<?php

namespace App\Http\Controllers;

use App\Models\AccountBalance;
use App\Models\BalanceAccount;
use App\Models\LoanApplication;
use App\Models\LoanLog;
use App\Models\PaymentHistory;
use App\Models\User;
use App\Models\UserImages;
use Barryvdh\DomPDF\Facade\Pdf;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $query = LoanApplication::where('user_id', Auth::user()->id)->orderBy('id', 'asc');
        // Filter by Loan Amount
        if ($request->filled('loan_amount')) {
            $query->whereRaw("JSON_EXTRACT(loan_details, '$.loan_amount') LIKE ?", ["%{$request->loan_amount}%"]);
        }
        // Sorting
        if ($request->filled('sort_field') && $request->filled('sort_order')) {
            switch ($request->sort_field) {
                case 'term':
                    $query->orderByRaw("CAST(JSON_EXTRACT(loan_details, '$.term') AS UNSIGNED) {$request->sort_order}");
                    break;
                case 'netProceeds':
                    $query->orderByRaw("CAST(JSON_EXTRACT(loan_details, '$.netProceeds') AS DECIMAL(10,2)) {$request->sort_order}");
                    break;
                default:
                    break;
            }
        }
        $loan = $query->paginate(20)->withQueryString();

        return Inertia::render('loans/index', [
            'loan' => $loan,
        ]);
    }

    public function loanManager(Request $request)
    {
        $query = LoanApplication::LoanDetails();  //orderBy('id', 'asc');

        if ($request->has('loan_amount')) {
            $amounts = (array) $request->loan_amount;

            $query->where(function ($q) use ($amounts) {
                foreach ($amounts as $amount) {
                    $q->orWhereRaw("JSON_EXTRACT(loan_details, '$.loan_amount') = ?", [$amount]);
                }
            });
        }
        if ($request->filled('user_id')) {
            $ids = is_array($request->user_id) ? $request->user_id : [$request->user_id];
            $query->whereIn('user_id', $ids);
        }

        if ($request->filled('statusSetData')) {
            $statuses = is_array($request->statusSetData) ? $request->statusSetData : [$request->statusSetData];
            $query->whereIn('status', $statuses);
        }

        if ($request->filled('sort_field') && $request->filled('sort_order')) {
            switch ($request->sort_field) {
                case 'term':
                    $query->orderByRaw("CAST(JSON_EXTRACT(loan_details, '$.term') AS UNSIGNED) {$request->sort_order}");
                    break;
                case 'netProceeds':
                    $query->orderByRaw("CAST(JSON_EXTRACT(loan_details, '$.netProceeds') AS DECIMAL(10,2)) {$request->sort_order}");
                    break;
                default:
                    break;
            }
        }
        $loan = $query->paginate(20)->withQueryString();
        return Inertia::render('loans/loan-manager', [
            'loan' => $loan,
        ]);
    }

    public function PaymentHistory()
    {
        return Inertia::render('loans/payment-history', [
           'account' => BalanceAccount::where('members_id', Auth::user()->id)->get()
        ]);
    }

    public function AccountHistory($acountNo, $cid){
        return response()->json(PaymentHistory::where('acc_no', $acountNo)->orderby('recid', 'desc')->get());
    }

    public function loanUpdateStatus($statusID, $loanID)
    {
        $arr = [
            'status' => $statusID,
            'approve_by' => Auth::user()->id
        ];
        LoanApplication::where('id', $loanID)->update($arr);
        loanLog($statusID, $loanID);
        return back()->with([
            'status' => 1,
            'message' => 'Loan successfully updated.'
        ]);
    }

    public function UpdateAccountingDeny($loanId, $status, Request $request)
    {
        $arr = [
            'acc_status' => $status,
            'reason_deny' => $request->reason_deny,
            'check_by' => Auth::user()->id
        ];

        LoanApplication::where('id', $loanId)->update($arr);

        loanLog($status, $loanId, $request->reason_deny, '2');

        return back()->with([
            'status' => 1,
            'message' => 'Loan successfully updated.'
        ]);
    }

    public function loanUpdateReason(Request $request, $id, $status)
    {
        if ($status == 4) {
            $arr = [
                'acc_status' => 2,
                'reason' => $request->reason,
                'status' => $status,
                'approve_by' => Auth::user()->id
            ];
        } else {
            $arr = [
                'status' => $status,
                'reason' => $request->reason,
                'approve_by' => Auth::user()->id
            ];
        }
        loanLog($status, $id, $request->reason);

        LoanApplication::where('id', $id)->update($arr);

        return back()->with([
            'status' => 1,
            'message' => 'Loan successfully updated.'
        ]);
    }

    public function loanCalculator()
    {
        return Inertia::render('loans/calculator', [
            'account_balance' => BalanceAccount::where('members_id', Auth::user()->id)->where('is_balance', 1)->get(),
            'gallery' => UserImages::where('user_id', Auth::user()->id)->where('show_img', 1)->get(),
            'user' => User::find(Auth::user()->id),
        ]);
    }

    public function delete($id)
    {
        $loan = LoanApplication::findOrFail($id);
        $status = $loan->status;

        if ($status == 1) {
            $message = 'Unable to  deleted Loan!';
        } else {
            $loan->delete();
            UserImages::where('loan_id', $id)->delete();

            $message = 'Loan deleted successfully!';
        }
        return back()->with([
            'status' => $status,
            'message' => $message
        ]);
    }

    public function MembersLoan($membersId)
    {
        return response()->json(BalanceAccount::where('members_id', $membersId)->orderby('is_balance', 'asc')->get());
    }

    public function promisorynote($loan_id)
    {
        $get = LoanApplication::LoanView($loan_id);
        if ($get) {
            $avatar = UserImages::where('user_id', $get->user_id)->where('image_tag', 1)->first();
            $img = 'avatar.jpg';
            if ($avatar) {
                $img = $avatar->image_name;
            }
            $signature = UserImages::where('loan_id', $get->id)->where('image_mapping', 4)->first();
            $signa = '';
            if ($signature) {
                $signa = $signature->image_name;
            }
            $details = json_decode($get->loan_details);
            $originalDate = new DateTime(date('Y-m-d'));
            $originalDate->modify('+' . $details->term . ' months');
            $data = [
                'name' => $get->name,
                'contact' => $get->phone_number,
                'loanAmount' => $details->netProceeds,
                'loanAmountWords' => $this->numberToWords($details->netProceeds) . ' pesos only. ',
                'loanCode' => date('Y') . '-' . $get->cid . $get->id,
                'term' => $details->term,
                'days' => 0,
                'dueDate' => now()->addMonths(4),
                'interestRate' => $this->Interest($get->loan_code),
                'savings' => 33072.86,
                'capital' => 5400.00,
                'others' => '',
                'photo' => $img,
                'signature' => $signa,
                'load_code' => $this->loadCode($get->loan_code),
                'payable' => $originalDate->format('Y-m-d')
            ];
        }

        $pdf = Pdf::loadView('promisory-note', $data)->setPaper('a4', 'portrait');
        return $pdf->download($get->name . '-' . $data['loanCode'] . '-' . $data['loanCode'] . '.pdf');
    }

    public function viewLoanDetails($id)
    {
        $details = LoanApplication::LoanView($id);
        $img = UserImages::useravatar($details->user_id);
        if ($img) {
            $img_is = $img->imgavata;
        } else {
            $img_is = '';
        }
        return Inertia::render('loans/view-details', [
            'details' =>  $details,
            'documents' => UserImages::where('loan_id', $id)->orderBy('id', 'asc')->get(),
            'img_data' => $img_is,
            'approve_by' => LoanApplication::approve($details->approve_by, 'approve_by'),
            'checkby' => LoanApplication::approve($details->check_by, 'check_by'),
            'logfile' => LoanLog::where('loan_id', $id)->orderby('id', 'desc')->get()
        ]);
    }

    public function checkBalance($membersId, $prefixId)
    {
        return response()->json(BalanceAccount::where('members_id', $membersId)->where('accid', $prefixId)->first());
    }

    public function loanApplications(Request $request)
    {
        $loan_details = [
            "loan_amount" => $request->loan_amount,
            "payment_mode" => $request->payment_mode,
            "term" => $request->term,
            "netProceeds" => $request->netProceeds,
            "interestPerPayment" => $request->interestPerPayment,
            "totalInterest" => $request->totalInterest,
            "serviceFee" => $request->serviceFee,
            "capitalRetention" => $request->capitalRetention,
            "insurance" => $request->insurance,
        ];

        $arr = [
            "user_id" => Auth::user()->id,
            "status" => 0,
            "loan_code" => $request->tabName,
            "loan_details" => json_encode($loan_details)
        ];

        $loan_id = LoanApplication::create($arr)->id;

        if ($request->magrow_gallery) {
            $arr = [
                "user_id" => Auth::user()->id,
                "image_name" => str_replace("/images/", "", $request->magrow_gallery),
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 0,
                'image_mapping' => 1
            ];
            UserImages::create($arr);
        }

        if ($request->valid_gallery) {
            $arr = [
                "user_id" => Auth::user()->id,
                "image_name" => str_replace("/images/", "", $request->valid_gallery),
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 0,
                'image_mapping' => 2
            ];
            UserImages::create($arr);
        }

        if ($request->co_maker_magrow_gallery) {
            $arr = [
                "user_id" => Auth::user()->id,
                "image_name" => str_replace("/images/", "", $request->co_maker_magrow_gallery),
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 0,
                'image_mapping' => 6
            ];
            UserImages::create($arr);
        }

        if ($request->co_maker_valid_id_gallery) {
            $arr = [
                "user_id" => Auth::user()->id,
                "image_name" => str_replace("/images/", "", $request->co_maker_valid_id_gallery),
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 0,
                'image_mapping' => 7
            ];
            UserImages::create($arr);
        }

        if ($request->magrow_id) {
            $magrow_id = time() . '-magrowId.' . $request->magrow_id->extension();
            $request->magrow_id->move(public_path('images'), $magrow_id);
            $arr = [
                "user_id" => Auth::user()->id,
                "image_name" => $magrow_id,
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 1,
                'image_mapping' => 1
            ];
            UserImages::create($arr);
        }

        if ($request->valid_id) {
            $valid_id = time() . '-validId.' . $request->valid_id->extension();
            $request->valid_id->move(public_path('images'), $valid_id);
            $arr = [
                "user_id" => Auth::user()->id,
                "image_name" => $valid_id,
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 1,
                'image_mapping' => 2
            ];
            UserImages::create($arr);
        }

        if ($request->selfie) {
            $selfie = time() . '-selfie.' . $request->selfie->extension();
            $request->selfie->move(public_path('images'), $selfie);
            $arr = [
                "user_id" => Auth::user()->id,
                "image_name" => $selfie,
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 0,
                'image_mapping' => 3
            ];
            UserImages::create($arr);
        }

        if ($request->signature) {
            $signature = time() . '-signature.' . $request->signature->extension();
            $request->signature->move(public_path('images'), $signature);
            $arr = [
                "user_id" => Auth::user()->id,
                "image_name" => $signature,
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 0,
                'image_mapping' => 4
            ];
            UserImages::create($arr);
        }

        if ($request->co_maker_magrow_id) {
            $co_maker_magrow_id = time() . '-co_maker_magrow_id.' . $request->co_maker_magrow_id->extension();
            $request->co_maker_magrow_id->move(public_path('images'), $co_maker_magrow_id);
            $arr = [
                "user_id" => Auth::user()->id,
                "image_name" => $co_maker_magrow_id,
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 1,
                'image_mapping' => 6
            ];
            UserImages::create($arr);
        }

        if ($request->co_maker_valid_id) {
            $co_maker_valid_id = time() . '-co_maker_valid_id.' . $request->co_maker_valid_id->extension();
            $request->co_maker_valid_id->move(public_path('images'), $co_maker_valid_id);
            $arr = [
                "user_id" => Auth::user()->id,
                "image_name" => $co_maker_valid_id,
                "image_tag" => 2,
                'loan_id' => $loan_id,
                'show_img' => 1,
                'image_mapping' => 7
            ];
            UserImages::create($arr);
        }

        if (is_array($request->supporting_docs)) {
            $count = 1;
            foreach ($request->file('supporting_docs', []) as $file) {
                $payslip = time() . '-payslip-' . $count++ . '.' . $file->extension();
                $file->move(public_path('images'), $payslip);
                $arr = [
                    "user_id" => Auth::user()->id,
                    "image_name" => $payslip,
                    "image_tag" => 2,
                    'loan_id' => $loan_id,
                    'show_img' => 0,
                    'image_mapping' => 5
                ];
                UserImages::create($arr);
            }
        }


        //    return to_route('dashboard');
    }

    public function test()
    {
        echo '<pre>';
        $permission = session()->all();
        $permissions = $permission['user_role'];
        print_r($permissions);
    }
    private function loadCode($loanCode)
    {
        switch ($loanCode) {
            case 1:
                return 'Net Cash';
            case 2:
                return 'LAD';
            case 3:
                return 'APL (CA)';
            default:
                return 'Net Cash';
        }
    }

    private function numberToWords($number)
    {
        $hyphen      = '-';
        $conjunction = ' and ';
        $separator   = ' ';
        $negative    = 'negative ';
        $decimal     = ' point ';
        $dictionary  = [
            0 => 'zero',
            1 => 'one',
            2 => 'two',
            3 => 'three',
            4 => 'four',
            5 => 'five',
            6 => 'six',
            7 => 'seven',
            8 => 'eight',
            9 => 'nine',
            10 => 'ten',
            11 => 'eleven',
            12 => 'twelve',
            13 => 'thirteen',
            14 => 'fourteen',
            15 => 'fifteen',
            16 => 'sixteen',
            17 => 'seventeen',
            18 => 'eighteen',
            19 => 'nineteen',
            20 => 'twenty',
            30 => 'thirty',
            40 => 'forty',
            50 => 'fifty',
            60 => 'sixty',
            70 => 'seventy',
            80 => 'eighty',
            90 => 'ninety',
            100 => 'hundred',
            1000 => 'thousand',
            1000000 => 'million',
            1000000000 => 'billion'
        ];

        if (!is_numeric($number)) {
            return false;
        }

        if ($number < 0) {
            return $negative . $this->numberToWords(abs($number));
        }

        $string = '';

        if ($number < 21) {
            $string = $dictionary[$number];
        } elseif ($number < 100) {
            $tens   = ((int) ($number / 10)) * 10;
            $units  = $number % 10;
            $string = $dictionary[$tens];
            if ($units) {
                $string .= $hyphen . $dictionary[$units];
            }
        } elseif ($number < 1000) {
            $hundreds  = (int) ($number / 100);
            $remainder = $number % 100;
            $string = $dictionary[$hundreds] . ' hundred';
            if ($remainder) {
                $string .= $conjunction . $this->numberToWords($remainder);
            }
        } else {
            foreach ([1000000000 => 'billion', 1000000 => 'million', 1000 => 'thousand'] as $value => $word) {
                if ($number >= $value) {
                    $baseUnits = (int) ($number / $value);
                    $remainder = $number % $value;
                    $string = $this->numberToWords($baseUnits) . ' ' . $word;
                    if ($remainder) {
                        $string .= $separator . $this->numberToWords($remainder);
                    }
                    break;
                }
            }
        }

        return $string;
    }
    private function paymentMode($paymentMode)
    {
        switch ($paymentMode) {
            case 1:
                return 'Weekly';
            case 2:
                return 'Semi - monthly';
            case 3:
                return 'Monthly';
            case 4:
                return 'Quarterly';
            default:
                return 'Weekly';
        };
    }
    private function Interest($loan_code)
    {
        switch ($loan_code) {
            case 1:
                return 24; //net cash
            case 2:
                return 18; //Lad
            case 3:
                return 36; // APL
            default:
                return 24; //if false set to net cash
        }
    }
}
