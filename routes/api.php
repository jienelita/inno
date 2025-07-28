<?php
use App\Http\Controllers\ApiController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::post('/login', [ApiController::class, 'login']);
Route::get('/paymenthistory/{userid}', [ApiController::class, 'paymenthistory']);
Route::get('/payments/details/{account_no}', [ApiController::class, 'details']);
Route::get('/loan-details/{loan_id}/{userid}', [ApiController::class, 'loanDetails']);
Route::post('/loan-submit', [ApiController::class, 'loanSubmit']);
Route::get('/my-applications/{user_id}', [ApiController::class, 'myApplications']);
Route::get('/loan-info/{id}', [ApiController::class, 'loanInfo']);
Route::get('/user-profile/{id}', [ApiController::class, 'profile']);
Route::post('/update-user/{id}', [ApiController::class, 'UpdateUser']);
Route::post('/update-avatar/{id}', [ApiController::class, 'updateAvatar']);
Route::post('/verify-otp', [ApiController::class, 'verifyOtp']);
Route::post('/chat-support', [ApiController::class, 'ChatStore']);
Route::get('/chat-support/{userId}', [ApiController::class, 'ChatFetch']);

Route::get('/check-cid/{cid}', function ($cid) {
    $exists = User::where('cid', $cid)->exists();
    return response()->json(['exists' => $exists]);
});