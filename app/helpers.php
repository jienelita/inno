<?php

use App\Models\DataKey;
use App\Models\LoanLog;
use App\Models\PaymentHistory;
use App\Models\UserImages;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

function hasPermission($feature, $cap)
{

    if (Auth::user()->is_admin == 3) {
        return true;
    }
    $permission = session()->all();
    $permissions = $permission['user_role'];
    foreach ($permissions as $permission) {
        if (strtolower($permission->capability) === strtolower($cap) && strtolower($permission->feature_id) === strtolower($feature)) {
            return true;
        }
    }
    return false;
}

function loanLog($status, $loan_id, $reason = '', $isaccounting = 1)
{
    $date = date('M. d, y H:i:s');
    $text = '';
    if ($reason != '') {
        $text = '<br /> Reason: ' . $reason;
    }
    $logmessage = Auth::user()->name . ' (' . Auth::user()->id . ') set status to <span class="' . statusReturn($status)['color'] . '">' . statusReturn($status)['text'] . '</span>.<br />' . $date . ' ' . $text;
    if ($isaccounting == 2) {
        $logmessage = Auth::user()->name . ' (' . Auth::user()->id . ') set status to <span class="' . accountingReturn($status)['color'] . '">' . accountingReturn($status)['text'] . '</span>.<br />' . $date . ' ' . $text . '<br/> Department: Accounting ';
    }
    $arr = [
        'log_message' => $logmessage,
        'loan_id' => $loan_id,
        'update_by' => Auth::user()->id,
        'status' => $status
    ];
    LoanLog::create($arr);
}

function accountingReturn($status)
{
    switch ($status) {
        case 1:
            return ['text' => 'Pre - Approved', 'color' => 'text-green-600'];
        case 2:
            return ['text' => 'Deny', 'color' => 'text-red-600'];
        default:
            return ['text' => 'Unknown', 'color' => ''];
    }
}

function statusReturn($status)
{
    switch ($status) {
        case 0:
            return ['text' => 'Pending', 'color' => 'text-red-600'];
        case 1:
            return ['text' => 'Approved', 'color' => 'text-green-600'];
        case 2:
            return ['text' => 'Disapproved', 'color' => 'text-red-600'];
        case 3:
            return ['text' => 'Validated', 'color' => 'text-blue-600'];
        case 4:
            return ['text' => 'Reject', 'color' => 'text-orange-600'];
        case 5:
            return ['text' => 'Disbursements', 'color' => 'text-green-600'];
        default:
            return ['text' => 'Unknown', 'color' => ''];
    }
}

function HistoryTransaction($cid, $accNo, $request)
{
    PaymentHistory::where('acc_no', $accNo)->where('cid', $cid)->delete();
    DB::connection('sqlsrv')
        ->table('TRNHIST')
        ->where('ACC', $accNo)
        ->orderBy('Recid', 'DESC')
        ->chunk(100, function ($dataHistory) use ($request) {
            foreach ($dataHistory as $data) {
                $arr = [
                    "cid" => $data->CID,
                    "recid" => $data->Recid,
                    "acc_no" => trim($data->Acc),
                    "chd" => $data->Chd,
                    "trn" => $data->Trn,
                    "trn_desc" => $data->TrnDesc,
                    "trn_mode" => $data->TrnMode,
                    "trn_amount" => number_format($data->TrnAmt / 100, 2),
                    "balance_amount" => number_format($data->BalAmt / 100, 2),
                    "trn_date" => $data->TrnDate,
                ];
                PaymentHistory::create($arr);
            }
        });
}

function avatar($userid)
{
    $user = UserImages::useravatar($userid);
    $img = 'avatar.jpg';
    if ($user) {
        $img = $user->imgavata;
    }
    return $img;
}


function humanFileSize($bytes, $decimals = 2)
{
    if ($bytes <= 0) return '0 B';
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $factor = floor(log($bytes, 1024));
    return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . ' ' . $units[$factor];
}

function semaphoneMessage($post)
{
    $ch = curl_init();
    $string = preg_replace('/\s+/', '', trim($post['number']));
    $number = str_replace('+63', '0', $string);
    $parameters = array(
        'apikey' => DataKey::where('id', 1)->first()->api_key, //Your API KEY
        'number' => $number,
        'message' => $post['message'],
        'sendername' => 'SEMAPHORE'
    );

    curl_setopt($ch, CURLOPT_URL, 'https://semaphore.co/api/v4/messages');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($parameters));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $output = curl_exec($ch);
    curl_close($ch);
    // print_r($output);
    // die();
}


function sms88()
{
    $curl = curl_init();

    curl_setopt_array($curl, [
        CURLOPT_URL => "https://sms.8x8.com/api/v1/subaccounts/MagrowMpc_4eED3_hq/messages",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => json_encode([
            'encoding' => 'AUTO',
            'track' => null,
            'text' => 'Your One-Time Password (OTP) is: 874609.',
            'destination' => '+639970628352'
        ]),
        CURLOPT_HTTPHEADER => [
            "accept: application/json",
            "authorization: Bearer yfvKEAITmttqJijpRVIpa0AbFVI615IVZWNg8n5XTo",
            "content-type: application/json"
        ],
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
        echo "cURL Error #:" . $err;
    } else {
        echo $response;
    }
}