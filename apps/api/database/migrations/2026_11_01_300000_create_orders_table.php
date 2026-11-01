<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('table_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
                ->default('pending');
            $table->enum('payment_status', ['unpaid', 'pending', 'paid', 'failed', 'expired'])
                ->default('unpaid');
            $table->enum('order_type', ['qr_order', 'pos_order'])->default('qr_order');
            $table->integer('subtotal');
            $table->integer('discount')->default(0);
            $table->integer('total_amount');
            $table->text('notes')->nullable();
            $table->string('customer_name')->nullable();
            $table->timestamps();

            $table->index(['branch_id', 'status', 'created_at']);
            $table->index(['restaurant_id', 'payment_status']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_item_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->integer('price');
            $table->string('variant')->nullable();
            $table->integer('quantity');
            $table->text('notes')->nullable();
            $table->integer('subtotal');
            $table->timestamps();

            $table->index(['order_id', 'menu_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
