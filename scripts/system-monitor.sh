#!/bin/bash

LOG_FILE="/tmp/sys-monitor.log"

{
    echo "========================================"
    echo "System Monitor"
    echo "Execution Time: $(date)"
    echo "========================================"

    echo ""
    echo "Disk Usage (/):"

    disk_usage=$(df -h / | awk 'NR==2 {gsub("%","",$5); print $5}')

    echo "Current disk usage: ${disk_usage}%"

    if [ "$disk_usage" -gt 80 ]; then
        echo "[WARNING] Kapasitas Disk Kritis!"
    fi

    echo ""
    echo "Docker Service:"

    docker_status=$(systemctl is-active docker)

    echo "Docker status: $docker_status"

    if [ "$docker_status" != "active" ]; then
        echo "[WARNING] Docker service tidak berjalan!"
    fi

} | tee "$LOG_FILE"