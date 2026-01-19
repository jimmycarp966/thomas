# Deployment Guide - ZenTrade AI

This guide covers the deployment of the ZenTrade AI application across multiple platforms.

## Prerequisites

- Node.js 18+ installed
- Python 3.11+ installed
- Supabase account
- Google Cloud account
- Vercel account
- Binance API credentials (optional)
- IOL Argentina API credentials (optional)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_LOCATION=us-central1

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Deployment Steps

### 1. Setup Supabase

1. Create a new Supabase project
2. Run the SQL migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_vector_search.sql`
   - `supabase/migrations/003_rls_policies.sql`
3. Enable the `vector` extension in your Supabase database
4. Get your Supabase URL and API keys

### 2. Deploy to Vercel (Frontend)

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Deploy to Vercel
vercel deploy
```

Or connect your GitHub repository to Vercel for automatic deployments.

### 3. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your_project_ref

# Deploy Edge Functions
supabase functions deploy analyze-markets
```

### 4. Deploy Google Cloud Functions

```bash
# Navigate to the Google Cloud Functions directory
cd google-cloud-functions

# Install dependencies
pip install -r requirements.txt

# Deploy functions
gcloud functions deploy analyze-trading-signal \
  --runtime python311 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point analyze_trading_signal \
  --memory 512MB \
  --timeout 300s

gcloud functions deploy execute-trade \
  --runtime python311 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point execute_trade \
  --memory 512MB \
  --timeout 300s

gcloud functions deploy monitor-positions \
  --runtime python311 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point monitor_positions \
  --memory 256MB \
  --timeout 300s
```

### 5. Setup Cron Jobs

For Supabase Edge Functions, use the Supabase Dashboard to schedule cron jobs:

1. Go to Edge Functions in Supabase Dashboard
2. Click on `analyze-markets` function
3. Schedule it to run every hour

For Google Cloud Functions, use Cloud Scheduler:

```bash
gcloud scheduler jobs create http analyze-markets-hourly \
  --schedule "0 * * * *" \
  --http-method POST \
  --uri https://your-region-your-project.cloudfunctions.net/analyze-trading-signal \
  --time-zone "America/Argentina/Buenos_Aires"

gcloud scheduler jobs create http monitor-positions-5min \
  --schedule "*/5 * * * *" \
  --http-method POST \
  --uri https://your-region-your-project.cloudfunctions.net/monitor-positions \
  --time-zone "America/Argentina/Buenos_Aires"
```

### 6. Configure Trading APIs

In the application settings page, add your API credentials:

- **Binance**: API Key and API Secret
- **IOL Argentina**: API Key and API Secret

## Verification

1. Access the application at your Vercel URL
2. Login with your credentials
3. Navigate to the Dashboard
4. Verify that all components load correctly
5. Test the AI Chat functionality
6. Check the Wellness Tracker
7. Configure your trading settings

## Monitoring

### Vercel
- Monitor deployment status in Vercel Dashboard
- Check logs for any errors

### Supabase
- Monitor database performance in Supabase Dashboard
- Check Edge Function logs
- Monitor Realtime subscriptions

### Google Cloud
- Monitor Cloud Functions in Google Cloud Console
- Check Cloud Scheduler jobs
- Review Cloud Logging

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed
- Check that Node.js version is 18+
- Verify environment variables are set correctly

### Database Connection Issues
- Verify Supabase URL and API keys
- Check RLS policies
- Ensure database migrations were applied

### AI Analysis Not Working
- Verify Google Cloud Project ID
- Check Vertex AI API is enabled
- Review Cloud Function logs

### Trading API Errors
- Verify API credentials are correct
- Check API permissions
- Ensure IP whitelist includes your deployment IPs

## Security Considerations

1. Never commit `.env` files to version control
2. Use environment variables for all sensitive data
3. Enable RLS policies in Supabase
4. Use service role keys only in server-side code
5. Implement rate limiting for API calls
6. Monitor for suspicious activity

## Backup and Recovery

### Database Backups
- Enable automatic backups in Supabase
- Regularly export database schema and data

### Code Backups
- Use Git for version control
- Tag releases
- Maintain feature branches

## Scaling

### Vercel
- Automatic scaling included
- Configure domain settings
- Set up custom domains

### Supabase
- Upgrade plan as needed
- Monitor database size
- Optimize queries

### Google Cloud
- Adjust function memory and timeout
- Scale Cloud Functions instances
- Monitor costs

## Support

For issues or questions:
- Check the documentation
- Review logs in respective dashboards
- Contact support for the respective platforms
