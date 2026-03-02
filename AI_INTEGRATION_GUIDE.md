# 🤖 AI Integration Guide - Document Verification & ATS CV Validation

This guide will help you set up AI-powered document verification and CV validation for your HealWell Recruitment platform.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Getting OpenAI API Key](#getting-openai-api-key)
3. [Environment Setup](#environment-setup)
4. [Database Migration](#database-migration)
5. [Testing the Integration](#testing-the-integration)
6. [How It Works](#how-it-works)
7. [Cost Estimation](#cost-estimation)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What's Been Implemented

✅ **AI Document Verification** (Licenses, Certificates, IDs)
- Automatically verifies document authenticity using GPT-4 Vision
- Extracts structured data (license numbers, expiry dates, names)
- Detects tampering and forgery
- Confidence scoring (0-100%)
- Documents hidden from recruiters until verified

✅ **ATS CV Validation** (Resume Validation)
- Validates uploaded files are actual CVs/resumes
- Rejects non-CV files (images, random PDFs, etc.)
- Analyzes CV quality (excellent/good/fair/poor)
- Extracts CV sections
- Confidence scoring

### Files Created/Modified

**New Files:**
- `src/lib/ai-verification.ts` - AI verification service
- `migration_ai_verification.sql` - Database schema updates
- `.env.example` - Environment variable template
- `AI_INTEGRATION_GUIDE.md` - This guide

**Modified Files:**
- `src/components/jobs/ApplyModal.tsx` - Added ATS CV validation
- `src/components/profile/VerificationStatus.tsx` - Added AI document verification
- `src/types/index.ts` - Added AI verification types

---

## 🔑 Getting OpenAI API Key

### Step 1: Create OpenAI Account

1. Go to https://platform.openai.com/signup
2. Sign up with your email or Google account
3. Verify your email address

### Step 2: Get API Key

1. Log in to https://platform.openai.com
2. Click on your profile (top right) → **API keys**
3. Click **"Create new secret key"**
4. Give it a name (e.g., "HealWell Recruitment")
5. **IMPORTANT:** Copy the key immediately (starts with `sk-...`)
6. Store it securely - you won't be able to see it again!

### Step 3: Add Billing

1. Go to https://platform.openai.com/settings/organization/billing/overview
2. Click **"Add payment method"**
3. Add your credit/debit card
4. Add initial credit: **$5-$10** is enough to start
5. Set up usage limits to prevent overspending:
   - Go to **Limits** tab
   - Set monthly budget (e.g., $20)

---

## ⚙️ Environment Setup

### Step 1: Update .env File

1. Copy `.env.example` to `.env` (if not already done)
2. Add your OpenAI API key:

```bash
# Supabase Configuration (already configured)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration (ADD THIS)
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### Step 2: Verify Environment Variables

Make sure your `.env` file is in the `nurseconnect-pro` directory and is NOT committed to Git (it should be in `.gitignore`).

---

## 🗄️ Database Migration

### Step 1: Run the Migration

You need to run the SQL migration to add AI verification fields to your database.

**Option A: Using Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `migration_ai_verification.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Verify success message

**Option B: Using Supabase CLI**

```bash
cd nurseconnect-pro
supabase db push migration_ai_verification.sql
```

### Step 2: Verify Migration

Run this query in SQL Editor to verify:

```sql
-- Check if new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_documents' 
AND column_name LIKE 'ai_%';
```

You should see columns like `ai_verified`, `ai_confidence`, `ai_analysis`, etc.

---

## 🧪 Testing the Integration

### Test 1: CV Validation (ATS)

1. Log in as a job seeker
2. Go to **Jobs** page
3. Click **Apply** on any job
4. Try uploading:
   - ✅ A real CV/Resume PDF → Should be accepted
   - ❌ A random image saved as PDF → Should be rejected
   - ❌ A non-CV document → Should be rejected

**Expected Behavior:**
- Valid CV: Shows green checkmark with confidence score
- Invalid file: Shows red error message
- Submit button disabled until valid CV uploaded

### Test 2: Document Verification

1. Log in as a job seeker
2. Go to **Profile** page
3. Scroll to **Verification Status** section
4. Upload a document (license, certificate, or ID)
5. Wait for AI verification (5-10 seconds)

**Expected Behavior:**
- Document uploads to Supabase Storage
- AI analyzes the document
- Shows verification status with confidence score
- Extracts information (name, license number, expiry date)
- Document marked as "pending" if AI verified, "rejected" if not

---

## 🔍 How It Works

### Document Verification Flow

```
User uploads document
    ↓
AI analyzes with GPT-4 Vision
    ↓
Extracts: name, license #, expiry date, etc.
    ↓
Checks for tampering/forgery
    ↓
Confidence score calculated
    ↓
If confidence ≥ 80%: Status = "pending" (awaits admin review)
If confidence < 80%: Status = "rejected"
    ↓
Recruiters only see "verified" documents
```

### CV Validation Flow

```
User uploads CV
    ↓
AI validates it's a real CV
    ↓
Checks for required sections
    ↓
Analyzes quality
    ↓
If valid (confidence ≥ 70%): Accept
If invalid: Reject with error message
    ↓
Application submitted with AI metadata
```

---

## 💰 Cost Estimation

### OpenAI Pricing (GPT-4o)

- **Input:** $2.50 per 1M tokens
- **Output:** $10.00 per 1M tokens

### Estimated Costs Per Document

- **CV Validation:** ~$0.01 - $0.02 per CV
- **Document Verification:** ~$0.02 - $0.03 per document

### Monthly Cost Examples

| Usage | Cost |
|-------|------|
| 100 applications/month | ~$1-2 |
| 500 applications/month | ~$5-10 |
| 1000 applications/month | ~$10-20 |
| 5000 applications/month | ~$50-100 |

**Very affordable!** Even with 1000 applications per month, you're only spending $10-20.

---

## 🐛 Troubleshooting

### Error: "OpenAI API key not configured"

**Solution:** Make sure `VITE_OPENAI_API_KEY` is set in your `.env` file and restart the dev server.

```bash
# Stop the server (Ctrl+C)
# Restart
npm run dev
```

### Error: "Incorrect API key provided"

**Solution:** Your API key is invalid. Double-check:
1. Key starts with `sk-`
2. No extra spaces
3. Key is active in OpenAI dashboard

### Error: "You exceeded your current quota"

**Solution:** Add more credits to your OpenAI account:
1. Go to https://platform.openai.com/settings/organization/billing
2. Add payment method
3. Add credits

### AI Verification Takes Too Long

**Normal:** 5-10 seconds per document
**If longer:** Check your internet connection or OpenAI API status

### Documents Not Showing for Recruiters

**Expected Behavior:** Recruiters only see documents with:
- `status = 'verified'`
- `ai_verified = true`

Admin must manually approve documents after AI verification.

---

## 🎉 Success Checklist

- [ ] OpenAI API key obtained and added to `.env`
- [ ] Database migration completed successfully
- [ ] Dev server restarted
- [ ] CV validation tested (accepts real CVs, rejects fake files)
- [ ] Document verification tested (uploads and AI analyzes)
- [ ] Billing set up with usage limits

---

## 📞 Support

If you encounter issues:
1. Check the browser console for errors (F12)
2. Check the terminal/server logs
3. Verify environment variables are loaded
4. Ensure database migration ran successfully

**OpenAI API Status:** https://status.openai.com
**Supabase Status:** https://status.supabase.com

---

## 🚀 Next Steps

After successful setup, you can:
1. Create an admin dashboard to review AI-verified documents
2. Adjust confidence thresholds (currently 80% for documents, 70% for CVs)
3. Add email notifications for verification results
4. Implement batch document processing
5. Add support for more document types

Enjoy your AI-powered recruitment platform! 🎊

