# Quick Start: Setting Up S3 Storage

This is a streamlined guide to get S3 storage working quickly. For detailed instructions, see [S3_SETUP.md](./S3_SETUP.md).

## 1. Install Dependencies

```bash
npm install
# or
bun install
```

This will install the required AWS SDK packages.

## 2. Create S3 Bucket (AWS Console)

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. Enter a unique name: `your-app-transcriptions-prod`
4. Choose region: `us-east-1` (or closest to your users)
5. Keep "Block all public access" **enabled**
6. Click "Create bucket"

## 3. Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Create user"
3. Username: `transcription-app-s3-user`
4. Click "Next"

### Create Policy

5. Click "Attach policies directly" → "Create policy"
6. Select "JSON" tab
7. Paste this policy (replace `your-bucket-name`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

8. Name it: `TranscriptionS3Policy`
9. Create policy and attach to user

### Get Access Keys

10. After creating user, go to "Security credentials"
11. Click "Create access key"
12. Choose "Application running outside AWS"
13. **Save the Access Key ID and Secret Access Key** (you won't see them again!)

## 4. Set Environment Variables

Create or update `.env.local`:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=your-app-transcriptions-prod
```

Replace with your actual values!

## 5. Test Connection

### Using AWS CLI (Optional)

```bash
# Configure AWS CLI
aws configure

# Test connection
aws s3 ls s3://your-bucket-name/

# Upload test file
echo "test" > test.txt
aws s3 cp test.txt s3://your-bucket-name/test/
aws s3 rm s3://your-bucket-name/test/test.txt
```

### Using Your App

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
# Log in and upload a test audio file
```

## 6. Verify Upload

Check your S3 bucket:

```bash
aws s3 ls s3://your-bucket-name/transcriptions/ --recursive
```

Or in AWS Console:
1. Go to S3 bucket
2. Navigate to `transcriptions/` folder
3. You should see your uploaded file

## 7. Deploy to Production

### Set Environment Variables

In your hosting provider dashboard, add:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`

### Deploy

```bash
# Deploy (depending on your platform)
vercel --prod
# or
git push railway main
# or
git push heroku main
```

## Common Issues

### "Cannot find module '@aws-sdk/client-s3'"
**Solution:** Run `npm install` to install dependencies

### "Access Denied" when uploading
**Solution:** 
- Check IAM policy has `s3:PutObject` permission
- Verify bucket name matches `AWS_S3_BUCKET_NAME`
- Ensure access keys are correct

### "Bucket not found"
**Solution:**
- Verify bucket name is correct in environment variables
- Check bucket region matches `AWS_REGION`

### Files upload but can't download
**Solution:**
- For private buckets, the app uses signed URLs automatically
- Check IAM policy includes `s3:GetObject`

## Alternative: Use Cloudflare R2 (No Egress Fees)

Cloudflare R2 is S3-compatible with zero egress fees:

1. Create R2 bucket at [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Get API token and endpoint
3. Set environment variables:

```env
AWS_REGION=auto
AWS_ACCESS_KEY_ID=your_r2_access_key
AWS_SECRET_ACCESS_KEY=your_r2_secret_key
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

## Next Steps

- [ ] Set up S3 lifecycle rules to delete old files
- [ ] Enable S3 bucket encryption
- [ ] Set up CloudWatch billing alerts
- [ ] Configure S3 access logs
- [ ] Review security best practices in [S3_SETUP.md](./S3_SETUP.md)

## Done! 🎉

Your app is now using S3 for audio storage. All uploads will be stored in your S3 bucket.

---

**Need more details?**
- [Complete S3 Setup Guide](./S3_SETUP.md)
- [Environment Variables Reference](./ENVIRONMENT_VARIABLES.md)
- [Migration from Vercel Blob](./MIGRATION_VERCEL_BLOB_TO_S3.md)

