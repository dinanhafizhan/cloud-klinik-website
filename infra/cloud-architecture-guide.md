# Panduan Arsitektur Cloud: Multi-VPC AWS, CloudFront, RDS, & Hybrid GCP Storage

Dokumen ini menjelaskan rancangan arsitektur cloud, konfigurasi jaringan, keamanan berlapis (defense-in-depth), dan integrasi hybrid multi-cloud antara **Amazon Web Services (AWS)** dan **Google Cloud Platform (GCP)** untuk aplikasi **Klinik Pemweb (Klinik Hafizh)**.

---

## 1. Diagram Topologi Jaringan & Arsitektur

```
                                [ Pengguna / Klien di Internet ]
                                               │
                                               ▼ HTTPS (SSL/TLS)
                     ┌──────────────────────────────────────────────────┐
                     │          Amazon CloudFront (Edge CDN)            │
                     │  - Default Cache Behavior: /* -> EC2 Frontend    │
                     │  - Custom Cache Behavior: /api/* -> EC2 Backend  │
                     └──────────────────────────────────────────────────┘
                                      │                        │
                                      │ HTTP                   │ HTTP
                                      ▼ (Port 80)              ▼ (Port 80)
    ┌──────────────────────────────────────────┐    ┌──────────────────────────────────────────┐
    │          VPC FRONTEND                    │    │          VPC BACKEND                     │
    │  CIDR: 10.0.0.0/16                       │    │  CIDR: 10.1.0.0/16                       │
    │  ┌────────────────────────────────────┐  │    │  ┌────────────────────────────────────┐  │
    │  │ Subnet Frontend (10.0.1.0/24)      │  │    │  │ Subnet Backend (10.1.1.0/24)       │  │
    │  │ ┌────────────────────────────────┐ │  │    │  │ ┌────────────────────────────────┐ │  │
    │  │ │ EC2 Frontend (React SPA Nginx) │ │  │    │  │ │ EC2 Backend (Express.js API)   │ │  │
    │  │ │ Port: 80 (Docker: 80 -> 3000)  │ │  │    │  │ │ Port: 80 (Docker: 80 -> 5000)  │ │  │
    │  │ └────────────────────────────────┘ │  │    │  │ └────────────────────────────────┘ │  │
    │  │ SG: sg-frontend (80, 443, 22)      │  │    │  │ SG: sg-backend (80/5000 from FE)   │  │
    │  └────────────────────────────────────┘  │    │  └────────────────────────────────────┘  │
    │  Internet Gateway: igw-frontend          │    │  Internet Gateway: igw-backend           │
    └──────────────────────────────────────────┘    └──────────────────────────────────────────┘
                         │                                       │               │
                         └──────────── VPC Peering ──────────────┘               │ HTTPS Outbound
                               (pcx-frontend-backend)                            │ (Upload & AI)
                                                                                 ▼
                                                      ┌────────────────────────────────────────┐
                                                      │       Google Cloud Platform (GCP)      │
                                                      │  - Cloud Storage Bucket:               │
                                                      │    klinik-storage-bucket-app           │
                                                      │  - Google Gemini AI API:               │
                                                      │    Generative Healthcare Assistant     │
                                                      └────────────────────────────────────────┘
                                                                 │
                                                    VPC Peering  │ (Port 3306 MySQL)
                                               (pcx-backend-db)  │
                                                                 ▼
                                    ┌──────────────────────────────────────────────────────────┐
                                    │                     VPC DATABASE                         │
                                    │  CIDR: 10.2.0.0/16 (ISOLATED - NO INTERNET GATEWAY)      │
                                    │  ┌─────────────────────────┐ ┌─────────────────────────┐ │
                                    │  │ Subnet DB Priv 1 (AZ-A) │ │ Subnet DB Priv 2 (AZ-B) │ │
                                    │  │ 10.2.1.0/24             │ │ 10.2.2.0/24             │ │
                                    │  └─────────────────────────┘ └─────────────────────────┘ │
                                    │  ┌─────────────────────────────────────────────────────┐ │
                                    │  │ DB Subnet Group -> RDS / Aurora MySQL (klinik-db)   │ │
                                    │  │ SG: sg-database (Port 3306 HANYA dari VPC Backend)  │ │
                                    │  └─────────────────────────────────────────────────────┘ │
                                    └──────────────────────────────────────────────────────────┘
```

---

## 2. Rincian Komponen & Spesifikasi Teknis

### A. AWS Network (3-VPC Architecture)
1. **VPC Frontend (`10.0.0.0/16`)**:
   - Berfungsi sebagai Presentation Tier.
   - Memiliki `igw-frontend` dan Subnet Publik `subnet-frontend` (`10.0.1.0/24`).
   - Security Group `sg-frontend` mengizinkan Inbound HTTP (80) & HTTPS (443) dari seluruh dunia (atau CloudFront IP Range) dan SSH (22).

2. **VPC Backend (`10.1.0.0/16`)**:
   - Berfungsi sebagai Business Logic & Application Tier.
   - Memiliki `igw-backend` dan Subnet `subnet-backend` (`10.1.1.0/24`).
   - IGW Backend memungkinkan EC2 Backend mengakses API eksternal (GCP Cloud Storage & Google Gemini API) dan men-download docker image dari DockerHub.
   - Security Group `sg-backend` HANYA mengizinkan trafik API (port 80 & 5000) dari VPC Frontend (`10.0.0.0/16`).

3. **VPC Database (`10.2.0.0/16`)**:
   - Berfungsi sebagai Data Storage Tier yang sangat terisolasi.
   - **TIDAK memiliki Internet Gateway (Zero Internet Access)**.
   - Terdiri dari 2 private subnet pada Availability Zone berbeda (`subnet-db-priv-1` pada AZ-A dan `subnet-db-priv-2` pada AZ-B) untuk memenuhi syarat High Availability RDS DB Subnet Group.
   - Security Group `sg-database` HANYA membuka port MySQL 3306 dari CIDR VPC Backend (`10.1.0.0/16`).

4. **VPC Peering Connections**:
   - `pcx-frontend-backend`: Menghubungkan Frontend VPC (`10.0.0.0/16`) dengan Backend VPC (`10.1.0.0/16`).
   - `pcx-backend-database`: Menghubungkan Backend VPC (`10.1.0.0/16`) dengan Database VPC (`10.2.0.0/16`).
   - **Keamanan**: Frontend VPC TIDAK di-peer ke Database VPC, sehingga mencegah peretasan database secara langsung dari layer presentasi.

5. **Amazon CloudFront**:
   - Bertindak sebagai Single Entry Point global yang menyediakan enkripsi SSL/TLS (HTTPS) dan caching edge.
   - **Path Pattern Rules**:
     - `/*` (Default): Diarahkan ke EC2 Frontend dengan caching static asset (HTML, JS, CSS, Media).
     - `/api/*` & `/auth/*`: Diarahkan ke EC2 Backend dengan disable cache (TTL=0) dan forward all headers & cookies.

### B. Hybrid Storage (Google Cloud Storage)
- Media statis dinamis (seperti foto profil dokter yang diunggah melalui dashboard) disimpan di Google Cloud Storage Bucket `klinik-storage-bucket-app`.
- Backend mengautentikasi ke GCS menggunakan Service Account Key (`gcs-key.json`).
- URL publik `https://storage.googleapis.com/klinik-storage-bucket-app/uploads/...` dikembalikan dan disimpan di database MySQL.

### C. Continuous Integration & Continuous Deployment (CI/CD)
- **GitHub Actions** menjalankan workflow otomatis pada setiap push ke branch `main`:
  1. Unit Test & Dependency Verification.
  2. Docker build & multi-arch packaging.
  3. Push image ke DockerHub (`ariilalhafizh/klinikpemweb-frontend` & `ariilalhafizh/klinikpemweb-backend`).
  4. SSH Action ke EC2 instance terkait untuk menarik image terbaru dan me-restart container dengan zero-downtime.

---

## 3. Langkah Deployment via Terraform

1. Masuk ke direktori `infra/`:
   ```bash
   cd infra
   ```
2. Salin dan sesuaikan file variabel:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
3. Lakukan inisialisasi dan deploy:
   ```bash
   terraform init
   terraform plan
   terraform apply -auto-approve
   ```
4. Output akan menampilkan IP EC2, Endpoint Database RDS, serta Domain Name CloudFront yang dapat langsung diakses.
