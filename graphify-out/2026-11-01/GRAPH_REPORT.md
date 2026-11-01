# Graph Report - Ordexa  (2026-11-01)

## Corpus Check
- 96 files · ~34,580 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 29 file(s) not represented in the graph (top: (none) 20, .ico 2, .css 2)

## Summary
- 626 nodes · 808 edges · 52 communities (36 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Next.js 16 Frontend App
- Illuminate\Http\JsonResponse
- web/package.json
- composer.json
- login/page.tsx
- Illuminate\Database\Migrations\Migration
- MVP Acceptance Criteria
- MVP Priorities (P0/P1/P2)
- Ordexa Restaurant SaaS Overview
- Inventory & Stock Tracking
- AGENTS.md — Ordexa Engineering & Agent Operational Playbook
- Restaurant
- User
- index.ts
- api/package.json
- AuthTest
- compilerOptions
- TenantScope
- dependencies
- config
- PHASE 1: Environment & Monorepo Foundation
- api/README.md
- scripts
- PHASE 2: Authentication, Multi-Tenant & RBAC
- PHASE 8: Testing, Security Hardening & Deployment
- AppServiceProvider
- types/package.json
- ui/package.json
- PHASE 3: Restaurant, Branches & Subscription Engine
- PHASE 4: Menu, Tables, QR & Customer Ordering
- PHASE 6: Order Lifecycle, Reverb & KDS/POS
- logging.php
- sanctum.php
- eslint.config.mjs
- PHASE 5: Payment Gateway & Webhook Reconciliation
- PHASE 7: PWA, Web Push & Analytics Dashboard
- Laravel Application
- Laravel Application
- ExampleTest
- web/README.md
- config/package.json
- PHASES.md — Ordexa Implementation Playbook
- artisan
- console.php
- web/AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `User` - 17 edges
2. `Restaurant` - 17 edges
3. `compilerOptions` - 16 edges
4. `Branch` - 13 edges
5. `AGENTS.md — Ordexa Engineering & Agent Operational Playbook` - 12 edges
6. `PHASES.md — Ordexa Implementation Playbook` - 11 edges
7. `Next.js 16 Frontend App` - 11 edges
8. `Controller` - 9 edges
9. `scripts` - 9 edges
10. `AuthTest` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Aturan Scoping Query:` --references--> `BelongsToTenant`  [INFERRED]
  agents.md → apps/api/app/Modules/Tenant/Traits/BelongsToTenant.php
- `Phase 2: Authentication, Multi-Tenant & RBAC` --references--> `IdentifyTenant`  [INFERRED]
  agents.md → apps/api/app/Modules/Tenant/Middleware/IdentifyTenant.php
- `Phase 2: Authentication, Multi-Tenant & RBAC` --references--> `BelongsToTenant`  [INFERRED]
  agents.md → apps/api/app/Modules/Tenant/Traits/BelongsToTenant.php
- `SaaS Subscription & Billing Engine` --references--> `Midtrans Payment Gateway (Platform Subscription)`  [INFERRED]
  PRD.md → TECH.md
- `Next.js 16 Frontend App` --implements--> `Public Marketing & Registration Portal`  [EXTRACTED]
  TECH.md → PRD.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Multi-Tenant Data Isolation Guardrail** — prd_multi_tenant_architecture, tech_postgresql_shared_schema, tech_sanctum_auth, prd_user_roles [EXTRACTED 1.00]
- **Dual-Track Multi-Tenant Payment Engine** — prd_dual_payment_system, tech_payment_abstraction_layer, tech_xendit_xenplatform, tech_midtrans_gateway, prd_subscription_billing [EXTRACTED 1.00]
- **Order-to-Kitchen Realtime Flow** — prd_qr_table_ordering, prd_kds_kitchen_display, prd_pos_cashier, tech_reverb_realtime [EXTRACTED 1.00]

## Communities (52 total, 16 thin omitted)

### Community 0 - "Next.js 16 Frontend App"
Cohesion: 0.07
Nodes (36): Branch Operations Management, Dual Payment Architecture (Subscription vs Customer), Enterprise Subscription Tier, Kitchen Display System (KDS), Menu & Category Management, Multi-Tenant SaaS Architecture, POS / Cashier System, Professional Subscription Tier (+28 more)

### Community 1 - "Illuminate\Http\JsonResponse"
Cohesion: 0.05
Nodes (22): Controller, AuthController, LoginRequest, RegisterRequest, BranchController, Branch, StoreBranchRequest, UpdateBranchRequest (+14 more)

### Community 2 - "web/package.json"
Cohesion: 0.05
Nodes (42): apps_web_app_globals, inter, metadata, viewport, Providers(), nextConfig, devDependencies, eslint (+34 more)

### Community 3 - "composer.json"
Cohesion: 0.05
Nodes (41): autoload, autoload-dev, psr-4, psr-4, description, extra, laravel, keywords (+33 more)

### Community 4 - "login/page.tsx"
Cohesion: 0.10
Nodes (24): LoginForm, loginSchema, RegisterForm, registerSchema, Button, ButtonProps, Input, InputProps (+16 more)

### Community 5 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.09
Nodes (3): Illuminate\Database\Migrations\Migration, Illuminate\Database\Schema\Blueprint, Illuminate\Support\Facades\Schema

### Community 10 - "AGENTS.md — Ordexa Engineering & Agent Operational Playbook"
Cohesion: 0.07
Nodes (27): 10. Definition of Done (DoD), 11. Navigasi Knowledge Graph, 1. Lead Architect Agent, 1. Project Manifesto & Core Vision, 2. Backend Core Agent (Laravel 13 & PostgreSQL), 2. Non-Negotiable Guardrails (Aturan Mutlak), 3. Frontend PWA Agent (Next.js 16 & shadcn/ui), 3. Mandatory Skills (Wajib Digunakan Tanpa Pengecualian) (+19 more)

### Community 11 - "Restaurant"
Cohesion: 0.13
Nodes (10): Phase 3: Restaurant, Unlimited Branches & Subscription Engine, RestaurantMembership, Subscription, Table, Restaurant, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\Relations\BelongsTo, Illuminate\Database\Eloquent\Relations\HasMany (+2 more)

### Community 12 - "User"
Cohesion: 0.12
Nodes (12): User, UserFactory, DatabaseSeeder, PackageSeeder, Illuminate\Database\Eloquent\Factories\Factory, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Seeder, Illuminate\Foundation\Auth\User (+4 more)

### Community 13 - "index.ts"
Cohesion: 0.08
Nodes (24): ApiError, ApiResponse, Branch, DayHours, MembershipRole, MenuCategory, MenuItem, MenuVariant (+16 more)

### Community 14 - "api/package.json"
Cohesion: 0.09
Nodes (21): devDependencies, concurrently, laravel-vite-plugin, tailwindcss, @tailwindcss/vite, vite, tailwindcss, optionalDependencies (+13 more)

### Community 15 - "AuthTest"
Cohesion: 0.13
Nodes (6): AuthTest, HealthCheckTest, TenantIsolationTest, TestCase, Illuminate\Foundation\Testing\RefreshDatabase, Illuminate\Foundation\Testing\TestCase

### Community 16 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 17 - "TenantScope"
Cohesion: 0.18
Nodes (8): Phase 2: Authentication, Multi-Tenant & RBAC, IdentifyTenant, TenantScope, BelongsToTenant, Closure, Illuminate\Database\Eloquent\Builder, Illuminate\Database\Eloquent\Scope, Symfony\Component\HttpFoundation\Response

### Community 18 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, clsx, date-fns, @hookform/resolvers, lucide-react, next, react, react-dom (+8 more)

### Community 19 - "config"
Cohesion: 0.15
Nodes (13): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, platform, preferred-install, sort-packages (+5 more)

### Community 20 - "PHASE 1: Environment & Monorepo Foundation"
Cohesion: 0.22
Nodes (9): 1.1 Inisialisasi Monorepo Root, 1.2 Setup Next.js 16 (`apps/web`), 1.3 Setup Laravel 13 (`apps/api`), 1.4 Setup Docker Compose, 1.5 Shared Packages, 1.6 Environment Variables, Acceptance Criteria, PHASE 1: Environment & Monorepo Foundation (+1 more)

### Community 21 - "api/README.md"
Cohesion: 0.25
Nodes (7): About Laravel, Agentic Development, Code of Conduct, Contributing, Learning Laravel, License, Security Vulnerabilities

### Community 22 - "scripts"
Cohesion: 0.25
Nodes (7): name, private, scripts, build:web, dev:web, lint, type-check

### Community 23 - "PHASE 2: Authentication, Multi-Tenant & RBAC"
Cohesion: 0.29
Nodes (7): 2.1 Database Migrations, 2.2 Core Models & Traits, 2.3 Auth Controllers, 2.4 Frontend Auth, Acceptance Criteria, PHASE 2: Authentication, Multi-Tenant & RBAC, Tujuan

### Community 24 - "PHASE 8: Testing, Security Hardening & Deployment"
Cohesion: 0.29
Nodes (7): 8.1 Pest Tests — Tenant Isolation, 8.2 Playwright E2E, 8.3 Nginx Production Config, 8.4 Laravel Scheduler (Console Commands), Acceptance Criteria, PHASE 8: Testing, Security Hardening & Deployment, Tujuan

### Community 26 - "types/package.json"
Cohesion: 0.33
Nodes (5): main, name, private, types, version

### Community 27 - "ui/package.json"
Cohesion: 0.33
Nodes (5): main, name, private, types, version

### Community 28 - "PHASE 3: Restaurant, Branches & Subscription Engine"
Cohesion: 0.33
Nodes (6): 3.1 Branch Management, 3.2 Feature Entitlement Engine, 3.3 Subscription State Machine, Acceptance Criteria, PHASE 3: Restaurant, Branches & Subscription Engine, Tujuan

### Community 29 - "PHASE 4: Menu, Tables, QR & Customer Ordering"
Cohesion: 0.33
Nodes (6): 4.1 Menu Management, 4.2 Table & QR Code, 4.3 Customer Ordering Page (Next.js), Acceptance Criteria, PHASE 4: Menu, Tables, QR & Customer Ordering, Tujuan

### Community 30 - "PHASE 6: Order Lifecycle, Reverb & KDS/POS"
Cohesion: 0.33
Nodes (6): 6.1 Order Creation, 6.2 Laravel Reverb Events, 6.3 KDS Frontend, Acceptance Criteria, PHASE 6: Order Lifecycle, Reverb & KDS/POS, Tujuan

### Community 31 - "logging.php"
Cohesion: 0.40
Nodes (4): Monolog\Handler\NullHandler, Monolog\Handler\StreamHandler, Monolog\Handler\SyslogUdpHandler, Monolog\Processor\PsrLogMessageProcessor

### Community 32 - "sanctum.php"
Cohesion: 0.40
Nodes (4): Illuminate\Cookie\Middleware\EncryptCookies, Illuminate\Foundation\Http\Middleware\ValidateCsrfToken, Laravel\Sanctum\Http\Middleware\AuthenticateSession, Laravel\Sanctum\Sanctum

### Community 33 - "eslint.config.mjs"
Cohesion: 0.40
Nodes (4): eslintConfig, ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

### Community 34 - "PHASE 5: Payment Gateway & Webhook Reconciliation"
Cohesion: 0.40
Nodes (5): 5.1 Payment Abstraction, 5.2 Webhook Handler, Acceptance Criteria, PHASE 5: Payment Gateway & Webhook Reconciliation, Tujuan

### Community 35 - "PHASE 7: PWA, Web Push & Analytics Dashboard"
Cohesion: 0.40
Nodes (5): 7.1 PWA Setup, 7.2 Analytics Dashboard, Acceptance Criteria, PHASE 7: PWA, Web Push & Analytics Dashboard, Tujuan

### Community 36 - "Laravel Application"
Cohesion: 0.50
Nodes (3): Agent Setup, Laravel Application, Prerequisites

### Community 37 - "Laravel Application"
Cohesion: 0.50
Nodes (3): Agent Setup, Laravel Application, Prerequisites

### Community 39 - "web/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "config/package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 41 - "PHASES.md — Ordexa Implementation Playbook"
Cohesion: 0.50
Nodes (3): Catatan Penting untuk Agent, Daftar Fase, PHASES.md — Ordexa Implementation Playbook

## Knowledge Gaps
- **277 isolated node(s):** `$schema`, `name`, `type`, `description`, `keywords` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 367 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Restaurant` connect `Restaurant` to `Illuminate\Http\JsonResponse`, `AuthTest`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `8. Roadmap Implementasi 8 Fase (Step-by-Step)` connect `AGENTS.md — Ordexa Engineering & Agent Operational Playbook` to `TenantScope`, `Restaurant`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `User` connect `User` to `Illuminate\Http\JsonResponse`, `AuthTest`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `$schema`, `name`, `type` to the rest of the system?**
  _277 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Next.js 16 Frontend App` be split into smaller, more focused modules?**
  _Cohesion score 0.06825396825396825 - nodes in this community are weakly interconnected._
- **Should `Illuminate\Http\JsonResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.05115089514066496 - nodes in this community are weakly interconnected._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04625346901017576 - nodes in this community are weakly interconnected._