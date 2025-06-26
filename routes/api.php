<?php
use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::post('/login', [ApiController::class, 'login']); // ✅ No CSRF required


// Route::group(['prefix' => 'api'], function () {
//     Route::post('/login', [ApiController::class, 'login']);
//     Route::middleware('auth:sanctum')->post('/logout', [ApiController::class, 'logout']);
//     Route::middleware('auth:sanctum')->get('/user', fn(Request $request) => $request->user());
// });