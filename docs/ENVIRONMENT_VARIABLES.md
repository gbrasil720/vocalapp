# Environment Variables Configuration

This document describes all environment variables required for the application to run properly.

## Database

### DATABASE_URL
- **Required:** Yes
- **Description:** PostgreSQL connection string
- **Example:** `postgresql://user:password@host:5432/database`
- **Provider:** Neon, Supabase, or any PostgreSQL database

## Authentication

### BETTER_AUTH_SECRET
- **Required:** Yes
- **Description:** Secret key for session encryption
- **Example:** Generate with: `openssl rand -base64 32`
- **Note:** Keep this secret and never commit to version control

### BETTER_AUTH_URL
- **Required:** Yes
- **Description:** The base URL of your application
- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com`

### GOOGLE_CLIENT_ID
- **Required:** Yes (if using Google OAuth)
- **Description:** Google OAuth client ID
- **Setup:** https://console.cloud.google.com/apis/credentials

### GOOGLE_CLIENT_SECRET
- **Required:** Yes (if using Google OAuth)
- **Description:** Google OAuth client secret
- **Setup:** https://console.cloud.google.com/apis/credentials

## Payments

### STRIPE_SECRET_KEY
- **Required:** Yes
- **Description:** Stripe secret key for API calls
- **Development:** `sk_test_...`
- **Production:** `sk_live_...`
- **Setup:** https://dashboard.stripe.com/apikeys

### STRIPE_WEBHOOK_SECRET
- **Required:** Yes
- **Description:** Stripe webhook signing secret
- **Example:** `whsec_...`
- **Setup:** https://dashboard.stripe.com/webhooks

### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- **Required:** Yes
- **Description:** Stripe publishable key (safe to expose in client)
- **Development:** `pk_test_...`
- **Production:** `pk_live_...`

## AI Services

### OPENAI_API_KEY
- **Required:** Yes
- **Description:** OpenAI API key for Whisper transcription
- **Example:** `sk-proj-...`
- **Setup:** https://platform.openai.com/api-keys
- **Note:** Ensure you have credits in your OpenAI account

## Storage (Amazon S3)

### AWS_REGION
- **Required:** Yes
- **Description:** AWS region where your S3 bucket is located
- **Example:** `us-east-1`, `us-west-2`, `eu-west-1`
- **Default:** `us-east-1`

### AWS_ACCESS_KEY_ID
- **Required:** Yes
- **Description:** AWS IAM access key ID
- **Example:** `AKIAIOSFODNN7EXAMPLE`
- **Setup:** See [S3_SETUP.md](./S3_SETUP.md) for detailed instructions
- **Security:** Keep this secret and never commit to version control

### AWS_SECRET_ACCESS_KEY
- **Required:** Yes
- **Description:** AWS IAM secret access key
- **Example:** `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
- **Setup:** See [S3_SETUP.md](./S3_SETUP.md) for detailed instructions
- **Security:** Keep this secret and never commit to version control

### AWS_S3_BUCKET_NAME
- **Required:** Yes
- **Description:** Name of your S3 bucket for storing audio files
- **Example:** `my-app-transcriptions-prod`
- **Setup:** See [S3_SETUP.md](./S3_SETUP.md) for detailed instructions

### AWS_S3_ENDPOINT
- **Required:** No
- **Description:** Custom S3 endpoint for S3-compatible services
- **Use Cases:**
  - Cloudflare R2: `https://<account-id>.r2.cloudflarestorage.com`
  - DigitalOcean Spaces: `https://<region>.digitaloceanspaces.com`
  - Backblaze B2: `https://s3.<region>.backblazeb2.com`
- **Note:** Leave empty for standard AWS S3

## Application

### NEXT_PUBLIC_URL
- **Required:** Yes
- **Description:** Public URL of your application (used for callbacks and webhooks)
- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com`
- **Note:** Must match your actual domain

## Setup Instructions

### Development (.env.local)

1. Create a `.env.local` file in the root directory
2. Copy the template below and fill in your values:

```env
# Database
DATABASE_URL=your_database_url

# Better Auth
BETTER_AUTH_SECRET=generate_with_openssl_rand_base64_32
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# OpenAI
OPENAI_API_KEY=sk-proj-your_key

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your-bucket-name

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

### Production

For production deployments, set these environment variables in your hosting provider's dashboard:

- **Vercel:** Settings → Environment Variables
- **Netlify:** Site settings → Environment variables
- **AWS/Docker:** Use AWS Secrets Manager or environment files
- **Railway:** Settings → Variables

### Security Best Practices

1. **Never commit secrets to version control**
   - Add `.env.local` to `.gitignore`
   - Use `.env.example` for template without secrets

2. **Use different keys for development and production**
   - Use test/sandbox keys in development
   - Use live/production keys only in production

3. **Rotate secrets regularly**
   - Change API keys periodically
   - Update immediately if compromised

4. **Use IAM roles in production (AWS)**
   - Instead of access keys, use IAM roles for EC2/ECS/Lambda
   - More secure and easier to manage

5. **Limit IAM permissions**
   - Follow principle of least privilege
   - Grant only necessary S3 permissions

## Validation

To check if your environment variables are set correctly:

```bash
# Check database connection
npm run db:push

# Check Stripe configuration
npm run stripe:check

# Test S3 upload (requires custom script)
# See scripts/test-s3-upload.ts
```

## Troubleshooting

### Database connection fails
- Verify `DATABASE_URL` is correct
- Check if database server is running
- Ensure firewall allows connections

### Authentication errors
- Verify `BETTER_AUTH_SECRET` is set
- Check `BETTER_AUTH_URL` matches your domain
- Ensure OAuth credentials are correct

### Stripe webhook errors
- Verify `STRIPE_WEBHOOK_SECRET` matches your webhook
- Check webhook URL in Stripe dashboard
- Ensure webhook is not blocked by firewall

### S3 upload fails
- Verify all AWS credentials are correct
- Check IAM permissions include S3 PutObject
- Ensure bucket name and region are correct
- Test with AWS CLI: `aws s3 ls s3://your-bucket-name/`

### OpenAI API errors
- Verify `OPENAI_API_KEY` is valid
- Check you have sufficient credits
- Ensure API key has proper permissions

## Migration from Vercel Blob

If you're migrating from Vercel Blob storage:

1. **Remove old environment variables:**
   - `BLOB_READ_WRITE_TOKEN`

2. **Add new S3 variables:**
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET_NAME`

3. **Follow the S3 setup guide:**
   - See [S3_SETUP.md](./S3_SETUP.md) for complete instructions

4. **Migrate existing files (optional):**
   - Create a script to copy files from Vercel Blob to S3
   - Update database records with new S3 URLs

5. **Remove Vercel Blob dependency:**
   - Run: `npm uninstall @vercel/blob`
   - Remove from code imports

## Additional Resources

- [S3 Setup Guide](./S3_SETUP.md)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

