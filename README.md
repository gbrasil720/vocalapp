This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Audio Transcription App

A powerful web application for transcribing audio files using OpenAI's Whisper API, with credit-based billing and subscription management.

## Features

- 🎙️ Audio transcription using OpenAI Whisper
- 💳 Credit-based billing system
- 📦 Amazon S3 storage for audio files
- 🔐 Authentication with Google OAuth
- 💰 Stripe integration for payments
- 📊 User dashboard with transcription history
- ⚡ Real-time transcription processing

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (e.g., Neon, Supabase)
- AWS account with S3 bucket
- OpenAI API key
- Stripe account
- Google OAuth credentials

## Storage Configuration

This application uses **Amazon S3** (or S3-compatible services) for storing audio files.

### Setting up S3

Follow the comprehensive guide in [`docs/S3_SETUP.md`](./docs/S3_SETUP.md) for:
- Creating an S3 bucket
- Configuring IAM permissions
- Setting up security best practices
- Cost optimization strategies
- Alternative S3-compatible services (Cloudflare R2, DigitalOcean Spaces, etc.)

### Environment Variables

See [`docs/ENVIRONMENT_VARIABLES.md`](./docs/ENVIRONMENT_VARIABLES.md) for a complete list of required environment variables.

Quick setup - create a `.env.local` file with:

```env
# Database
DATABASE_URL=your_database_url

# Authentication
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=your-bucket-name

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Set up Database

```bash
npm run db:push
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
app/
├── (auth)/          # Authentication pages
├── api/             # API routes
│   ├── transcriptions/  # Transcription endpoints
│   ├── credits/         # Credit management
│   └── billing/         # Stripe billing
├── dashboard/       # User dashboard
└── page.tsx        # Landing page

lib/
├── storage/        # S3 storage utilities
├── transcription/  # Transcription processing
├── credits/        # Credit system
└── billing/        # Stripe integration

components/
├── ui/             # UI components
└── sections/       # Landing page sections
```

## Key Features

### Transcription

- Supports multiple audio formats (MP3, M4A, WAV, WEBM, FLAC, OGG, MP4)
- Maximum file size: 25MB
- Automatic credit deduction based on duration
- Real-time processing status

### Credit System

- Pay-as-you-go pricing: 1 credit per minute
- Credit packages available
- Automatic refunds for failed transcriptions

### Subscription Plans

- **Free:** 10 credits/month
- **Pro:** Unlimited credits + multiple file uploads

## API Endpoints

- `POST /api/transcriptions/upload` - Upload audio files
- `GET /api/transcriptions` - List user's transcriptions
- `GET /api/transcriptions/[id]` - Get specific transcription
- `POST /api/transcriptions/process` - Process transcription (internal)
- `GET /api/credits/balance` - Get credit balance
- `POST /api/credits/checkout` - Purchase credits

## Development

### Database Migrations

```bash
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
```

### Testing S3 Configuration

```bash
# Test AWS credentials
aws s3 ls s3://your-bucket-name/

# Upload test file
aws s3 cp test.mp3 s3://your-bucket-name/test/
```

## Migration from Vercel Blob

If you're migrating from Vercel Blob:

1. **Set up S3** - Follow [`docs/S3_SETUP.md`](./docs/S3_SETUP.md)
2. **Update environment variables** - Remove `BLOB_READ_WRITE_TOKEN`, add AWS variables
3. **Install dependencies** - Run `npm install` (AWS SDK is already in package.json)
4. **Deploy** - The code is already updated to use S3

The migration is complete! All new uploads will use S3. Existing files in Vercel Blob will remain accessible via their URLs.

## Deployment

### Environment Variables

Set these in your hosting provider:
- All variables from `.env.local`
- Use production values for Stripe, OpenAI, etc.

### Recommended Platforms

- **Vercel** - Zero-config deployment
- **Railway** - Easy environment management
- **AWS Amplify** - Native AWS integration
- **Fly.io** - Global edge deployment

### Post-Deployment Checklist

- ✅ Database migrations applied
- ✅ S3 bucket configured and accessible
- ✅ Stripe webhooks configured
- ✅ OpenAI API key has credits
- ✅ OAuth redirect URLs updated
- ✅ Environment variables set

## Troubleshooting

See [`docs/ENVIRONMENT_VARIABLES.md`](./docs/ENVIRONMENT_VARIABLES.md#troubleshooting) for common issues and solutions.

## Documentation

- [S3 Setup Guide](./docs/S3_SETUP.md)
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)

## Tech Stack

- **Framework:** Next.js 15
- **Database:** PostgreSQL + Drizzle ORM
- **Authentication:** Better Auth
- **Payments:** Stripe
- **Storage:** Amazon S3
- **AI:** OpenAI Whisper
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Stripe Documentation](https://stripe.com/docs)
