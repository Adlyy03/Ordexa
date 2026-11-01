# Graph Report - Ordexa  (2026-11-01)

## Corpus Check
- 188 files · ~68,439 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 30 file(s) not represented in the graph (top: (none) 20, .ico 2, .css 2)

## Summary
- 1122 nodes · 2211 edges · 95 communities (62 shown, 33 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a6524d4a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PaymentGatewayInterface
- Illuminate\Foundation\Http\FormRequest
- Illuminate\Database\Migrations\Migration
- OrderCreatedEvent
- Next.js 16 Frontend App
- Order
- restaurant/page.tsx
- CustomerOrderView.tsx
- TestCase
- (auth)/register/page.tsx
- index.ts
- Restaurant
- api/package.json
- web/package.json
- Illuminate\Support\Str
- compilerOptions
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Controller
- layout.tsx
- dependencies
- Illuminate\Http\JsonResponse
- Partner
- button.tsx
- OrderController.php
- manifest.json
- Illuminate\Support\Facades\Route
- Ordexa Partner Program — Implementation Specification
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
- Illuminate\Http\Request
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
- User
- PartnerController
- Package
- react
- AdminWithdrawalController
- UserFactory.php
- AdminCommissionController
- .update
- next
- entrypoint.sh

## God Nodes (most connected - your core abstractions)
1. `Restaurant` - 48 edges
2. `User` - 43 edges
3. `Partner` - 41 edges
4. `Table` - 37 edges
5. `Order` - 36 edges
6. `Controller` - 35 edges
7. `Branch` - 33 edges
8. `react` - 27 edges
9. `MenuItem` - 23 edges
10. `Subscription` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Phase 5: Payment Gateway & Webhook Reconciliation` --references--> `PaymentGatewayInterface`  [INFERRED]
  AGENTS.md → apps/api/app/Modules/Payment/Contracts/PaymentGatewayInterface.php
- `Acceptance Criteria` --references--> `PaymentGatewayInterface`  [INFERRED]
  PHASES.md → apps/api/app/Modules/Payment/Contracts/PaymentGatewayInterface.php
- `Aturan Scoping Query:` --references--> `BelongsToTenant`  [INFERRED]
  AGENTS.md → apps/api/app/Modules/Tenant/Traits/BelongsToTenant.php
- `Phase 6: Order Lifecycle, Laravel Reverb & KDS/POS` --references--> `OrderCreatedEvent`  [INFERRED]
  AGENTS.md → apps/api/app/Modules/Order/Events/OrderCreatedEvent.php
- `2. Non-Negotiable Guardrails (Aturan Mutlak)` --references--> `PaymentGatewayInterface`  [INFERRED]
  AGENTS.md → apps/api/app/Modules/Payment/Contracts/PaymentGatewayInterface.php

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Multi-Tenant Data Isolation Guardrail** — prd_multi_tenant_architecture, tech_postgresql_shared_schema, tech_sanctum_auth, prd_user_roles [EXTRACTED 1.00]
- **Dual-Track Multi-Tenant Payment Engine** — prd_dual_payment_system, tech_payment_abstraction_layer, tech_xendit_xenplatform, tech_midtrans_gateway, prd_subscription_billing [EXTRACTED 1.00]
- **Order-to-Kitchen Realtime Flow** — prd_qr_table_ordering, prd_kds_kitchen_display, prd_pos_cashier, tech_reverb_realtime [EXTRACTED 1.00]

## Communities (95 total, 33 thin omitted)

### Community 0 - "PaymentGatewayInterface"
Cohesion: 0.05
Nodes (31): 10. Definition of Done (DoD), 11. Navigasi Knowledge Graph, 1. Lead Architect Agent, 1. Project Manifesto & Core Vision, 2. Backend Core Agent (Laravel 13 & PostgreSQL), 2. Non-Negotiable Guardrails (Aturan Mutlak), 3. Frontend PWA Agent (Next.js 16 & shadcn/ui), 3. Mandatory Skills (Wajib Digunakan Tanpa Pengecualian) (+23 more)

### Community 1 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.06
Nodes (9): LoginRequest, RegisterRequest, StoreBranchRequest, UpdateBranchRequest, AdjustCommissionRequest, PartnerRegisterRequest, UpdatePartnerSettingRequest, WithdrawalRequest (+1 more)

### Community 2 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.07
Nodes (3): Illuminate\Database\Migrations\Migration, Illuminate\Database\Schema\Blueprint, Illuminate\Support\Facades\Schema

### Community 3 - "OrderCreatedEvent"
Cohesion: 0.09
Nodes (19): 8. Roadmap Implementasi 8 Fase (Step-by-Step), Phase 1: Environment & Monorepo Foundation, Phase 2: Authentication, Multi-Tenant & RBAC, Phase 3: Restaurant, Unlimited Branches & Subscription Engine, Phase 4: Menu, Tables, QR Generation & Customer Ordering, Phase 5: Payment Gateway & Webhook Reconciliation, Phase 6: Order Lifecycle, Laravel Reverb & KDS/POS, Phase 7: PWA, Web Push & Analytics Dashboard (+11 more)

### Community 4 - "Next.js 16 Frontend App"
Cohesion: 0.07
Nodes (36): Branch Operations Management, Dual Payment Architecture (Subscription vs Customer), Enterprise Subscription Tier, Kitchen Display System (KDS), Menu & Category Management, Multi-Tenant SaaS Architecture, POS / Cashier System, Professional Subscription Tier (+28 more)

### Community 5 - "Order"
Cohesion: 0.12
Nodes (5): Order, OrderItem, OrderService, AnalyticsController, OrderLifecycleTest

### Community 6 - "restaurant/page.tsx"
Cohesion: 0.18
Nodes (7): AnalyticsData, AnalyticsSummary, BranchBreakdown, StatusBreakdown, TopItem, ref_next_link, recharts

### Community 7 - "CustomerOrderView.tsx"
Cohesion: 0.13
Nodes (19): Props, CartDrawer(), CartDrawerProps, CustomerOrderView(), CustomerOrderViewProps, MenuGrid(), MenuGridProps, OrderConfirmation() (+11 more)

### Community 8 - "TestCase"
Cohesion: 0.14
Nodes (7): AnalyticsTest, HealthCheckTest, PaymentWebhookTest, TestCase, Illuminate\Foundation\Testing\RefreshDatabase, Illuminate\Foundation\Testing\TestCase, Illuminate\Support\Facades\Event

### Community 9 - "(auth)/register/page.tsx"
Cohesion: 0.10
Nodes (21): LoginForm, loginSchema, RegisterForm, registerSchema, OrderItem, OrderRecord, OrderConfirmationProps, Input (+13 more)

### Community 10 - "index.ts"
Cohesion: 0.08
Nodes (24): ApiError, ApiResponse, Branch, DayHours, MembershipRole, MenuCategory, MenuItem, MenuVariant (+16 more)

### Community 11 - "Restaurant"
Cohesion: 0.15
Nodes (9): Branch, MenuCategory, PublicOrderController, Table, Restaurant, BelongsToTenant, SecurityLeakagePenetrationTest, Illuminate\Database\Eloquent\Relations\HasOne (+1 more)

### Community 12 - "api/package.json"
Cohesion: 0.09
Nodes (21): devDependencies, concurrently, laravel-vite-plugin, tailwindcss, @tailwindcss/vite, vite, tailwindcss, optionalDependencies (+13 more)

### Community 13 - "web/package.json"
Cohesion: 0.10
Nodes (20): tailwindcss, name, packageManager, private, version, clsx, date-fns, eslint (+12 more)

### Community 14 - "Illuminate\Support\Str"
Cohesion: 0.11
Nodes (9): MediaController, MediaUploadService, QRCodeService, chillerlan\QRCode\Output\QRMarkupSVG, chillerlan\QRCode\QRCode, chillerlan\QRCode\QROptions, Illuminate\Support\Facades\Storage, Illuminate\Support\Str (+1 more)

### Community 15 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 16 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.14
Nodes (7): BranchMenuSetting, PartnerCommission, PaymentTransaction, Subscription, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 17 - "Controller"
Cohesion: 0.14
Nodes (4): Controller, BranchController, WebhookController, RestaurantController

### Community 18 - "layout.tsx"
Cohesion: 0.18
Nodes (9): apps_web_app_globals, inter, metadata, viewport, ServiceWorkerRegister(), Providers(), ref_next_font_google, @tanstack/react-query (+1 more)

### Community 19 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, clsx, date-fns, @hookform/resolvers, lucide-react, next, react, react-dom (+8 more)

### Community 20 - "Illuminate\Http\JsonResponse"
Cohesion: 0.16
Nodes (4): MenuCategoryController, MenuItemController, TableController, Illuminate\Http\JsonResponse

### Community 21 - "Partner"
Cohesion: 0.07
Nodes (12): Partner, PartnerAuditLog, PartnerCommissionSetting, PartnerReferral, PartnerWithdrawal, CommissionService, PartnerService, WithdrawalService (+4 more)

### Community 22 - "button.tsx"
Cohesion: 0.13
Nodes (20): AdminLayout(), AdminLayoutProps, PartnerLayout(), PartnerLayoutProps, Button, ButtonProps, AdminCommissionRecord, AdminPartnerRecord (+12 more)

### Community 24 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, short_name, shortcuts (+2 more)

### Community 26 - "Ordexa Partner Program — Implementation Specification"
Cohesion: 0.06
Nodes (34): 10. UI/UX Design, 11. API & Backend, 12. Security & Financial Integrity, 13. Testing Requirements, 14. Implementation Instructions, 15. Final Requirements, 1. Objective, 2. New Pages & Routes (+26 more)

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
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, postcss, tailwindcss, @tailwindcss/postcss, @tailwindcss/turbopack, @types/node (+3 more)

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

### Community 52 - "Illuminate\Http\Request"
Cohesion: 0.24
Nodes (5): AdminPartnerController, Illuminate\Foundation\Application, Illuminate\Foundation\Configuration\Exceptions, Illuminate\Foundation\Configuration\Middleware, Illuminate\Http\Request

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

### Community 84 - "User"
Cohesion: 0.16
Nodes (6): RestaurantMembership, HasOne, User, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Laravel\Sanctum\HasApiTokens

### Community 86 - "Package"
Cohesion: 0.31
Nodes (4): Package, DatabaseSeeder, PackageSeeder, Illuminate\Database\Seeder

### Community 87 - "react"
Cohesion: 0.22
Nodes (5): OrderData, OrderItem, SuperAdminMetrics, TenantRecord, react

### Community 89 - "UserFactory.php"
Cohesion: 0.38
Nodes (4): UserFactory, Illuminate\Database\Eloquent\Factories\Factory, Illuminate\Support\Facades\Hash, static

## Knowledge Gaps
- **339 isolated node(s):** `$schema`, `name`, `type`, `description`, `keywords` (+334 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 504 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PaymentGatewayInterface` connect `PaymentGatewayInterface` to `PHASE 5: Payment Gateway & Webhook Reconciliation`, `OrderCreatedEvent`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `Acceptance Criteria` connect `PHASE 5: Payment Gateway & Webhook Reconciliation` to `PaymentGatewayInterface`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `PHASES.md — Ordexa Implementation Playbook` connect `PHASES.md — Ordexa Implementation Playbook` to `PHASE 1: Environment & Monorepo Foundation`, `PHASE 2: Authentication, Multi-Tenant & RBAC`, `PHASE 8: Testing, Security Hardening & Deployment`, `PHASE 3: Restaurant, Branches & Subscription Engine`, `PHASE 4: Menu, Tables, QR & Customer Ordering`, `PHASE 6: Order Lifecycle, Reverb & KDS/POS`, `PHASE 5: Payment Gateway & Webhook Reconciliation`, `PHASE 7: PWA, Web Push & Analytics Dashboard`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **What connects `$schema`, `name`, `type` to the rest of the system?**
  _339 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PaymentGatewayInterface` be split into smaller, more focused modules?**
  _Cohesion score 0.050595238095238096 - nodes in this community are weakly interconnected._
- **Should `Illuminate\Foundation\Http\FormRequest` be split into smaller, more focused modules?**
  _Cohesion score 0.05853658536585366 - nodes in this community are weakly interconnected._
- **Should `Illuminate\Database\Migrations\Migration` be split into smaller, more focused modules?**
  _Cohesion score 0.0707070707070707 - nodes in this community are weakly interconnected._