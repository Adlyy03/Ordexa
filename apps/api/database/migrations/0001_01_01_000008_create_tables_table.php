<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('qr_token')->unique();
            $table->string('qr_image_url')->nullable();
            $table->integer('capacity')->default(4);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('branch_id');
            $table->index('qr_token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};
