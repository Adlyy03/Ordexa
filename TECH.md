TECHNICAL STACK & TECHNOLOGY REQUIREMENTS
Restaurant SaaS Platform
MVP Technical Architecture & Implementation Specification
MVP Ready
Multi-Tenant SaaS
PWA Architecture

Informasi	Detail
Architecture	Monorepo
Frontend	Next.js
Backend	Laravel
Database	PostgreSQL
Application	Web + PWA
Payment	Multi-Gateway
Deployment	Docker + VPS
Market	Indonesia


1. Tujuan Arsitektur Teknologi
Arsitektur teknologi dirancang untuk membangun platform SaaS restoran yang mampu melayani banyak bisnis kuliner dari satu sistem terpusat.

Setiap restoran memiliki tenant, akun, subscription, cabang, pengguna, dan data operasional masing-masing.

Sistem harus mendukung:
- Banyak restoran dalam satu platform.
- Cabang restoran tanpa batasan paket.
- Pemisahan data antar-tenant.
- Dashboard operasional berbasis PWA.
- Customer ordering berbasis website.
- Integrasi pembayaran QRIS.
- Realtime order management.
- Subscription billing.
- Pengembangan dan deployment yang efisien.
Prinsip utama: gunakan arsitektur modular monolith untuk MVP, bukan microservices. Dengan demikian, pengembangan lebih sederhana, biaya infrastruktur lebih terkendali, tetapi modul tetap dapat dipisahkan ketika platform berkembang.
2. Technology Stack
2.1 Frontend
Teknologi	Fungsi
Next.js	Framework frontend
TypeScript	Type safety
Tailwind CSS	Styling
shadcn/ui	Komponen UI
TanStack Query	API state dan caching
Zustand	Client-side state
React Hook Form	Form management
Zod	Validasi data
Recharts	Analytics dan grafik
PWA	Installable dashboard

Next.js digunakan untuk seluruh antarmuka platform, termasuk landing page, registrasi, dashboard, dan customer ordering.

PWA difokuskan pada dashboard operasional restoran, kasir, dapur, serta dashboard Super Admin.
2.2 Backend
Teknologi	Fungsi
Laravel 12	Backend framework
PHP 8.4	Backend runtime
Laravel Sanctum	API authentication
Laravel Reverb	Realtime communication
Laravel Queue	Background jobs
Laravel Scheduler	Scheduled tasks
Laravel Policies	Authorization
Laravel Notifications	Notifikasi

Backend menggunakan pendekatan modular berdasarkan domain bisnis.

Modul backend meliputi:
- Authentication
- Tenant Management
- Restaurant Management
- Branch Management
- User & Role Management
- Subscription Management
- Package & Feature Management
- Menu Management
- Table & QR Management
- Order Management
- Payment Management
- POS Management
- Kitchen Management
- Inventory Management
- Reporting & Analytics
- Notification Management
- Audit Logs
2.3 Database









PostgreSQL

Database utama untuk seluruh data platform, tenant, cabang, transaksi, pesanan, dan subscription.


Teknologi tambahan:
- Eloquent ORM untuk interaksi database.
- Redis untuk cache, queue, dan kebutuhan realtime.
- Database migrations untuk pengelolaan struktur.
- Indexing untuk optimasi query.
- PostgreSQL Row Level Security sebagai lapisan perlindungan tambahan jika diperlukan.
Model database MVP menggunakan satu database dan shared schema dengan pemisahan data berdasarkan tenant_id.

Struktur relasi utama:
users
  └── restaurant_memberships
          └── restaurants
                 ├── subscriptions
                 ├── branches
                 │    ├── tables
                 │    ├── orders
                 │    ├── transactions
                 │    └── employees
                 ├── menus
                 └── payments


Semua akses data tenant wajib divalidasi pada backend. Jangan mengandalkan tenant ID yang dikirim frontend sebagai bukti otorisasi.
2.4 Payment Gateway Architecture
Penting untuk model bisnis SaaS
Platform menggunakan sistem Multi-Payment Gateway Integration.

Artinya, platform tidak hanya mempunyai satu integrasi pembayaran untuk semua transaksi. Terdapat dua kategori pembayaran dengan pemisahan merchant yang jelas.

A. Platform Subscription Payment

Digunakan untuk pembayaran langganan restoran kepada pemilik platform.

Rekomendasi:
- Midtrans sebagai payment gateway utama.
- Xendit sebagai alternatif atau gateway tambahan.
Fungsi:
- Pembayaran paket Starter.
- Pembayaran paket Professional.
- Pembayaran paket Enterprise.
- Upgrade subscription.
- Renewal subscription.
- Invoice dan payment history.
- Webhook pembayaran.
- Verifikasi transaksi.
Merchant untuk pembayaran ini merupakan merchant milik perusahaan/platform lu.

B. Restaurant Customer Payment

Digunakan ketika pelanggan membeli makanan dari restoran melalui QR Ordering atau POS.

Rekomendasi:
- Midtrans.
- Xendit.
- Dapat dikembangkan dengan gateway lain.
Setiap restoran harus dapat menggunakan konfigurasi pembayaran yang sesuai dengan kepemilikan merchant dan proses onboarding penyedia gateway.

Alur yang diinginkan:
CUSTOMER
   |
   v
QR ORDERING
   |
   v
RESTAURANT PAYMENT SERVICE
   |
   v
PAYMENT GATEWAY
   |
   v
RESTAURANT MERCHANT ACCOUNT
   |
   v
WEBHOOK VERIFICATION
   |
   v
ORDER PAYMENT CONFIRMED


Ketentuan penting:
- Pembayaran subscription dan pembayaran makanan tidak boleh dicampur.
- Setiap transaksi harus mempunyai identitas tenant dan referensi transaksi.
- Pembayaran makanan harus terhubung ke merchant restoran yang benar.
- Jangan menggunakan satu QRIS milik platform untuk menampung pembayaran seluruh restoran tanpa skema resmi yang disetujui penyedia gateway.
- Jangan menyimpan secret key gateway restoran dalam bentuk plaintext.
- Gunakan webhook signature verification.
- Sediakan idempotency dan rekonsiliasi pembayaran.
Catatan bisnis: satu integrasi API gateway tidak otomatis berarti setiap restoran memiliki merchant account sendiri. Untuk mendukung pembayaran langsung ke masing-masing restoran, prioritaskan skema resmi seperti sub-merchant atau partner/platform onboarding dari provider. Ketersediaan fitur, persetujuan merchant, biaya, dan settlement harus dikonfirmasi langsung ke Midtrans atau Xendit sebelum implementasi.

Rekomendasi utama untuk pembayaran: untuk kebutuhan banyak restoran dengan merchant berbeda, gua lebih menyarankan Xendit xenPlatform sebagai jalur utama pembayaran pelanggan. Xendit menyediakan master account, sub-account merchant, routing, split payment, dan monitoring transaksi. 
Xendit Docs+2


Midtrans tetap bisa disiapkan sebagai alternatif integrasi, tetapi jangan mengasumsikan satu akun Midtrans platform otomatis bisa menerima dan meneruskan pembayaran untuk semua restoran. Skema merchant dan settlement harus dikonfirmasi terlebih dahulu. 
Midtrans Documentation+1

2.5 PWA Technology
PWA digunakan untuk mengubah dashboard operasional menjadi aplikasi yang dapat di-install.

Teknologi:
- Web App Manifest.
- Service Worker.
- Workbox atau integrasi PWA Next.js yang terpelihara.
- Web Push API.
- Responsive UI.
- Cache Storage.
Pembagian:
Aplikasi	PWA
Landing Page	Tidak wajib
Registrasi	Tidak wajib
Customer Ordering	Tidak wajib
Super Admin	Ya
Restaurant Dashboard	Ya
Branch Dashboard	Ya
Cashier	Ya
Kitchen Display	Ya

PWA harus mendukung:
- Install melalui browser.
- Ikon aplikasi.
- Standalone display.
- Push notification.
- Update aplikasi.
- Offline caching untuk aset statis.
Jangan menyimpan transaksi atau status pembayaran sebagai data offline yang dianggap sudah berhasil. Semua transaksi keuangan wajib divalidasi server.
2.6 Storage & Media
Teknologi	Fungsi
Cloudflare R2	Penyimpanan gambar menu
Cloudflare CDN	Distribusi aset
Signed URL	Akses file privat
Image optimization	Optimasi gambar

Gambar menu, logo restoran, banner, dan foto produk disimpan di object storage, bukan sebagai file permanen di VPS.
2.7 Infrastructure & Deployment
Teknologi	Fungsi
Linux VPS	Server utama
Docker	Containerization
Docker Compose	Orkestrasi MVP
Nginx	Reverse proxy
Cloudflare	DNS, CDN, proteksi
Let's Encrypt	SSL
GitHub	Source code
GitHub Actions	CI/CD
Sentry	Error monitoring
Uptime Kuma	Uptime monitoring

Untuk MVP, gunakan satu VPS yang menjalankan:
- Next.js.
- Laravel API.
- PostgreSQL.
- Redis.
- Laravel Queue Worker.
- Laravel Reverb.
- Nginx.
Database harus memiliki backup terjadwal ke lokasi terpisah dari VPS utama.
3. Software Development Tools
Perangkat pengembangan yang digunakan:
Tool	Fungsi
VS Code / Antigravity	Development IDE
Git	Version control
GitHub	Repository
pnpm	Frontend package manager
Composer	PHP dependencies
Postman / Bruno	API testing
Figma	UI/UX design
Docker	Local development
Playwright	E2E testing
Pest	Backend testing

4. Arsitektur Project
Gunakan Monorepo untuk mengelola frontend dan backend dalam satu repository.
restaurant-platform/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (marketing)/
│   │   │   ├── (auth)/
│   │   │   ├── super-admin/
│   │   │   ├── restaurant/
│   │   │   ├── branch/
│   │   │   ├── cashier/
│   │   │   ├── kitchen/
│   │   │   └── order/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── public/
│   │
│   └── api/
│       ├── app/
│       │   ├── Modules/
│       │   ├── Models/
│       │   ├── Services/
│       │   ├── Jobs/
│       │   └── Policies/
│       ├── database/
│       ├── routes/
│       └── tests/
│
├── packages/
│   ├── ui/
│   ├── types/
│   └── config/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   ├── database/
│   └── monitoring/
│
├── docs/
│   ├── prd/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── deployment/
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json
└── README.md


Catatan:
- apps/web berisi seluruh tampilan.
- apps/api berisi backend Laravel.
- packages berisi komponen dan tipe data yang bisa digunakan bersama.
- infrastructure berisi konfigurasi deployment.
- docs menjadi dokumentasi pengembangan.
Laravel tetap menggunakan Composer secara independen di dalam apps/api.
5. Payment Architecture — Detail Multi-Restaurant
Bagian ini harus menjadi perhatian utama karena platform menangani pembayaran dari banyak bisnis yang berbeda.
5.1 Pemisahan Merchant
PLATFORM PAYMENT ACCOUNT

Merchant milik perusahaan platform
Subscription Payment


Merchant A

Restoran A
Order Payment


Merchant B

Restoran B
Order Payment


Merchant C

Restoran C
Order Payment


Merchant D

Restoran D
Order Payment



Ilustrasi pemisahan merchant. Implementasi aktual mengikuti skema sub-account dan persetujuan provider.
Contoh:
- Restoran A memiliki merchant sendiri.
- Restoran B memiliki merchant sendiri.
- Restoran C memiliki merchant sendiri.
- Semua pembayaran masuk ke akun merchant yang sesuai.
- Platform dapat memantau status transaksi sesuai kewenangan provider.
Setiap restoran memiliki konfigurasi:
restaurant_payment_accounts
├── id
├── tenant_id
├── provider
├── merchant_account_id
├── onboarding_status
├── settlement_status
└── created_at


Jangan menyimpan API secret langsung pada tabel ini. Simpan referensi secret ke secret manager atau penyimpanan terenkripsi.
5.2 Dua Jenis Payment Gateway
Kebutuhan	Akun pembayaran
Subscription restoran	Platform
QRIS pesanan restoran	Merchant restoran
Refund pesanan	Merchant restoran
Rekonsiliasi subscription	Platform
Rekonsiliasi pesanan	Merchant restoran

5.3 Payment Provider Abstraction
Backend wajib memiliki lapisan PaymentService agar integrasi provider tidak tersebar di seluruh aplikasi.

Contoh struktur:
Payment/
├── Contracts/
│   └── PaymentGatewayInterface.php
│
├── Providers/
│   ├── XenditProvider.php
│   └── MidtransProvider.php
│
├── Services/
│   ├── SubscriptionPaymentService.php
│   ├── RestaurantPaymentService.php
│   └── PaymentWebhookService.php
│
└── DTO/


Dengan struktur tersebut, penambahan gateway tidak perlu mengubah keseluruhan business logic.

Prioritas MVP:
1. Integrasi satu provider untuk subscription.
2. Integrasi skema multi-merchant untuk pembayaran restoran.
3. Webhook dan rekonsiliasi.
4. Provider kedua setelah integrasi utama stabil.
Jangan mengaktifkan dua provider sekaligus hanya demi terlihat lengkap. Fokus pada alur pembayaran yang benar-benar berjalan.
6. Authentication & Security Architecture
Teknologi keamanan:
- Laravel Sanctum.
- Role-Based Access Control (RBAC).
- Laravel Policies.
- Tenant Middleware.
- Rate Limiting.
- Password Hashing.
- CSRF Protection.
- HTTPS.
- Encrypted Credentials.
- Audit Logs.
Ketentuan keamanan:
1. Super Admin mempunyai akses platform-level.
2. Restaurant Owner hanya mengakses tenant miliknya.
3. Branch Manager hanya mengakses cabang yang ditugaskan.
4. Cashier hanya mengakses fitur kasir sesuai izin.
5. Kitchen Staff hanya mengakses operasional dapur sesuai izin.
6. Customer tidak mendapatkan akses dashboard internal.
7. Semua endpoint wajib memiliki pemeriksaan otorisasi.
8. Webhook harus diverifikasi sebelum mengubah status pembayaran.
Untuk autentikasi, gunakan cookie/session Sanctum dengan konfigurasi domain dan CSRF yang benar apabila frontend dan API berada pada subdomain satu domain utama.
7. Testing & Quality Assurance
Testing	Teknologi
Backend Unit Test	Pest
API Test	Pest
Frontend Unit Test	Vitest
E2E Test	Playwright
API Manual Test	Bruno
Code Quality	ESLint + PHP Pint
Static Analysis	PHPStan / Larastan

Skenario wajib diuji:
- Tenant A tidak bisa melihat data Tenant B.
- Cabang A tidak bisa mengakses data cabang yang tidak ditugaskan.
- Downgrade paket benar-benar mengubah akses fitur.
- Pembayaran gagal tidak mengaktifkan subscription.
- Webhook ganda tidak menggandakan transaksi.
- Pembayaran restoran A tidak masuk ke merchant restoran B.
- Pesanan masuk ke dapur secara realtime.
- PWA dapat di-install dan menerima notifikasi.
- Database dapat dipulihkan dari backup.
8. Environment dan Domain
Rekomendasi domain:
Domain	Kegunaan
platform.com	Landing page
app.platform.com	Dashboard PWA
api.platform.com	Backend API
order.platform.com	Customer ordering

Contoh URL pemesanan:
order.platform.com/r/restoran-a/bogor/meja-01
order.platform.com/r/restoran-b/jakarta/meja-03


Environment:
- Development.
- Staging.
- Production.
Setiap environment wajib memiliki credential payment gateway dan database yang terpisah.
9. Pembagian Pekerjaan: AI vs Manual
AI dapat menangani sebagian besar pekerjaan coding
Ini bagian penting agar lu tidak salah menganggap AI bisa menyelesaikan semua hal sendirian.
9.1 Pekerjaan yang Bisa Ditangani AI
Pekerjaan	AI
Setup monorepo	Bisa
Setup Next.js	Bisa
Setup Laravel	Bisa
Membuat UI/UX	Bisa
Membuat dashboard	Bisa
CRUD seluruh modul	Bisa
Database migrations	Bisa
Relasi database	Bisa
Tenant isolation implementation	Bisa
RBAC implementation	Bisa
Subscription logic	Bisa
Payment gateway integration code	Bisa
Webhook implementation	Bisa
QR Code generation	Bisa
PWA implementation	Bisa
Realtime implementation	Bisa
Unit testing	Bisa
API testing	Bisa
Docker configuration	Bisa
CI/CD workflow	Bisa
Technical documentation	Bisa
Bug fixing dan refactoring	Bisa

AI dapat membuat implementasi teknisnya, tetapi semua hasil tetap perlu diuji dan direview.
9.2 Pekerjaan yang Harus Lu Handle Manual
Memerlukan tindakan manusia atau akun resmi
Pekerjaan	Kenapa manual
Membeli domain	Memerlukan akun dan pembayaran
Membeli VPS	Memerlukan akun provider
Membuat akun Cloudflare	Verifikasi kepemilikan
Aktivasi payment gateway	KYC dan persetujuan provider
Aktivasi XenPlatform	Persetujuan dan konfigurasi bisnis
Verifikasi merchant restoran	Dokumen dan proses KYC
Mengisi API credentials	Akses akun resmi
Mengatur rekening settlement	Validasi kepemilikan
Mengatur DNS	Kepemilikan domain
Membayar layanan hosting	Transaksi finansial
Menyetujui kebijakan legal	Keputusan pemilik bisnis
UAT restoran	Pengujian kondisi nyata
Monitoring transaksi produksi	Pengawasan bisnis
Persetujuan refund	Kebijakan finansial
Pengelolaan insiden produksi	Keputusan operasional

9.3 Pekerjaan Kolaborasi AI + Manusia
Contohnya:
Pekerjaan	AI	Lu
Payment gateway	Integrasi kode	Aktivasi akun
Deployment	Buat Docker dan konfigurasi	Sediakan VPS dan domain
Database backup	Buat script otomatis	Tentukan lokasi dan kebijakan
Security	Audit kode	Review dan persetujuan
Subscription	Buat sistem billing	Tentukan harga dan aturan
Merchant onboarding	Buat form dan integrasi API	Pastikan dokumen dan KYC
Testing	Buat test cases	Uji alur bisnis nyata

Kesimpulan: AI bertanggung jawab membantu membangun software, sedangkan lu memegang akun, akses, keputusan bisnis, legalitas, dan validasi operasional.
10. Rekomendasi Versi Teknologi
Untuk proyek yang dimulai sekarang, gunakan versi stabil yang masih mendapatkan dukungan.
Teknologi	Rekomendasi
Next.js	16.x
React	19.x
Node.js	22 LTS atau lebih baru yang kompatibel
TypeScript	5.x
Laravel	13.x
PHP	8.3+
PostgreSQL	17 atau versi stabil yang didukung
Redis	8.x
Docker	Stable
pnpm	Latest stable

Laravel 13 dirilis pada Maret 2026 dan membutuhkan PHP minimal 8.3. Next.js 16 memiliki dukungan Node.js minimal 20.9. 
Laravel+2


Versi dependency harus dikunci dan diperbarui secara terkontrol. Jangan asal menggunakan versi terbaru setiap kali melakukan instalasi.
11. Deployment Architecture MVP
USER / CUSTOMER

Browser dan PWA


CLOUDFLARE

DNS • CDN • SSL • Protection


PRODUCTION VPS
Next.js

Frontend


Laravel

API


PostgreSQL

Database


Redis

Cache & Queue


Reverb

Realtime


Queue Worker

Background jobs





EXTERNAL SERVICES

Xendit • Midtrans • Cloudflare R2 • Email Provider


MVP dapat dimulai dari satu VPS dengan Docker Compose. Namun, database, worker, dan service aplikasi harus mempunyai konfigurasi backup, resource limit, health check, dan restart policy yang benar.

Ketika penggunaan meningkat, database dan worker dapat dipindahkan ke server terpisah tanpa mengubah keseluruhan arsitektur.
12. Tahapan Implementasi Teknologi
Tahap	Fokus
Phase 1	Setup monorepo dan development environment
Phase 2	Authentication, tenant, RBAC
Phase 3	Restaurant, branch, subscription
Phase 4	Menu, meja, QR ordering
Phase 5	Payment gateway dan webhook
Phase 6	Order management dan KDS
Phase 7	PWA, notification, realtime
Phase 8	Testing, security, deployment

Urutan tersebut merupakan tahapan implementasi, bukan kewajiban menyelesaikan seluruh modul satu per satu tanpa integrasi. Setiap fase harus memiliki pengujian sebelum dilanjutkan.
13. Keputusan Teknologi Final
Recommended MVP Stack
Kategori	Teknologi final
Frontend	Next.js 16
Language	TypeScript
UI	Tailwind CSS + shadcn/ui
Backend	Laravel 13
Backend Language	PHP 8.3+
Database	PostgreSQL
Cache	Redis
Realtime	Laravel Reverb
Authentication	Laravel Sanctum
State Management	Zustand
API State	TanStack Query
Form Validation	React Hook Form + Zod
PWA	Manifest + Service Worker
Payment Platform	Xendit
Multi-Merchant Payment	Xendit xenPlatform
Alternative Gateway	Midtrans
Storage	Cloudflare R2
Proxy	Nginx
Infrastructure	Docker Compose
Server	Linux VPS
DNS/CDN	Cloudflare
Repository	GitHub
CI/CD	GitHub Actions
Testing	Pest + Vitest + Playwright
Monitoring	Sentry + Uptime Kuma
Architecture	Modular Monolith + Multi-Tenant
Repository Structure	Monorepo

14. Catatan Keputusan Penting
Ada beberapa keputusan yang tidak boleh diubah sembarangan ketika pengembangan sudah dimulai:
1. Gunakan satu backend Laravel untuk seluruh modul MVP.
2. Gunakan satu database PostgreSQL dengan tenant isolation.
3. Semua restoran dapat memiliki banyak cabang tanpa pembatasan paket.
4. Subscription dikelola pada tingkat restoran.
5. Fitur dashboard ditentukan oleh feature entitlement.
6. Pembayaran subscription dan pembayaran pelanggan harus terpisah.
7. Setiap restoran harus mempunyai identitas merchant pembayaran yang sesuai dengan skema provider.
8. Payment gateway menggunakan abstraction layer.
9. Dashboard operasional menjadi PWA.
10. Landing page dan customer QR ordering tetap berupa website.
11. Jangan menggunakan microservices pada tahap MVP.
12. Semua transaksi keuangan harus mempunyai audit trail dan mekanisme rekonsiliasi.
