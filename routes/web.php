<?php
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\RoleManagerController;
use App\Http\Controllers\UserManagerController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');

    Route::post('/loans/delete/{id}', [LoanController::class, 'delete']);
    Route::get('/loan/view/{id}', [LoanController::class, 'viewLoanDetails']);

    Route::middleware(['auth', 'is_user'])->group(function () {
        Route::get('loans', [LoanController::class, 'index'])->name('loans');
        Route::get('loan/loan-calculator', [LoanController::class, 'loanCalculator'])->name('loan.calculator');
        Route::post('/loan-applications', [LoanController::class, 'loanApplications']);
        Route::post('/resend-otp', [OtpController::class, 'resend'])->name('otp.resend');
        Route::post('/verify-otp', [OtpController::class, 'verify'])->name('otp.verify');
        Route::get('/members-balance/{membersId}/{prefixId}', [LoanController::class, 'checkBalance']);
    });

    Route::middleware(['auth', 'is_admin'])->group(function () {
        Route::get('user-manager', [UserManagerController::class, 'index']);        
        Route::get('/role-manager', [RoleManagerController::class, 'index']);
        Route::post('/save-role', [RoleManagerController::class, 'saveRole']);
        Route::get('/list-of-roles/{group_id}', [RoleManagerController::class, 'listofRoles']);
        Route::post('/save-user', [UserManagerController::class, 'saveUser']);
        Route::get('/role-list/{group_id}', [RoleManagerController::class, 'listofRoles']);
        Route::get('/user-role-assign/{group_id}', [RoleManagerController::class, 'UserAssignRole']);
        Route::get('/update-role/{role_id}', [RoleManagerController::class, 'UpdateRoleData']);
        Route::post('/update-user-assign-role', [UserManagerController::class, 'UpdateUserRole']);
        Route::post('/user-password-update', [UserManagerController::class, 'UpdatePassword']);
        Route::post('/update-role/{roleid}', [RoleManagerController::class, 'updateRole']);
        Route::get('/user-count-role/{role_id}', [RoleManagerController::class, 'CountRoleUser']);
        Route::get('/query', [UserManagerController::class, 'testQuery']);
        Route::post('/update-user-database', [UserManagerController::class, 'UpdateUserDatabase']);
        
    });

    Route::middleware(['auth', 'is_admin_or_any'])->group(function () {
        Route::post('loan-update-reason/{loanID}/{status}', [LoanController::class, 'loanUpdateReason']);
        Route::get('/members', [UserManagerController::class, 'membersList']);
        Route::get('/loan-manager', [LoanController::class, 'loanManager']);
        Route::get('/member/{user_id}', [UserManagerController::class, 'updateUser']);
        Route::post('/user-manager/update-status', [UserManagerController::class, 'UpdateUserStatus']);
        Route::get('/user-manager/profile-image/{id}', [UserManagerController::class, 'getProfile']);
        Route::post('/loan-update-status/{statusID}/{loanID}', [LoanController::class, 'loanUpdateStatus']);
        Route::post('/update-accounting/{loanid}/{status}', [LoanController::class, 'UpdateAccountingDeny']);
        Route::post('/user-manager/member-status', [UserManagerController::class, 'UpdateMemberStatus']);
        
        Route::get('/promisory-note/{loanId}', [LoanController::class, 'promisorynote']);
        Route::get('/members-loan/{membersId}', [LoanController::class, 'MembersLoan']);
    });

    Route::get('test', [LoanController::class, 'test']);
    Route::post('update-id-image', [ImageController::class, 'UpdateImage']);
});

Route::get('/check-cid', function (Request $request) {
    $exists = User::where('cid', $request->CID)->exists();
    return response()->json(['available' => !$exists]);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
