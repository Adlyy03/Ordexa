PRODUCT REQUIREMENTS DOCUMENT (PRD)
Restaurant SaaS Platform
National Restaurant Ordering & Management Ecosystem
Product Specification
MVP Foundation
Multi-Tenant SaaS


Informasi	Detail
Product Type	SaaS Platform
Target Market	UMKM Restoran Indonesia
Business Model	Subscription
Platform	Web + PWA
Architecture	Multi-Tenant
Branch System	Unlimited Branches
Market	Indonesia
Document	PRD v1.0


1. Executive Summary
Restaurant SaaS Platform merupakan platform digital berbasis Software as a Service (SaaS) yang dirancang untuk membantu pelaku usaha kuliner dan restoran di Indonesia mengelola operasional bisnis secara digital dalam satu ekosistem terintegrasi.

Platform ini memungkinkan restoran untuk mendaftarkan bisnis mereka secara mandiri, memilih paket berlangganan, mendapatkan dashboard pengelolaan restoran, mengatur banyak cabang, mengelola menu, menerima pesanan pelanggan melalui QR Code, memproses pembayaran digital, serta memantau seluruh aktivitas bisnis secara terpusat.

Platform tidak dibangun untuk satu restoran tertentu, melainkan sebagai layanan terbuka yang dapat digunakan oleh berbagai restoran, mulai dari usaha kuliner kecil, kedai makanan, warung modern, coffee shop, hingga jaringan restoran dengan banyak cabang di seluruh Indonesia.

Setiap restoran yang terdaftar memiliki ruang pengelolaan tersendiri dengan data, pengguna, cabang, transaksi, dan pengaturan yang terisolasi dari restoran lainnya.

Dengan demikian, pemilik restoran tidak perlu membangun sistem pemesanan dan manajemen bisnis sendiri karena seluruh kebutuhan operasional sudah disediakan melalui satu platform.
2. Latar Belakang dan Permasalahan
Banyak pelaku UMKM kuliner di Indonesia masih mengandalkan proses operasional manual atau menggunakan beberapa aplikasi berbeda yang tidak saling terintegrasi.

Beberapa permasalahan yang ingin diselesaikan:
1. Pemesanan masih dilakukan secara manual melalui pelayan atau kasir.
2. Pengelolaan menu dan harga belum terpusat.
3. Pemilik kesulitan memantau aktivitas setiap cabang.
4. Pencatatan transaksi dan laporan penjualan masih dilakukan secara manual.
5. Informasi pesanan dari kasir ke dapur berpotensi mengalami keterlambatan atau kesalahan.
6. Pengelolaan stok dan persediaan belum terdokumentasi dengan baik.
7. Pemilik bisnis kesulitan mengetahui performa penjualan secara keseluruhan.
8. Pembuatan sistem digital sendiri membutuhkan biaya dan sumber daya teknis yang tidak sedikit.
Platform ini hadir untuk menyediakan solusi terintegrasi yang dapat digunakan tanpa mengharuskan restoran memiliki tim developer atau infrastruktur teknologi sendiri.
3. Visi dan Misi Produk
Visi

Menjadi platform SaaS manajemen dan pemesanan restoran yang dapat digunakan oleh pelaku bisnis kuliner di seluruh Indonesia, dari UMKM hingga jaringan restoran berskala besar.

Misi
- Mendigitalisasi proses pemesanan makanan dan minuman.
- Menyediakan sistem pengelolaan restoran yang mudah digunakan.
- Membantu UMKM mengelola bisnis secara lebih efisien.
- Menyediakan manajemen multi-cabang dalam satu dashboard.
- Mengintegrasikan pemesanan, pembayaran, kasir, dan dapur.
- Menyediakan data analitik untuk membantu pengambilan keputusan bisnis.
- Menghadirkan layanan berlangganan yang fleksibel dan terjangkau.
4. Target Pengguna dan Pasar









UMKM Kuliner

Warung makan, kedai nasi, usaha makanan rumahan, dan bisnis kuliner kecil yang ingin mulai menggunakan sistem digital.











Cafe dan Coffee Shop

Usaha yang membutuhkan QR ordering, pengelolaan meja, kasir, dan monitoring pesanan.











Restoran dan Rumah Makan

Bisnis yang membutuhkan sistem pemesanan, pengelolaan dapur, stok, dan laporan.











Jaringan Restoran Multi-Cabang

Pemilik bisnis yang ingin mengelola banyak lokasi dari satu akun terpusat.



Target geografis adalah seluruh wilayah Indonesia, dengan pendekatan layanan berbasis internet yang dapat diakses melalui browser.
5. Konsep dan Model Bisnis
Platform menggunakan model bisnis SaaS (Software as a Service).

Artinya, restoran tidak membeli atau memiliki source code aplikasi, tetapi mendapatkan hak penggunaan platform berdasarkan paket berlangganan.

Alur bisnis:
1. Restoran mengunjungi website platform.
2. Restoran melakukan registrasi akun.
3. Restoran membuat profil bisnis.
4. Restoran memilih paket berlangganan.
5. Restoran menyelesaikan pembayaran.
6. Sistem mengaktifkan subscription.
7. Dashboard restoran dapat digunakan sesuai hak akses paket.
8. Restoran dapat menambahkan cabang sesuai kebutuhan.
9. Restoran mengelola operasional melalui dashboard.
10. Ketika masa langganan habis, sistem menangani status subscription sesuai kebijakan platform.
Prinsip utama: satu restoran memiliki satu akun bisnis utama yang dapat menaungi banyak cabang tanpa batas jumlah cabang berdasarkan paket berlangganan.
6. Struktur Organisasi dan Hak Akses
Platform memiliki beberapa jenis pengguna dengan tanggung jawab berbeda.
Role	Tanggung Jawab
Super Admin	Pengelolaan seluruh platform
Restaurant Owner	Pemilik dan pengelola bisnis restoran
Restaurant Admin	Administrasi restoran
Branch Manager	Pengelolaan cabang
Cashier	Pengelolaan transaksi kasir
Kitchen Staff	Pengelolaan pesanan dapur
Customer	Pemesanan makanan

Setiap role mempunyai izin akses yang berbeda berdasarkan tanggung jawabnya.

Restaurant Owner dapat mengakses data keseluruhan restoran, sedangkan Branch Manager, Cashier, dan Kitchen Staff dibatasi sesuai cabang dan kewenangannya.

Super Admin mempunyai kewenangan platform-level, termasuk pengelolaan seluruh tenant, subscription, dan konfigurasi sistem.
7. Modul Utama Platform
7.1 Public Website
Website publik menjadi pintu masuk utama platform.

Fitur:
- Landing page.
- Informasi layanan.
- Penjelasan fitur platform.
- Perbandingan paket langganan.
- FAQ.
- Registrasi restoran.
- Login pengguna.
- Informasi kontak dan bantuan.
7.2 Restaurant Registration
Sistem registrasi memungkinkan restoran bergabung secara mandiri.

Fitur:
- Registrasi pemilik restoran.
- Verifikasi email.
- Login dan autentikasi.
- Pembuatan profil restoran.
- Informasi nama bisnis dan kategori.
- Alamat restoran.
- Pemilihan paket.
- Aktivasi subscription setelah pembayaran terkonfirmasi.
Setiap registrasi akan menghasilkan identitas tenant yang unik.
7.3 Super Admin Dashboard
Dashboard ini digunakan oleh pemilik dan pengelola platform.

A. Overview & Analytics
- Total restoran terdaftar.
- Total restoran aktif.
- Restoran suspended.
- Restoran expired.
- Total cabang.
- Total subscription aktif.
- Total pendapatan langganan.
- Statistik pertumbuhan restoran.
B. Restaurant Management

Fitur CRUD restoran secara lengkap:
- Create restoran.
- Read seluruh restoran.
- Update informasi restoran.
- Delete atau arsipkan restoran.
- Suspend dan reactivate restoran.
- Melihat detail restoran.
- Melihat daftar cabang.
- Melihat aktivitas restoran.
- Melihat paket yang digunakan.
C. Subscription Management
- Upgrade paket.
- Downgrade paket.
- Aktivasi subscription.
- Perpanjangan langganan.
- Pembatalan subscription.
- Pengaturan tanggal mulai dan berakhir.
- Pengaturan masa tenggang.
- Riwayat perubahan paket.
- Status pembayaran.
D. Package Management

Super Admin dapat mengelola paket:
- Membuat paket baru.
- Mengubah harga paket.
- Mengatur periode langganan.
- Menambah atau menghapus fitur paket.
- Mengaktifkan atau menonaktifkan paket.
E. Transaction Monitoring
- Melihat seluruh transaksi.
- Status pembayaran.
- Riwayat pembayaran.
- Detail invoice.
- Monitoring transaksi payment gateway.
F. Support Ticket
- Melihat laporan kendala restoran.
- Membalas tiket.
- Mengubah status tiket.
- Menyimpan riwayat komunikasi.
G. Notification Center
- Pengumuman platform.
- Informasi pemeliharaan sistem.
- Pemberitahuan subscription.
- Informasi fitur terbaru.
H. Audit Logs
- Aktivitas Super Admin.
- Perubahan paket.
- Perubahan status restoran.
- Perubahan konfigurasi.
- Riwayat aktivitas penting pengguna.
7.4 Restaurant Dashboard
Setiap restoran mendapatkan dashboard tersendiri setelah subscription aktif.

Fitur utama:

A. Business Overview
- Total pesanan.
- Total penjualan.
- Pesanan berjalan.
- Pesanan selesai.
- Statistik penjualan.
- Performa cabang.
- Ringkasan transaksi.
B. Restaurant Profile
- Informasi restoran.
- Logo dan gambar bisnis.
- Deskripsi.
- Alamat.
- Kontak.
- Jam operasional.
- Pengaturan tampilan pemesanan.
C. Branch Management

Restoran dapat menambahkan cabang sebanyak yang dibutuhkan.

Contoh struktur:
Restaurant: Adly Food Group
│
├── Branch 01 - Bogor
├── Branch 02 - Jakarta
├── Branch 03 - Depok
├── Branch 04 - Bandung
└── Branch 05 - Tangerang


Setiap cabang memiliki:
- Identitas cabang.
- Alamat dan lokasi.
- Jam operasional.
- Daftar meja.
- QR Code.
- Pengaturan menu.
- Karyawan.
- Pesanan.
- Transaksi.
- Laporan penjualan.
D. Menu Management
- CRUD kategori menu.
- CRUD produk makanan dan minuman.
- Harga produk.
- Foto produk.
- Deskripsi.
- Varian dan topping.
- Status ketersediaan.
- Pengaturan menu per cabang.
E. Order Management
- Melihat pesanan masuk.
- Detail pesanan.
- Status pesanan.
- Riwayat pesanan.
- Filter berdasarkan cabang.
- Monitoring pesanan realtime.
F. QR Table Management
- Membuat meja.
- Mengubah identitas meja.
- Menghapus meja.
- Generate QR Code.
- Download QR Code.
- Cetak QR Code.
- Menghubungkan QR dengan cabang dan meja.
G. Employee Management
- Menambahkan karyawan.
- Mengatur role.
- Mengatur hak akses.
- Menentukan cabang.
- Mengaktifkan dan menonaktifkan akun.
H. Reports & Analytics
- Laporan penjualan.
- Laporan transaksi.
- Laporan produk terlaris.
- Performa cabang.
- Laporan berdasarkan periode.
- Export laporan.
7.5 Customer QR Ordering
Pelanggan tidak perlu membuat akun atau mengunduh aplikasi.

Alur pemesanan:
1. Pelanggan datang ke restoran.
2. Memindai QR Code pada meja.
3. Website menampilkan identitas restoran dan cabang.
4. Pelanggan melihat daftar menu.
5. Pelanggan memilih makanan dan minuman.
6. Produk masuk ke keranjang.
7. Pelanggan mengonfirmasi pesanan.
8. Pelanggan memilih metode pembayaran.
9. Sistem memproses pembayaran.
10. Pesanan diteruskan ke sistem restoran.
11. Pelanggan dapat melihat status pesanan.
Fitur:
- Tampilan menu responsif.
- Kategori makanan.
- Detail produk.
- Varian dan topping.
- Shopping cart.
- Catatan pesanan.
- QRIS payment.
- Riwayat/status pesanan melalui sesi pemesanan.
7.6 Kitchen Display System (KDS)
KDS digunakan oleh staf dapur untuk menerima dan mengelola pesanan.

Fitur:
- Pesanan masuk realtime.
- Informasi nomor meja.
- Detail produk.
- Jumlah pesanan.
- Catatan pelanggan.
- Waktu pemesanan.
- Update status pesanan.
Status pesanan:

Pending → Confirmed → Preparing → Ready → Completed
7.7 POS / Cashier
Sistem kasir digunakan untuk transaksi yang dilakukan melalui staf restoran.

Fitur:
- Membuat pesanan.
- Memilih meja.
- Menambahkan produk.
- Menghitung total pembayaran.
- Memproses pembayaran.
- Mencetak atau menampilkan struk.
- Melihat riwayat transaksi.
7.8 Inventory Management
Fitur pengelolaan stok:
- Daftar bahan baku.
- Jumlah persediaan.
- Penambahan stok.
- Pengurangan stok.
- Monitoring stok menipis.
- Riwayat perubahan stok.
Untuk MVP, pencatatan stok dapat dimulai secara manual. Pengurangan stok otomatis berdasarkan resep dan bahan baku dapat menjadi pengembangan berikutnya.
7.9 Subscription & Billing
Setiap restoran mempunyai halaman khusus untuk mengelola langganannya.

Fitur:
- Informasi paket aktif.
- Harga paket.
- Masa berlaku.
- Upgrade dan downgrade.
- Riwayat pembayaran.
- Invoice.
- Status pembayaran.
- Perpanjangan subscription.

8. Paket Berlangganan
Platform menyediakan tiga paket utama.
STARTER
Basic Operations
Cocok untuk UMKM yang mulai melakukan digitalisasi.
- QR Ordering
- Menu Management
- QR Table Management
- Order Management
- Kitchen Display
- Basic Sales Reports
- Multi-Branch


PROFESSIONAL
Business Growth
Cocok untuk bisnis yang membutuhkan pengelolaan lebih lengkap.
- Semua fitur Starter
- POS / Cashier
- Employee Management
- Inventory Management
- Promotions & Discounts
- Advanced Analytics
- Branch Performance
- Export Reports


ENTERPRISE
Advanced Operations
Cocok untuk bisnis dengan kebutuhan operasional kompleks.
- Semua fitur Professional
- Custom Branding
- Supplier Management
- Centralized Menu Management
- Advanced Inventory
- Cross-Branch Stock Management
- API Integration
- Audit Logs
- Priority Support


Aturan paket:
- Semua paket mendukung banyak cabang tanpa batas berdasarkan jumlah cabang.
- Tidak ada batasan jumlah cabang yang dipaksakan oleh subscription.
- Perbedaan paket ditentukan oleh fitur yang tersedia.
- Hak akses fitur harus diperiksa melalui subscription dan feature entitlement.
- Harga dan periode berlangganan ditentukan melalui konfigurasi Super Admin.
9. Multi-Tenant Architecture
Sistem menggunakan arsitektur multi-tenant.

Setiap restoran merupakan satu tenant yang mempunyai data sendiri.

Contoh:
PLATFORM
│
├── TENANT A
│   ├── Restaurant Profile
│   ├── Subscription
│   ├── Users
│   ├── Branches
│   ├── Menus
│   ├── Orders
│   └── Transactions
│
├── TENANT B
│   ├── Restaurant Profile
│   ├── Subscription
│   ├── Users
│   ├── Branches
│   ├── Menus
│   ├── Orders
│   └── Transactions
│
└── TENANT C
    ├── Restaurant Profile
    ├── Subscription
    ├── Users
    ├── Branches
    ├── Menus
    ├── Orders
    └── Transactions


Ketentuan teknis:
1. Setiap restoran memiliki tenant_id unik.
2. Setiap cabang memiliki branch_id unik.
3. Setiap data operasional terkait dengan tenant yang sesuai.
4. Data antar-tenant tidak boleh dapat diakses secara silang.
5. Hak akses ditentukan berdasarkan role dan tenant.
6. Akses operasional dapat dibatasi berdasarkan cabang.
7. Subscription berlaku pada tingkat restoran, bukan per cabang.
Model database MVP dapat menggunakan shared database dengan shared schema dan pemisahan data berdasarkan tenant.

Pengamanan isolasi data harus diterapkan pada backend, bukan hanya menyembunyikan menu atau halaman di frontend.
10. Progressive Web App (PWA)
Platform menggunakan pendekatan hybrid web dan PWA.

Tidak semua bagian platform harus menjadi aplikasi yang dapat di-install.
Modul	Bentuk
Landing Page	Website
Restaurant Registration	Website
Customer QR Ordering	Website
Super Admin	PWA
Restaurant Dashboard	PWA
Branch Dashboard	PWA
Cashier / POS	PWA
Kitchen Display	PWA

Dashboard operasional dapat dipasang sebagai aplikasi melalui browser pada perangkat yang mendukung instalasi PWA.

Fitur PWA:
- Installable application.
- Responsive layout.
- App icon dan splash screen.
- Standalone display.
- Web push notifications.
- Service worker.
- Cache untuk aset aplikasi.
Catatan: transaksi, pembayaran, dan perubahan data penting tetap memerlukan koneksi internet. PWA tidak boleh menganggap transaksi offline sebagai pembayaran yang berhasil.
11. Payment System
Platform mempunyai dua jenis pembayaran yang berbeda.

A. Subscription Payment

Pembayaran restoran kepada pemilik platform untuk berlangganan layanan.

B. Customer Restaurant Payment

Pembayaran pelanggan kepada restoran untuk pesanan makanan.

Sistem harus membedakan kedua transaksi tersebut agar pembukuan dan status pembayaran tidak tercampur.

Integrasi QRIS dapat menggunakan payment gateway yang mendukung kebutuhan merchant dan skema pembayaran platform.

Ketentuan:
- Verifikasi pembayaran melalui webhook.
- Validasi signature webhook.
- Idempotency untuk mencegah pembayaran diproses dua kali.
- Status transaksi yang jelas.
- Riwayat pembayaran.
- Penanganan pembayaran pending, berhasil, gagal, dan kedaluwarsa.
Detail skema pencairan dana dan pembagian settlement mengikuti kemampuan serta ketentuan penyedia payment gateway.
12. Subscription Lifecycle
Setiap restoran memiliki siklus subscription.
Registered

Restoran berhasil mendaftar


Pending Payment

Menunggu pembayaran paket


Active
Subscription aktif


Grace Period

Masa tenggang pembayaran


Expired / Suspended

Akses operasional dibatasi sesuai kebijakan


Sistem harus mendukung:
- Upgrade paket.
- Downgrade paket.
- Perpanjangan otomatis jika didukung skema pembayaran.
- Perpanjangan manual.
- Pembatalan langganan.
- Perubahan paket oleh Super Admin.
- Riwayat seluruh perubahan.
Perubahan paket harus mempunyai aturan efektif yang jelas, termasuk penanganan fitur yang tidak lagi tersedia setelah downgrade.

Data historis transaksi tidak boleh dihapus hanya karena subscription berakhir.
13. Non-Functional Requirements
Kebutuhan kualitas sistem:

Security
- Password hashing.
- Authentication dan authorization.
- Tenant isolation.
- Validasi input.
- Proteksi API.
- Rate limiting.
- Audit logging.
- Webhook verification.
Performance
- Halaman responsif.
- Query database efisien.
- Pagination.
- Cache untuk data yang sesuai.
- Realtime update tanpa refresh manual.
Reliability
- Backup database terjadwal.
- Logging error.
- Monitoring server.
- Penanganan kegagalan pembayaran.
- Recovery dan restore data.
Scalability
- Mendukung penambahan tenant.
- Mendukung banyak cabang.
- Pemisahan service saat diperlukan.
- Struktur database yang siap berkembang.
Usability
- Mobile-first.
- Navigasi sederhana.
- Dashboard sesuai role.
- UI konsisten.
- Bahasa Indonesia sebagai bahasa utama.
14. MVP Scope dan Prioritas Pengembangan
MVP harus fokus pada alur bisnis utama yang benar-benar bisa digunakan restoran.
Prioritas	Modul	Status
P0	Authentication & Registration	Wajib
P0	Multi-Tenant Architecture	Wajib
P0	Super Admin Dashboard	Wajib
P0	Restaurant Management	Wajib
P0	Subscription Management	Wajib
P0	Package & Feature Management	Wajib
P0	Branch Management	Wajib
P0	Menu Management	Wajib
P0	QR Table Ordering	Wajib
P0	Payment Integration	Wajib
P0	Order Management	Wajib
P0	Kitchen Display	Wajib
P1	POS / Cashier	Berikutnya
P1	Employee Management	Berikutnya
P1	Inventory	Berikutnya
P1	Analytics Lanjutan	Berikutnya
P2	Supplier Management	Pengembangan lanjut
P2	Cross-Branch Inventory	Pengembangan lanjut
P2	Custom Branding	Pengembangan lanjut
P2	Advanced API Integration	Pengembangan lanjut

15. Acceptance Criteria MVP
MVP dianggap memenuhi tujuan awal apabila:
1. Restoran dapat mendaftar melalui website.
2. Restoran dapat memilih dan membayar paket.
3. Sistem dapat mengaktifkan subscription berdasarkan pembayaran terverifikasi.
4. Super Admin dapat mengelola seluruh restoran.
5. Super Admin dapat upgrade dan downgrade paket restoran.
6. Restoran dapat membuat banyak cabang.
7. Restoran dapat mengelola menu dan meja.
8. Setiap meja dapat mempunyai QR Code unik.
9. Pelanggan dapat memesan melalui QR.
10. Pembayaran pelanggan dapat diverifikasi.
11. Pesanan masuk ke dashboard dapur secara realtime.
12. Staf dapat mengubah status pesanan.
13. Pemilik restoran dapat melihat laporan transaksi.
14. Restoran tidak dapat mengakses data tenant lain.
15. Dashboard operasional dapat di-install sebagai PWA.
16. Sistem memiliki mekanisme backup dan monitoring.
16. Prinsip Pengembangan Produk
Pengembangan platform harus mengikuti prinsip berikut:
- Build scalable, not overengineered.
- Prioritaskan fitur yang menyelesaikan masalah nyata UMKM.
- Semua modul harus terintegrasi.
- Hindari fitur dummy atau halaman Coming Soon pada fitur yang dinyatakan sudah tersedia.
- Setiap tombol dan navigasi harus memiliki fungsi nyata.
- Setiap fitur memiliki validasi dan penanganan error.
- Setiap role memiliki batasan akses yang jelas.
- Semua perubahan data penting harus tercatat.
- Tampilan harus profesional, modern, responsif, dan konsisten.
- Sistem harus dapat digunakan melalui HP maupun desktop.
17. Indikator Keberhasilan Produk
Keberhasilan MVP akan diukur melalui:
- Jumlah restoran yang berhasil mendaftar.
- Jumlah restoran yang mengaktifkan subscription.
- Jumlah cabang yang dikelola.
- Jumlah pesanan yang berhasil diproses.
- Tingkat keberhasilan pembayaran.
- Aktivitas penggunaan dashboard.
- Tingkat penggunaan QR Ordering.
- Tingkat perpanjangan subscription.
- Jumlah kendala operasional yang dilaporkan.
