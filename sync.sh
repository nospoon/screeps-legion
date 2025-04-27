#!/usr/bin/env zsh
set -euo pipefail

########################################
# Copy all files from the current directory
# to the Screeps scripts folder on Windows.
#
# Usage (from project root):
#   ./copy_to_windows.sh
#
# Requirements:
#   - WSL (Windows Subsystem for Linux)
#   - rsync (sudo apt install rsync)
########################################

# Windows-style destination (edit if needed)
WIN_DEST='C:\Users\mikol\AppData\Local\Screeps\scripts\127_0_0_1___21025\default'

# Convert to a Linux path understood by WSL
DEST="$(wslpath -u "$WIN_DEST")"

echo "Syncing $(pwd)  -->  $DEST"
printf '---------------------------------------------\n'

# Create destination directory if it doesn't exist
mkdir -p "$DEST"

# Mirror current directory to Windows folder.
# --delete   : remove files in DEST that no longer exist in source
# --exclude  : skip VCS and editor artefacts; add more as needed
rsync -av --delete \
      --exclude '.git/' \
      --exclude '*.swp' \
      --exclude '*.swo' \
      --exclude 'sync.sh' \
      ./ "$DEST/"

printf '---------------------------------------------\n'
echo "Done."
