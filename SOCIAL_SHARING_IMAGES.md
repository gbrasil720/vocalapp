# Social Sharing Images Setup Guide

This guide explains where to configure images that appear when sharing your website links on social media platforms (Facebook, Twitter, LinkedIn, etc.).

## 🎯 Quick Setup

### 1. **Create Your Image File** (REQUIRED)

Place your social sharing image in the `public/` folder:
- **File name**: `og-image.png` (or `.jpg`)
- **Recommended size**: 1200 x 630 pixels
- **Format**: PNG or JPG

**Location**: `public/og-image.png`

### 2. **Default Image Configuration** (OPTIONAL)

The default image path is configured in:
- **File**: `lib/seo.ts`
- **Line**: 28
- **Current default**: `${baseUrl}/og-image.png`

To change the default image filename, modify line 28:
```typescript
const ogImage = image || `${baseUrl}/your-custom-image.png`
```

### 3. **Page-Specific Images** (OPTIONAL)

To use a different image for a specific page, pass the `image` parameter in the page's metadata:

**File**: `app/page.tsx` (or any page file)
```typescript
export const metadata: Metadata = generateSEOMetadata({
  title: 'Your Page Title',
  description: 'Your page description',
  path: '/',
  image: '/custom-page-image.png' // ← Add this for page-specific images
})
```

## 📋 Where Images Are Used

- **Open Graph (Facebook, LinkedIn)**: Configured in `lib/seo.ts` lines 48-61
- **Twitter Cards**: Configured in `lib/seo.ts` lines 63-67
- **Image dimensions**: 1200 x 630 pixels (set in `lib/seo.ts` line 57-58)

## ✅ Checklist

- [ ] Create `og-image.png` (1200x630px) in `public/` folder
- [ ] Verify image is accessible at `https://yourdomain.com/og-image.png`
- [ ] Test sharing on [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test sharing on [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] (Optional) Add page-specific images for important pages

## 🔍 Testing Your Images

After adding your image, test it with:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

Enter your website URL and click "Scrape" to see how your link will appear.

