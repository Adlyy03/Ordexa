<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->enum('track', ['subscription', 'customer_order'])->default('subscription');
            $table->string('gateway'); // xendit, midtrans
            $table->string('external_id')->unique();
            $table->string('idempotency_key')->unique();
            $table->integer('amount');
            $table->enum('status', ['pending', 'paid', 'failed', 'expired'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('payment_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->index(['restaurant_id', 'status']);
            $table->index(['gateway', 'external_id']);
            $table->index('idempotency_key');
        });

        Schema::create('payment_webhooks', function (Blueprint $table) {
            $table->id();
            $table->string('gateway');
            $table->string('event_type')->nullable();
            $table->string('idempotency_key')->unique();
            $table->json('payload');
            $table->boolean('is_processed')->default(false);
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['gateway', 'is_processed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_webhooks');
        Schema::dropIfExists('payment_transactions');
    }
};
