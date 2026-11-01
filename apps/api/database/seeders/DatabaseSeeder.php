<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PackageSeeder::class);

        // Super Admin account
        User::updateOrCreate(
            ['email' => 'superadmin@ordexa.id'],
            [
                'name' => 'Ordexa Super Admin',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
    }
}
