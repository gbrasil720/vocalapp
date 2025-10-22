# Amazon S3 Setup Guide for Audio Storage

This guide will walk you through setting up an Amazon S3 bucket to store audio files for transcription.

## Prerequisites

- An AWS account ([Sign up here](https://aws.amazon.com/))
- AWS CLI installed (optional, but recommended)

## Step 1: Create an S3 Bucket

1. **Log in to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Navigate to the S3 service

2. **Create a New Bucket**
   - Click "Create bucket"
   - Enter a unique bucket name (e.g., `your-app-transcriptions-prod`)
   - Choose a region close to your users (e.g., `us-east-1`)
   - Keep "Block all public access" **ENABLED** for security
   - Enable bucket versioning (optional but recommended)
   - Click "Create bucket"

## Step 2: Configure CORS (Cross-Origin Resource Sharing)

If you need to upload files directly from the browser, configure CORS:

1. Select your bucket
2. Go to the "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit" and add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Replace `https://your-domain.com` with your actual domain.

## Step 3: Create an IAM User for Programmatic Access

1. **Navigate to IAM**
   - Go to https://console.aws.amazon.com/iam/
   - Click "Users" in the left sidebar
   - Click "Create user"

2. **User Details**
   - User name: `transcription-app-s3-user`
   - Select "Programmatic access" (API access)
   - Click "Next"

3. **Set Permissions**
   - Select "Attach policies directly"
   - Click "Create policy"
   - Choose "JSON" tab and paste:

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

Replace `your-bucket-name` with your actual bucket name.

4. **Name and Create Policy**
   - Name: `TranscriptionS3Policy`
   - Description: `Allows read/write access to transcription bucket`
   - Click "Create policy"

5. **Attach Policy to User**
   - Go back to user creation
   - Refresh the policy list
   - Select `TranscriptionS3Policy`
   - Click "Next" and "Create user"

6. **Save Credentials**
   - **IMPORTANT**: Save the Access Key ID and Secret Access Key
   - You won't be able to see the secret key again
   - Store them securely

## Step 4: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=your-bucket-name

# Optional: Custom S3 endpoint (for S3-compatible services)
# AWS_S3_ENDPOINT=https://custom-endpoint.com
```

## Step 5: Production Security Best Practices

### Use IAM Roles Instead of Access Keys (Recommended for Production)

If deploying on AWS (EC2, ECS, Lambda):
1. Create an IAM role with the S3 policy
2. Attach the role to your compute resource
3. Remove `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from environment variables
4. The AWS SDK will automatically use the instance role

### Enable Bucket Encryption

1. Go to your S3 bucket
2. Navigate to "Properties" tab
3. Under "Default encryption", click "Edit"
4. Select "Server-side encryption with Amazon S3 managed keys (SSE-S3)"
5. Click "Save changes"

### Enable Logging

1. Create a separate bucket for logs (e.g., `your-app-logs`)
2. In your main bucket, go to "Properties"
3. Under "Server access logging", click "Edit"
4. Enable logging and select your logs bucket
5. Set a prefix like `s3-access-logs/`

### Set Lifecycle Rules

To automatically delete old files and save costs:

1. Go to your bucket's "Management" tab
2. Click "Create lifecycle rule"
3. Rule name: `delete-old-transcriptions`
4. Choose "Limit the scope using one or more filters"
5. Prefix: `transcriptions/`
6. Add action: "Expire current versions of objects"
7. Set days: 90 (or your preferred retention period)
8. Click "Create rule"

## Step 6: Cost Optimization

### Use S3 Intelligent-Tiering

1. Go to bucket "Properties"
2. Under "Default storage class", select "Intelligent-Tiering"
3. This automatically moves infrequently accessed files to cheaper storage

### Monitor Usage

1. Enable AWS Cost Explorer in billing console
2. Set up billing alerts:
   - Go to CloudWatch
   - Create alarm for "EstimatedCharges"
   - Set threshold (e.g., $10)
   - Add email notification

## Step 7: Testing

Test your configuration with the AWS CLI:

```bash
# List buckets
aws s3 ls

# Upload a test file
aws s3 cp test.mp3 s3://your-bucket-name/test/test.mp3

# Download the file
aws s3 cp s3://your-bucket-name/test/test.mp3 downloaded.mp3

# Delete the test file
aws s3 rm s3://your-bucket-name/test/test.mp3
```

## Troubleshooting

### Error: Access Denied

- Verify your IAM policy includes the correct bucket ARN
- Check that your access keys are correct
- Ensure the bucket region matches `AWS_REGION`

### Error: CORS Issues

- Verify CORS configuration includes your domain
- Check that `AllowedOrigins` matches your actual origin (including https://)
- Ensure `AllowedMethods` includes the methods you're using

### Error: SignatureDoesNotMatch

- Check your `AWS_SECRET_ACCESS_KEY` is correct
- Verify there are no extra spaces in environment variables
- Ensure your system time is synchronized (AWS requires time accuracy)

## Alternative: S3-Compatible Services

This setup also works with S3-compatible services:

### Cloudflare R2
- No egress fees
- S3-compatible API
- Set `AWS_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`

### DigitalOcean Spaces
- Simple pricing
- Set `AWS_S3_ENDPOINT=https://<region>.digitaloceanspaces.com`

### Backblaze B2
- Lowest storage costs
- Set `AWS_S3_ENDPOINT=https://s3.<region>.backblazeb2.com`

## Summary

You should now have:
- ✅ An S3 bucket configured for audio storage
- ✅ IAM user with appropriate permissions
- ✅ Access credentials in your environment variables
- ✅ Security best practices enabled
- ✅ Cost optimization configured

Your application is now ready to use S3 for audio storage!

