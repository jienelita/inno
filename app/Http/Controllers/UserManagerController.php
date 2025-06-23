<?php

namespace App\Http\Controllers;

use App\Models\BalanceAccount;
use App\Models\PaymentHistory;
use App\Models\Role;
use App\Models\RoleGroup;
use App\Models\RoleList;
use App\Models\RolePermission;
use App\Models\RoleUser;
use App\Models\User;
use App\Models\UserImages;
use App\Models\UserReason;
use App\Models\UserSession;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Twilio\Rest\Client;
use Twilio\Http\CurlClient;

class UserManagerController extends Controller
{
    public function index()
    {
        return Inertia::render('user/user-manager', [
            'user_list' => User::selectraw('users.id as user_id, users.*')->where('is_admin', '>', 0)->get(),
            'role' => Role::all(),
            'role_group' => RoleGroup::all(),
            'role_list' => RoleList::all(),
        ]);
    }

    public function loanManager()
    {
        return Inertia::render('loans/index', [
            'user' => User::all()
        ]);
    }

    public function updateUser($userid)
    {
        return Inertia::render('user/update-user', [
            'user_details' => User::find($userid),
            'image_name' => avatar($userid),
        ]);
    }

    public function FileManager()
    {
        $images = UserImages::where('user_id', Auth::user()->id)->get()->map(function ($img) {
            $path = "images/{$img->image_name}";

            $extension = Str::lower(pathinfo($img->image_name, PATHINFO_EXTENSION));
            $category = match ($extension) {
                'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp' => 'Image',
                'mp3', 'wav', 'aac' => 'Music',
                'mp4', 'mov', 'avi' => 'Video',
                'pdf', 'docx', 'txt' => 'Document',
                default => 'Other',
            };
            $sizeInBytes = file_exists($path) ? filesize($path) : 0;

            return [
                'id' => $img->id,
                'image_name' => $img->image_name,
                'image_tag' => $img->image_tag,
                'created_at' => $img->created_at->toDateTimeString(),
                'category' => $category,
                'size' => humanFileSize($sizeInBytes),
            ];
        });

        return Inertia::render('user/file-manager', [
            'user_image' => $images
        ]);
    }

    public function UpdateUserPost(Request $request)
    {
        if (request()->ajax()) {
            
            // $sid = 'ACd7f8f6c5951081ec4a558c13d55584fb';
            // $token = 'f45c41896a6a9c6c5157d57e013d4ef6';

            // $twilio = new Client($sid, $token);

            $otp = rand(100000, 999999);
            // $to = '+639970628352';

            // try {
            //     $message = $twilio->messages->create(
            //         $to,
            //         [
            //             'from' => '+14849228654',
            //             'body' => "Your verification code is: $otp"
            //         ]
            //     );
            //     echo "OTP sent! SID: " . $message->sid;
            // } catch (Exception $e) {
            //     echo "Error: " . $e->getMessage();
            // }

            // die();

            $request->validate([
                //'password' => ['required', 'confirmed', Rules\Password::defaults()],
                "current_address" => ['required'],
                "permanent_address" => ['required'],
                "first_name" => ['required'],
                "last_name" => ['required'],
                "phone_number" => ['required'],
                "bithdate" => ['required'],
                "birth_place" => ['required'],
                "middle_name" => ['required'],
            ]);

            if ($request["is_new_member"] == 1) {
                $cid = NULL;
            } else {
                $cid = $request['cid'];
            }

            $arr = [
                "current_address" => $request["current_address"],
                "permanent_address" => $request["permanent_address"],
                "first_name" => $request["first_name"],
                "last_name" => $request["last_name"],
                "phone_number" => $request["phone_number"],
                "bithdate" => $request["bithdate"],
                "birth_place" => $request["birth_place"],
                "name" => $request["first_name"] . ' ' . $request["last_name"] . ' ' . $request["prefix_name"],
                "middle_name" => $request["middle_name"],
                "prefix_name" => $request["prefix_name"],
                "is_active" => 2,
                "cid" => $cid,
                "otp" =>  $otp
            ];
            User::where('id', $request['user_id'])->update($arr);

            if (isset($_FILES['photo'])) {
                $files = $_FILES['photo'];
                $imageName = time() . '.' . pathinfo($files['name'], PATHINFO_EXTENSION);
                $location = "images/" . $imageName;
                move_uploaded_file($_FILES['photo']['tmp_name'], $location);
                $arr = [
                    "user_id" => $request['user_id'],
                    "original_name" => $files['name'],
                    "image_name" => $imageName,
                    "image_tag" => 1
                ];
                UserImages::create($arr);
            }
        }
    }

    public function membersList(Request $request)
    {
        $pagesize = 20;
        if (isset($request['pagesize'])) {
            $pagesize = $request['pagesize'];
        }
        $query =  User::selectraw('users.id as user_id, users.*')->where('is_admin',  0)->where('is_active', 3)->orderBy('id', 'desc');  //orderBy('id', 'asc');
        if ($request->filled('statusSetData')) {
            $statuses = is_array($request->statusSetData) ? $request->statusSetData : [$request->statusSetData];
            $query->whereIn('status', $statuses);
        }
        $userlist = $query->paginate($pagesize)->withQueryString();

        return Inertia::render('user/index', [
            'user_list' =>  $userlist
        ]);
    }

    public function UpdateUserStatus(Request $request)
    {
        $user = User::findOrFail($request->id);
        $user->is_active = $request->status;
        $user->save();
        if ($request->status == 2) {
            $arr = [
                'reason' =>  $request->reason,
                'user_id' => $request->id,
                'created_by' => Auth::user()->id,
                'stat' => 0
            ];

            UserReason::create($arr);
        }
    }

    // public function DeleteRole(Request $request)
    // {
    //     $roleid = $request['roleId'];
    //     if (RoleUser::where('roles_id', $roleid)->get()->count() === 0) {
    //         Role::where('id', $roleid)->delete();
    //         return back()->with([
    //             'status' => 1,
    //         ]);
    //     } else {
    //         return back()->with([
    //             'status' => 2,
    //         ]);
    //     }
    // }

    public function DeleteUser(Request $request)
    {
        if (UserSession::where('user_id', $request['userid'])->get()->count() > 0) {
            return back()->with([
                'status' => 1,
                'message' => 'Unable to delete user, please logout user.'
            ]);
        } else {

            return back()->with([
                'status' => 2,
                'message' => 'User successfully deleted.'
            ]);
        }
    }

    public function getProfile($user_id)
    {
        $user = UserImages::useravatar($user_id);
        $img = 'avatar.jpg';
        if ($user) {
            $img = $user->imgavata;
        }
        return response()->json([
            'image_name' => $img,
            'reason' => UserReason::statusReturn($user_id, 0)['reason'],
            'disable_by' => UserReason::statusReturn($user_id, 0)['name'],
            'disaproved_by' => UserReason::statusReturn($user_id, 1)['name'],
            'disaproved_res' => UserReason::statusReturn($user_id, 1)['reason'],
        ]);
    }

    public function UpdateUserRole(Request $request)
    {
        if (is_array($request['values']['role'])) {
            $userID = $request['userId'];
            RolePermission::where('user_id', $userID)->delete();
            RoleUser::where('user_id', $userID)->delete();
            foreach ($request['values']['role'] as $roleId) {
                RoleUser::create([
                    'user_id' => $userID,
                    'roles_id' => $roleId,
                ]);
                $role = Role::find($roleId);
                if ($role) {
                    $rolePermissions = json_decode($role->permission);
                    foreach ($rolePermissions as $key => $permissions) {
                        foreach ($permissions as $value) {
                            if (!RolePermission::where('user_id', $userID)->where('feature_id', $key)->where('capability', $value)->exists()) {
                                $permission = new RolePermission();
                                $permission->user_id = $userID;
                                $permission->role_id = $role->id;
                                $permission->feature_id = $key;
                                $permission->capability = $value;
                                $permission->save();
                            }
                        }
                    }
                }
            }
        }
    }

    public function UpdatePassword(Request $request)
    {
        $arr = [
            'password' => Hash::make($request->pass),
        ];
        User::where('id', $request->userId)->update($arr);
    }

    public function UpdateMemberStatus(Request $request)
    {
        $arr = [
            'status' => $request->status,
        ];
        User::where('id', $request->id)->update($arr);
        if ($request->status == 2) {
            $arr = [
                'user_id' => $request->id,
                'reason' => $request->reason,
                'created_by' => Auth::user()->id,
                'stat' => 1
            ];
            UserReason::create($arr);
        }
    }

    public function UpdateCid($userId, Request $request)
    {
        if ($request['cid'] > 0) {
            //check
            if (User::where('cid', $request['cid'])->where('id', '!=', $userId)->get()->count() > 0) {
                return back()->with([
                    'status' => 1,
                    'message' => ''
                ]);
            } else {
                $arr = [
                    'cid' => $request['cid']
                ];
                User::where('id', $userId)->update($arr);
            }
        } else {
            return back()->with([
                'status' => 0,
                'message' => ''
            ]);
        }
    }

    public function saveUser(Request $request)
    {
        $record = $request->records;
        $arr = [
            "email"  => $record['email'],
            "is_active" => 3,
            "password" => Hash::make($record['password']),
            "first_name" => $record['fname'],
            "last_name" => $record['lname'],
            "is_admin" => $record['user_type'],
            "name" => $record['fname'] . ' ' . $record['lname']
        ];
        $last_id = User::create($arr)->id;
        if ($record['user_type'] != 3) {
            if (is_array($record['role'])) {
                foreach ($record['role'] as $roleId) {
                    RoleUser::create([
                        'user_id' => $last_id,
                        'roles_id' => $roleId,
                    ]);
                    $role = Role::find($roleId);
                    if ($role) {
                        $rolePermissions = json_decode($role->permission);
                        foreach ($rolePermissions as $key => $permissions) {
                            foreach ($permissions as $value) {
                                if (!RolePermission::where('user_id', $last_id)->where('feature_id', $key)->where('capability', $value)->exists()) {
                                    $permission = new RolePermission();
                                    $permission->user_id = $last_id;
                                    $permission->role_id = $role->id;
                                    $permission->feature_id = $key;
                                    $permission->capability = $value;
                                    $permission->save();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    public function UpdateUserDatabase(Request $request)
    {
        $cid = str_pad($request['records']['cid'], 6, '0', STR_PAD_LEFT);
        $members_id = $request['records']['user_id'];

        if (BalanceAccount::where('members_id', $members_id)->count() > 0) {
            BalanceAccount::where('members_id', $members_id)->delete();
        }

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
                    ->first()
                    ->FullDesc ?? null;
                $is_loan = 0;

                $is_loan = in_array($accid, [87, 79, 73, 51]) ? 1 : 0;

                $arr = [
                    "cid" => $item->CID,
                    "account_no" => trim($item->ACC),
                    "br_code" => $item->BrCode,
                    "balance" => number_format($balance, 2),
                    "is_balance" => $is_loan,
                    "prefix" => $prefix,
                    "generate_by" => Auth::user()->id,
                    "accid" => $accid,
                    "members_id" => $members_id,
                    'chd' => $item->Chd
                ];
                if ($balance > 0) {
                    BalanceAccount::create($arr);
                }
            });
    }

    public function testQuery(Request $request)
    {
        $accNo = trim('1708838');
        $cid = 17093;
        //$this->GeneratePaymentHistory($request);
    }
}
