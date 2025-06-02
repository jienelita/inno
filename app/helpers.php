<?php

use App\Models\LoanLog;
use Illuminate\Support\Facades\Auth;

function hasPermission($feature, $cap)
{

    if (auth()->user()->is_admin == 3) {
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
    $logmessage = auth()->user()->name . ' (' . auth()->user()->id . ') set status to <span class="' . statusReturn($status)['color'] . '">' . statusReturn($status)['text'] . '</span><br />' . $date . ' ' . $text;
    if ($isaccounting == 2) {
        $logmessage = auth()->user()->name . ' (' . auth()->user()->id . ') set status to <span class="' . accountingReturn($status)['color'] . '">' . accountingReturn($status)['text'] . '</span><br />' . $date . ' ' . $text.'<br/> Department: Accounting ';
    }
    $arr = [
        'log_message' => $logmessage,
        'loan_id' => $loan_id,
        'update_by' => auth()->user()->id,
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
        default:
            return ['text' => 'Unknown', 'color' => ''];
    }
}
