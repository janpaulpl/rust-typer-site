#!/bin/bash

# Define the data directory
DATA_DIR="./assets/data"

# Check if the directory exists
if [ ! -d "$DATA_DIR" ]; then
  echo "Error: Directory $DATA_DIR does not exist."
  exit 1
fi

# Generate the list of all files, excluding files.json
echo "{ \"files\": [" > "$DATA_DIR/files.json"

# List all files, excluding files.json, and remove the path prefix
find "$DATA_DIR" -type f ! -name 'files.json' -exec basename {} \; | sed 's/.*/"&"/' | paste -sd "," - >> "$DATA_DIR/files.json"

echo "] }" >> "$DATA_DIR/files.json"

echo "files.json generated with the following files:"
cat "$DATA_DIR/files.json"
