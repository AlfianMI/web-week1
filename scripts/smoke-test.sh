#!/bin/bash
# scripts/smoke-test.sh

TARGET_URL=${1:-"http://localhost:3000/health"}
MAX_RETRIES=5
COUNT=0

echo "Memulai Smoke Test pada $TARGET_URL..."

while [ $COUNT -lt $MAX_RETRIES ]; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL")
  
  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "[SUCCESS] Service merespons dengan HTTP Status 200 OK."
    exit 0
  fi

  echo "[WAIT] HTTP Status: $HTTP_STATUS. Mencoba kembali dalam 5 detik... ($((COUNT+1))/$MAX_RETRIES)"
  sleep 5
  COUNT=$((COUNT+1))
done

echo "[CRITICAL] Smoke Test Gagal! Aplikasi tidak merespons dengan benar."
exit 1
