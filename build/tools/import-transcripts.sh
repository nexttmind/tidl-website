#!/usr/bin/env bash
#
# Many TIDL transcripts are .docx by extension and plain UTF-8 underneath.
# This converts anything that is actually text into .md and leaves real
# Word files alone for manual handling.
#
# Usage: bash build/tools/import-transcripts.sh /path/to/source/dir
#

set -euo pipefail
SRC="${1:?usage: import-transcripts.sh <source dir>}"
DEST="reference/transcripts"
mkdir -p "$DEST"

shopt -s nullglob
for f in "$SRC"/*.docx "$SRC"/*.md "$SRC"/*.txt; do
  base=$(basename "$f")
  if file "$f" | grep -qi "text"; then
    out="$DEST/${base%.*}.md"
    cp "$f" "$out"
    echo "converted  $base"
  else
    echo "SKIP real docx, convert manually: $base"
  fi
done

echo
echo "Now rename to YYYY-MM-DD-participants.md so they sort chronologically."
