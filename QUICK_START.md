# 🚀 Quick Start - AI Integration

Follow these steps to get AI document verification and CV validation working in 5 minutes!

## ⚡ Quick Setup (5 Minutes)

### 1️⃣ Get OpenAI API Key (2 minutes)

```
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with sk-...)
4. Add $5-10 credit at: https://platform.openai.com/settings/organization/billing
```

### 2️⃣ Add API Key to .env (30 seconds)

Open `nurseconnect-pro/.env` and add:

```bash
VITE_OPENAI_API_KEY=sk-your-actual-key-here
```

### 3️⃣ Run Database Migration (1 minute)

**Option A: Supabase Dashboard**
```
1. Go to your Supabase project
2. Click "SQL Editor"
3. Copy contents of migration_ai_verification.sql
4. Paste and click "Run"
```

**Option B: Command Line**
```bash
# If you have Supabase CLI installed
supabase db push migration_ai_verification.sql
```

### 4️⃣ Restart Dev Server (30 seconds)

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 5️⃣ Test It! (1 minute)

**Test CV Validation:**
1. Log in as job seeker
2. Apply to a job
3. Upload a CV → Should show "✓ CV Verified by AI"
4. Try uploading a random image → Should be rejected

**Test Document Verification:**
1. Go to Profile page
2. Upload a license/certificate
3. Wait 5-10 seconds
4. See AI verification results with extracted data

---

## ✅ Verification Checklist

- [ ] OpenAI API key added to `.env`
- [ ] Database migration completed
- [ ] Server restarted
- [ ] CV validation works (rejects non-CVs)
- [ ] Document verification works (shows AI analysis)

---

## 🎯 What You Get

### 1. **ATS CV Validation**
- ✅ Automatically rejects fake CVs
- ✅ Only accepts real resumes
- ✅ Shows quality score
- ✅ Prevents spam applications

### 2. **Document Verification**
- ✅ Verifies licenses, certificates, IDs
- ✅ Extracts license numbers, expiry dates
- ✅ Detects tampering/forgery
- ✅ Hides unverified docs from recruiters

### 3. **Cost**
- 💰 ~$0.01-0.02 per CV validation
- 💰 ~$0.02-0.03 per document verification
- 💰 ~$10-20 per 1000 applications

---

## 🐛 Common Issues

### "OpenAI API key not configured"
→ Add `VITE_OPENAI_API_KEY` to `.env` and restart server

### "Incorrect API key"
→ Check key starts with `sk-` and has no spaces

### "Quota exceeded"
→ Add credits at https://platform.openai.com/settings/organization/billing

### Migration fails
→ Make sure you're connected to the correct Supabase project

---

## 📚 Full Documentation

For detailed information, see `AI_INTEGRATION_GUIDE.md`

---

## 🎉 You're Done!

Your platform now has:
- ✅ AI-powered CV validation (ATS)
- ✅ AI-powered document verification
- ✅ Automatic fraud detection
- ✅ Data extraction from documents

**Next Steps:**
1. Test with real documents
2. Adjust confidence thresholds if needed
3. Create admin dashboard for document review
4. Monitor OpenAI usage and costs

Enjoy! 🚀

