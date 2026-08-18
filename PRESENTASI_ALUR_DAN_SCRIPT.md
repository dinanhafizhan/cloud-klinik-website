# NASKAH & ALUR PRESENTASI PROYEK CLOUD COMPUTING
## Sistem Informasi Klinik & Reservasi Dokter Modern dengan AI Healthcare Assistant
### Arsitektur: AWS Multi-VPC, CloudFront, EC2, RDS/Aurora, Hybrid GCP Storage, & CI/CD GitHub Actions

---

## 📋 DAFTAR ISI
1. [Struktur & Estimasi Waktu Presentasi](#1-struktur--estimasi-waktu-presentasi)
2. [Ringkasan Arsitektur & Teknologi](#2-ringkasan-arsitektur--teknologi)
3. [Naskah Presentasi Slide-by-Slide (Script Kata-demi-Kata)](#3-naskah-presentasi-slide-by-slide)
   - [Slide 1: Pembukaan & Latar Belakang](#slide-1-pembukaan--latar-belakang-0000---0130)
   - [Slide 2: Arsitektur Jaringan 3-VPC & Isolasi Keamanan](#slide-2-arsitektur-jaringan-3-vpc--isolasi-keamanan-0130---0330)
   - [Slide 3: Amazon CloudFront & Compute Tier (EC2 Docker)](#slide-3-amazon-cloudfront--compute-tier-ec2-docker-0330---0500)
   - [Slide 4: Database Tier (RDS/Aurora) & Hybrid GCP Cloud Storage](#slide-4-database-tier-rdsaurora--hybrid-gcp-cloud-storage-0500---0630)
   - [Slide 5: Integrasi AI Gemini & Otomasi CI/CD GitHub Actions](#slide-5-integrasi-ai-gemini--otomasi-cicd-github-actions-0630---0800)
   - [Slide 6: Skenario Live Demo Aplikasi & Infrastruktur](#slide-6-skenario-live-demo-aplikasi--infrastruktur-0800---1130)
   - [Slide 7: Kesimpulan & Penutup](#slide-7-kesimpulan--penutup-1130---1230)
4. [Panduan Langkah Skenario Live Demo](#4-panduan-langkah-skenario-live-demo)
5. [Bank Tanya Jawab (Q&A Defense Cheat-Sheet)](#5-bank-tanya-jawab-qa-defense-cheat-sheet)

---

## 1. STRUKTUR & ESTIMASI WAKTU PRESENTASI
- **Total Durasi**: 12 – 15 Menit
- **Pembagian Waktu**:
  - **00:00 - 01:30 (1.5 min)**: Pembukaan, Pengenalan Masalah, & Profil Aplikasi.
  - **01:30 - 03:30 (2.0 min)**: Arsitektur Jaringan AWS 3-VPC, Subnet, Route Table, Peering, NACL & SG.
  - **03:30 - 05:00 (1.5 min)**: Distribusi Global CloudFront & Compute EC2 Docker Container.
  - **05:00 - 06:30 (1.5 min)**: Database RDS/Aurora & Hybrid Multi-Cloud GCP Storage Bucket.
  - **06:30 - 08:00 (1.5 min)**: AI Assistant Gemini & Otomasi CI/CD Pipeline GitHub Actions.
  - **08:00 - 11:30 (3.5 min)**: Live Demonstration (End-to-End System, Upload GCS, Chatbot AI, CI/CD).
  - **11:30 - 15:00 (3.5 min)**: Kesimpulan, Penutup, & Sesi Tanya Jawab (Q&A).

---

## 2. RINGKASAN ARSITEKTUR & TEKNOLOGI

```
                                [ Klien / Pengguna Internet ]
                                              │
                                              ▼ HTTPS (SSL/TLS)
                    ┌──────────────────────────────────────────────────┐
                    │          Amazon CloudFront (Edge CDN)            │
                    │  - Default Cache Behavior: /* -> EC2 Frontend    │
                    │  - Custom Cache Behavior: /api/* -> EC2 Backend  │
                    └──────────────────────────────────────────────────┘
                                     │                        │
                                     │ HTTP (Port 80)         │ HTTP (Port 80)
                                     ▼                        ▼
   ┌──────────────────────────────────────────┐    ┌──────────────────────────────────────────┐
   │          VPC FRONTEND                    │    │          VPC BACKEND                     │
   │  CIDR: 10.0.0.0/16                       │    │  CIDR: 10.1.0.0/16                       │
   │  Subnet: subnet-frontend (10.0.1.0/24)   │    │  Subnet: subnet-backend (10.1.1.0/24)    │
   │  Compute: EC2 Frontend (React Nginx)     │    │  Compute: EC2 Backend (Express.js API)   │
   │  SG: sg-frontend (80, 443, 22)           │    │  SG: sg-backend (Inbound from SG-FE)     │
   │  Gateway: igw-frontend                   │    │  Gateway: igw-backend (Outbound Ext API) │
   └──────────────────────────────────────────┘    └──────────────────────────────────────────┘
                        │                                       │               │
                        └──────────── VPC Peering ──────────────┘               │ HTTPS Outbound
                              (pcx-frontend-backend)                            │
                                                                                ▼
                                                     ┌────────────────────────────────────────┐
                                                     │      Google Cloud Platform (GCP)       │
                                                     │  - Cloud Storage:                      │
                                                     │    klinik-storage-bucket-app           │
                                                     │  - Google Gemini AI API                │
                                                     └────────────────────────────────────────┘
                                                                │
                                                   VPC Peering  │ Port 3306 MySQL
                                              (pcx-backend-db)  │
                                                                ▼
                                   ┌──────────────────────────────────────────────────────────┐
                                   │                    VPC DATABASE                          │
                                   │  CIDR: 10.2.0.0/16 (TERISOLASI PENUH - TANPA IGW)        │
                                   │  - Subnet db-priv-1 (10.2.1.0/24 - AZ A)                 │
                                   │  - Subnet db-priv-2 (10.2.2.0/24 - AZ B)                 │
                                   │  - DB Subnet Group: Multi-AZ Subnet                      │
                                   │  - Database: AWS RDS / Aurora MySQL (klinik-db)          │
                                   │  - SG: sg-database (Inbound 3306 HANYA dari VPC Backend) │
                                   └──────────────────────────────────────────────────────────┘
```

---

## 3. NASKAH PRESENTASI SLIDE-BY-SLIDE

### Slide 1: Pembukaan & Latar Belakang (00:00 - 01:30)
> **Visual Slide**: Logo Aplikasi "Klinik Hafizh", Mockup Tampilan Web, Daftar Anggota Tim, & Highlight Teknologi (AWS, GCP, Docker, React, Node.js, Gemini AI).
>
> **Tindakan Presenter**: Berdiri tegak, sapa penguji/audiens dengan suara jelas, percaya diri, dan ramah.

**Script Presenter:**
> *"Selamat pagi/siang kepada Bapak/Ibu dosen penguji dan rekan-rekan sekalian.*
> 
> *Perkenalkan, kami dari tim pengembang aplikasi **Klinik Pemweb (Klinik Hafizh)**. Pada kesempatan hari ini, kami akan mempresentasikan hasil rancang bangun sistem informasi layanan klinik dan reservasi dokter modern yang kami bangun menggunakan arsitektur **Enterprise Multi-Cloud Infrastructure** menggabungkan keunggulan **Amazon Web Services (AWS)** dan **Google Cloud Platform (GCP)**, didukung otomatisasi **CI/CD GitHub Actions** serta integrasi **Generative AI Assistant**.*
> 
> *Aplikasi ini memecahkan tantangan antrean manual di fasilitas kesehatan dengan menyediakan reservasi dokter secara real-time, manajemen jadwal dinamis, serta konsultasi awal kesehatan melalui AI Chatbot berbasis Google Gemini.*
> 
> *Mari kita masuk ke inti rancangan arsitektur cloud yang telah kami bangun."*

---

### Slide 2: Arsitektur Jaringan 3-VPC & Isolasi Keamanan (01:30 - 03:30)
> **Visual Slide**: Diagram 3-VPC (VPC Frontend, VPC Backend, VPC Database), Tabel Subnet & CIDR, Panah VPC Peering, Icon NACL & Security Groups.
>
> **Tindakan Presenter**: Arahkan pointer ke diagram jaringan, jelaskan prinsip *Defense-in-Depth* dan *Zero Trust*.

**Script Presenter:**
> *"Pada aspek infrastruktur jaringan AWS, kami tidak menempatkan seluruh komponen dalam satu jaringan datar (flat network). Kami menerapkan prinsip **Defense-in-Depth** dengan memisahkan arsitektur menjadi **3 Virtual Private Cloud (VPC) terpisah**:*
>
> 1. *Pertama, **VPC Frontend** dengan CIDR `10.0.0.0/16`. Di dalamnya terdapat `subnet-frontend` dan Internet Gateway `igw-frontend`. Layer ini bertugas melayani antarmuka web (Presentation Tier).*
> 2. *Kedua, **VPC Backend** dengan CIDR `10.1.0.0/16`. Memiliki `subnet-backend` dan `igw-backend`. Internet gateway di backend ini digunakan khusus untuk komunikasi outbound ke layanan pihak ketiga seperti Google Gemini AI API, GCP Cloud Storage, serta penarikan container image dari DockerHub.*
> 3. *Ketiga, **VPC Database** dengan CIDR `10.2.0.0/16`. Bagian ini adalah **Core Data Tier** kami yang terdiri dari dua subnet privat: `subnet-db-priv-1` di Availability Zone A dan `subnet-db-priv-2` di Availability Zone B.*
>
> *Keunggulan utama arsitektur kami terletak pada **Isolasi Keamanan**:*
> - *VPC Database **SAMA SEKALI TIDAK MEMILIKI INTERNET GATEWAY (No IGW)**. Database tidak memiliki IP publik sehingga mustahil diakses langsung dari internet.*
> - *Untuk komunikasi antar-tier, kami mengonfigurasi **2 VPC Peering Connection**:*
>   - *`pcx-frontend-backend` menghubungkan Frontend dan Backend.*
>   - *`pcx-backend-database` menghubungkan Backend dan Database.*
> - *VPC Frontend **TIDAK** memiliki peering ke VPC Database. Dengan demikian, jika terjadi serangan siber pada layer frontend, penyerang tetap tidak memiliki jalur rute langsung ke database.*
> - *Keamanan ini diperkuat dengan **Security Group berjenjang**: `sg-database` hanya membuka port MySQL 3306 secara eksklusif ke IP VPC Backend, dan `sg-backend` hanya menerima request API dari VPC Frontend."*

---

### Slide 3: Amazon CloudFront & Compute Tier (EC2 Docker) (03:30 - 05:00)
> **Visual Slide**: Arsitektur CloudFront Edge Caching, Path Routing Table (`/*` vs `/api/*`), dan Spesifikasi EC2 Instance.
>
> **Tindakan Presenter**: Jelaskan efisiensi akses konten dan bagaimana CloudFront bertindak sebagai Single Point of Entry yang aman.

**Script Presenter:**
> *"Sebagai pintu gerbang utama ke seluruh sistem, kami menempatkan **Amazon CloudFront Distribution** di layer terdepan.*
> 
> *CloudFront memberikan tiga manfaat kritikal:*
> 1. *Menyediakan enkripsi **HTTPS (SSL/TLS)** secara otomatis kepada pengguna akhir.*
> 2. *Menyediakan **Edge Caching** untuk aset statis frontend seperti HTML, bundle JavaScript React, dan CSS, sehingga memangkas latency akses secara signifikan.*
> 3. *Melakukan **Smart Path Routing**:*
>    - *Trafik reguler `/*` otomatis diarahkan ke origin **EC2 Frontend**.*
>    - *Trafik data `/api/*` dan `/auth/*` otomatis diteruskan ke origin **EC2 Backend** dengan konfigurasi cache dinonaktifkan (TTL=0) dan seluruh header/cookie diteruskan secara transparan.*
>
> *Pada layer Compute, baik frontend maupun backend berjalan di atas **Amazon EC2 Instance** berbasis Ubuntu Server yang telah di-kontainerisasi menggunakan **Docker** dan **Docker Compose**:*
> - *EC2 Frontend menjalankan container Nginx ringan yang menyajikan Single Page Application (SPA) React.*
> - *EC2 Backend menjalankan Node.js Express.js yang menangani logika bisnis, autentikasi JWT, dan interaksi data."*

---

### Slide 4: Database Tier (RDS/Aurora) & Hybrid GCP Cloud Storage (05:00 - 06:30)
> **Visual Slide**: Logo AWS RDS MySQL / Aurora, Icon GCP Cloud Storage Bucket `klinik-storage-bucket-app`, dan Alur Upload Foto Dokter.
>
> **Tindakan Presenter**: Tekankan konsep **Hybrid Multi-Cloud Strategy** yang menggabungkan AWS dan GCP.

**Script Presenter:**
> *"Berikutnya, pada layer persistensi data, kami menerapkan strategi **Hybrid Multi-Cloud**:*
>
> 1. *Untuk **Relational Structured Data**, kami menggunakan **AWS RDS / Aurora MySQL (`klinik-db`)**. Database ini terpasang pada DB Subnet Group yang mencakup `subnet-db-priv-1` dan `subnet-db-priv-2` secara Multi-AZ. Ini menjamin ketersediaan tinggi (High Availability), automated backups, dan failover.*
> 2. *Untuk **Unstructured Object Storage (Media Foto)**, kami mengintegrasikan **Google Cloud Storage (GCP)**.*
>    - *Ketika admin mengunggah foto profil dokter baru, file diproses di backend menggunakan Multer memory-storage.*
>    - *Backend melakukan streaming langsung ke GCS Bucket bernama `klinik-storage-bucket-app` menggunakan Service Account Key JSON yang aman.*
>    - *GCP mengembalikan Public URL CDN global (`https://storage.googleapis.com/...`) yang kemudian disimpan sebagai referensi URL di database RDS.*
>
> *Strategi hybrid ini membuat instance EC2 backend tetap stateless, menghemat kapasitas disk server, dan memisahkan beban pengiriman media statis ke infrastruktur storage global GCP."*

---

### Slide 5: Integrasi AI Gemini & Otomasi CI/CD GitHub Actions (06:30 - 08:00)
> **Visual Slide**: Diagram Flow Gemini AI Chatbot, Diagram Pipeline CI/CD (GitHub Push -> Test -> Docker Build -> DockerHub -> EC2 SSH Deploy).
>
> **Tindakan Presenter**: Jelaskan keunggulan fitur inovatif AI dan efisiensi deployment otomatis tim.

**Script Presenter:**
> *"Aplikasi kami dilengkapi dua fitur unggulan modern:*
>
> 1. ***AI Healthcare Assistant (Google Gemini)**:*
>    - *Kami mengintegrasikan Google GenAI SDK (`@google/genai`) pada endpoint backend.*
>    - *Sistem dilengkapi **System Prompt Engineering** khusus: AI berperan sebagai asisten resmi Klinik Hafizh yang memberikan edukasi kesehatan, panduan pertolongan pertama, serta mengarahkan pasien ke dokter spesialis yang tepat.*
>
> 2. ***Otomasi CI/CD Pipeline (GitHub Actions)**:*
>    - *Kami mengimplementasikan dua workflow independen: `.github/workflows/frontend.yml` dan `.github/workflows/backend.yml`.*
>    - *Setiap kali developer melakukan `git push` ke branch `main`, pipeline secara otomatis:*
>      - *Menjalankan pengujian dan validasi dependensi.*
>      - *Membangun Docker Image menggunakan Docker Buildx dan mem-push image ke DockerHub.*
>      - *Melakukan koneksi aman via SSH ke masing-masing EC2 (Frontend dan Backend).*
>      - *Menarik image terbaru dan merestart container via Docker Compose tanpa downtime manual.*
>    - *Hal ini menjamin siklus rilis fitur yang cepat, teruji, dan bebas dari human-error."*

---

### Slide 6: Skenario Live Demo Aplikasi & Infrastruktur (08:00 - 11:30)
> **Visual Slide / Layar**: Live Browser (CloudFront URL), AWS Management Console (VPC / EC2 / RDS), GCP Console (Storage Bucket), dan GitHub Actions Tab.
>
> **Tindakan Presenter**: Berpindah layar ke browser dan lakukan demo secara runtut sesuai panduan di Bagian 4.

**Script Presenter (Sambil melakukan demo):**
> *(1) "Dapat dilihat pada layar, kami mengakses aplikasi melalui domain **Amazon CloudFront** dengan protokol aman HTTPS.*
> 
> *(2) Pertama, kita uji fitur **AI Healthcare Chatbot**. Kita masukkan keluhan: 'Halo dok, saya sering sakit kepala di bagian belakang leher'. Terlihat AI Gemini merespons dengan cepat, memberikan edukasi awal, dan menyarankan reservasi ke dokter spesialis saraf.*
> 
> *(3) Selanjutnya, kita lakukan **Reservasi Janji Temu Pasien**, memilih jadwal dokter yang tersedia, dan submit. Data langsung masuk ke RDS MySQL secara real-time.*
> 
> *(4) Sekarang kita masuk ke **Admin Dashboard**. Kita coba tambah data dokter baru dengan mengunggah foto. Setelah disimpan, kita periksa foto tersebut — URL-nya langsung mengarah ke `storage.googleapis.com/klinik-storage-bucket-app`. Kita buka GCP Storage Console, file foto telah berhasil terunggah.*
> 
> *(5) Terakhir, pada AWS Console, kita periksa konfigurasi **3 VPC, Route Tables, dan Peering Connection**, membuktikan bahwa trafik antar-tier berjalan aman melalui jaringan privat internal."*

---

### Slide 7: Kesimpulan & Penutup (11:30 - 12:30)
> **Visual Slide**: Rangkuman Poin Keunggulan Arsitektur & Terima Kasih.
>
> **Tindakan Presenter**: Buat kesimpulan yang tegas dan buka sesi tanya jawab.

**Script Presenter:**
> *"Sebagai kesimpulan:*
> - *Arsitektur **3-VPC berjenjang** memberikan perlindungan tingkat enterprise dengan isolasi database privat tanpa eksposur internet.*
> - *Pemanfaatan **Amazon CloudFront** mengoptimalkan performa global dan keamanan SSL.*
> - *Strategi **Hybrid Multi-Cloud** dengan **GCP Cloud Storage** dan **Google Gemini AI** membuktikan interoperabilitas antar platform cloud terdepan.*
> - *Didukung oleh **Docker Containerization** dan **CI/CD GitHub Actions**, sistem ini siap diskalakan (highly scalable), andal, dan siap diimplementasikan pada lingkungan produksi nyata.*
>
> *Demikian presentasi dari kelompok kami. Terima kasih banyak atas perhatian Bapak/Ibu dosen dan rekan-rekan. Kami persilakan untuk sesi tanya jawab."*

---

## 4. PANDUAN LANGKAH SKENARIO LIVE DEMO

Berikut adalah urutan teknis saat melakukan demonstrasi langsung di depan penguji:

| No | Komponen yang Didemokan | Tindakan & Hal yang Ditunjukkan | Poin Penekanan untuk Penguji |
|---|---|---|---|
| **1** | **Akses CloudFront** | Buka URL CloudFront di browser (misal: `https://xxxx.cloudfront.net`). Tunjukkan gembok SSL/HTTPS dan inspeksi network tab (Cache HIT pada aset statis). | Distribusi CDN global dan single point of entry yang aman. |
| **2** | **AI Gemini Chatbot** | Buka widget Chatbot di pojok kanan bawah. Ketik pertanyaan seputar gejala kesehatan. Tunjukkan respons cerdas dan sopan dari AI. | Integrasi AI generasi terbaru pada backend Node.js. |
| **3** | **Reservasi Pasien** | Buka menu Reservasi, pilih dokter, pilih tanggal, dan submit formulir janji temu. | Interaksi penuh frontend -> backend -> database. |
| **4** | **Upload Foto ke GCP Storage** | Login Admin (`admin` / password), buka menu Dokter -> Tambah Dokter. Upload file foto. Tunjukkan inspect element gambar yang mengarah ke `https://storage.googleapis.com/klinik-storage-bucket-app/...`. Buka Google Cloud Storage Console untuk membuktikan file tersimpan di bucket. | Implementasi arsitektur Hybrid Multi-Cloud (AWS + GCP). |
| **5** | **Bukti Isolasi AWS VPC** | Buka AWS Console -> VPC. Tunjukkan 3 VPC (Frontend, Backend, Database), 2 Peering Connection, dan Route Table Database yang **TIDAK memiliki 0.0.0.0/0 ke Internet Gateway**. | Keamanan database tier yang terisolasi total (*Zero Internet Access*). |
| **6** | **CI/CD GitHub Actions** | Buka tab GitHub Actions di repository. Tunjukkan riwayat build dan deploy otomatis yang sukses (Job: Build & Test -> Dockerize & Push -> SSH Deploy EC2). | Otomasi DevOps modern dan zero-downtime deployment. |

---

## 5. BANK TANYA JAWAB (Q&A DEFENSE CHEAT-SHEET)

Berikut adalah 10 pertanyaan kritis yang paling sering ditanyakan dosen/penguji beserta jawaban teknis terbaiknya:

### Q1: Mengapa kalian menggunakan 3 VPC terpisah, bukan sekadar 3 subnet berbeda dalam 1 VPC?
> **Jawaban:**
> *"Pemisahan menjadi 3 VPC memberikan batas keamanan (*security boundary*) dan isolasi administratif yang jauh lebih kuat dibandingkan subnet level. Dengan 3 VPC terpisah:
> 1. Kita dapat menerapkan routing tabel dan gateway independen.
> 2. Kita mengontrol komunikasi antar-tier secara granular melalui **VPC Peering Connection**.
> 3. Frontend VPC sama sekali tidak memiliki rute peering ke Database VPC, sehingga serangan yang menembus layer frontend tidak dapat melompat langsung ke layer database (mencegah *lateral movement attack*)."*

---

### Q2: Bagaimana EC2 Frontend bisa berkomunikasi dengan EC2 Backend jika keduanya berada di VPC berbeda?
> **Jawaban:**
> *"Komunikasi terjadi melalui **VPC Peering Connection (`pcx-frontend-backend`)**. Pada Route Table Frontend, kami menambahkan entri rute bahwa paket dengan tujuan CIDR `10.1.0.0/16` (VPC Backend) diteruskan ke ID Peering tersebut. Begitu pula sebaliknya pada Route Table Backend untuk CIDR `10.0.0.0/16`. Selain itu, lalu lintas publik dari pengguna diarahkan oleh **Amazon CloudFront** berdasarkan path pattern: request path `/api/*` langsung diarahkan ke IP publik/DNS Backend."*

---

### Q3: Bagaimana cara Backend menghubungi Database jika VPC Database tidak memiliki Internet Gateway?
> **Jawaban:**
> *"Backend dan Database terhubung melalui **VPC Peering Connection (`pcx-backend-database`)** via jaringan privat internal AWS (Private IP). Pada Route Table Backend, rute ke `10.2.0.0/16` diarahkan ke peering tersebut. Pada Route Table Database, rute balik ke `10.1.0.0/16` juga diarahkan ke peering. Database tidak membutuhkan Internet Gateway karena seluruh transaksi database hanya berasal dari EC2 Backend secara lokal/privat."*

---

### Q4: Mengapa kalian menggunakan Google Cloud Storage (GCP) padahal server komputasi berada di AWS? Mengapa tidak memakai AWS S3 saja?
> **Jawaban:**
> *"Kami sengaja merancang arsitektur **Hybrid Multi-Cloud** untuk menunjukkan interoperabilitas antar penyedia cloud. Pemanfaatan GCP Cloud Storage memberikan keunggulan fleksibilitas penyimpanan objek, integrasi native yang mulus dengan ekosistem Google lainnya (seperti Google Gemini AI SDK yang kami gunakan untuk chatbot), serta menghindari *single-vendor lock-in*."*

---

### Q5: Bagaimana mekanisme autentikasi dan keamanan antara Backend AWS dan Bucket GCP Storage?
> **Jawaban:**
> *"Kami menggunakan **GCP Service Account IAM** dengan hak akses terbatas (*Least Privilege*) khusus Storage Object Creator/Viewer. Kunci autentikasi berbentuk Service Account JSON Key (`gcs-key.json`) yang disimpan secara aman di environment server dan di-mount ke dalam container Docker backend. Tanpa key ini, tidak ada pihak luar yang bisa mengunggah ke bucket kami."*

---

### Q6: Bagaimana CloudFront membedakan antara request halaman web React dan request API backend?
> **Jawaban:**
> *"Melalui konfigurasi **Multiple Origins & Cache Behaviors** pada CloudFront:
> - Kami mendaftarkan 2 Origin: Origin 1 untuk EC2 Frontend dan Origin 2 untuk EC2 Backend.
> - Kami membuat Cache Behavior dengan aturan path pattern: jika path diawali `/api/*` atau `/auth/*`, CloudFront meneruskannya ke Origin Backend dengan TTL=0 (tidak di-cache) dan meneruskan semua HTTP Method (GET, POST, PUT, DELETE).
> - Pola default `/*` diteruskan ke Origin Frontend dengan caching aset statis aktif."*

---

### Q7: Mengapa pada VPC Database memerlukan 2 Subnet di Availability Zone berbeda (`subnet-db-priv-1` dan `subnet-db-priv-2`)?
> **Jawaban:**
> *"Layanan AWS RDS dan Aurora mewajibkan pembuatan **DB Subnet Group** yang terdiri dari minimal 2 subnet di Availability Zone (AZ) berbeda (misalnya `ap-southeast-1a` dan `ap-southeast-1b`). Hal ini merupakan standar best-practice AWS untuk mendukung fitur Multi-AZ High Availability dan automated failover jika salah satu data center mengalami gangguan."*

---

### Q8: Bagaimana alur kerja CI/CD GitHub Actions ketika ada perubahan kode baru?
> **Jawaban:**
> *"Pipeline kami berjalan secara otomatis dalam 3 tahap (jobs):
> 1. **Build & Test**: GitHub Runner mengunduh kode, memasang dependensi Node.js, dan menjalankan automated test.
> 2. **Dockerize & Push**: GitHub Runner membangun Docker image menggunakan Buildx dengan tag commit SHA dan `:latest`, lalu mem-push image ke DockerHub repository kami.
> 3. **Deploy via SSH**: GitHub Runner menggunakan SSH Action dengan private key rahasia untuk masuk ke EC2, melakukan `docker compose pull`, dan merestart container baru tanpa menghapus data volume yang ada."*

---

### Q9: Apa fungsi Network ACL (NACL) selain Security Group yang sudah ada?
> **Jawaban:**
> *"NACL bertindak sebagai **Stateless Firewall** di level subnet yang mengevaluasi seluruh paket masuk dan keluar berdasarkan urutan aturan (Rule Numbers), sedangkan Security Group bertindak sebagai **Stateful Firewall** di level virtual instance (EC2/RDS). Kombinasi keduanya memberikan keamanan ganda: NACL menyaring trafik di gerbang subnet, dan Security Group menyaring trafik spesifik di tingkat port aplikasi."*

---

### Q10: Bagaimana arsitektur ini menangani peningkatan trafik yang tiba-tiba (Scalability)?
> **Jawaban:**
> *"1. **Edge Caching CloudFront** menyerap lonjakan trafik pembacaan aset statis tanpa membebani server EC2.
> 2. **Stateless Backend & Docker**: Backend kami bersifat stateless karena session menggunakan JWT dan foto disimpan di GCP Storage, sehingga kita dapat dengan mudah menambahkan Auto Scaling Group (ASG) dan Application Load Balancer (ALB) di depan EC2 Backend jika trafik bertambah di masa depan.
> 3. **RDS Auto Storage Scaling**: Database RDS telah dikonfigurasi dengan autoscaling storage hingga 50 GB."*
