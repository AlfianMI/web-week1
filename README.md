# Startup Multi-Service API (Node.js)

Repository aplikasi web REST API Node.js/Express yang dirancang untuk arsitektur multi-service (Web App, Database PostgreSQL, dan In-Memory Cache Redis) dengan persistensi data dan strategi caching (*Cache-Aside pattern*).

---

## 📁 Structure Repository

```text
stack-nodejs/
├── package.json               # Dependensi proyek & npm scripts
├── .env.example               # Template variabel lingkungan
├── .gitignore                 # File yang diabaikan Git
├── README.md                  # Dokumentasi aplikasi & API
└── src/
    ├── app.js                 # Inisialisasi Express app & middleware
    ├── server.js              # Entrypoint server & Graceful Shutdown
    ├── config/
    │   ├── env.js             # Environment variables loader & validator
    │   ├── database.js        # PostgreSQL pool connection & schema initializer
    │   └── redis.js           # Redis client & reconnection strategy
    ├── controllers/
    │   ├── productController.js # Handler HTTP REST API Produk
    │   └── healthController.js  # Handler endpoint kesehatan (Health Check)
    ├── services/
    │   └── productService.js   # Logika bisnis, query DB & Cache-Aside pattern
    ├── routes/
    │   ├── productRoutes.js   # Routing rute `/api/v1/products`
    │   └── healthRoutes.js    # Routing rute `/health` & `/health/deep`
    └── middlewares/
        ├── logger.js          # Request HTTP logger (morgan)
        └── errorHandler.js    # Centralized error handler
```

---

##  Fitur Utamanya

1. **Persistensi Data**: Menggunakan Database **PostgreSQL** dengan connection pool management dan skema tabel otomatis (`products`).
2. **In-Memory Caching**: Menggunakan **Redis** dengan pola *Cache-Aside*:
   - Reading: Cek Redis dulu -> Jika miss -> Query DB -> Update Redis (TTL).
   - Mutation (CUD): Modifikasi data di DB -> Invalidate / hapus cache terkait di Redis.
3. **Robust Health Check**: Endpoint `/health/deep` yang memverifikasi koneksi real-time ke PostgreSQL dan Redis.
4. **Graceful Shutdown**: Menutup HTTP server, PostgreSQL connection pool, dan Redis client secara aman saat menerima sinyal `SIGTERM` / `SIGINT`.

---

## Variabel Lingkungan (.env)

Salin `.env.example` ke `.env` lalu sesuaikan nilainya:

```bash
cp .env.example .env
```

| Variable | Default Value | Deskripsi |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port server aplikasi |
| `NODE_ENV` | `development` | Lingkungan aplikasi (`development` / `production`) |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Port PostgreSQL |
| `DB_USER` | `postgres` | Username PostgreSQL |
| `DB_PASSWORD` | `postgres` | Password PostgreSQL |
| `DB_NAME` | `startup_db` | Nama Database |
| `REDIS_HOST` | `localhost` | Host Redis |
| `REDIS_PORT` | `6379` | Port Redis |
| `REDIS_PASSWORD` | `""` | Password Redis (opsional) |
| `CACHE_TTL_SECONDS`| `3600` | Durasi simpan cache Redis (detik) |

---

## Cara Menjalankan

### 1. Install Dependensi
```bash
npm install
```

### 2. Jalankan Mode Development
```bash
npm run dev
```

### 3. Jalankan Mode Production
```bash
npm start
```

---

## Endpoint API Reference

### Health Checks
- `GET /health`: Basic health status
- `GET /health/deep`: Deep health check (Database PostgreSQL & Cache Redis connectivity)

### Product Management (`/api/v1/products`)
- `GET /api/v1/products`: Mengambil semua data produk (Memanfaatkan Cache-Aside)
- `GET /api/v1/products/:id`: Mengambil detail produk berdasarkan ID (Memanfaatkan Cache-Aside)
- `POST /api/v1/products`: Membuat produk baru (Invalidates List Cache)
- `PUT /api/v1/products/:id`: Memperbarui data produk (Invalidates List & Item Cache)
- `DELETE /api/v1/products/:id`: Menghapus produk (Invalidates List & Item Cache)

---

# DevOps Setup

Menjelaskan Konfigurasi DevOps untuk menjalankan aplikasi menggunakan Docker.

## Prerequisites

Pastikan sistem telah memiliki:

- Docker
- Docker Compose
- Bash
- Git

Verifikasi instalasi:

```bash
docker --version
docker compose version
git --version
bash --version

#Berikut Alur pengerjaan Project Week 1

1. System Monitoring

Script monitoring tersedia di:

scripts/system-monitor.sh

Script melakukan pemeriksaan:

Tanggal dan waktu eksekusi.
Penggunaan disk pada root partition /.
Peringatan jika penggunaan disk melebihi 80%.
Status service Docker.

Menjalankan script:

//bash
chmod +x scripts/system-monitor.sh
./scripts/system-monitor.sh

Output log disimpan di:

/tmp/sys-monitor.log

Melihat log:
//bash
cat /tmp/sys-monitor.log

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

2. Docker Image

Aplikasi menggunakan Docker Multi-Stage Build.

Build image:
//bash
docker build -t devops-week1-app:v1.0 .

Melihat image:
//bash
docker images devops-week1-app:v1.0

Memeriksa ukuran image:
//bash
docker image inspect devops-week1-app:v1.0 --format '{{.Size}}' | numfmt --to=iec

Hasil pengujian image:

44 MB

Image dijalankan menggunakan user non-root.

Verifikasi:
//bash
docker run --rm devops-week1-app:v1.0 whoami

Output:

node

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

3. Docker Compose

Docker Compose menjalankan tiga service:
-app
-db
-redis

Menjalankan seluruh stack:
//bash
docker compose up -d --build

Melihat status service:
//bash
docker compose ps

Melihat log aplikasi:
//bash
docker compose logs app

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

4. Health Check

Aplikasi menyediakan endpoint:

GET /health/deep

Pengujian:
//bash
curl http://localhost:3000/health/deep ->> Endpoint memeriksa koneksi PostgreSQL dan Redis.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

5. Database Persistence

PostgreSQL menggunakan named volume:

db-data

Volume digunakan agar data database tetap tersimpan ketika container dihentikan dan dibuat kembali.

Pengujian persistence:
//bash
docker compose down
//bash
docker compose up -d

Setelah container dibuat kembali, data pada database tetap tersedia karena volume tidak dihapus.
Note : Jangan menggunakan 'docker compose down -v' ketika ingin mempertahankan data database.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

6. Environment Configuration

File .env digunakan untuk konfigurasi runtime dan tidak di-commit ke repository.

Contoh konfigurasi Docker Compose:

DB_HOST=db
DB_PORT=5432
DB_USER=devops
DB_NAME=startup_db

REDIS_HOST=redis
REDIS_PORT=6379

Service db dan redis diakses menggunakan nama service Docker melalui network backend-net, bukan menggunakan localhost
