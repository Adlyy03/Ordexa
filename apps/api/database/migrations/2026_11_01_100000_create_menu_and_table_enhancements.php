<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Menu Categories
        Schema::create('menu_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('restaurant_id');
        });

        // 2. Menu Items
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_category_id')->constrained('menu_categories')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('price');
            $table->string('image_url')->nullable();
            $table->boolean('is_available')->default(true);
            $table->json('variants')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['restaurant_id', 'menu_category_id', 'is_available']);
        });

        // 3. Branch Menu Availability Overrides
        Schema::create('branch_menu_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->unique(['branch_id', 'menu_item_id']);
        });

        // 4. Add restaurant_id to tables if not present
        if (! Schema::hasColumn('tables', 'restaurant_id')) {
            Schema::table('tables', function (Blueprint $table) {
                $table->foreignId('restaurant_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                $table->index('restaurant_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('tables', 'restaurant_id')) {
            Schema::table('tables', function (Blueprint $table) {
                $table->dropForeign(['restaurant_id']);
                $table->dropColumn('restaurant_id');
            });
        }

        Schema::dropIfExists('branch_menu_settings');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menu_categories');
    }
};
