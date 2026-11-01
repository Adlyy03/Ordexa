# Graph Report - Ordexa  (2026-11-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 906 nodes · 1557 edges · 84 communities (58 shown, 26 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6a0c96ea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- MidtransProvider
- User
- Illuminate\Database\Migrations\Migration
- AGENTS.md — Ordexa Engineering & Agent Operational Playbook
- Next.js 16 Frontend App
- Order
- react
- CustomerOrderView.tsx
- TestCase
- login/page.tsx
- index.ts
- Restaurant
- api/package.json
- web/package.json
- Illuminate\Support\Str
- compilerOptions
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Illuminate\Http\Request
- layout.tsx
- dependencies
- Illuminate\Http\JsonResponse
- OrderCreatedEvent
- Table
- OrderController
- manifest.json
- BranchController
- MediaController.php
- TenantScope
- SubscriptionController
- composer.json
- scripts
- devDependencies
- PHASE 1: Environment & Monorepo Foundation
- require-dev
- api/README.md
- scripts
- config
- AuthTest
- MenuTest
- TableAndPublicOrderTest
- PHASE 2: Authentication, Multi-Tenant & RBAC
- PHASE 8: Testing, Security Hardening & Deployment
- MenuItem
- AppServiceProvider
- platform
- require
- TenantIsolationTest
- types/package.json
- ui/package.json
- PHASE 3: Restaurant, Branches & Subscription Engine
- PHASE 4: Menu, Tables, QR & Customer Ordering
- PHASE 6: Order Lifecycle, Reverb & KDS/POS
- bootstrap/app.php
- psr-4
- logging.php
- sanctum.php
- eslint.config.mjs
- scripts
- PHASE 5: Payment Gateway & Webhook Reconciliation
- PHASE 7: PWA, Web Push & Analytics Dashboard
- Laravel Application
- Laravel Application
- ExampleTest
- web/README.md
- config/package.json
- PHASES.md — Ordexa Implementation Playbook
- artisan
- autoload-dev
- extra
- console.php
- web/AGENTS.md
- sw.js
- backup.sh
- MVP Acceptance Criteria
- MVP Priorities (P0/P1/P2)
- Ordexa Restaurant SaaS Overview
- Inventory & Stock Tracking

## God Nodes (most connected - your core abstractions)
1. `Restaurant` - 37 edges
2. `Table` - 35 edges
3. `Order` - 34 edges
4. `Branch` - 31 edges
5. `Controller` - 25 edges
6. `User` - 24 edges
7. `MenuItem` - 21 edges
8. `TestCase` - 20 edges
9. `Subscription` - 17 edges
10. `BelongsToTenant` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Aturan Scoping Query:` --references--> `BelongsToTenant`  [INFERRED]
  agents.md → apps/api/app/Modules/Tenant/Traits/BelongsToTenant.php
- `Phase 2: Authentication, Multi-Tenant & RBAC` --references--> `BelongsToTenant`  [INFERRED]
  agents.md → apps/api/app/Modules/Tenant/Traits/BelongsToTenant.php
- `Phase 2: Authentication, Multi-Tenant & RBAC` --references--> `IdentifyTenant`  [INFERRED]
  agents.md → apps/api/app/Modules/Tenant/Middleware/IdentifyTenant.php
- `SaaS Subscription & Billing Engine` --references--> `Midtrans Payment Gateway (Platform Subscription)`  [INFERRED]
  PRD.md → TECH.md
- `Menu & Category Management` --references--> `Cloudflare R2 Object Storage & CDN`  [INFERRED]
  PRD.md → TECH.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Multi-Tenant Data Isolation Guardrail** — prd_multi_tenant_architecture, tech_postgresql_shared_schema, tech_sanctum_auth, prd_user_roles [EXTRACTED 1.00]
- **Dual-Track Multi-Tenant Payment Engine** — prd_dual_payment_system, tech_payment_abstraction_layer, tech_xendit_xenplatform, tech_midtrans_gateway, prd_subscription_billing [EXTRACTED 1.00]
- **Order-to-Kitchen Realtime Flow** — prd_qr_table_ordering, prd_kds_kitchen_display, prd_pos_cashier, tech_reverb_realtime [EXTRACTED 1.00]

## Communities (84 total, 26 thin omitted)

### Community 0 - "MidtransProvider"
Cohesion: 0.08
Nodes (12): PaymentGatewayInterface, CreateInvoiceDTO, InvoiceResultDTO, WebhookPayloadDTO, PaymentTransaction, PaymentWebhook, MidtransProvider, XenditProvider (+4 more)

### Community 1 - "User"
Cohesion: 0.06
Nodes (15): User, LoginRequest, RegisterRequest, StoreBranchRequest, UserFactory, DatabaseSeeder, PackageSeeder, Illuminate\Database\Eloquent\Factories\Factory (+7 more)

### Community 2 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.08
Nodes (3): Illuminate\Database\Migrations\Migration, Illuminate\Database\Schema\Blueprint, Illuminate\Support\Facades\Schema

### Community 3 - "AGENTS.md — Ordexa Engineering & Agent Operational Playbook"
Cohesion: 0.06
Nodes (32): 10. Definition of Done (DoD), 11. Navigasi Knowledge Graph, 1. Lead Architect Agent, 1. Project Manifesto & Core Vision, 2. Backend Core Agent (Laravel 13 & PostgreSQL), 2. Non-Negotiable Guardrails (Aturan Mutlak), 3. Frontend PWA Agent (Next.js 16 & shadcn/ui), 3. Mandatory Skills (Wajib Digunakan Tanpa Pengecualian) (+24 more)

### Community 4 - "Next.js 16 Frontend App"
Cohesion: 0.07
Nodes (36): Branch Operations Management, Dual Payment Architecture (Subscription vs Customer), Enterprise Subscription Tier, Kitchen Display System (KDS), Menu & Category Management, Multi-Tenant SaaS Architecture, POS / Cashier System, Professional Subscription Tier (+28 more)

### Community 5 - "Order"
Cohesion: 0.12
Nodes (10): Order, OrderItem, OrderService, AnalyticsController, OrderLifecycleTest, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Support\Facades\DB, Illuminate\Support\Facades\Event (+2 more)

### Community 6 - "react"
Cohesion: 0.10
Nodes (17): OrderItem, OrderRecord, OrderData, OrderItem, AnalyticsData, AnalyticsSummary, BranchBreakdown, StatusBreakdown (+9 more)

### Community 7 - "CustomerOrderView.tsx"
Cohesion: 0.15
Nodes (20): CartDrawer(), CartDrawerProps, CustomerOrderView(), CustomerOrderViewProps, MenuGrid(), MenuGridProps, OrderConfirmation(), OrderConfirmationProps (+12 more)

### Community 8 - "TestCase"
Cohesion: 0.14
Nodes (7): Package, AnalyticsTest, HealthCheckTest, PaymentWebhookTest, TestCase, Illuminate\Foundation\Testing\RefreshDatabase, Illuminate\Foundation\Testing\TestCase

### Community 9 - "login/page.tsx"
Cohesion: 0.13
Nodes (17): LoginForm, loginSchema, RegisterForm, registerSchema, Input, InputProps, Label, LabelProps (+9 more)

### Community 10 - "index.ts"
Cohesion: 0.08
Nodes (24): ApiError, ApiResponse, Branch, DayHours, MembershipRole, MenuCategory, MenuItem, MenuVariant (+16 more)

### Community 11 - "Restaurant"
Cohesion: 0.21
Nodes (8): Branch, Subscription, Restaurant, BelongsToTenant, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\Relations\HasMany, Illuminate\Database\Eloquent\Relations\HasOne, Illuminate\Database\Eloquent\SoftDeletes

### Community 12 - "api/package.json"
Cohesion: 0.09
Nodes (21): devDependencies, concurrently, laravel-vite-plugin, tailwindcss, @tailwindcss/vite, vite, tailwindcss, optionalDependencies (+13 more)

### Community 13 - "web/package.json"
Cohesion: 0.10
Nodes (20): Providers(), name, packageManager, private, version, clsx, date-fns, eslint (+12 more)

### Community 14 - "Illuminate\Support\Str"
Cohesion: 0.11
Nodes (7): TableController, QRCodeService, chillerlan\QRCode\Output\QRMarkupSVG, chillerlan\QRCode\QRCode, chillerlan\QRCode\QROptions, Illuminate\Support\Str, Pdo\Mysql

### Community 15 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 16 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.14
Nodes (3): RestaurantMembership, BranchMenuSetting, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 17 - "Illuminate\Http\Request"
Cohesion: 0.20
Nodes (5): Controller, AuthController, WebhookController, RestaurantController, Illuminate\Http\Request

### Community 18 - "layout.tsx"
Cohesion: 0.13
Nodes (9): apps_web_app_globals, inter, metadata, viewport, Props, ServiceWorkerRegister(), nextConfig, next (+1 more)

### Community 19 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, clsx, date-fns, @hookform/resolvers, lucide-react, next, react, react-dom (+8 more)

### Community 20 - "Illuminate\Http\JsonResponse"
Cohesion: 0.23
Nodes (3): MenuCategoryController, MenuItemController, Illuminate\Http\JsonResponse

### Community 21 - "OrderCreatedEvent"
Cohesion: 0.25
Nodes (7): OrderCreatedEvent, OrderStatusUpdatedEvent, Illuminate\Broadcasting\InteractsWithSockets, Illuminate\Broadcasting\PrivateChannel, Illuminate\Contracts\Broadcasting\ShouldBroadcastNow, Illuminate\Foundation\Events\Dispatchable, Illuminate\Queue\SerializesModels

### Community 22 - "Table"
Cohesion: 0.21
Nodes (4): MenuCategory, PublicOrderController, Table, SecurityLeakagePenetrationTest

### Community 24 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, short_name, shortcuts (+2 more)

### Community 26 - "MediaController.php"
Cohesion: 0.27
Nodes (3): MediaController, MediaUploadService, Illuminate\Support\Facades\Storage

### Community 27 - "TenantScope"
Cohesion: 0.31
Nodes (3): TenantScope, Illuminate\Database\Eloquent\Builder, Illuminate\Database\Eloquent\Scope

### Community 29 - "composer.json"
Cohesion: 0.22
Nodes (8): description, keywords, license, minimum-stability, name, prefer-stable, $schema, type

### Community 30 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, dev, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd, pre-package-uninstall, setup (+1 more)

### Community 31 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/turbopack, @types/node, @types/react, @types/react-dom (+1 more)

### Community 32 - "PHASE 1: Environment & Monorepo Foundation"
Cohesion: 0.22
Nodes (9): 1.1 Inisialisasi Monorepo Root, 1.2 Setup Next.js 16 (`apps/web`), 1.3 Setup Laravel 13 (`apps/api`), 1.4 Setup Docker Compose, 1.5 Shared Packages, 1.6 Environment Variables, Acceptance Criteria, PHASE 1: Environment & Monorepo Foundation (+1 more)

### Community 33 - "require-dev"
Cohesion: 0.25
Nodes (8): require-dev, fakerphp/faker, laravel/pail, laravel/pao, laravel/pint, mockery/mockery, nunomaduro/collision, phpunit/phpunit

### Community 34 - "api/README.md"
Cohesion: 0.25
Nodes (7): About Laravel, Agentic Development, Code of Conduct, Contributing, Learning Laravel, License, Security Vulnerabilities

### Community 35 - "scripts"
Cohesion: 0.25
Nodes (7): name, private, scripts, build:web, dev:web, lint, type-check

### Community 36 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 40 - "PHASE 2: Authentication, Multi-Tenant & RBAC"
Cohesion: 0.29
Nodes (7): 2.1 Database Migrations, 2.2 Core Models & Traits, 2.3 Auth Controllers, 2.4 Frontend Auth, Acceptance Criteria, PHASE 2: Authentication, Multi-Tenant & RBAC, Tujuan

### Community 41 - "PHASE 8: Testing, Security Hardening & Deployment"
Cohesion: 0.29
Nodes (7): 8.1 Pest Tests — Tenant Isolation, 8.2 Playwright E2E, 8.3 Nginx Production Config, 8.4 Laravel Scheduler (Console Commands), Acceptance Criteria, PHASE 8: Testing, Security Hardening & Deployment, Tujuan

### Community 44 - "platform"
Cohesion: 0.33
Nodes (6): platform, ext-dom, ext-simplexml, ext-xml, ext-xmlwriter, php

### Community 45 - "require"
Cohesion: 0.33
Nodes (6): require, chillerlan/php-qrcode, laravel/framework, laravel/sanctum, laravel/tinker, php

### Community 47 - "types/package.json"
Cohesion: 0.33
Nodes (5): main, name, private, types, version

### Community 48 - "ui/package.json"
Cohesion: 0.33
Nodes (5): main, name, private, types, version

### Community 49 - "PHASE 3: Restaurant, Branches & Subscription Engine"
Cohesion: 0.33
Nodes (6): 3.1 Branch Management, 3.2 Feature Entitlement Engine, 3.3 Subscription State Machine, Acceptance Criteria, PHASE 3: Restaurant, Branches & Subscription Engine, Tujuan

### Community 50 - "PHASE 4: Menu, Tables, QR & Customer Ordering"
Cohesion: 0.33
Nodes (6): 4.1 Menu Management, 4.2 Table & QR Code, 4.3 Customer Ordering Page (Next.js), Acceptance Criteria, PHASE 4: Menu, Tables, QR & Customer Ordering, Tujuan

### Community 51 - "PHASE 6: Order Lifecycle, Reverb & KDS/POS"
Cohesion: 0.33
Nodes (6): 6.1 Order Creation, 6.2 Laravel Reverb Events, 6.3 KDS Frontend, Acceptance Criteria, PHASE 6: Order Lifecycle, Reverb & KDS/POS, Tujuan

### Community 52 - "bootstrap/app.php"
Cohesion: 0.40
Nodes (3): Illuminate\Foundation\Application, Illuminate\Foundation\Configuration\Exceptions, Illuminate\Foundation\Configuration\Middleware

### Community 53 - "psr-4"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 54 - "logging.php"
Cohesion: 0.40
Nodes (4): Monolog\Handler\NullHandler, Monolog\Handler\StreamHandler, Monolog\Handler\SyslogUdpHandler, Monolog\Processor\PsrLogMessageProcessor

### Community 55 - "sanctum.php"
Cohesion: 0.40
Nodes (4): Illuminate\Cookie\Middleware\EncryptCookies, Illuminate\Foundation\Http\Middleware\ValidateCsrfToken, Laravel\Sanctum\Http\Middleware\AuthenticateSession, Laravel\Sanctum\Sanctum

### Community 56 - "eslint.config.mjs"
Cohesion: 0.40
Nodes (4): eslintConfig, ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

### Community 57 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 58 - "PHASE 5: Payment Gateway & Webhook Reconciliation"
Cohesion: 0.40
Nodes (5): 5.1 Payment Abstraction, 5.2 Webhook Handler, Acceptance Criteria, PHASE 5: Payment Gateway & Webhook Reconciliation, Tujuan

### Community 59 - "PHASE 7: PWA, Web Push & Analytics Dashboard"
Cohesion: 0.40
Nodes (5): 7.1 PWA Setup, 7.2 Analytics Dashboard, Acceptance Criteria, PHASE 7: PWA, Web Push & Analytics Dashboard, Tujuan

### Community 60 - "Laravel Application"
Cohesion: 0.50
Nodes (3): Agent Setup, Laravel Application, Prerequisites

### Community 61 - "Laravel Application"
Cohesion: 0.50
Nodes (3): Agent Setup, Laravel Application, Prerequisites

### Community 63 - "web/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 64 - "config/package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 65 - "PHASES.md — Ordexa Implementation Playbook"
Cohesion: 0.50
Nodes (3): Catatan Penting untuk Agent, Daftar Fase, PHASES.md — Ordexa Implementation Playbook

### Community 67 - "autoload-dev"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 68 - "extra"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

## Knowledge Gaps
- **305 isolated node(s):** `ApiError`, `ApiResponse`, `Branch`, `DayHours`, `MembershipRole` (+300 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 444 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BelongsToTenant` connect `Restaurant` to `MidtransProvider`, `AGENTS.md — Ordexa Engineering & Agent Operational Playbook`, `Order`, `MenuItem`, `Table`, `TenantScope`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Restaurant` connect `Restaurant` to `User`, `AGENTS.md — Ordexa Engineering & Agent Operational Playbook`, `Order`, `TestCase`, `MenuItem`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Illuminate\Http\Request`, `Table`, `SubscriptionController`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Table` connect `Table` to `Order`, `TestCase`, `Restaurant`, `Illuminate\Support\Str`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `OrderCreatedEvent`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `ApiError`, `ApiResponse`, `Branch` to the rest of the system?**
  _305 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MidtransProvider` be split into smaller, more focused modules?**
  _Cohesion score 0.08140610545790934 - nodes in this community are weakly interconnected._
- **Should `User` be split into smaller, more focused modules?**
  _Cohesion score 0.06262626262626263 - nodes in this community are weakly interconnected._
- **Should `Illuminate\Database\Migrations\Migration` be split into smaller, more focused modules?**
  _Cohesion score 0.07549361207897794 - nodes in this community are weakly interconnected._