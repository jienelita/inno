<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class SkipCsrfForApi extends Middleware
{
    protected function inExceptArray($request)
    {
        // Match API paths
        return str_starts_with($request->path(), 'api/');
    }
}