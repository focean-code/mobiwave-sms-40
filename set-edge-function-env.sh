#!/bin/bash

echo "🔑 Setting Edge Function Environment Variables..."

PROJECT_REF="bhnjecmsalnqxgociwuk"

# Generate a base64 encryption key for API key encryption (32 bytes = 256 bits)
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "Generated encryption key: $ENCRYPTION_KEY"

echo "Setting environment variables..."

# Set the encryption key
export SUPABASE_ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobmplY21zYWxucXhnb2Npd3VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgyMDQyNywiZXhwIjoyMDYyMzk2NDI3fQ.vwSjIzVcsvbYUy6ml978U3djmslJwaCd5a-fPG4eW2w"

npx supabase secrets set API_KEY_ENCRYPTION_KEY_B64="$ENCRYPTION_KEY" --project-ref "$PROJECT_REF"

if [ $? -eq 0 ]; then
    echo "✅ Environment variables set successfully!"
    echo "🔄 Edge functions should now work properly."
    echo ""
    echo "💡 Test the functions again using the debugger in the UI."
else
    echo "❌ Failed to set environment variables"
    exit 1
fi
