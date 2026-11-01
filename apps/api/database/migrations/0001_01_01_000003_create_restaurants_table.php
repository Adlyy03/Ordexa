<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo_url')->nullable();
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->json('operational_hours')->nullable();
            $table->enum('subscription_status', [
                'registered', 'pending_payment', 'active', 'grace_period', 'expired', 'suspended',
            ])->default('registered');
            $table->timestamps();
            $table->softDeletes();

            $table->index('subscription_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
