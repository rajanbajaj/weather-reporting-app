#!/bin/bash

# absolute path to your project root
PROJECT_DIR="/path/to/project"
NODE_PATH="/path/to/bin/node"

# CRON_JOB="* * * * * cd $PROJECT_DIR && $NODE_PATH --env-file=$PROJECT_DIR/config/.env $PROJECT_DIR/src/index.js start >> $PROJECT_DIR/logs/cron.log 2>&1"
CRON_JOB="0 0 * * 1 cd $PROJECT_DIR && $NODE_PATH --env-file=$PROJECT_DIR/config/.env $PROJECT_DIR/src/index.js start >> $PROJECT_DIR/logs/cron.log 2>&1"

# check if the cron job already exists
(crontab -l 2>/dev/null | grep -Fv "$CRON_JOB") | crontab -

echo "Cron job removed."