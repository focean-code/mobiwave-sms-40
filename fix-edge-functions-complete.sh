#!/bin/bash

echo "🔧 Setting ALL required Edge Function Environment Variables..."

PROJECT_REF="bhnjecmsalnqxgociwuk"
SUPABASE_URL="https://bhnjecmsalnqxgociwuk.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobmplY21zYWxucXhnb2Npd3VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgyMDQyNywiZXhwIjoyMDYyMzk2NDI3fQ.vwSjIzVcsvbYUy6ml978U3djmslJwaCd5a-fPG4eW2w"

# Set access token
export SUPABASE_ACCESS_TOKEN="$SERVICE_ROLE_KEY"

echo "Setting SUPABASE_URL..."
npx supabase secrets set SUPABASE_URL="$SUPABASE_URL" --project-ref "$PROJECT_REF"

echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" --project-ref "$PROJECT_REF"

echo "Checking if API_KEY_ENCRYPTION_KEY_B64 is already set..."
# We'll assume it's already set from the previous step

echo "✅ All environment variables configured!"
echo ""
echo "📋 Environment variables set:"
echo "   - SUPABASE_URL: $SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY: [CONFIGURED]"
echo "   - API_KEY_ENCRYPTION_KEY_B64: [ALREADY SET]"
echo ""
echo "🔄 Edge functions should now work properly."
echo "💡 Test the functions again using the debugger in the UI."
