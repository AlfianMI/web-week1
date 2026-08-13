Docker Multi-Stage Build
Deskripsi

Dokumentasi ini menjelaskan proses containerisasi aplikasi Node.js menggunakan Docker Multi-Stage Build.

Tujuan dari implementasi ini adalah membuat Docker image yang:

Menggunakan base image resmi Node.js berbasis Alpine.
Memisahkan tahap instalasi dependency dengan production runtime.
Menggunakan dependency production saja.
Menjalankan aplikasi menggunakan user non-root.
Mengurangi ukuran final image.
Struktur

File yang digunakan untuk Tugas 2:

.
├── Dockerfile
├── .dockerignore
├── package.json
├── package-lock.json
└── src/
Dockerfile

Dockerfile menggunakan dua stage.

Stage 1 — Dependencies

Stage pertama menggunakan:

FROM node:18-alpine AS dependencies

Pada tahap ini package.json dan package-lock.json disalin ke image, kemudian dependency production di-install menggunakan:

RUN npm ci --omit=dev
Stage 2 — Production

Stage kedua kembali menggunakan:

FROM node:18-alpine

Dependency dari stage pertama disalin menggunakan:

COPY --from=dependencies /app/node_modules ./node_modules

Kemudian source code aplikasi disalin ke image.

Image production menggunakan:

ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "src/server.js"]

Dengan USER node, aplikasi tidak dijalankan sebagai root.

.dockerignore

File .dockerignore digunakan untuk mencegah file yang tidak diperlukan masuk ke Docker build context.

File yang diabaikan:

node_modules/
.git/
.env
*.log
npm-debug.log*
.DS_Store
coverage/

Hal ini mencegah dependency dari host, file Git, environment file, dan log ikut masuk ke image.

Build Image

Build image dengan tag:

docker build -t devops-week1-app:v1.0 .
Verifikasi Image

Lihat image:

docker images devops-week1-app:v1.0

Ukuran image juga dapat diperiksa dengan:

docker image inspect devops-week1-app:v1.0 --format '{{.Size}}' | numfmt --to=iec

Hasil implementasi saat pengujian menunjukkan ukuran image sekitar:

44 MB

yang berada di bawah batas 150 MB yang ditentukan dalam tugas.

Verifikasi Non-Root User

Untuk memastikan container menggunakan user non-root:

docker run --rm devops-week1-app:v1.0 whoami

Hasil:

node

Hal ini menunjukkan bahwa aplikasi dijalankan menggunakan user node, bukan root.
