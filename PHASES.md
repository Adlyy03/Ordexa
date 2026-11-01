# PHASES.md — Ordexa Implementation Playbook

> **Panduan Eksekusi Per-Fase untuk AI Agents**  
> Baca dan patuhi [AGENTS.md](file:///home/adly/Projects/Ordexa/AGENTS.md) sebelum mengerjakan fase apapun.  
> Skill wajib aktif: `graphify` + `caveman` + `antislop-ui`

---

## Daftar Fase

| # | Fase | Status |
|---|------|--------|
| 1 | [Environment & Monorepo Foundation](#phase-1-environment--monorepo-foundation) | ⬜ Todo |
| 2 | [Authentication, Multi-Tenant & RBAC](#phase-2-authentication-multi-tenant--rbac) | ⬜ Todo |
| 3 | [Restaurant, Branches & Subscription Engine](#phase-3-restaurant-branches--subscription-engine) | ⬜ Todo |
| 4 | [Menu, Tables, QR & Customer Ordering](#phase-4-menu-tables-qr--customer-ordering) | ⬜ Todo |
| 5 | [Payment Gateway & Webhook Reconciliation](#phase-5-payment-gateway--webhook-reconciliation) | ⬜ Todo |
| 6 | [Order Lifecycle, Reverb & KDS/POS](#phase-6-order-lifecycle-reverb--kdspOS) | ⬜ Todo |
| 7 | [PWA, Web Push & Analytics Dashboard](#phase-7-pwa-web-push--analytics-dashboard) | ⬜ Todo |
| 8 | [Testing, Security Hardening & Deployment](#phase-8-testing-security-hardening--deployment) | ⬜ Todo |

> **Aturan Urutan**: Jangan mulai fase N+1 sebelum seluruh checklist fase N selesai dan test lolos.

---

## PHASE 1: Environment & Monorepo Foundation

### Tujuan
Membangun fondasi monorepo yang bersih, reproducible, dan siap dikembangkan semua anggota tim.

### Acceptance Criteria
- [ ] `pnpm install` di root berjalan tanpa error
- [ ] `docker compose up` menjalankan PostgreSQL, Redis, dan Nginx
- [ ] Next.js dev server hidup di `localhost:3000`
- [ ] Laravel API merespons di `localhost:8000/api/health`
- [ ] Semua linter (ESLint + PHP Pint) lolos tanpa warning

---

### 1.1 Inisialisasi Monorepo Root

**File: `pnpm-workspace.yaml`**
```yaml
packages:
  - "apps/web"
  - "packages/*"
```

**File: `package.json` (root)**
```json
{
  "name": "ordexa",
  "private": true,
  "scripts": {
    "dev:web": "pnpm --filter web dev",
    "build:web": "pnpm --filter web build",
    "lint": "pnpm --filter web lint",
    "type-check": "pnpm --filter web tsc --noEmit"
  },
  "devDependencies": {
    "@ordexa/config": "workspace:*"
  }
}
```

**File: `.gitignore`**
```
node_modules/
.next/
vendor/
.env
.env.local
.env.production
storage/logs/
storage/framework/cache/
storage/framework/sessions/
storage/framework/views/
bootstrap/cache/
*.sqlite
graphify-out/graph.json
graphify-out/graph.html
graphify-out/cost.json
```

---

### 1.2 Setup Next.js 16 (`apps/web`)

```bash
cd apps
pnpm create next-app@latest web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias
cd web
pnpm add @tanstack/react-query @tanstack/react-query-devtools zustand
pnpm add react-hook-form @hookform/resolvers zod
pnpm add recharts date-fns
pnpm add -D @types/node
```

**Setup shadcn/ui:**
```bash
pnpm dlx shadcn@latest init
# Pilih: Default style, Slate base color, CSS variables
pnpm dlx shadcn@latest add button input label card badge
pnpm dlx shadcn@latest add dialog sheet dropdown-menu
pnpm dlx shadcn@latest add table tabs form select
pnpm dlx shadcn@latest add toast sonner skeleton avatar
pnpm dlx shadcn@latest add separator scroll-area
```

**File: `apps/web/next.config.ts`**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudflare.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

**File: `apps/web/src/lib/providers.tsx`**
```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**File: `apps/web/src/app/layout.tsx`**
```tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Ordexa",
    template: "%s | Ordexa",
  },
  description: "Platform manajemen dan pemesanan restoran untuk UMKM Indonesia",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ordexa",
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Struktur folder `apps/web/src/app/`:**
```
app/
├── (marketing)/          # platform.com — landing, pricing, FAQ
│   ├── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   └── layout.tsx
├── (auth)/               # Login, register, verifikasi
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── verify-email/
│   │   └── page.tsx
│   └── layout.tsx
├── super-admin/          # PWA — platform management
│   ├── page.tsx
│   ├── restaurants/
│   ├── subscriptions/
│   ├── packages/
│   ├── transactions/
│   └── layout.tsx
├── restaurant/           # PWA — owner/admin dashboard
│   ├── page.tsx
│   ├── branches/
│   ├── menu/
│   ├── employees/
│   ├── reports/
│   └── layout.tsx
├── branch/               # PWA — cabang dashboard
│   ├── page.tsx
│   ├── orders/
│   ├── tables/
│   └── layout.tsx
├── cashier/              # PWA — POS kasir
│   ├── page.tsx
│   └── layout.tsx
├── kitchen/              # PWA — KDS dapur
│   ├── page.tsx
│   └── layout.tsx
└── order/                # Web — customer QR ordering
    └── r/
        └── [tenant]/
            └── [branch]/
                └── [table]/
                    └── page.tsx
```

---

### 1.3 Setup Laravel 13 (`apps/api`)

```bash
cd apps
composer create-project laravel/laravel:^13.0 api
cd api
composer require laravel/sanctum
composer require --dev pestphp/pest pestphp/pest-plugin-laravel
php artisan pest:install
```

**Tambah packages:**
```bash
composer require predis/predis
composer require intervention/image-laravel
composer require spatie/laravel-permission
composer require laravel/reverb
php artisan reverb:install
```

**File: `apps/api/.env.example`**
```ini
APP_NAME=Ordexa
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=ordexa
DB_USERNAME=ordexa
DB_PASSWORD=secret

CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=cookie
SESSION_DOMAIN=.localhost

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

SANCTUM_STATEFUL_DOMAINS=localhost:3000,app.localhost:3000

REVERB_APP_ID=ordexa-local
REVERB_APP_KEY=reverb-app-key
REVERB_APP_SECRET=reverb-app-secret
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=http

CLOUDFLARE_R2_BUCKET=ordexa
CLOUDFLARE_R2_KEY=
CLOUDFLARE_R2_SECRET=
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_URL=
```

**File: `apps/api/bootstrap/app.php`** (tambahkan middleware):
```php
<?php

use App\Http\Middleware\IdentifyTenant;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        $middleware->alias([
            'tenant' => IdentifyTenant::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

**Struktur modul `apps/api/app/Modules/`:**
```
Modules/
├── Auth/
│   ├── Controllers/AuthController.php
│   ├── Requests/LoginRequest.php
│   ├── Requests/RegisterRequest.php
│   └── routes.php
├── Tenant/
│   ├── Models/Restaurant.php
│   ├── Traits/BelongsToTenant.php
│   ├── Middleware/IdentifyTenant.php
│   └── routes.php
├── Branch/
│   ├── Controllers/BranchController.php
│   ├── Models/Branch.php
│   └── routes.php
├── Menu/
│   ├── Controllers/MenuController.php
│   ├── Models/MenuCategory.php
│   ├── Models/MenuItem.php
│   └── routes.php
├── Order/
│   ├── Controllers/OrderController.php
│   ├── Models/Order.php
│   ├── Models/OrderItem.php
│   └── routes.php
├── Payment/
│   ├── Contracts/PaymentGatewayInterface.php
│   ├── Providers/XenditProvider.php
│   ├── Providers/MidtransProvider.php
│   ├── Services/SubscriptionPaymentService.php
│   ├── Services/RestaurantPaymentService.php
│   └── Services/PaymentWebhookService.php
├── Subscription/
│   ├── Controllers/SubscriptionController.php
│   ├── Models/Subscription.php
│   ├── Models/Package.php
│   └── routes.php
├── Table/
│   ├── Controllers/TableController.php
│   ├── Models/Table.php
│   └── routes.php
├── KDS/
│   ├── Controllers/KDSController.php
│   └── routes.php
└── POS/
    ├── Controllers/POSController.php
    └── routes.php
```

**File: `apps/api/routes/api.php`**
```php
<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'version' => '1.0.0']));

// Auth routes (public)
require __DIR__.'/../app/Modules/Auth/routes.php';

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    require __DIR__.'/../app/Modules/Tenant/routes.php';
    require __DIR__.'/../app/Modules/Branch/routes.php';
    require __DIR__.'/../app/Modules/Menu/routes.php';
    require __DIR__.'/../app/Modules/Order/routes.php';
    require __DIR__.'/../app/Modules/Subscription/routes.php';
    require __DIR__.'/../app/Modules/Table/routes.php';
    require __DIR__.'/../app/Modules/KDS/routes.php';
    require __DIR__.'/../app/Modules/POS/routes.php';
});

// Webhook routes (raw, NO auth middleware)
require __DIR__.'/../routes/webhooks.php';
```

---

### 1.4 Setup Docker Compose

**File: `docker-compose.yml`**
```yaml
name: ordexa

services:
  web:
    build:
      context: ./apps/web
      dockerfile: ../../infrastructure/docker/web.Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - NEXT_PUBLIC_REVERB_HOST=localhost
      - NEXT_PUBLIC_REVERB_PORT=8080
    depends_on:
      - api

  api:
    build:
      context: ./apps/api
      dockerfile: ../../infrastructure/docker/api.Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./apps/api:/var/www/html
    environment:
      - APP_ENV=local
      - DB_HOST=db
      - REDIS_HOST=redis
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  reverb:
    image: php:8.3-cli-alpine
    working_dir: /var/www/html
    volumes:
      - ./apps/api:/var/www/html
    command: php artisan reverb:start --host=0.0.0.0 --port=8080
    ports:
      - "8080:8080"
    depends_on:
      - api

  queue:
    image: php:8.3-cli-alpine
    working_dir: /var/www/html
    volumes:
      - ./apps/api:/var/www/html
    command: php artisan queue:work redis --sleep=3 --tries=3 --timeout=90
    depends_on:
      - api
      - redis

  scheduler:
    image: php:8.3-cli-alpine
    working_dir: /var/www/html
    volumes:
      - ./apps/api:/var/www/html
    command: sh -c "while true; do php artisan schedule:run; sleep 60; done"
    depends_on:
      - api

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: ordexa
      POSTGRES_USER: ordexa
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ordexa"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:8-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./infrastructure/nginx/local.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - web
      - api

volumes:
  pgdata:
  redisdata:
```

**File: `infrastructure/nginx/local.conf`**
```nginx
server {
    listen 80;
    server_name localhost;

    location /api {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /app.ordexa {
        proxy_pass http://reverb:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### 1.5 Shared Packages

**File: `packages/types/src/index.ts`**
```typescript
// Auth
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
}

// Tenant
export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  subscription_status: "registered" | "pending_payment" | "active" | "grace_period" | "expired" | "suspended";
  active_package: Package | null;
}

// Branch
export interface Branch {
  id: number;
  restaurant_id: number;
  name: string;
  slug: string;
  address: string;
  phone: string | null;
  operational_hours: OperationalHours;
  is_active: boolean;
}

export interface OperationalHours {
  monday?: { open: string; close: string } | null;
  tuesday?: { open: string; close: string } | null;
  wednesday?: { open: string; close: string } | null;
  thursday?: { open: string; close: string } | null;
  friday?: { open: string; close: string } | null;
  saturday?: { open: string; close: string } | null;
  sunday?: { open: string; close: string } | null;
}

// Menu
export interface MenuCategory {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
  items: MenuItem[];
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  variants: MenuVariant[];
}

export interface MenuVariant {
  id: number;
  name: string;
  price_adjustment: number;
}

// Order
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "expired";

export interface Order {
  id: number;
  order_number: string;
  branch_id: number;
  table_id: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  variant: string | null;
  notes: string | null;
  subtotal: number;
}

// Subscription
export interface Package {
  id: number;
  name: "Starter" | "Professional" | "Enterprise";
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
}

export interface Subscription {
  id: number;
  restaurant_id: number;
  package: Package;
  status: Restaurant["subscription_status"];
  starts_at: string;
  ends_at: string;
  grace_ends_at: string | null;
}

// API Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
```

---

### 1.6 Environment Variables

**File: `apps/web/.env.local.example`**
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_REVERB_APP_KEY=reverb-app-key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

---

## PHASE 2: Authentication, Multi-Tenant & RBAC

### Tujuan
Sistem login, registrasi restoran, dan isolasi data tenant yang tidak bisa ditembus.

### Acceptance Criteria
- [ ] Pemilik restoran bisa register dan verifikasi email
- [ ] Login menghasilkan Sanctum session token via httpOnly cookie
- [ ] Endpoint apapun mengembalikan `401` jika token tidak valid
- [ ] Tenant A tidak bisa mengakses data Tenant B (test otomatis)
- [ ] RBAC policies berjalan per role

---

### 2.1 Database Migrations

**Urutan eksekusi migrations:**

**`0001_create_restaurants_table.php`**
```php
Schema::create('restaurants', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->string('logo_url')->nullable();
    $table->string('description')->nullable();
    $table->string('address')->nullable();
    $table->string('phone')->nullable();
    $table->string('email')->nullable();
    $table->json('operational_hours')->nullable();
    $table->enum('subscription_status', [
        'registered', 'pending_payment', 'active', 'grace_period', 'expired', 'suspended'
    ])->default('registered');
    $table->timestamps();
    $table->softDeletes();

    $table->index('subscription_status');
});
```

**`0002_create_restaurant_memberships_table.php`**
```php
Schema::create('restaurant_memberships', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
    $table->string('role'); // owner, admin, manager, cashier, kitchen
    $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
    $table->boolean('is_active')->default(true);
    $table->timestamps();

    $table->unique(['user_id', 'restaurant_id', 'role']);
    $table->index(['user_id', 'restaurant_id']);
});
```

**`0003_create_branches_table.php`**
```php
Schema::create('branches', function (Blueprint $table) {
    $table->id();
    $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('slug');
    $table->text('address')->nullable();
    $table->string('phone')->nullable();
    $table->json('operational_hours')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    $table->softDeletes();

    $table->unique(['restaurant_id', 'slug']);
    $table->index('restaurant_id');
});
```

**`0004_create_packages_table.php`**
```php
Schema::create('packages', function (Blueprint $table) {
    $table->id();
    $table->string('name'); // Starter, Professional, Enterprise
    $table->string('slug')->unique();
    $table->integer('price_monthly'); // dalam Rupiah
    $table->integer('price_yearly');
    $table->json('features'); // list fitur yang tersedia
    $table->integer('sort_order')->default(0);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

**`0005_create_subscriptions_table.php`**
```php
Schema::create('subscriptions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
    $table->foreignId('package_id')->constrained();
    $table->enum('status', [
        'pending_payment', 'active', 'grace_period', 'expired', 'cancelled'
    ])->default('pending_payment');
    $table->string('billing_period')->default('monthly'); // monthly, yearly
    $table->integer('amount');
    $table->timestamp('starts_at')->nullable();
    $table->timestamp('ends_at')->nullable();
    $table->timestamp('grace_ends_at')->nullable();
    $table->timestamps();

    $table->index(['restaurant_id', 'status']);
});
```

---

### 2.2 Core Models & Traits

**File: `apps/api/app/Modules/Tenant/Traits/BelongsToTenant.php`**
```php
<?php

namespace App\Modules\Tenant\Traits;

use App\Modules\Tenant\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            if (auth()->check() && !$model->restaurant_id) {
                $membership = auth()->user()->currentMembership();
                if ($membership) {
                    $model->restaurant_id = $membership->restaurant_id;
                }
            }
        });
    }

    public function scopeForTenant(Builder $query, int $restaurantId): Builder
    {
        return $query->where($this->getTable().'.restaurant_id', $restaurantId);
    }
}
```

**File: `apps/api/app/Modules/Tenant/Scopes/TenantScope.php`**
```php
<?php

namespace App\Modules\Tenant\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        // Super admin bypass
        if (auth()->check() && auth()->user()->hasRole('super_admin')) {
            return;
        }

        $restaurantId = $this->resolveRestaurantId();

        if ($restaurantId) {
            $builder->where($model->getTable().'.restaurant_id', $restaurantId);
        }
    }

    private function resolveRestaurantId(): ?int
    {
        if (!auth()->check()) {
            return null;
        }

        $user = auth()->user();
        $membership = $user->currentMembership();

        return $membership?->restaurant_id;
    }
}
```

**File: `apps/api/app/Modules/Tenant/Models/Restaurant.php`**
```php
<?php

namespace App\Modules\Tenant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Restaurant extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'logo_url', 'description',
        'address', 'phone', 'email', 'operational_hours', 'subscription_status',
    ];

    protected $casts = [
        'operational_hours' => 'array',
    ];

    public function memberships(): HasMany
    {
        return $this->hasMany(\App\Models\RestaurantMembership::class);
    }

    public function branches(): HasMany
    {
        return $this->hasMany(\App\Modules\Branch\Models\Branch::class);
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(\App\Modules\Subscription\Models\Subscription::class)
            ->where('status', 'active')
            ->latest();
    }

    public function hasFeature(string $feature): bool
    {
        $subscription = $this->activeSubscription;
        if (!$subscription) {
            return false;
        }

        return in_array($feature, $subscription->package->features ?? []);
    }
}
```

**File: `apps/api/app/Models/User.php`** (tambahkan method):
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password'];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function memberships(): HasMany
    {
        return $this->hasMany(RestaurantMembership::class);
    }

    // Membership aktif saat ini (ditentukan dari request context)
    public function currentMembership(): ?RestaurantMembership
    {
        $restaurantId = request()->header('X-Restaurant-Id')
            ?? session('current_restaurant_id');

        if (!$restaurantId) {
            return $this->memberships()
                ->where('role', 'owner')
                ->where('is_active', true)
                ->first();
        }

        return $this->memberships()
            ->where('restaurant_id', $restaurantId)
            ->where('is_active', true)
            ->first();
    }

    public function hasRole(string $role): bool
    {
        if ($role === 'super_admin') {
            return $this->email === config('app.super_admin_email');
        }
        return $this->currentMembership()?->role === $role;
    }
}
```

---

### 2.3 Auth Controllers

**File: `apps/api/app/Modules/Auth/Controllers/AuthController.php`**
```php
<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Requests\RegisterRequest;
use App\Modules\Tenant\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
            ]);

            $restaurant = Restaurant::create([
                'name' => $request->restaurant_name,
                'slug' => Str::slug($request->restaurant_name).'-'.Str::random(6),
                'subscription_status' => 'registered',
            ]);

            $restaurant->memberships()->create([
                'user_id' => $user->id,
                'role' => 'owner',
            ]);

            $user->sendEmailVerificationNotification();

            return ['user' => $user, 'restaurant' => $restaurant];
        });

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan verifikasi email Anda.',
            'data' => $result,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!auth()->attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email atau password salah.',
            ], 422);
        }

        $user = auth()->user();

        if (!$user->hasVerifiedEmail()) {
            auth()->logout();
            return response()->json([
                'message' => 'Email belum diverifikasi. Silakan cek email Anda.',
            ], 403);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $user,
                'restaurants' => $user->memberships()->with('restaurant')->get(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        auth()->guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'user' => $request->user(),
                'current_membership' => $request->user()->currentMembership()?->load('restaurant'),
            ],
        ]);
    }
}
```

**File: `apps/api/app/Modules/Auth/routes.php`**
```php
<?php

use App\Modules\Auth\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});
```

---

### 2.4 Frontend Auth

**File: `apps/web/src/services/auth.ts`**
```typescript
import { ApiResponse, User, Restaurant } from "@ordexa/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}/api${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Terjadi kesalahan.");
  }

  return res.json();
}

export const authService = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    restaurant_name: string;
  }) =>
    fetchApi<ApiResponse<{ user: User; restaurant: Restaurant }>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchApi<ApiResponse<{ user: User; restaurants: { restaurant: Restaurant }[] }>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => fetchApi("/auth/logout", { method: "POST" }),

  me: () =>
    fetchApi<ApiResponse<{ user: User; current_membership: { restaurant: Restaurant } | null }>>(
      "/auth/me"
    ),
};
```

**File: `apps/web/src/app/(auth)/login/page.tsx`**
```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await authService.login(data);
      toast.success("Login berhasil!");
      router.push("/restaurant");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md space-y-8 px-8 py-10 bg-white rounded-2xl shadow-sm border border-zinc-100">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Masuk ke Ordexa</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Belum punya akun?{" "}
            <Link href="/register" className="text-zinc-900 font-medium underline underline-offset-4">
              Daftar sekarang
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@restoran.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 8 karakter"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

## PHASE 3: Restaurant, Branches & Subscription Engine

### Tujuan
Restoran bisa dikelola, cabang bisa ditambah tanpa batas, dan sistem subscription (tier-based feature entitlement) berjalan.

### Acceptance Criteria
- [ ] Owner bisa update profil restoran
- [ ] Owner bisa CRUD cabang tanpa batasan jumlah
- [ ] Feature entitlement memblokir akses fitur tier lebih tinggi
- [ ] Subscription state machine berjalan (state transitions)
- [ ] Super Admin bisa manage semua restoran dan paket

---

### 3.1 Branch Management

**File: `apps/api/app/Modules/Branch/Controllers/BranchController.php`**
```php
<?php

namespace App\Modules\Branch\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Branch\Models\Branch;
use App\Modules\Branch\Requests\StoreBranchRequest;
use App\Modules\Branch\Requests\UpdateBranchRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    // Semua branch sudah di-scope ke tenant via BelongsToTenant global scope
    public function index(): JsonResponse
    {
        $branches = Branch::with('tables')->get();

        return response()->json(['data' => $branches]);
    }

    public function store(StoreBranchRequest $request): JsonResponse
    {
        $restaurant = $request->user()->currentMembership()->restaurant;

        // Tidak ada batasan jumlah cabang — semua paket unlimited
        $branch = $restaurant->branches()->create([
            'name' => $request->name,
            'slug' => Str::slug($request->name).'-'.Str::random(4),
            'address' => $request->address,
            'phone' => $request->phone,
            'operational_hours' => $request->operational_hours,
        ]);

        return response()->json([
            'message' => 'Cabang berhasil ditambahkan.',
            'data' => $branch,
        ], 201);
    }

    public function show(Branch $branch): JsonResponse
    {
        return response()->json(['data' => $branch->load('tables')]);
    }

    public function update(UpdateBranchRequest $request, Branch $branch): JsonResponse
    {
        $branch->update($request->validated());

        return response()->json([
            'message' => 'Cabang berhasil diperbarui.',
            'data' => $branch,
        ]);
    }

    public function destroy(Branch $branch): JsonResponse
    {
        $branch->delete();

        return response()->json(['message' => 'Cabang berhasil dihapus.']);
    }
}
```

---

### 3.2 Feature Entitlement Engine

**File: `apps/api/app/Modules/Subscription/Services/FeatureEntitlementService.php`**
```php
<?php

namespace App\Modules\Subscription\Services;

use App\Modules\Tenant\Models\Restaurant;

class FeatureEntitlementService
{
    // Mapping fitur ke paket minimum yang mengaksesnya
    private const FEATURE_REQUIREMENTS = [
        // Starter — semua paket
        'qr_ordering'       => 'starter',
        'menu_management'   => 'starter',
        'table_management'  => 'starter',
        'order_management'  => 'starter',
        'kitchen_display'   => 'starter',
        'basic_reports'     => 'starter',
        'multi_branch'      => 'starter',

        // Professional
        'pos_cashier'       => 'professional',
        'employee_management' => 'professional',
        'inventory'         => 'professional',
        'promotions'        => 'professional',
        'advanced_analytics' => 'professional',
        'branch_performance' => 'professional',
        'export_reports'    => 'professional',

        // Enterprise
        'custom_branding'       => 'enterprise',
        'supplier_management'   => 'enterprise',
        'centralized_menu'      => 'enterprise',
        'advanced_inventory'    => 'enterprise',
        'cross_branch_stock'    => 'enterprise',
        'api_integration'       => 'enterprise',
        'audit_logs'            => 'enterprise',
        'priority_support'      => 'enterprise',
    ];

    private const PACKAGE_HIERARCHY = ['starter', 'professional', 'enterprise'];

    public function can(Restaurant $restaurant, string $feature): bool
    {
        $subscription = $restaurant->activeSubscription;

        if (!$subscription || $subscription->status !== 'active') {
            // Grace period: hanya akses read-only basic
            if ($subscription?->status === 'grace_period') {
                return in_array($feature, ['qr_ordering', 'menu_management', 'order_management']);
            }
            return false;
        }

        $packageSlug = strtolower($subscription->package->name);
        $requiredPackage = self::FEATURE_REQUIREMENTS[$feature] ?? null;

        if (!$requiredPackage) {
            return false; // Fitur tidak dikenal, tolak
        }

        $packageLevel = array_search($packageSlug, self::PACKAGE_HIERARCHY);
        $requiredLevel = array_search($requiredPackage, self::PACKAGE_HIERARCHY);

        return $packageLevel >= $requiredLevel;
    }
}
```

**Middleware penggunaan:**
```php
// Di route
Route::middleware(['auth:sanctum', 'feature:pos_cashier'])->group(function () {
    Route::apiResource('/pos', POSController::class);
});

// File: app/Http/Middleware/CheckFeature.php
public function handle(Request $request, Closure $next, string $feature): mixed
{
    $restaurant = $request->user()->currentMembership()->restaurant;

    if (!app(FeatureEntitlementService::class)->can($restaurant, $feature)) {
        return response()->json([
            'message' => 'Fitur ini tidak tersedia pada paket langganan Anda.',
        ], 403);
    }

    return $next($request);
}
```

---

### 3.3 Subscription State Machine

**File: `apps/api/app/Modules/Subscription/Services/SubscriptionService.php`**
```php
<?php

namespace App\Modules\Subscription\Services;

use App\Modules\Subscription\Models\Subscription;
use App\Modules\Tenant\Models\Restaurant;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    public function activate(Subscription $subscription): void
    {
        DB::transaction(function () use ($subscription) {
            $subscription->update([
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => $this->calculateEndDate($subscription),
                'grace_ends_at' => null,
            ]);

            $subscription->restaurant->update([
                'subscription_status' => 'active',
            ]);
        });
    }

    public function expire(Subscription $subscription): void
    {
        DB::transaction(function () use ($subscription) {
            $graceDays = 7; // 7 hari masa tenggang

            $subscription->update([
                'status' => 'grace_period',
                'grace_ends_at' => now()->addDays($graceDays),
            ]);

            $subscription->restaurant->update([
                'subscription_status' => 'grace_period',
            ]);
        });
    }

    public function suspend(Subscription $subscription): void
    {
        DB::transaction(function () use ($subscription) {
            $subscription->update(['status' => 'expired']);
            $subscription->restaurant->update(['subscription_status' => 'expired']);
        });
    }

    public function cancel(Subscription $subscription): void
    {
        DB::transaction(function () use ($subscription) {
            $subscription->update(['status' => 'cancelled']);
            $subscription->restaurant->update(['subscription_status' => 'expired']);
        });
    }

    private function calculateEndDate(Subscription $subscription): Carbon
    {
        return $subscription->billing_period === 'yearly'
            ? now()->addYear()
            : now()->addMonth();
    }

    // Dijalankan oleh Scheduler setiap hari
    public function processExpiredSubscriptions(): void
    {
        // Aktif → Grace period
        Subscription::query()
            ->where('status', 'active')
            ->where('ends_at', '<', now())
            ->each(fn ($sub) => $this->expire($sub));

        // Grace period → Expired
        Subscription::query()
            ->where('status', 'grace_period')
            ->where('grace_ends_at', '<', now())
            ->each(fn ($sub) => $this->suspend($sub));
    }
}
```

---

## PHASE 4: Menu, Tables, QR & Customer Ordering

### Tujuan
Sistem menu lengkap, QR code unik per meja, dan halaman pelanggan yang bisa memesan tanpa login.

### Acceptance Criteria
- [ ] Owner bisa CRUD kategori dan item menu dengan foto
- [ ] Foto tersimpan di Cloudflare R2 via presigned URL
- [ ] Setiap meja punya QR Code unik yang bisa didownload
- [ ] Halaman `/order/r/[tenant]/[branch]/[table]` menampilkan menu dan keranjang
- [ ] Pelanggan bisa submit pesanan tanpa login/daftar

---

### 4.1 Menu Management

**`create_menus_table.php`**
```php
Schema::create('menu_categories', function (Blueprint $table) {
    $table->id();
    $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->integer('sort_order')->default(0);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    $table->index('restaurant_id');
});

Schema::create('menu_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
    $table->foreignId('menu_category_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->text('description')->nullable();
    $table->integer('price');
    $table->string('image_url')->nullable();
    $table->boolean('is_available')->default(true);
    $table->json('variants')->nullable(); // [{name: "Ukuran L", price_adjustment: 5000}]
    $table->integer('sort_order')->default(0);
    $table->timestamps();
    $table->index(['restaurant_id', 'menu_category_id', 'is_available']);
});

// Pengaturan ketersediaan menu per cabang
Schema::create('branch_menu_settings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
    $table->foreignId('menu_item_id')->constrained()->cascadeOnDelete();
    $table->boolean('is_available')->default(true);
    $table->timestamps();
    $table->unique(['branch_id', 'menu_item_id']);
});
```

**File: `apps/api/app/Modules/Menu/Services/MediaUploadService.php`**
```php
<?php

namespace App\Modules\Menu\Services;

use Aws\S3\S3Client;
use Illuminate\Support\Str;

class MediaUploadService
{
    private S3Client $client;

    public function __construct()
    {
        $this->client = new S3Client([
            'version' => 'latest',
            'region' => 'auto',
            'endpoint' => config('filesystems.disks.r2.endpoint'),
            'credentials' => [
                'key' => config('filesystems.disks.r2.key'),
                'secret' => config('filesystems.disks.r2.secret'),
            ],
        ]);
    }

    // Generate presigned URL untuk upload langsung dari frontend ke R2
    public function createPresignedUpload(string $folder, string $extension): array
    {
        $key = $folder.'/'.Str::uuid().'.'.$extension;

        $command = $this->client->getCommand('PutObject', [
            'Bucket' => config('filesystems.disks.r2.bucket'),
            'Key' => $key,
            'ContentType' => 'image/'.$extension,
        ]);

        $presigned = $this->client->createPresignedRequest($command, '+15 minutes');

        return [
            'upload_url' => (string) $presigned->getUri(),
            'file_key' => $key,
            'public_url' => config('filesystems.disks.r2.url').'/'.$key,
        ];
    }
}
```

---

### 4.2 Table & QR Code

**`create_tables_table.php`**
```php
Schema::create('tables', function (Blueprint $table) {
    $table->id();
    $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
    $table->string('name'); // "Meja 1", "VIP 3", dll
    $table->string('qr_token')->unique(); // UUID unik, embedded di QR
    $table->string('qr_image_url')->nullable(); // URL gambar QR di R2
    $table->integer('capacity')->default(4);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    $table->index('branch_id');
    $table->index('qr_token');
});
```

**File: `apps/api/app/Modules/Table/Services/QRCodeService.php`**
```php
<?php

namespace App\Modules\Table\Services;

use App\Modules\Table\Models\Table;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class QRCodeService
{
    public function generate(Table $table): string
    {
        $url = config('app.order_url').'/r/'
            .$table->branch->restaurant->slug.'/'
            .$table->branch->slug.'/'
            .$table->qr_token;

        $options = new QROptions([
            'outputType' => QRCode::OUTPUT_IMAGE_PNG,
            'imageBase64' => false,
            'scale' => 10,
        ]);

        $qrPng = (new QRCode($options))->render($url);

        $filename = 'qr-codes/'.$table->qr_token.'.png';
        Storage::disk('r2')->put($filename, $qrPng);

        $qrUrl = Storage::disk('r2')->url($filename);
        $table->update(['qr_image_url' => $qrUrl]);

        return $qrUrl;
    }

    public function regenerate(Table $table): string
    {
        $table->update(['qr_token' => Str::uuid()]);
        return $this->generate($table);
    }
}
```

---

### 4.3 Customer Ordering Page (Next.js)

**File: `apps/web/src/app/order/r/[tenant]/[branch]/[table]/page.tsx`**
```tsx
import { Metadata } from "next";
import { CustomerOrderView } from "@/components/order/CustomerOrderView";

interface Props {
  params: { tenant: string; branch: string; table: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Pesan Makanan`,
    description: `Scan QR dan pesan langsung dari meja Anda.`,
  };
}

export default function CustomerOrderPage({ params }: Props) {
  return <CustomerOrderView {...params} />;
}
```

**File: `apps/web/src/components/order/CustomerOrderView.tsx`**
```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/stores/cartStore";
import { MenuGrid } from "./MenuGrid";
import { CartDrawer } from "./CartDrawer";
import { OrderConfirmation } from "./OrderConfirmation";
import { getPublicMenu } from "@/services/order";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  tenant: string;
  branch: string;
  table: string;
}

export function CustomerOrderView({ tenant, branch, table }: Props) {
  const [step, setStep] = useState<"menu" | "confirm" | "success">("menu");
  const cart = useCartStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-menu", tenant, branch, table],
    queryFn: () => getPublicMenu(tenant, branch, table),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-zinc-500 text-center">
          Menu tidak ditemukan atau QR Code tidak valid.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-semibold text-zinc-900">{data.restaurant.name}</h1>
          <p className="text-sm text-zinc-500">{data.branch.name} · {data.table.name}</p>
        </div>
      </header>

      {/* Menu */}
      <main className="max-w-lg mx-auto pb-32">
        <MenuGrid categories={data.categories} />
      </main>

      {/* Cart FAB */}
      {cart.items.length > 0 && (
        <CartDrawer onCheckout={() => setStep("confirm")} />
      )}

      {/* Order confirmation sheet */}
      {step === "confirm" && (
        <OrderConfirmation
          tableToken={table}
          branchSlug={branch}
          tenantSlug={tenant}
          onSuccess={() => setStep("success")}
          onBack={() => setStep("menu")}
        />
      )}
    </div>
  );
}
```

**File: `apps/web/src/stores/cartStore.ts`**
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@ordexa/types";

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  variant: string | null;
  notes: string | null;
  subtotal: number;
}

interface CartStore {
  items: CartItem[];
  tableToken: string | null;
  addItem: (item: Omit<CartItem, "subtotal">) => void;
  removeItem: (menuItemId: number, variant: string | null) => void;
  updateQuantity: (menuItemId: number, variant: string | null, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      tableToken: null,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.menuItemId === item.menuItemId && i.variant === item.variant
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId && i.variant === item.variant
                  ? { ...i, quantity: i.quantity + item.quantity, subtotal: (i.quantity + item.quantity) * i.price }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, subtotal: item.quantity * item.price }],
          };
        });
      },

      removeItem: (menuItemId, variant) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.menuItemId === menuItemId && i.variant === variant)
          ),
        }));
      },

      updateQuantity: (menuItemId, variant, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId, variant);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId && i.variant === variant
              ? { ...i, quantity, subtotal: quantity * i.price }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "ordexa-cart" }
  )
);
```

---

## PHASE 5: Payment Gateway & Webhook Reconciliation

### Tujuan
Dua jalur pembayaran yang terpisah bersih: langganan SaaS via platform, pesanan pelanggan via sub-merchant restoran.

### Acceptance Criteria
- [ ] `PaymentGatewayInterface` menjadi satu-satunya entry point transaksi
- [ ] Tidak ada pemanggilan SDK Midtrans/Xendit langsung di Controller
- [ ] Webhook diverifikasi signature sebelum diproses
- [ ] Idempotency key mencegah duplikasi transaksi
- [ ] Subscription aktif HANYA setelah webhook `paid` diterima dan diverifikasi

---

### 5.1 Payment Abstraction

**File: `apps/api/app/Modules/Payment/Contracts/PaymentGatewayInterface.php`**
```php
<?php

namespace App\Modules\Payment\Contracts;

use App\Modules\Payment\DTOs\CreateInvoiceDTO;
use App\Modules\Payment\DTOs\InvoiceResultDTO;
use App\Modules\Payment\DTOs\WebhookPayloadDTO;

interface PaymentGatewayInterface
{
    public function createInvoice(CreateInvoiceDTO $dto): InvoiceResultDTO;
    public function verifyWebhook(array $payload, string $signature): bool;
    public function getTransactionStatus(string $referenceId): string;
}
```

**File: `apps/api/app/Modules/Payment/DTOs/CreateInvoiceDTO.php`**
```php
<?php

namespace App\Modules\Payment\DTOs;

readonly class CreateInvoiceDTO
{
    public function __construct(
        public string $referenceId,
        public int $amount,
        public string $description,
        public string $payerEmail,
        public string $successRedirectUrl,
        public string $failureRedirectUrl,
        public ?string $merchantAccountId = null, // untuk xenPlatform sub-account
    ) {}
}
```

**File: `apps/api/app/Modules/Payment/Providers/XenditProvider.php`**
```php
<?php

namespace App\Modules\Payment\Providers;

use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\DTOs\CreateInvoiceDTO;
use App\Modules\Payment\DTOs\InvoiceResultDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XenditProvider implements PaymentGatewayInterface
{
    private string $apiKey;
    private string $baseUrl = 'https://api.xendit.co';

    public function __construct(string $apiKey)
    {
        $this->apiKey = $apiKey;
    }

    public function createInvoice(CreateInvoiceDTO $dto): InvoiceResultDTO
    {
        $headers = [
            'Authorization' => 'Basic '.base64_encode($this->apiKey.':'),
            'Content-Type' => 'application/json',
        ];

        // Untuk sub-merchant (xenPlatform), tambahkan for-user-id header
        if ($dto->merchantAccountId) {
            $headers['for-user-id'] = $dto->merchantAccountId;
        }

        $response = Http::withHeaders($headers)->post("{$this->baseUrl}/v2/invoices", [
            'external_id' => $dto->referenceId,
            'amount' => $dto->amount,
            'description' => $dto->description,
            'payer_email' => $dto->payerEmail,
            'success_redirect_url' => $dto->successRedirectUrl,
            'failure_redirect_url' => $dto->failureRedirectUrl,
            'currency' => 'IDR',
        ]);

        if ($response->failed()) {
            Log::error('Xendit invoice creation failed', [
                'reference_id' => $dto->referenceId,
                'error' => $response->json(),
            ]);
            throw new \RuntimeException('Gagal membuat invoice pembayaran.');
        }

        $data = $response->json();

        return new InvoiceResultDTO(
            invoiceId: $data['id'],
            referenceId: $data['external_id'],
            paymentUrl: $data['invoice_url'],
            expiresAt: $data['expiry_date'],
            status: $data['status'],
        );
    }

    public function verifyWebhook(array $payload, string $signature): bool
    {
        $callbackToken = config('services.xendit.webhook_token');
        return hash_equals($callbackToken, $signature);
    }

    public function getTransactionStatus(string $referenceId): string
    {
        $response = Http::withBasicAuth($this->apiKey, '')->get("{$this->baseUrl}/v2/invoices", [
            'external_id' => $referenceId,
        ]);

        return $response->json('0.status', 'UNKNOWN');
    }
}
```

---

### 5.2 Webhook Handler

**File: `apps/api/app/Modules/Payment/Controllers/WebhookController.php`**
```php
<?php

namespace App\Modules\Payment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Payment\Models\PaymentTransaction;
use App\Modules\Payment\Services\PaymentWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(private PaymentWebhookService $webhookService) {}

    public function xendit(Request $request): JsonResponse
    {
        $signature = $request->header('x-callback-token', '');

        // 1. Verifikasi signature
        if (!$this->webhookService->verifyXenditSignature($signature)) {
            Log::warning('Xendit webhook: invalid signature', [
                'ip' => $request->ip(),
            ]);
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $payload = $request->all();
        $referenceId = $payload['external_id'] ?? null;

        if (!$referenceId) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        // 2. Idempotency check — cegah duplikasi
        $existing = PaymentTransaction::where('idempotency_key', $referenceId)
            ->where('status', 'paid')
            ->first();

        if ($existing) {
            Log::info('Xendit webhook: duplicate event ignored', ['ref' => $referenceId]);
            return response()->json(['message' => 'Already processed']);
        }

        // 3. Process webhook secara async
        $this->webhookService->processXenditWebhook($payload);

        return response()->json(['message' => 'Webhook received']);
    }
}
```

**File: `apps/api/routes/webhooks.php`**
```php
<?php

use App\Modules\Payment\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

// PENTING: Tidak ada auth middleware di webhook
// Verifikasi dilakukan via signature di controller
Route::prefix('webhooks')->group(function () {
    Route::post('/xendit', [WebhookController::class, 'xendit'])
        ->name('webhooks.xendit');
    Route::post('/midtrans', [WebhookController::class, 'midtrans'])
        ->name('webhooks.midtrans');
});
```

---

## PHASE 6: Order Lifecycle, Reverb & KDS/POS

### Tujuan
Pesanan dibuat, diteruskan realtime ke dapur (KDS), kasir memantau transaksi, status pesanan bisa diupdate.

### Acceptance Criteria
- [ ] Pesanan masuk di dashboard KDS dalam <2 detik setelah submit
- [ ] KDS menampilkan pesanan beserta detail item dan catatan
- [ ] Status pesanan bisa diupdate oleh dapur
- [ ] POS bisa membuat pesanan manual dari kasir
- [ ] Event realtime via Laravel Reverb berfungsi

---

### 6.1 Order Creation

**`create_orders_table.php`**
```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('order_number')->unique(); // ORD-20241101-0001
    $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
    $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
    $table->foreignId('table_id')->constrained();
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
    $table->foreignId('menu_item_id')->constrained();
    $table->string('name'); // snapshot nama item saat pesan
    $table->integer('price'); // snapshot harga saat pesan
    $table->string('variant')->nullable();
    $table->integer('quantity');
    $table->text('notes')->nullable();
    $table->integer('subtotal');
    $table->timestamps();
});
```

**File: `apps/api/app/Modules/Order/Controllers/OrderController.php`**
```php
<?php

namespace App\Modules\Order\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Order\Events\OrderCreatedEvent;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Requests\CreateOrderRequest;
use App\Modules\Order\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    // Endpoint public — pelanggan submit pesanan via QR
    public function storePublic(CreateOrderRequest $request, string $tableToken): JsonResponse
    {
        $order = $this->orderService->createFromQR($tableToken, $request->validated());

        // Broadcast ke KDS dan kasir secara realtime
        event(new OrderCreatedEvent($order));

        return response()->json([
            'message' => 'Pesanan berhasil dikirim ke dapur.',
            'data' => [
                'order_number' => $order->order_number,
                'total_amount' => $order->total_amount,
                'status' => $order->status,
            ],
        ], 201);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:confirmed,preparing,ready,completed,cancelled',
        ]);

        $order->update(['status' => $request->status]);

        // Broadcast status update ke semua listener
        broadcast(new \App\Modules\Order\Events\OrderStatusUpdatedEvent($order))->toOthers();

        return response()->json([
            'message' => 'Status pesanan diperbarui.',
            'data' => $order,
        ]);
    }
}
```

---

### 6.2 Laravel Reverb Events

**File: `apps/api/app/Modules/Order/Events/OrderCreatedEvent.php`**
```php
<?php

namespace App\Modules\Order\Events;

use App\Modules\Order\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderCreatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order) {}

    public function broadcastOn(): array
    {
        return [
            // Channel privat per cabang — hanya staf cabang ini yang subscribe
            new PrivateChannel('branch.'.$this->order->branch_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'table_name' => $this->order->table->name,
            'status' => $this->order->status,
            'total_amount' => $this->order->total_amount,
            'notes' => $this->order->notes,
            'items' => $this->order->items->map(fn ($item) => [
                'name' => $item->name,
                'quantity' => $item->quantity,
                'variant' => $item->variant,
                'notes' => $item->notes,
            ])->toArray(),
            'created_at' => $this->order->created_at->toISOString(),
        ];
    }
}
```

---

### 6.3 KDS Frontend

**File: `apps/web/src/app/kitchen/page.tsx`**
```tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "@/lib/pusher";
import { OrderCard } from "@/components/kitchen/OrderCard";
import { Order } from "@ordexa/types";
import { Badge } from "@/components/ui/badge";

export default function KitchenPage() {
  const queryClient = useQueryClient();
  const [branchId, setBranchId] = useState<number | null>(null);

  const { data: orders } = useQuery({
    queryKey: ["kitchen-orders", branchId],
    queryFn: () => fetchActiveOrders(branchId!),
    enabled: !!branchId,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!branchId) return;

    const channel = pusherClient.subscribe(`private-branch.${branchId}`);

    channel.bind("order.created", (data: Order) => {
      // Notifikasi audio
      new Audio("/sounds/order-bell.mp3").play().catch(() => {});

      queryClient.setQueryData(["kitchen-orders", branchId], (old: Order[] = []) => [
        data,
        ...old,
      ]);
    });

    channel.bind("order.status_updated", (data: Order) => {
      queryClient.setQueryData(["kitchen-orders", branchId], (old: Order[] = []) =>
        old.map((o) => (o.id === data.id ? data : o))
      );
    });

    return () => {
      pusherClient.unsubscribe(`private-branch.${branchId}`);
    };
  }, [branchId, queryClient]);

  const pendingOrders = orders?.filter((o) => o.status === "pending") ?? [];
  const preparingOrders = orders?.filter((o) => o.status === "preparing") ?? [];
  const readyOrders = orders?.filter((o) => o.status === "ready") ?? [];

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Kitchen Display</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{pendingOrders.length} Masuk</Badge>
          <Badge className="bg-amber-500">{preparingOrders.length} Diproses</Badge>
          <Badge className="bg-green-600">{readyOrders.length} Siap</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kolom: Pending */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase mb-3">
            Pesanan Masuk
          </h2>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        {/* Kolom: Preparing */}
        <div>
          <h2 className="text-sm font-semibold text-amber-400 uppercase mb-3">
            Sedang Diproses
          </h2>
          <div className="space-y-3">
            {preparingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        {/* Kolom: Ready */}
        <div>
          <h2 className="text-sm font-semibold text-green-400 uppercase mb-3">
            Siap Disajikan
          </h2>
          <div className="space-y-3">
            {readyOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## PHASE 7: PWA, Web Push & Analytics Dashboard

### Tujuan
Dashboard operasional bisa diinstall sebagai PWA, push notification saat pesanan masuk, analytics penjualan tersedia.

### Acceptance Criteria
- [ ] Lighthouse PWA score ≥ 90
- [ ] Dashboard bisa diinstall di Android/iOS/Desktop
- [ ] Push notification muncul di perangkat staf saat pesanan baru
- [ ] Dashboard Owner menampilkan grafik penjualan dan produk terlaris
- [ ] Super Admin melihat metrik platform: total restoran, MRR, dsb

---

### 7.1 PWA Setup

**File: `apps/web/public/manifest.json`**
```json
{
  "name": "Ordexa Dashboard",
  "short_name": "Ordexa",
  "description": "Platform manajemen restoran",
  "start_url": "/restaurant",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#18181b",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["business", "productivity"]
}
```

**File: `apps/web/public/sw.js`** (Service Worker minimal)
```javascript
const CACHE_NAME = "ordexa-v1";
const STATIC_ASSETS = ["/", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Hanya cache GET requests untuk aset statis
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("/api/")) return; // Jangan cache API calls

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Ordexa", {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      tag: data.tag || "ordexa-notification",
      data: { url: data.url || "/kitchen" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

---

### 7.2 Analytics Dashboard

**File: `apps/web/src/app/restaurant/page.tsx`** (Dashboard Overview)
```tsx
import { Suspense } from "react";
import { SalesChart } from "@/components/restaurant/SalesChart";
import { TopProducts } from "@/components/restaurant/TopProducts";
import { BranchPerformance } from "@/components/restaurant/BranchPerformance";
import { StatCards } from "@/components/restaurant/StatCards";
import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">Ringkasan performa seluruh cabang Anda.</p>
      </div>

      {/* Stat cards */}
      <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>}>
        <StatCards />
      </Suspense>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}>
            <SalesChart />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}>
            <TopProducts />
          </Suspense>
        </div>
      </div>

      {/* Branch table */}
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <BranchPerformance />
      </Suspense>
    </div>
  );
}
```

---

## PHASE 8: Testing, Security Hardening & Deployment

### Tujuan
Platform aman, teruji, dan siap deploy ke produksi VPS.

### Acceptance Criteria
- [ ] Semua Pest feature tests lolos
- [ ] Playwright E2E: QR scan → order → KDS flow berjalan
- [ ] Tenant A tidak bisa akses data Tenant B (automated)
- [ ] Rate limiting aktif di endpoint publik
- [ ] Docker Compose production berjalan di VPS
- [ ] SSL Let's Encrypt terpasang via Nginx

---

### 8.1 Pest Tests — Tenant Isolation

**File: `apps/api/tests/Feature/TenantIsolationTest.php`**
```php
<?php

use App\Models\User;
use App\Modules\Tenant\Models\Restaurant;
use App\Modules\Branch\Models\Branch;

describe('Tenant Isolation', function () {
    beforeEach(function () {
        // Setup dua tenant berbeda
        $this->tenantA = Restaurant::factory()->create(['subscription_status' => 'active']);
        $this->tenantB = Restaurant::factory()->create(['subscription_status' => 'active']);

        $this->userA = User::factory()->create();
        $this->tenantA->memberships()->create(['user_id' => $this->userA->id, 'role' => 'owner']);

        $this->userB = User::factory()->create();
        $this->tenantB->memberships()->create(['user_id' => $this->userB->id, 'role' => 'owner']);

        $this->branchA = Branch::factory()->for($this->tenantA, 'restaurant')->create();
        $this->branchB = Branch::factory()->for($this->tenantB, 'restaurant')->create();
    });

    it('Tenant A tidak dapat membaca cabang Tenant B', function () {
        $this->actingAs($this->userA)
            ->withHeaders(['X-Restaurant-Id' => $this->tenantA->id])
            ->getJson("/api/branches/{$this->branchB->id}")
            ->assertStatus(404);
    });

    it('Tenant A tidak dapat melihat daftar cabang Tenant B', function () {
        $this->actingAs($this->userA)
            ->withHeaders(['X-Restaurant-Id' => $this->tenantA->id])
            ->getJson('/api/branches')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data') // hanya cabang milik Tenant A
            ->assertJsonPath('data.0.id', $this->branchA->id);
    });

    it('Tenant A tidak dapat mengupdate data Tenant B', function () {
        $this->actingAs($this->userA)
            ->withHeaders(['X-Restaurant-Id' => $this->tenantA->id])
            ->putJson("/api/branches/{$this->branchB->id}", ['name' => 'Hacked'])
            ->assertStatus(404);
    });

    it('Tenant A tidak dapat menghapus data Tenant B', function () {
        $this->actingAs($this->userA)
            ->withHeaders(['X-Restaurant-Id' => $this->tenantA->id])
            ->deleteJson("/api/branches/{$this->branchB->id}")
            ->assertStatus(404);
    });
});
```

**File: `apps/api/tests/Feature/WebhookIdempotencyTest.php`**
```php
<?php

describe('Webhook Idempotency', function () {
    it('memproses webhook payment sekali meskipun dikirim dua kali', function () {
        $payload = [
            'external_id' => 'ORDER-001',
            'status' => 'PAID',
            'amount' => 50000,
        ];

        // Kirim pertama
        $this->postJson('/api/webhooks/xendit', $payload, [
            'x-callback-token' => config('services.xendit.webhook_token'),
        ])->assertStatus(200);

        // Kirim duplikat
        $this->postJson('/api/webhooks/xendit', $payload, [
            'x-callback-token' => config('services.xendit.webhook_token'),
        ])->assertStatus(200)
          ->assertJsonPath('message', 'Already processed');

        // Pastikan hanya satu transaksi tercatat
        $this->assertDatabaseCount('payment_transactions', 1);
    });

    it('menolak webhook dengan signature tidak valid', function () {
        $this->postJson('/api/webhooks/xendit', [], [
            'x-callback-token' => 'token-palsu',
        ])->assertStatus(401);
    });
});
```

---

### 8.2 Playwright E2E

**File: `apps/web/tests/e2e/qr-order-flow.spec.ts`**
```typescript
import { test, expect } from "@playwright/test";

test.describe("Customer QR Order Flow", () => {
  test("pelanggan bisa melihat menu dan submit pesanan", async ({ page }) => {
    // Simulasi scan QR ke halaman order
    await page.goto("/order/r/warung-test/bogor/meja-01");

    // Pastikan menu tampil
    await expect(page.getByRole("heading", { name: /warung test/i })).toBeVisible();

    // Pilih item menu
    await page.getByTestId("menu-item-1").click();
    await page.getByRole("button", { name: /tambah/i }).click();

    // Buka keranjang
    await page.getByTestId("cart-button").click();
    await expect(page.getByText("1 item")).toBeVisible();

    // Konfirmasi pesanan
    await page.getByRole("button", { name: /pesan sekarang/i }).click();

    // Isi nama (opsional)
    await page.getByPlaceholder("Nama (opsional)").fill("Budi");

    // Submit
    await page.getByRole("button", { name: /konfirmasi pesanan/i }).click();

    // Verifikasi sukses
    await expect(page.getByText(/pesanan berhasil/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("order-number")).toBeVisible();
  });
});
```

---

### 8.3 Nginx Production Config

**File: `infrastructure/nginx/production.conf`**
```nginx
# Redirect HTTP ke HTTPS
server {
    listen 80;
    server_name platform.com app.platform.com order.platform.com api.platform.com;
    return 301 https://$host$request_uri;
}

# API
server {
    listen 443 ssl http2;
    server_name api.platform.com;

    ssl_certificate /etc/letsencrypt/live/platform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/platform.com/privkey.pem;

    location / {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # WebSocket Reverb
    location /app {
        proxy_pass http://reverb:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 60s;
    }

    # Rate limit endpoint publik
    limit_req_zone $binary_remote_addr zone=api_public:10m rate=30r/m;
    location /api/order {
        limit_req zone=api_public burst=10 nodelay;
        proxy_pass http://api:8000;
    }
}

# Frontend
server {
    listen 443 ssl http2;
    server_name app.platform.com order.platform.com platform.com;

    ssl_certificate /etc/letsencrypt/live/platform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/platform.com/privkey.pem;

    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### 8.4 Laravel Scheduler (Console Commands)

**File: `apps/api/routes/console.php`**
```php
<?php

use Illuminate\Support\Facades\Schedule;
use App\Modules\Subscription\Services\SubscriptionService;

// Proses expired subscription setiap hari jam 00:05
Schedule::call(function () {
    app(SubscriptionService::class)->processExpiredSubscriptions();
})->dailyAt('00:05')->name('process-expired-subscriptions')->withoutOverlapping();

// Backup database setiap hari jam 02:00
Schedule::command('db:backup')->dailyAt('02:00')->name('db-backup')->withoutOverlapping();
```

---

## Catatan Penting untuk Agent

> [!IMPORTANT]
> Sebelum mengerjakan setiap fase, wajib menjalankan: `graphify query "<apa yang akan dikerjakan>"` untuk memverifikasi tidak ada konflik dependensi.

> [!WARNING]
> **JANGAN** jalankan Phase N+1 sebelum semua test di Phase N lolos. Urutan ini bukan opsional.

> [!CAUTION]
> Webhook routes (`/api/webhooks/*`) **DILARANG** dibungkus middleware `auth:sanctum`. Keamanan ditangani via signature verification di dalam handler, bukan middleware.

> [!NOTE]
> Semua response error yang user-facing wajib dalam **Bahasa Indonesia**. Error teknis di log boleh dalam English.

---

*Dokumen ini adalah panduan hidup. Update setiap kali ada perubahan arsitektur signifikan dan re-run `graphify --update` setelahnya.*
