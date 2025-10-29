#!/bin/bash

# This script helps format your Firebase private key correctly for .env.local

echo "=========================================="
echo "Firebase Private Key Formatter"
echo "=========================================="
echo ""
echo "1. Open your Firebase service account JSON file"
echo "2. Copy the ENTIRE 'private_key' value (including BEGIN and END lines)"
echo "3. Paste it below when prompted"
echo ""
echo "This script will format it correctly for .env.local"
echo ""
echo "Press Ctrl+C to cancel, or press Enter to continue..."
read

echo ""
echo "Paste your private key (including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)"
echo "Then press Enter twice:"
echo ""

# Read multiline input
private_key=""
while IFS= read -r line; do
    [[ -z "$line" ]] && break
    private_key+="$line"$'\n'
done

# Remove trailing newline
private_key="${private_key%$'\n'}"

# Escape for .env format (convert actual newlines to \n)
formatted_key=$(echo "$private_key" | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')

echo ""
echo "=========================================="
echo "FORMATTED KEY (copy this to .env.local):"
echo "=========================================="
echo ""
echo "FIREBASE_ADMIN_PRIVATE_KEY=\"$formatted_key\""
echo ""
echo "=========================================="
echo "Copy the line above and paste it into your .env.local file"
echo "(replacing the existing FIREBASE_ADMIN_PRIVATE_KEY line)"
echo "=========================================="

