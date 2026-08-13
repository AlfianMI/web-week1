Scripts

Folder ini berisi script automation dan monitoring untuk project.

System Monitor

system-monitor.sh digunakan untuk memonitor kondisi dasar server host, meliputi:

Tanggal dan waktu eksekusi.
Penggunaan disk pada root partition /.
Peringatan jika penggunaan disk melebihi 80%.
Status service Docker.
Menjalankan Script

Pastikan script memiliki permission executable:

chmod +x scripts/system-monitor.sh

Jalankan script dengan:

./scripts/system-monitor.sh
Log

Output monitoring juga disimpan ke:

/tmp/sys-monitor.log

Untuk melihat log:

cat /tmp/sys-monitor.log
