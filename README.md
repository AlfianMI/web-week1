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


# DevOps Week 2 - CI/CD Pipeline

[![CI/CD Pipeline](https://github.com/AlfianMI/web-week1/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/AlfianMI/web-week1/actions/workflows/ci-cd.yml)

Implementasi **End-to-End CI/CD Pipeline** menggunakan **GitHub Actions** untuk aplikasi web Node.js.

Pipeline mencakup:

* Continuous Integration (CI)
* Matrix Testing
* DevSecOps Security Scanning
* Docker Image Build & Publish
* GitHub Container Registry (GHCR)
* Smoke Test
* GitHub Environment
* Automated Release

---

## Pipeline Overview

Alur pipeline:

```text
Push / Pull Request
        |
        v
  Lint & Test
(Node.js 18 & 20)
        |
        v
 Security Scan
(npm audit + Trivy)
        |
        v
 Build & Publish
   Docker Image
      -> GHCR
        |
        v
   Smoke Test
    /health
        |
        v
GitHub Release
```

---

# Tugas 1 - CI & Matrix Testing

Workflow GitHub Actions:

```text
.github/workflows/ci-cd.yml
```

Pipeline dijalankan pada:

* Push ke `main`
* Push ke `develop`
* Pull Request menuju `main`
* Manual melalui `workflow_dispatch`

### Matrix Testing

Aplikasi diuji menggunakan:

* Node.js 18.x
* Node.js 20.x

Konfigurasi matrix:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

Setiap versi Node.js menjalankan:

```bash
npm ci
npm run lint
npm test
```

Dependency caching diaktifkan menggunakan:

```yaml
cache: npm
```

### Hasil

GitHub Actions berhasil menjalankan:

* Lint & Test - Node 18.x ✅
* Lint & Test - Node 20.x ✅

---

# Tugas 2 - DevSecOps Security Scanning

Security scanning dijalankan setelah proses lint dan testing berhasil.

```yaml
needs: lint-and-test
```

### Dependency Security Scan

Dependency aplikasi diperiksa menggunakan:

```bash
npm audit --audit-level=high
```

### Container Security Scan

Docker image diperiksa menggunakan **Trivy**:

```yaml
uses: aquasecurity/trivy-action@v0.36.0
```

Konfigurasi severity:

```yaml
severity: HIGH,CRITICAL
exit-code: '1'
```

Dengan konfigurasi tersebut, workflow akan gagal apabila ditemukan vulnerability dengan severity:

* HIGH
* CRITICAL

### Alpine Package Update

Base image menggunakan:

```dockerfile
FROM node:18-alpine
```

Package Alpine diperbarui menggunakan:

```dockerfile
RUN apk update && apk upgrade
```

Hal ini membantu mengurangi vulnerability pada package OS yang terdapat di dalam container.

---

# Tugas 3 - Build & Publish ke GHCR

Job `build-and-publish` memiliki dependency:

```yaml
needs: security-scan
```

Job hanya dijalankan ketika terdapat push ke branch `main`:

```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

### Login ke GHCR

Pipeline melakukan autentikasi menggunakan:

```yaml
uses: docker/login-action@v3
```

Registry:

```text
ghcr.io
```

Authentication menggunakan:

```text
${{ secrets.GITHUB_TOKEN }}
```

### Docker Metadata

Metadata dan tag image dibuat menggunakan:

```yaml
uses: docker/metadata-action@v5
```

### Build & Push

Docker image dibuat dan dipublikasikan menggunakan:

```yaml
uses: docker/build-push-action@v5
```

GitHub Actions Layer Cache digunakan dengan:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

Image berhasil dipublikasikan ke **GitHub Container Registry (GHCR)** dan dapat dilihat pada bagian **Packages** di repository.

---

# Tugas 4 - Release Automation, Environment Protection & Documentation

## GitHub Environment

Environment bernama:

```text
production
```

dibuat pada repository GitHub.

Environment Secret yang digunakan:

```text
APP_PORT=3000
```

Secret digunakan oleh workflow untuk menentukan port aplikasi pada saat deployment dan Smoke Test.

---

## Smoke Test

Smoke Test dibuat menggunakan Bash script:

```text
scripts/smoke-test.sh
```

Script melakukan HTTP GET request terhadap endpoint aplikasi.

Default endpoint:

```text
http://localhost:3000/health
```

Script juga melakukan retry apabila aplikasi belum merespons HTTP 200.

### Menjalankan Smoke Test secara lokal

```bash
chmod +x scripts/smoke-test.sh
./scripts/smoke-test.sh
```

Jika aplikasi merespons HTTP 200, script menghasilkan:

```text
[SUCCESS] Service merespons dengan HTTP Status 200 OK.
```

dan mengembalikan exit status `0`.

Jika aplikasi tidak merespons dengan benar setelah beberapa kali percobaan, script mengembalikan exit status `1`.

---

## Release Automation

Release job dijalankan setelah seluruh tahap sebelumnya berhasil:

```text
lint-and-test
      |
      v
security-scan
      |
      v
build-and-publish
      |
      v
release
```

Release job menggunakan GitHub Environment:

```yaml
environment:
  name: production
```

Docker image yang telah dipublikasikan ke GHCR kemudian digunakan untuk menjalankan aplikasi.

Setelah container berjalan, Smoke Test dijalankan terhadap:

```text
/health
```

Jika Smoke Test berhasil, GitHub Release dibuat secara otomatis menggunakan:

```yaml
softprops/action-gh-release@v2
```

Format release tag:

```text
v1.0.<github.run_number>
```

Contoh:

```text
v1.0.7
```

---

# Testing Secara Lokal

### 1. Install dependency

```bash
npm ci
```

### 2. Jalankan lint

```bash
npm run lint
```

### 3. Jalankan unit test

```bash
npm test
```

### 4. Jalankan aplikasi menggunakan Docker Compose

```bash
docker compose up -d
```

### 5. Periksa container

```bash
docker compose ps
```

### 6. Jalankan Smoke Test

```bash
./scripts/smoke-test.sh
```

---

# Test melalui GitHub Actions

Workflow dapat dilihat melalui:

```text
Repository → Actions → CI/CD Pipeline
```

Setiap workflow run akan menampilkan status:

* Lint & Test - Node 18.x
* Lint & Test - Node 20.x
* Security Scan
* Build & Push Docker Image
* Smoke Test & Release

**Build & Publish** serta **Release Automation** hanya berjalan ketika workflow dijalankan melalui push ke branch `main`, sesuai dengan konfigurasi pipeline.

Test push menggunakan branch dev untuk mentrigger git action dan workflow berjalan dengan lancar namun build & push image serta smoke test& Release ter-skip

✅ Lint & Test - Node 18.x
✅ Lint & Test - Node 20.x
✅ Security Scan
⏭️ Build & Push Docker Image
⏭️ Smoke Test & Release

Test push menggunakan branch main untuk mentrigger git action dan workflow berjalan dengan lancar

✅ Lint & Test - Node 18.x
✅ Lint & Test - Node 20.x
✅ Security Scan
✅ Build & Push Docker Image
✅ Smoke Test & Release

---

# Git Workflow

Pengembangan Week 2 dilakukan pada branch:

```text
feature/week2-cicd-setup
```

Setelah seluruh implementasi selesai, branch feature diajukan sebagai Pull Request menuju:

```text
irfanrp/Web:main
```

---

# Repository Structure

```text
.
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── scripts/
│   └── smoke-test.sh
├── src/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

---

# Conclusion

Implementasi Week 2 menerapkan **End-to-End CI/CD Pipeline** menggunakan:

* GitHub Actions
* Matrix Testing
* Dependency Caching
* Lint & Unit Testing
* npm Audit
* Trivy Container Scanning
* Docker Build
* GitHub Container Registry (GHCR)
* GitHub Environment
* Smoke Testing
* Automated GitHub Release

Pipeline dirancang agar proses **build dan release hanya dilanjutkan setelah tahap testing dan security scanning berhasil**.

# Week 3 — AWS Cloud & Terraform (IaC)

Implementasi Week 3 berfokus pada provisioning infrastructure AWS menggunakan Terraform, penyimpanan Docker Image di Amazon ECR, deployment container ke EC2, serta otomatisasi CI/CD menggunakan GitHub Actions.

---

## Arsitektur

```text
                         GitHub
                            │
                       push ke main
                            │
                            ▼
                   GitHub Actions
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
        Lint & Test                 Security Scan
              │                           │
              └─────────────┬─────────────┘
                            ▼
                      Docker Build
                            │
                            ▼
                    Amazon ECR :latest
                            │
                            │ SSH
                            ▼
                         EC2
                            │
                     Docker Pull
                            │
                     Docker Container
                            │
                     Port 80 → 3000
                            │
                            ▼
                        /health
                            │
                            ▼
                         HTTP 200
                            │
                            ▼
                  GitHub Release
1. Teknologi yang Digunakan
AWS
Terraform
Amazon VPC
Amazon EC2
Amazon ECR
AWS IAM
GitHub Actions
GitHub OIDC
Docker
Node.js
Amazon Linux 2023

---

## 2. Tugas 1 — Provisioning AWS Infrastructure dengan Terraform — Provisioning AWS Infrastructure dengan Terraform
Tujuan

Provisioning infrastructure AWS secara reproducible menggunakan Terraform.

Seluruh konfigurasi Terraform diletakkan pada direktori:

infra/

Struktur:

infra/
├── .gitignore
├── .terraform.lock.hcl
├── main.tf
├── outputs.tf
├── providers.tf
├── terraform.tfvars.example
├── user-data.sh
└── variables.tf
Terraform Provider

AWS provider menggunakan versi:

version = "~> 6.0"

Region:

ap-southeast-1

Catatan: modul tugas awal mencantumkan ~> 5.0, tetapi konfigurasi ini menggunakan ~> 6.0 sesuai arahan mentor.

Provider yang digunakan:

Terraform v1.15.9
AWS Provider v6.61.0
Infrastructure yang Dibuat

Terraform membuat:

VPC
10.0.0.0/16
│
├── Public Subnet
│   └── 10.0.1.0/24
│       └── ap-southeast-1a
│
├── Internet Gateway
│
├── Public Route Table
│   └── 0.0.0.0/0 → Internet Gateway
│
├── Security Group
│   ├── 22  / SSH
│   ├── 80  / HTTP
│   └── 443 / HTTPS
│
└── EC2
    ├── Amazon Linux 2023
    ├── t3.micro
    └── Docker

Semua resource Terraform menggunakan tag:

ManagedBy = "Terraform"
Variable

Variable yang digunakan:

aws_region
environment
instance_type
key_pair_name

Contoh:

aws_region    = "ap-southeast-1"
environment   = "dev"
instance_type = "t3.micro"
key_pair_name = "week3-terraform-key"

File yang berisi konfigurasi aktual:

terraform.tfvars

tidak di-commit ke repository.

Sebagai gantinya tersedia:

terraform.tfvars.example
User Data

EC2 menggunakan user-data.sh untuk menginstal Docker saat pertama kali dijalankan:

dnf update -y

dnf install -y docker

systemctl enable docker
systemctl start docker

usermod -aG docker ec2-user

Hasil verifikasi pada EC2:

Docker version 25.0.14
docker.service → active (running)
Terraform Execution

Validasi:

terraform validate

Hasil:

Success! The configuration is valid.

Planning:

terraform plan

Hasil awal:

Plan: 7 to add, 0 to change, 0 to destroy.

Provisioning:

terraform apply

Hasil:

Apply complete! Resources: 7 added, 0 changed, 0 destroyed.

Output:

ec2_public_ip = 54.169.238.47
vpc_id        = vpc-0cef6f8ff334b4ce6
---

3. Tugas 2 — Build & Push Docker Image ke Amazon ECR
Tujuan

Membangun Docker Image aplikasi dan mempublikasikannya ke Amazon ECR.

ECR Repository

Repository:

alfianmi-bootcamp-app

Region:

ap-southeast-1

Repository bersifat private.

Image scanning:

Scan on Push = Enabled

ECR URI:

992382472679.dkr.ecr.ap-southeast-1.amazonaws.com/alfianmi-bootcamp-app
Endpoint /health

Endpoint aplikasi disesuaikan menjadi:

GET /health

Response:

{
  "status": "healthy",
  "week": 3
}

HTTP status:

200 OK

Unit test juga diperbarui untuk memverifikasi response tersebut.

Docker Build

Dockerfile menggunakan multi-stage build.

Build image:

docker build -t alfianmi-bootcamp-app:latest .

Untuk mengurangi build context, dibuat .dockerignore yang mengecualikan file/folder yang tidak diperlukan seperti:

node_modules
.git
.github
infra/.terraform
terraform.tfstate
*.tfplan
npm-debug.log

Sebelum optimasi:

Build context: 886.9 MB

Setelah optimasi:

Build context: 312.3 KB

Hasil image lokal setelah optimasi:

~206 MB

Ukuran image yang tercatat di ECR sekitar:

~52 MB
Login ke ECR
aws ecr get-login-password \
  --region ap-southeast-1 | \
docker login \
  --username AWS \
  --password-stdin \
  992382472679.dkr.ecr.ap-southeast-1.amazonaws.com

Hasil:

Login Succeeded
Tag Image
docker tag \
  alfianmi-bootcamp-app:latest \
  992382472679.dkr.ecr.ap-southeast-1.amazonaws.com/alfianmi-bootcamp-app:latest
Push Image
docker push \
  992382472679.dkr.ecr.ap-southeast-1.amazonaws.com/alfianmi-bootcamp-app:latest

Image berhasil dipublikasikan ke ECR dengan tag:

latest
Image Scan

Scan ECR berhasil diselesaikan:

status: COMPLETE

Hasil scan:

{
  "findings": [],
  "findingSeverityCounts": {}
}

Artinya tidak ada finding vulnerability pada hasil scan image tersebut.

---

4. Tugas 3 — Deploy Aplikasi ke EC2 dari ECR
IAM Role

EC2 menggunakan IAM Role:

ec2-ecr-pull-role

Policy:

AmazonEC2ContainerRegistryPullOnly

Instance Profile:

ec2-ecr-pull-profile

Arsitektur IAM:

EC2
 │
 ▼
Instance Profile
 │
 ▼
ec2-ecr-pull-role
 │
 ▼
AmazonEC2ContainerRegistryPullOnly
 │
 ▼
Amazon ECR

EC2 tidak menggunakan AWS Access Key atau Secret Key yang di-hardcode.

Verifikasi IAM Role

AWS STS dari EC2:

aws sts get-caller-identity

Hasil:

{
  "Account": "992382472679",
  "Arn": "arn:aws:sts::992382472679:assumed-role/ec2-ecr-pull-role/i-01b69abd9160931b3"
}

Hal tersebut membuktikan EC2 menggunakan temporary credentials dari IAM Role.

Login ECR dari EC2
aws ecr get-login-password \
  --region ap-southeast-1 | \
docker login \
  --username AWS \
  --password-stdin \
  992382472679.dkr.ecr.ap-southeast-1.amazonaws.com

Hasil:

Login Succeeded
Pull Image
docker pull \
  992382472679.dkr.ecr.ap-southeast-1.amazonaws.com/alfianmi-bootcamp-app:latest

Image berhasil ditarik dari ECR.

Menjalankan Container
docker run -d \
  --name bootcamp-app \
  --restart unless-stopped \
  -p 80:3000 \
  992382472679.dkr.ecr.ap-southeast-1.amazonaws.com/alfianmi-bootcamp-app:latest

Mapping port:

EC2 Port 80
    ↓
Container Port 3000
Verifikasi Container
docker ps

Container berjalan dengan:

bootcamp-app
Up
0.0.0.0:80->3000/tcp
Verifikasi Endpoint

Dari EC2:

curl -i http://localhost/health

Hasil:

HTTP/1.1 200 OK

Response:

{
  "status": "healthy",
  "week": 3
}

Pengujian dari laptop melalui public IP EC2:

curl -i http://54.169.238.47/health

Hasil:

HTTP/1.1 200 OK

Response:

{
  "status": "healthy",
  "week": 3
}
---

5. Tugas 4 — Otomasi CI/CD Pipeline untuk AWS
Tujuan

Mengotomatisasi:

Build
→ Push ECR
→ Deploy EC2
→ Smoke Test
→ Release

setelah push ke branch main.

GitHub OIDC

Workflow menggunakan GitHub OIDC untuk autentikasi ke AWS.

IAM Role:

github-actions-ecr-deploy-role

GitHub OIDC Provider:

token.actions.githubusercontent.com

Audience:

sts.amazonaws.com

Trust policy dibatasi untuk repository dan branch main.

Subject:

repo:AlfianMI@94944686/web-week1@1335220245:ref:refs/heads/main

Pendekatan ini digunakan agar GitHub Actions tidak perlu menyimpan long-lived AWS Access Key dan Secret Key.

GitHub Secrets

Secret yang digunakan:

EC2_HOST
EC2_SSH_KEY

EC2_SSH_KEY berisi private key EC2 dan tidak disimpan di repository.

Workflow

Workflow berada pada:

.github/workflows/ci-cd.yml

Pipeline:

Lint & Test
     ↓
Security Scan
     ↓
Build & Push Docker Image to ECR
     ↓
Deploy to EC2
     ↓
Smoke Test
     ↓
Create GitHub Release
Lint & Test

Matrix Node.js:

18.x
20.x

Proses:

npm ci
npm run lint
npm test
Security Scan

Dependency security:

npm audit --audit-level=high

Container security:

Trivy
Severity: HIGH,CRITICAL
Build & Push

GitHub Actions menggunakan:

aws-actions/configure-aws-credentials
aws-actions/amazon-ecr-login
docker/setup-buildx-action
docker/build-push-action

Image dipush ke:

992382472679.dkr.ecr.ap-southeast-1.amazonaws.com/alfianmi-bootcamp-app:latest
Deployment

GitHub Actions melakukan SSH ke EC2 lalu:

Login ke ECR.
Pull image terbaru.
Menghapus container lama.
Menjalankan container baru.
Menjalankan docker image prune.

Container dijalankan dengan:

docker run -d \
  --name bootcamp-app \
  --restart unless-stopped \
  -p 80:3000 \
  <ECR_IMAGE>:latest
Smoke Test

Setelah deployment, pipeline menjalankan:

./scripts/smoke-test.sh "http://${EC2_HOST}/health"

Endpoint harus menghasilkan:

HTTP 200 OK
GitHub Release

Jika smoke test berhasil, pipeline membuat GitHub Release:

v1.0.<github_run_number>

---

6. Hasil Akhir CI/CD

Full pipeline berhasil dijalankan dengan seluruh job berhasil:

✅ Lint & Test - Node 18.x
✅ Lint & Test - Node 20.x
✅ Security Scan
✅ Build & Push Docker Image to ECR
✅ Deploy to EC2
✅ Smoke Test
✅ Create GitHub Release
---
