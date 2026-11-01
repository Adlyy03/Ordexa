<?php

namespace App\Modules\Subscription\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Payment\Services\SubscriptionPaymentService;
use App\Modules\Subscription\Models\Package;
use App\Modules\Subscription\Models\Subscription;
use App\Modules\Subscription\Services\FeatureEntitlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(
        protected FeatureEntitlementService $entitlementService,
        protected SubscriptionPaymentService $paymentService
    ) {}

    public function packages(): JsonResponse
    {
        $packages = Package::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => $packages,
        ]);
    }

    public function current(Request $request): JsonResponse
    {
        $restaurant = $request->user()->currentMembership()?->restaurant;

        if (! $restaurant) {
            return response()->json([
                'message' => 'Restoran tidak ditemukan.',
            ], 404);
        }

        $subscription = $restaurant->subscriptions()
            ->with('package')
            ->latest()
            ->first();

        return response()->json([
            'data' => [
                'restaurant_id' => $restaurant->id,
                'subscription_status' => $restaurant->subscription_status,
                'active_subscription' => $subscription,
            ],
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_id' => ['required', 'exists:packages,id'],
            'billing_period' => ['required', 'in:monthly,yearly'],
            'gateway' => ['sometimes', 'in:xendit,midtrans'],
        ]);

        $restaurant = $request->user()->currentMembership()?->restaurant;

        if (! $restaurant) {
            return response()->json(['message' => 'Restoran tidak ditemukan.'], 404);
        }

        $package = Package::findOrFail($validated['package_id']);
        $amount = $validated['billing_period'] === 'yearly'
            ? $package->price_yearly
            : $package->price_monthly;

        $subscription = $restaurant->subscriptions()->create([
            'package_id' => $package->id,
            'status' => 'pending_payment',
            'billing_period' => $validated['billing_period'],
            'amount' => $amount,
        ]);

        $restaurant->update(['subscription_status' => 'pending_payment']);

        $gateway = $validated['gateway'] ?? 'xendit';
        $invoiceData = $this->paymentService->createSubscriptionInvoice($subscription, $gateway);

        return response()->json([
            'message' => 'Langganan berhasil dibuat, silakan lakukan pembayaran.',
            'data' => [
                'subscription' => $subscription->load('package'),
                'payment' => $invoiceData,
            ],
        ], 201);
    }
}
