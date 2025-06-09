<?php

namespace App\Http\Controllers;

use App\Models\BalanceAccount;
use App\Models\GeneratedDatabase;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DatabaseManagerController extends Controller
{
    public function index()
    {
       // User::factory()->count(500)->create();
        return Inertia::render('database/index', [
        ]);
    }

    public function GenerateDatabase(Request $request)
    {
        BalanceAccount::truncate();
        User::chunk(100, function ($users) use ($request) {
            foreach ($users as $data) {
                $cid = str_pad($data->cid, 6, '0', STR_PAD_LEFT);
                $members_id = $data->id;
                DB::connection('sqlsrv')
                    ->table('ClientTable')
                    ->join('RELACC', 'RELACC.CID', '=', 'ClientTable.CID')
                    ->where(function ($query) {
                        $query->where('RELACC.ACC', 'LIKE', '17%')
                            ->orWhere('RELACC.ACC', 'LIKE', '00%')
                            ->orWhere('RELACC.ACC', 'LIKE', '24%')
                            ->orWhere('RELACC.ACC', 'LIKE', '87%')
                            ->orWhere('RELACC.ACC', 'LIKE', '79%')
                            ->orWhere('RELACC.ACC', 'LIKE', '51%')
                            ->orWhere('RELACC.ACC', 'LIKE', '73%');
                    })
                    ->where('ClientTable.LastName', '!=', '')
                    ->where('RELACC.CID', $cid)
                    ->get()
                    ->map(function ($item) use ($members_id) {
                        $transaction = DB::connection('sqlsrv')
                            ->table('TRNHIST')
                            ->where('Acc', $item->ACC)
                            ->orderBy('Recid', 'DESC')
                            ->first();

                        $svac = DB::connection('sqlsrv')
                            ->table('SVACC')
                            ->where('Acc', $item->ACC)
                            ->first();

                        $balance = 0;
                        if ($transaction) {
                            $balance = $transaction->BalAmt / 100;
                            if ($svac && $svac->PrType == 24) {
                                $balance = $svac->BalAmt / 100;
                            }
                        }

                        $accid = substr(trim($item->ACC), 0, 2);
                        $prefix = DB::connection('sqlsrv')
                            ->table('PRPARMS')
                            ->where('PrType', $accid)
                            ->value('FullDesc');

                        $is_loan = in_array($accid, [87, 79, 73, 51]) ? 1 : 0;

                        if ($balance > 0) {
                            BalanceAccount::create([
                                "cid" => $item->CID,
                                "account_no" => $item->ACC,
                                "br_code" => $item->BrCode,
                                "balance" => number_format($balance, 2),
                                "is_balance" => $is_loan,
                                "prefix" => $prefix,
                                "generate_by" => Auth::user()->id,
                                "accid" => $accid,
                                "members_id" => $members_id
                            ]);
                        }
                    });
            }
        });
       // GeneratedDatabase::delete();
        $arr = [
            'total_user' => User::all()->count(),
            'generate_by' => Auth::user()->id,
        ];
        GeneratedDatabase::create($arr);
    }
}
