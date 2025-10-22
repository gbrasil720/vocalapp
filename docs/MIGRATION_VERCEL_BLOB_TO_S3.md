# Migration Guide: Vercel Blob to Amazon S3

This guide will help you migrate your audio transcription app from Vercel Blob storage to Amazon S3.

## Why Migrate to S3?

### Advantages of S3

- ✅ **Cost-effective** - Pay only for what you use, often cheaper at scale
- ✅ **No vendor lock-in** - Works with any hosting provider
- ✅ **Better control** - Fine-grained IAM permissions and policies
- ✅ **S3-compatible alternatives** - Can use Cloudflare R2, DigitalOcean Spaces, Backblaze B2
- ✅ **Advanced features** - Lifecycle policies, versioning, encryption
- ✅ **Global availability** - Choose regions closest to your users

### When to Consider Vercel Blob

- Small projects with low storage needs (<100GB)
- Deploying exclusively on Vercel
- Want zero-configuration setup
- Don't need advanced storage features

## Migration Steps

### 1. Set Up Amazon S3

Follow the comprehensive setup guide: [S3_SETUP.md](./S3_SETUP.md)

Quick checklist:
- [ ] Create S3 bucket
- [ ] Create IAM user with S3 permissions
- [ ] Save access credentials
- [ ] Configure bucket security and CORS
- [ ] Test connection with AWS CLI

### 2. Update Environment Variables

#### Remove (if you had these)
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

#### Add
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=your-app-transcriptions-prod

# Optional: For S3-compatible services
# AWS_S3_ENDPOINT=https://account-id.r2.cloudflarestorage.com
```

### 3. Update Dependencies

The migration is already complete in the codebase! But if you're doing it manually:

#### Remove Vercel Blob
```bash
npm uninstall @vercel/blob
```

#### Install AWS SDK
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 4. Code Changes (Already Done)

The following files have been updated:

#### ✅ `lib/storage/s3.ts` (NEW)
- Complete S3 utility module
- Upload, download, delete functions
- Signed URL generation
- S3 key management

#### ✅ `app/api/transcriptions/upload/route.ts`
- Replaced `put` from `@vercel/blob` with `uploadToS3`
- Uses `generateS3Key` for unique file paths

#### ✅ `package.json`
- Added `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- Removed `@vercel/blob`

### 5. Test the Migration

#### A. Test S3 Connection

```bash
# List buckets
aws s3 ls

# Upload test file
echo "test" > test.txt
aws s3 cp test.txt s3://your-bucket-name/test/test.txt

# Download test file
aws s3 cp s3://your-bucket-name/test/test.txt downloaded.txt

# Clean up
aws s3 rm s3://your-bucket-name/test/test.txt
rm test.txt downloaded.txt
```

#### B. Test Application Upload

1. Start development server:
```bash
npm run dev
```

2. Log in to your application
3. Upload a test audio file
4. Verify it appears in your S3 bucket:
```bash
aws s3 ls s3://your-bucket-name/transcriptions/ --recursive
```

5. Check the transcription processes correctly
6. Verify the file URL in your database points to S3

### 6. Deploy to Production

#### Update Production Environment Variables

In your hosting provider (Vercel, Railway, etc.):

1. **Remove:**
   - `BLOB_READ_WRITE_TOKEN`

2. **Add:**
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET_NAME`

#### Deployment Platforms

**Vercel:**
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add new variables for Production, Preview, Development
4. Redeploy

**Railway:**
1. Go to project variables
2. Add new variables
3. Redeploy automatically

**Other platforms:**
- Set environment variables through CLI or dashboard
- Ensure all variables are set before deployment

### 7. Handle Existing Files (Optional)

You have two options for existing files stored in Vercel Blob:

#### Option A: Keep Both (Recommended for Zero Downtime)

- Existing files remain in Vercel Blob (URLs still work)
- New uploads go to S3
- No migration needed
- Gradually expire old files using lifecycle rules

**Pros:**
- Zero downtime
- No data migration needed
- Old URLs continue working

**Cons:**
- Files split across two storage systems
- Ongoing Vercel Blob costs

#### Option B: Migrate All Files

Create a migration script:

```typescript
// scripts/migrate-blob-to-s3.ts
import { db } from '@/db'
import { transcription } from '@/db/schema'
import { uploadToS3, generateS3Key } from '@/lib/storage/s3'
import { eq } from 'drizzle-orm'

async function migrateFile(record: typeof transcription.$inferSelect) {
  console.log(`Migrating ${record.fileName}...`)
  
  // Download from Vercel Blob
  const response = await fetch(record.fileUrl)
  const blob = await response.blob()
  const file = new File([blob], record.fileName, { type: record.mimeType })
  
  // Upload to S3
  const s3Key = generateS3Key(record.userId, record.fileName)
  const uploadResult = await uploadToS3(file, s3Key)
  
  // Update database
  await db
    .update(transcription)
    .set({ fileUrl: uploadResult.url })
    .where(eq(transcription.id, record.id))
  
  console.log(`✓ Migrated ${record.fileName}`)
}

async function migrateAll() {
  // Get all transcriptions with Vercel Blob URLs
  const records = await db
    .select()
    .from(transcription)
    .where(/* filter for vercel blob URLs */)
    .limit(100) // Process in batches
  
  for (const record of records) {
    try {
      await migrateFile(record)
    } catch (error) {
      console.error(`Failed to migrate ${record.id}:`, error)
    }
  }
  
  console.log('Migration complete!')
}

migrateAll()
```

Run the migration:
```bash
npx tsx scripts/migrate-blob-to-s3.ts
```

**Pros:**
- Consolidated storage
- Can remove Vercel Blob completely
- Better for long-term maintenance

**Cons:**
- Requires downtime or careful coordination
- Risk of data loss if not done carefully
- Takes time for large datasets

## Rollback Plan

If you need to rollback to Vercel Blob:

1. **Reinstall Vercel Blob:**
```bash
npm install @vercel/blob
```

2. **Revert code changes:**
```bash
git checkout HEAD~1 app/api/transcriptions/upload/route.ts
```

3. **Update environment variables:**
   - Remove AWS variables
   - Add back `BLOB_READ_WRITE_TOKEN`

4. **Redeploy**

## Cost Comparison

### Vercel Blob Pricing (as of 2024)
- **Storage:** $0.15/GB per month
- **Bandwidth:** $0.10/GB
- **Requests:** $0.005 per 1,000 reads

### Amazon S3 Standard Pricing (as of 2024)
- **Storage:** $0.023/GB per month (first 50TB)
- **PUT requests:** $0.005 per 1,000
- **GET requests:** $0.0004 per 1,000
- **Data transfer out:** $0.09/GB (after 100GB free)

### Example: 100GB storage, 10,000 uploads, 50,000 reads

**Vercel Blob:**
- Storage: $15/month
- Requests: ~$0.25
- **Total: ~$15.25/month**

**Amazon S3:**
- Storage: $2.30/month
- Requests: ~$0.07
- **Total: ~$2.37/month**

**Savings: ~85% with S3**

## S3-Compatible Alternatives

### Cloudflare R2
- **Pricing:** $0.015/GB storage, $0 egress
- **Setup:** Similar to S3, set `AWS_S3_ENDPOINT`
- **Best for:** High bandwidth applications

### DigitalOcean Spaces
- **Pricing:** $5/month for 250GB + 1TB transfer
- **Setup:** S3-compatible API
- **Best for:** Predictable costs

### Backblaze B2
- **Pricing:** $0.005/GB storage, $0.01/GB download
- **Setup:** S3-compatible API
- **Best for:** Lowest storage costs

## Troubleshooting

### Error: "Failed to upload to S3"

**Check:**
1. AWS credentials are correct
2. IAM user has `s3:PutObject` permission
3. Bucket name and region match environment variables
4. Bucket exists and is accessible

**Test:**
```bash
aws s3 cp test.txt s3://your-bucket-name/test.txt
```

### Error: "Access Denied"

**Solutions:**
1. Verify IAM policy includes correct bucket ARN
2. Check bucket policy doesn't block access
3. Ensure credentials are for correct AWS account

### Error: "Bucket not found"

**Solutions:**
1. Verify `AWS_S3_BUCKET_NAME` is correct
2. Check bucket is in the region specified by `AWS_REGION`
3. Ensure bucket exists in your AWS account

### Files upload but can't be downloaded

**Solutions:**
1. Use signed URLs for private buckets: `getSignedFileUrl(key)`
2. Check CORS configuration for browser downloads
3. Verify bucket permissions allow GetObject

## Post-Migration Checklist

- [ ] All environment variables configured
- [ ] Test upload works in development
- [ ] Test upload works in production
- [ ] Verify transcription processing works
- [ ] Check S3 costs in AWS billing dashboard
- [ ] Set up CloudWatch billing alerts
- [ ] Configure S3 lifecycle rules for old files
- [ ] Enable S3 server-side encryption
- [ ] Set up S3 bucket logging (optional)
- [ ] Update documentation for team
- [ ] Remove Vercel Blob token from environment
- [ ] Uninstall `@vercel/blob` package

## Support

If you encounter issues:

1. Check [S3_SETUP.md](./S3_SETUP.md) for configuration
2. Review [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for troubleshooting
3. Test AWS CLI commands to isolate issues
4. Check AWS CloudTrail for permission errors

## Summary

The migration is straightforward:
1. ✅ Set up S3 bucket
2. ✅ Update environment variables
3. ✅ Deploy (code is already updated)
4. ✅ Test uploads
5. ✅ Monitor costs and performance

Your application will now use S3 for all new uploads with better cost-efficiency and flexibility!

