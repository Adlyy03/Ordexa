<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('referral_code', 32)->unique();
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending');
            $table->string('bank_name', 100)->nullable();
            $table->string('bank_account_number', 50)->nullable();
            $table->string('bank_account_name', 150)->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        Schema::create('partner_referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained('partners')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->unique()->constrained('restaurants')->cascadeOnDelete();
            $table->string('referral_code', 32);
            $table->string('attribution_source', 50)->default('direct_link');
            $table->enum('status', ['registered', 'converted', 'expired'])->default('registered');
            $table->timestamp('registered_at')->useCurrent();
            $table->timestamp('converted_at')->nullable();
            $table->timestamps();

            $table->index(['partner_id', 'status']);
        });

        Schema::create('partner_commission_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('commission_type', ['percentage', 'fixed'])->default('percentage');
            $table->decimal('commission_rate', 5, 2)->default(10.00); // 10.00%
            $table->integer('fixed_amount')->default(50000); // IDR 50.000
            $table->boolean('is_recurring')->default(true);
            $table->integer('commission_duration_months')->default(12); // 12 months (0 = indefinite)
            $table->integer('minimum_withdrawal')->default(100000); // IDR 100.000
            $table->integer('attribution_days')->default(30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('partner_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained('partners')->cascadeOnDelete();
            $table->foreignId('referral_id')->constrained('partner_referrals')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained('restaurants')->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->cascadeOnDelete();
            $table->foreignId('payment_transaction_id')->nullable()->unique()->constrained('payment_transactions')->cascadeOnDelete();
            $table->enum('commission_type', ['percentage', 'fixed', 'recurring', 'adjustment']);
            $table->decimal('commission_rate', 5, 2)->nullable();
            $table->integer('commission_amount');
            $table->enum('status', ['pending', 'available', 'paid', 'reversed'])->default('available');
            $table->string('note', 255)->nullable();
            $table->timestamp('available_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['partner_id', 'status']);
            $table->index('subscription_id');
        });

        Schema::create('partner_withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained('partners')->cascadeOnDelete();
            $table->integer('amount');
            $table->string('payout_method', 50)->default('bank_transfer');
            $table->string('payout_account_name', 150);
            $table->string('payout_account_number', 50);
            $table->string('payout_provider', 100);
            $table->enum('status', ['pending', 'approved', 'rejected', 'paid'])->default('pending');
            $table->text('admin_note')->nullable();
            $table->string('payment_reference', 100)->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['partner_id', 'status']);
        });

        Schema::create('partner_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('target_type', 100);
            $table->unsignedBigInteger('target_id');
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->index(['target_type', 'target_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_audit_logs');
        Schema::dropIfExists('partner_withdrawals');
        Schema::dropIfExists('partner_commissions');
        Schema::dropIfExists('partner_commission_settings');
        Schema::dropIfExists('partner_referrals');
        Schema::dropIfExists('partners');
    }
};
