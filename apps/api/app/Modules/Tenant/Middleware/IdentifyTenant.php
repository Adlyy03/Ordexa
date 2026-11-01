<?php

namespace App\Modules\Tenant\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();
            if (method_exists($user, 'currentMembership')) {
                $membership = $user->currentMembership();
                if ($membership && $membership->restaurant) {
                    // Set restaurant in request attribute for downstream access
                    $request->attributes->set('current_restaurant', $membership->restaurant);
                    $request->attributes->set('current_role', $membership->role);
                    $request->attributes->set('current_branch_id', $membership->branch_id);
                }
            }
        }

        return $next($request);
    }
}
