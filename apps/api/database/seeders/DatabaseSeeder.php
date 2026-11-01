<?php

namespace Database\Seeders;

use App\Models\RestaurantMembership;
use App\Models\User;
use App\Modules\Branch\Models\Branch;
use App\Modules\Menu\Models\MenuCategory;
use App\Modules\Menu\Models\MenuItem;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Subscription\Models\Package;
use App\Modules\Subscription\Models\Subscription;
use App\Modules\Table\Models\Table;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PackageSeeder::class);

        // 1. Super Admin Account
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@ordexa.id'],
            [
                'name' => 'Ordexa Super Admin',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        auth()->login($superAdmin);

        // 2. Demo Restaurant (Active)
        $restaurant = Restaurant::updateOrCreate(
            ['slug' => 'resto-nusantara'],
            [
                'name' => 'Resto Nusantara',
                'subscription_status' => 'active',
            ]
        );

        // 3. Subscription (Professional Package)
        $proPackage = Package::where('slug', 'professional')->first() ?? Package::first();
        if ($proPackage) {
            Subscription::updateOrCreate(
                ['restaurant_id' => $restaurant->id],
                [
                    'package_id' => $proPackage->id,
                    'status' => 'active',
                    'billing_period' => 'monthly',
                    'amount' => $proPackage->price_monthly ?? 299000,
                    'starts_at' => now(),
                    'ends_at' => now()->addDays(30),
                    'grace_ends_at' => now()->addDays(37),
                ]
            );
        }

        // 4. Branches
        $branchSenopati = Branch::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'slug' => 'senopati'],
            [
                'name' => 'Cabang Senopati',
                'is_active' => true,
            ]
        );

        $branchBsd = Branch::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'slug' => 'bsd'],
            [
                'name' => 'Cabang BSD',
                'is_active' => true,
            ]
        );

        // 5. Staff Accounts
        // Owner
        $owner = User::updateOrCreate(
            ['email' => 'owner@nusantara.com'],
            [
                'name' => 'Budi Pratama (Owner)',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        RestaurantMembership::updateOrCreate(
            ['user_id' => $owner->id, 'restaurant_id' => $restaurant->id],
            [
                'role' => 'owner',
                'branch_id' => $branchSenopati->id,
                'is_active' => true,
            ]
        );

        // Cashier (Kasir Senopati)
        $cashier = User::updateOrCreate(
            ['email' => 'kasir@nusantara.com'],
            [
                'name' => 'Siti Kasir',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        RestaurantMembership::updateOrCreate(
            ['user_id' => $cashier->id, 'restaurant_id' => $restaurant->id],
            [
                'role' => 'cashier',
                'branch_id' => $branchSenopati->id,
                'is_active' => true,
            ]
        );

        // Kitchen (Dapur Senopati)
        $kitchen = User::updateOrCreate(
            ['email' => 'dapur@nusantara.com'],
            [
                'name' => 'Chef Junaedi',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        RestaurantMembership::updateOrCreate(
            ['user_id' => $kitchen->id, 'restaurant_id' => $restaurant->id],
            [
                'role' => 'kitchen',
                'branch_id' => $branchSenopati->id,
                'is_active' => true,
            ]
        );

        // 6. Tables for Cabang Senopati
        $table1 = Table::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'branch_id' => $branchSenopati->id, 'qr_token' => 'meja-01'],
            [
                'name' => 'Meja 01',
                'capacity' => 4,
                'is_active' => true,
            ]
        );

        $table2 = Table::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'branch_id' => $branchSenopati->id, 'qr_token' => 'meja-02'],
            [
                'name' => 'Meja 02',
                'capacity' => 2,
                'is_active' => true,
            ]
        );

        $table3 = Table::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'branch_id' => $branchSenopati->id, 'qr_token' => 'meja-03'],
            [
                'name' => 'Meja 03',
                'capacity' => 6,
                'is_active' => true,
            ]
        );

        // 7. Menu Categories
        $catMakanan = MenuCategory::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'name' => 'Makanan Utama'],
            ['sort_order' => 1, 'is_active' => true]
        );

        $catMinuman = MenuCategory::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'name' => 'Minuman Segar'],
            ['sort_order' => 2, 'is_active' => true]
        );

        $catCamilan = MenuCategory::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'name' => 'Camilan & Penutup'],
            ['sort_order' => 3, 'is_active' => true]
        );

        // 8. Menu Items
        $itemNasgor = MenuItem::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'name' => 'Nasi Goreng Spesial'],
            [
                'menu_category_id' => $catMakanan->id,
                'description' => 'Nasi goreng khas Nusantara dengan telur mata sapi, sate ayam, dan kerupuk udang.',
                'price' => 35000,
                'is_available' => true,
                'sort_order' => 1,
            ]
        );

        $itemAyam = MenuItem::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'name' => 'Ayam Bakar Taliwang'],
            [
                'menu_category_id' => $catMakanan->id,
                'description' => 'Ayam bakar pedas gurih bumbu rempah khas Taliwang dengan plecing kangkung.',
                'price' => 45000,
                'is_available' => true,
                'sort_order' => 2,
            ]
        );

        $itemTeh = MenuItem::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'name' => 'Es Teh Manis Melati'],
            [
                'menu_category_id' => $catMinuman->id,
                'description' => 'Teh melati seduh segar dingin dengan rasa manis pas.',
                'price' => 8000,
                'is_available' => true,
                'sort_order' => 1,
            ]
        );

        $itemKopi = MenuItem::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'name' => 'Kopi Susu Gula Aren'],
            [
                'menu_category_id' => $catMinuman->id,
                'description' => 'Espresso robusta & arabica pilihan dengan susu creamy dan gula aren murni.',
                'price' => 18000,
                'is_available' => true,
                'sort_order' => 2,
            ]
        );

        $itemTahu = MenuItem::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'name' => 'Tahu Crispy Cabe Garam'],
            [
                'menu_category_id' => $catCamilan->id,
                'description' => 'Potongan tahu sutra goreng renyah ditaburi bawang putih cincang dan cabai rawit gurih.',
                'price' => 15000,
                'is_available' => true,
                'sort_order' => 1,
            ]
        );

        // 9. Sample Orders (for KDS, POS, and Analytics display)
        $order1 = Order::updateOrCreate(
            ['order_number' => 'ORD-20261101-0001'],
            [
                'restaurant_id' => $restaurant->id,
                'branch_id' => $branchSenopati->id,
                'table_id' => $table1->id,
                'status' => 'preparing',
                'payment_status' => 'paid',
                'order_type' => 'qr_order',
                'subtotal' => 43000,
                'discount' => 0,
                'total_amount' => 43000,
                'notes' => 'Sambal dipisah ya',
                'customer_name' => 'Dimas',
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order1->id, 'menu_item_id' => $itemNasgor->id],
            [
                'name' => $itemNasgor->name,
                'price' => 35000,
                'quantity' => 1,
                'notes' => 'Sambal dipisah',
                'subtotal' => 35000,
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order1->id, 'menu_item_id' => $itemTeh->id],
            [
                'name' => $itemTeh->name,
                'price' => 8000,
                'quantity' => 1,
                'notes' => 'Sedikit es',
                'subtotal' => 8000,
            ]
        );

        $order2 = Order::updateOrCreate(
            ['order_number' => 'ORD-20261101-0002'],
            [
                'restaurant_id' => $restaurant->id,
                'branch_id' => $branchSenopati->id,
                'table_id' => $table2->id,
                'status' => 'pending',
                'payment_status' => 'pending',
                'order_type' => 'qr_order',
                'subtotal' => 63000,
                'discount' => 0,
                'total_amount' => 63000,
                'notes' => 'Makan di tempat',
                'customer_name' => 'Rina',
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order2->id, 'menu_item_id' => $itemAyam->id],
            [
                'name' => $itemAyam->name,
                'price' => 45000,
                'quantity' => 1,
                'subtotal' => 45000,
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order2->id, 'menu_item_id' => $itemKopi->id],
            [
                'name' => $itemKopi->name,
                'price' => 18000,
                'quantity' => 1,
                'subtotal' => 18000,
            ]
        );

        $order3 = Order::updateOrCreate(
            ['order_number' => 'ORD-20261101-0003'],
            [
                'restaurant_id' => $restaurant->id,
                'branch_id' => $branchSenopati->id,
                'table_id' => $table3->id,
                'status' => 'completed',
                'payment_status' => 'paid',
                'order_type' => 'qr_order',
                'subtotal' => 50000,
                'discount' => 0,
                'total_amount' => 50000,
                'customer_name' => 'Andi',
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order3->id, 'menu_item_id' => $itemNasgor->id],
            [
                'name' => $itemNasgor->name,
                'price' => 35000,
                'quantity' => 1,
                'subtotal' => 35000,
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order3->id, 'menu_item_id' => $itemTahu->id],
            [
                'name' => $itemTahu->name,
                'price' => 15000,
                'quantity' => 1,
                'subtotal' => 15000,
            ]
        );
    }
}
