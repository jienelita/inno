<?php
use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::post('/login', [ApiController::class, 'login']);
Route::get('/paymenthistory/{userid}', [ApiController::class, 'paymenthistory']);
Route::get('/payments/details/{account_no}', [ApiController::class, 'details']);
Route::get('/loan-details/{loan_id}/{userid}', [ApiController::class, 'loanDetails']);
Route::post('/loan-submit', [ApiController::class, 'loanSubmit']);
Route::get('/my-applications/{user_id}', [ApiController::class, 'myApplications']);

// Route::group(['prefix' => 'api'], function () {
//     Route::post('/login', [ApiController::class, 'login']);
//     Route::middleware('auth:sanctum')->post('/logout', [ApiController::class, 'logout']);
//     Route::middleware('auth:sanctum')->get('/user', fn(Request $request) => $request->user());
// });