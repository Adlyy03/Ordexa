# AGENTS.md — Ordexa Engineering & Agent Operational Playbook

> **Panduan & Standar Operasional untuk AI Agents dan Tim Engineering**  
> Proyek: **Ordexa** — National Restaurant Ordering & Management Ecosystem (Multi-Tenant SaaS)  
> Dokumen Sumber: [PRD.md](file:///home/adly/Projects/Ordexa/PRD.md) & [TECH.md](file:///home/adly/Projects/Ordexa/TECH.md)  
> Status: **Active Reference & Project Constitution**

---

## 1. Project Manifesto & Core Vision

Ordexa adalah platform Software as a Service (SaaS) multi-tenant B2B2C untuk mendigitalisasi operasional ekosistem restoran dan UMKM kuliner di Indonesia:
- **B2B**: Pemilik restoran mendaftar, berlangganan SaaS, mengelola menu, meja, staf, dan memonitor banyak cabang secara terpusat.
- **B2C**: Pelanggan memesan makanan langsung dari meja via QR Code tanpa perlu download aplikasi atau registrasi akun, lalu membayar via QRIS.
- **Operasional**: Pesanan diteruskan secara realtime ke Kitchen Display System (KDS) dan sistem Kasir (POS) tanpa jeda.

Setiap agent yang berkontribusi pada repositori ini **WAJIB** membaca dan menaati aturan main dalam dokumen ini sebelum menulis sebaris kode pun.

---

## 2. Non-Negotiable Guardrails (Aturan Mutlak)

Setiap agent **DILARANG KERAS** melanggar 11 prinsip inti berikut:

1. **Modular Monolith, Bukan Microservices**:  
   Arsitektur backend adalah Laravel 13 modular monolith (`apps/api/app/Modules/...`). Jangan memecah backend menjadi microservices terpisah pada fase MVP.
2. **Backend-Enforced Multi-Tenancy**:  
   Isolasi tenant (`tenant_id`) **wajib** ditegakkan di level database query, Eloquent Global Scopes, dan Sanctum Policies. **JANGAN PERNAH** mempercayai `tenant_id` dari payload request client tanpa verifikasi relasi user/token di backend.
3. **Semua Paket Mendukung Cabang Tanpa Batas (Unlimited Branches)**:  
   Semua tier langganan (Starter, Professional, Enterprise) **mendukung cabang tanpa batas**. Perbedaan tier diatur berdasarkan **Fitur (Feature Entitlement)**, bukan pembatasan kuota cabang. Langganan dibayar di tingkat restoran (Tenant), bukan per cabang.
4. **Pemisahan Jalur Pembayaran (Dual Payment Separation)**:  
   - **Track 1 (Subscription)**: Restoran membayar ke akun platform Ordexa (Midtrans / Xendit Master).
   - **Track 2 (Customer Order)**: Pelanggan membayar pesanan langsung ke sub-account merchant restoran terkait via Xendit xenPlatform / QRIS restoran. Dana pesanan pelanggan **TIDAK BOLEH** dicampur ke rekening platform tanpa skema resmi penyedia gateway.
5. **Payment Provider Abstraction Layer**:  
   Kode transaksi wajib menggunakan interface (`PaymentGatewayInterface`). Dilarang memanggil SDK Midtrans/Xendit langsung di Controller.
6. **Idempotensi & Webhook Signature**:  
   Semua webhook pembayaran wajib diverifikasi tanda tangan keamanannya (`signature verification`) dan menerapkan `idempotency key` untuk mencegah pemrosesan pembayaran ganda.
7. **Hybrid Web & PWA**:  
   - Customer QR Ordering (`order.platform.com`) & Public Landing: Website standar (cepat, mobile-first, zero install, tanpa login wajib).
   - Dashboard (Super Admin, Owner, Cabang, Kasir, KDS): PWA yang dapat diinstal (Service Worker, Web App Manifest, Standalone display).
8. **Keuangan Tidak Boleh Offline**:  
   Meskipun PWA mendukung cache offline untuk aset statis, **semua transaksi keuangan dan konfirmasi pesanan wajib online dan divalidasi server**.
9. **Kredensial & Secrets Terproteksi**:  
   API Keys payment gateway restoran tidak boleh disimpan sebagai plain text di database. Wajib terenkripsi (`encrypted cast` di Eloquent / secret vault).
10. **Zero Dummy UI**:  
    Dilarang membuat tombol tanpa fungsi nyata atau halaman bertuliskan *"Coming Soon"* pada fitur yang dideklarasikan aktif di MVP. Semua tombol dan navigasi harus fungsional dengan validasi dan error handling lengkap.
11. **Wajib Mematuhi 3 Core Skills (`graphify`, `caveman`, `antislop-ui`)**:  
    Seluruh agen operasional wajib mengaktifkan dan mengintegrasikan ketiga skill ini dalam setiap respon dan eksekusi kode.

---

## 3. Mandatory Skills (Wajib Digunakan Tanpa Pengecualian)

Setiap agent yang bekerja pada project ini **WAJIB** menerapkan 3 skill berikut:

| Skill | Fungsi & Mandat Operasional |
| :--- | :--- |
| **`graphify`** | **Architecture & Dependency Navigation**: Selalu query graph (`graphify-out/`) sebelum dan sesudah perubahan kode. Dilarang menebak relasi modul tanpa verifikasi graph dependencies. |
| **`caveman`** | **Terse Technical Communication**: Komunikasi wajib ringkas, padat, tanpa basa-basi (*answer first, kill fluff*), hemat token, namun 100% fakta teknis, path file, dan perintah tetap utuh dan presisi. |
| **`antislop-ui`** | **Visual & UI Anti-Slop Filter**: Standar mutlak frontend Next.js/Tailwind/shadcn. Desain bebas generic AI slop, tata letak, hierarki warna, kontras, responsivitas mobile-first, dan interaksi wajib berkelas produksi. |

---

## 4. Repositori & Topology Arsitektur (Monorepo)

Struktur monorepo menggunakan `pnpm` workspace untuk frontend dan Composer untuk backend Laravel:

```text
Ordexa/
├── apps/
│   ├── web/                     # Next.js 16 (App Router, React 19, TypeScript)
│   │   ├── app/
│   │   │   ├── (marketing)/     # Landing page, pricing, public FAQ
│   │   │   ├── (auth)/          # Login, Register, Email Verification
│   │   │   ├── super-admin/     # Platform Owner Dashboard (PWA)
│   │   │   ├── restaurant/      # Owner & Admin Multi-Branch Dashboard (PWA)
│   │   │   ├── branch/          # Branch Operations Dashboard (PWA)
│   │   │   ├── cashier/         # POS & Cashier Station (PWA)
│   │   │   ├── kitchen/         # Kitchen Display System / KDS (PWA)
│   │   │   └── order/           # Customer QR Ordering: /r/[tenant]/[branch]/[table]
│   │   ├── components/          # UI Components (shadcn/ui + Tailwind)
│   │   ├── hooks/               # Custom React Hooks
│   │   ├── services/            # API Client Services (TanStack Query)
│   │   └── public/              # Icons, PWA Manifest, Static Assets
│   │
│   └── api/                     # Laravel 13 (PHP 8.3+) Modular API
│       ├── app/
│       │   ├── Modules/         # Domain Modules (Auth, Tenant, Restaurant, Branch,
│       │   │                    #   Menu, Table, Order, Payment, KDS, POS, Subscription)
│       │   ├── Models/          # Core Eloquent Models & Scopes
│       │   ├── Services/        # Business Logic & Payment Abstraction
│       │   ├── Jobs/            # Queue Workers (Order broadcasting, Webhook handling)
│       │   └── Policies/        # Authorization & RBAC Policies
│       ├── database/            # Migrations, Seeders, Factories
│       ├── routes/              # API Routes (api.php, channels.php, webhooks.php)
│       └── tests/               # Pest PHP Unit & Feature Tests
│
├── packages/
│   ├── ui/                      # Shared React UI components
│   ├── types/                   # Shared TypeScript DTOs & Contracts
│   └── config/                  # Shared ESLint, Prettier, Tailwind configurations
│
├── infrastructure/
│   ├── docker/                  # Dockerfiles for Web, API, Reverb, Workers
│   ├── nginx/                   # Nginx reverse proxy configuration
│   ├── database/                # PostgreSQL init scripts & backup routines
│   └── monitoring/              # Healthcheck & logging configs
│
├── graphify-out/                # Persistent Architectural Knowledge Graph
├── PRD.md                       # Product Requirements Document
├── TECH.md                      # Technical Architecture Specification
├── AGENTS.md                    # This Engineering & Agent Playbook
├── docker-compose.yml           # Local & Single VPS MVP Orchestration
└── pnpm-workspace.yaml          # PNPM Workspace Configuration
```

---

## 5. Subdomain & Routing Strategy

| Subdomain | Target Aplikasi | Audience | Sifat Aplikasi |
| :--- | :--- | :--- | :--- |
| `platform.com` | `apps/web/app/(marketing)` | Publik & Calon Klien | Standar Web (SEO optimized) |
| `app.platform.com` | `apps/web/app/{super-admin,restaurant,branch,cashier,kitchen}` | Owner, Manager, Kasir, Dapur, Super Admin | PWA (Installable) |
| `order.platform.com` | `apps/web/app/order` | Pelanggan Restoran | Web (Mobile-First, zero login) |
| `api.platform.com` | `apps/api` | API Gateway / Client Requests | RESTful JSON API + WebSockets |

**Contoh URL Pemesanan Pelanggan (QR Code):**  
`order.platform.com/r/{restaurant-slug}/{branch-slug}/{table-code}`

---

## 6. Model Multi-Tenancy & Skema Database

Platform menggunakan **Shared Database & Shared Schema** dengan isolasi `tenant_id` pada PostgreSQL.

### Relasi Inti Database
```text
users
  └── restaurant_memberships (role: owner, admin, manager, cashier, kitchen)
          └── restaurants (tenant_id, name, logo, subscription_status)
                 ├── subscriptions (package_id, status: active|grace|expired, dates)
                 ├── branches (branch_id, name, address, operational_hours)
                 │    ├── tables (table_id, table_number, qr_code_token, qr_image_url)
                 │    ├── orders (order_id, status, total_amount, payment_status)
                 │    │    └── order_items (product_id, quantity, notes, price)
                 │    ├── transactions (payment_id, gateway, invoice, amount)
                 │    └── employees (user_id, branch_id, role, status)
                 ├── menus (categories, products, modifiers, toppings, images_r2)
                 └── restaurant_payment_accounts (xendit_sub_account_id, settlement_status)
```

### Aturan Scoping Query:
- Semua model domain restoran **WAJIB** menggunakan Trait `BelongsToTenant`.
- Trait `BelongsToTenant` menerapkan Eloquent Global Scope yang otomatis menambahkan `WHERE tenant_id = :current_tenant_id`.
- Untuk request kasir, KDS, dan manager cabang, scope dipersempit ke `branch_id` yang ditugaskan.
- Bypass tenant scope **HANYA** diperbolehkan untuk request yang terautentikasi sebagai `Super Admin` melalui policy eksplisit.

---

## 7. Spesialisasi Agent (Agent Personas & Task Matrix)

Saat menyelesaikan tugas dalam proyek ini, AI Agent mengadopsi persona spesifik berikut sesuai domain pekerjaannya:

```
                  ┌──────────────────────────────┐
                  │      Lead Architect Agent     │
                  │   (Orchestrator & Standards)  │
                  └──────────────┬───────────────┘
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Backend Core   │    │   Frontend PWA   │    │ Payment & Sec    │
│  (Laravel/DB/API)│    │ (Next.js/UI/UX)  │    │ (Xendit/Sanctum) │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                     ┌───────────────────────┐
                     │    QA & Test Agent    │
                     │ (Pest/Vitest/E2E/Sec) │
                     └───────────────────────┘
```

### 1. Lead Architect Agent
- **Tanggung Jawab**: Menjaga integritas monorepo, review arsitektur modular, memastikan batasan modul tidak bocor, serta memastikan kepatuhan terhadap PRD.md dan TECH.md.
- **Tools Utama**: `graphify`, git, file inspector, codebase search.

### 2. Backend Core Agent (Laravel 13 & PostgreSQL)
- **Tanggung Jawab**:
  - Implementasi modul domain di `apps/api/app/Modules/`.
  - Migrasi database PostgreSQL, Trait multi-tenant, dan indexing efisien.
  - Setup background workers via Laravel Queue & Scheduler.
  - Setup real-time broadcasting via Laravel Reverb (Event `OrderCreated`, `OrderStatusUpdated`).

### 3. Frontend PWA Agent (Next.js 16 & shadcn/ui)
- **Tanggung Jawab**:
  - Membangun antarmuka pengguna di `apps/web` (Marketing, Customer QR, Dashboard multi-role).
  - Setup PWA: `manifest.json`, Service Worker caching (Workbox/Serwist), Web Push API.
  - Integrasi state management: TanStack Query (caching API) dan Zustand (keranjang belanja & sesi meja).
  - UI responsif mobile-first menggunakan Tailwind CSS dan shadcn/ui.

### 4. Payment & Security Agent
- **Tanggung Jawab**:
  - Implementasi `PaymentGatewayInterface` dan driver provider (Xendit xenPlatform & Midtrans).
  - Enkripsi credential gateway di database.
  - Validasi webhook signature & penanganan idempotensi transaksi.
  - Audit trail finansial dan rekonsiliasi data pembayaran.

### 5. QA & Testing Agent
- **Tanggung Jawab**:
  - Unit & feature test backend menggunakan **Pest PHP**.
  - Component test frontend menggunakan **Vitest**.
  - E2E testing alur belanja & KDS menggunakan **Playwright**.
  - **Security isolation test**: Memverifikasi secara otomatis bahwa Tenant A tidak pernah bisa membaca data Tenant B dalam kondisi apapun.

---

## 8. Roadmap Implementasi 8 Fase (Step-by-Step)

Pengerjaan proyek wajib mengikuti tahapan fase berikut. Jangan melompati fase sebelum kriteria penerimaan (acceptance criteria) fase sebelumnya terpenuhi:

### Phase 1: Environment & Monorepo Foundation
- [ ] Inisialisasi struktur monorepo (`apps/web`, `apps/api`, `packages/ui`, `packages/types`).
- [ ] Setup Docker Compose untuk local development (PostgreSQL 17, Redis 8, Nginx).
- [ ] Konfigurasi Next.js 16 dengan TypeScript, Tailwind CSS, shadcn/ui.
- [ ] Konfigurasi Laravel 13 dengan PHP 8.3+, Sanctum, dan Pest.

### Phase 2: Authentication, Multi-Tenant & RBAC
- [ ] Tabel migrasi `users`, `restaurants`, `restaurant_memberships`, `roles`, `permissions`.
- [ ] Trait `BelongsToTenant` dan Middleware `IdentifyTenant`.
- [ ] Autentikasi Laravel Sanctum berbasis secure httpOnly cookie.
- [ ] RBAC Policies: Super Admin, Restaurant Owner, Admin, Branch Manager, Cashier, Kitchen Staff.
- [ ] Test isolasi data tenant: Tenant A tidak bisa query Tenant B.

### Phase 3: Restaurant, Unlimited Branches & Subscription Engine
- [ ] CRUD Restoran & Profil Bisnis.
- [ ] Modul Manajemen Cabang tanpa batasan jumlah (`branches`).
- [ ] Master Paket Langganan: Starter, Professional, Enterprise.
- [ ] Feature Entitlement Engine: verifikasi akses fitur berdasarkan paket aktif.
- [ ] Subscription State Machine: `registered` → `pending_payment` → `active` → `grace_period` → `expired/suspended`.

### Phase 4: Menu, Tables, QR Generation & Customer Ordering
- [ ] Kategori & Menu CRUD dengan upload foto ke Cloudflare R2 (presigned URL).
- [ ] Pengaturan ketersediaan menu per cabang.
- [ ] Manajemen Meja per Cabang (`tables`) dan dynamic QR Code generator.
- [ ] Halaman Pelanggan `order.platform.com/r/{tenant}/{branch}/{table}`.
- [ ] Keranjang belanja (Zustand) dan form konfirmasi pesanan (tanpa login).

### Phase 5: Payment Gateway & Webhook Reconciliation
- [ ] Abstraksi Provider Pembayaran (`PaymentGatewayInterface`).
- [ ] Implementasi Xendit xenPlatform untuk pembayaran pesanan pelanggan (sub-merchant account & QRIS).
- [ ] Implementasi pembayaran subscription platform via Midtrans/Xendit master.
- [ ] Webhook endpoint dengan signature verification dan idempotency table.
- [ ] Penanganan status: pending, paid, failed, expired.

### Phase 6: Order Lifecycle, Laravel Reverb & KDS/POS
- [ ] Pembuatan pesanan (`orders`, `order_items`).
- [ ] Setup Laravel Reverb untuk real-time WebSocket communication.
- [ ] Event `OrderCreatedEvent` dipancarkan ke channel privat cabang: `private-branch.{branch_id}`.
- [ ] Layar Kitchen Display System (KDS): tampilan pesanan baru, bunyi notifikasi, update status (`Pending` → `Confirmed` → `Preparing` → `Ready` → `Completed`).
- [ ] Layar POS/Kasir: transaksi manual meja, input pembayaran kasir, pencetakan struk.

### Phase 7: PWA, Web Push & Analytics Dashboard
- [ ] Konfigurasi Web App Manifest & Service Worker untuk dashboard operasional.
- [ ] Web Push Notification saat pesanan baru masuk ke dapur & kasir.
- [ ] Dashboard Super Admin: metrik SaaS, total restoran, MRR, kontrol subscription.
- [ ] Dashboard Restaurant Owner: grafik penjualan cabang, produk terlaris, filter tanggal (Recharts).

### Phase 8: Testing, Security Hardening & VPS Deployment
- [ ] Automated Pest API Tests & Tenant Leakage Verification.
- [ ] Playwright E2E: simulasi pelanggan scan QR → pesan → webhook simulasi → pesanan muncul di KDS.
- [ ] Rate limiting pada endpoint publik & webhook.
- [ ] Konfigurasi Docker Compose production, Nginx reverse proxy, SSL Let's Encrypt.
- [ ] Script backup database harian terenkripsi ke Cloudflare R2.

---

## 9. Standar Kode & Konvensi

### Backend (Laravel 13)
- **Formatting**: Gunakan `laravel/pint` (PSR-12).
- **Controller**: Controller harus setipis mungkin (*skinny controller*). Pindahkan business logic ke `Services/` atau `Actions/`.
- **Validation**: Gunakan dedicated `FormRequest` class untuk semua input payload.
- **DTO**: Gunakan DTO atau typed classes untuk mentransfer data kompleks antara controller dan service.
- **Database Transaction**: Semua operasi multi-tabel (seperti checkout pesanan & potongan inventaris) wajib dibungkus dalam `DB::transaction()`.

### Frontend (Next.js 16)
- **Component Pattern**: Gunakan Server Components secara default; gunakan `'use client'` hanya saat membutuhkan hooks, state, atau event listeners.
- **Naming Convention**: PascalCase untuk komponen (`OrderCard.tsx`), camelCase untuk utilities dan hooks (`useCart.ts`).
- **Data Fetching**: Gunakan TanStack Query untuk client-side fetching dengan stale-time dan cache invalidation yang terukur.
- **UI & Accessibility**: Gunakan token warna Tailwind semantic dan komponen primitif Radix UI / shadcn/ui.

---

## 10. Definition of Done (DoD)

Sebuah fitur atau modul baru dianggap **SELESAI** jika dan hanya jika:
1. Memenuhi seluruh Acceptance Criteria yang ditentukan di [PRD.md §15](file:///home/adly/Projects/Ordexa/PRD.md#L630-L648).
2. Memiliki unit/feature test otomatis (Pest / Vitest) yang lolos tanpa error.
3. Menjamin isolasi data tenant (`tenant_id` tidak bocor).
4. Tidak menyertakan hardcoded secrets atau endpoint URLs.
5. Memiliki error handling yang jelas dalam Bahasa Indonesia untuk user-facing alert.
6. Kode telah diformat bersih dengan linter (`pint` untuk PHP, `eslint` untuk TypeScript).

---

## 11. Navigasi Knowledge Graph

Repository ini telah diindeks ke dalam persistent knowledge graph (`graphify-out/`). Untuk menavigasi relasi arsitektural antarkomponen:
- **Lihat Visualisasi**: Buka [graph.html](file:///home/adly/Projects/Ordexa/graphify-out/graph.html) di browser.
- **Laporan Audit & Hubs**: Baca [GRAPH_REPORT.md](file:///home/adly/Projects/Ordexa/graphify-out/GRAPH_REPORT.md).
- **Query Graph**: Jalankan perintah `graphify query "<pertanyaan>"` di terminal untuk melacak alur dependensi modul secara instan.
