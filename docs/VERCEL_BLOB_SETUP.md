# Vercel Blob Setup Guide

This guide will help you set up Vercel Blob for storing audio files.

## Prerequisites

A Vercel account (free tier works fine for development)

## Step 1: Create a Blob Store

1. Go to your Vercel dashboard
2. Navigate to Storage tab
3. Click "Create Database"
4. Select "Blob" storage
5. Choose a name for your store (e.g., "audio-transcriptions")
6. Click "Create"

## Step 2: Get Your Token

After creating the Blob store:

1. Click on your newly created Blob store
2. Go to the ".env.local" tab
3. Copy the `BLOB_READ_WRITE_TOKEN` value

## Step 3: Configure Environment Variables

Add to your `.env.local` file:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

## Step 4: Deploy

For production:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add `BLOB_READ_WRITE_TOKEN` with your production token
4. Redeploy your application

## Features

- Automatic CDN distribution
- Built-in security
- Simple API
- No additional configuration needed
- Works seamlessly with Vercel deployments

## Usage

The application automatically uses Vercel Blob for all file uploads. No code changes needed.

## Pricing

- Free tier: 500MB storage, 1GB bandwidth
- Pro tier: Pay as you grow

Check current pricing at: https://vercel.com/docs/storage/vercel-blob/usage-and-pricing

## Migration from S3

If you have existing files in S3, use the migration script:

```bash
bun run scripts/migrate-s3-to-blob.ts
```

This will:

- Download all files from S3
- Upload them to Vercel Blob
- Update database records
- Preserve all metadata

## Troubleshooting

### Error: "Failed to upload to Vercel Blob"

Check that:

1. Your `BLOB_READ_WRITE_TOKEN` is set correctly
2. The token has read/write permissions
3. You haven't exceeded your storage quota

### Error: "Token invalid"

1. Verify the token is complete (they're quite long)
2. Check for extra spaces or newlines
3. Generate a new token if needed

## Support

For Vercel Blob specific issues, refer to: https://vercel.com/docs/storage/vercel-blob
