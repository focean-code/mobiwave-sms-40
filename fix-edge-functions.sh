#!/bin/bash

# Fix Edge Functions Script
echo "🔧 Fixing Supabase Edge Functions..."

# Set the access token
export SUPABASE_ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobmplY21zYWxucXhnb2Npd3VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgyMDQyNywiZXhwIjoyMDYyMzk2NDI3fQ.vwSjIzVcsvbYUy6ml978U3djmslJwaCd5a-fPG4eW2w"

PROJECT_REF="bhnjecmsalnqxgociwuk"

# Critical edge functions for mspace integration
FUNCTIONS=(
    "mspace-accounts"
    "mspace-balance" 
    "mspace-proxy"
)

echo "📦 Deploying critical edge functions..."

for func in "${FUNCTIONS[@]}"; do
    echo "🚀 Deploying $func..."
    
    if npx supabase functions deploy "$func" --project-ref "$PROJECT_REF"; then
        echo "✅ $func deployed successfully!"
    else
        echo "❌ Failed to deploy $func"
        exit 1
    fi
    
    sleep 2
done

echo "🔑 Setting required environment variables..."

# Set the encryption key environment variable for edge functions
if npx supabase secrets set API_KEY_ENCRYPTION_KEY_B64="Q1J5cHRvS2V5Zm9yQVBJa2V5RW5jcnlwdGlvbjEyMzQ1Njc4OTA=" --project-ref "$PROJECT_REF"; then
    echo "✅ API_KEY_ENCRYPTION_KEY_B64 set successfully!"
else
    echo "❌ Failed to set API_KEY_ENCRYPTION_KEY_B64"
    exit 1
fi

echo "🧪 Testing edge functions..."

# Test mspace-balance function
echo "Testing mspace-balance function..."
curl -s "https://$PROJECT_REF.supabase.co/functions/v1/mspace-balance" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobmplY21zYWxucXhnb2Npd3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjA0MjcsImV4cCI6MjA2MjM5NjQyN30.5pAIzKeSeIR3zC8DnccQBTh8hQuhU09NCgH4H8xnMt8" \
  -H "Content-Type: application/json"

echo ""
echo "✅ Edge functions deployment complete!"
echo "🔄 Please refresh your browser to test the fixes."
