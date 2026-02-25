# 📧 EMAIL VERIFICATION SETUP - Wolf Shield

## ✅ CODE CHANGES COMPLETE

All email verification code is now implemented. Users will receive an email from Supabase when they sign up.

---

## 🎯 REQUIRED: SUPABASE EMAIL CONFIGURATION

### Step 1: Configure Email Settings in Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `qmctxtmmzeutlgegjrnb`
3. **Navigate to**: Authentication → Email Templates

### Step 2: Set Sender Email

**Location**: Authentication → Settings → SMTP Settings

**Option A: Use Supabase's Free Email Service** (Quick Start)
- Sender Name: `Wolf Shield`
- Sender Email: `noreply@mail.qmctxtmmzeutlgegjrnb.supabase.co`
- **Note**: This will work immediately but shows Supabase domain

**Option B: Use Custom Domain (Recommended)** ✅
- **Sender Email**: `support@isoflux.app`
- **Requirements**: You need to configure SMTP or use a service like:
  - SendGrid (Free tier: 100 emails/day)
  - Mailgun (Free tier: 1000 emails/month)
  - Amazon SES (Very cheap)
  - Resend (Free tier: 100 emails/day)

---

## 🔧 OPTION B: SETUP CUSTOM EMAIL (RECOMMENDED)

### Using Resend (Easiest Option)

1. **Sign up**: https://resend.com
2. **Add domain**: `isoflux.app`
3. **Add DNS records** (they'll provide these):
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [provided by Resend]
   
   Type: TXT
   Name: @
   Value: [SPF record provided by Resend]
   ```

4. **Get API Key**: Settings → API Keys → Create

5. **Configure in Supabase**:
   - Go to: Authentication → Settings → SMTP Settings
   - Enable custom SMTP
   - **SMTP Host**: `smtp.resend.com`
   - **Port**: `465` (SSL) or `587` (TLS)
   - **Username**: `resend`
   - **Password**: [Your Resend API Key]
   - **Sender Email**: `support@isoflux.app`
   - **Sender Name**: `Wolf Shield`

---

## 📝 CUSTOMIZE EMAIL TEMPLATES

### Location: Authentication → Email Templates → Confirm signup

**Current Template**:
```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

**Wolf Shield Custom Template** (Copy/Paste This):

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0f172a;
      color: #e2e8f0;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .brand {
      font-size: 32px;
      font-weight: bold;
      color: #10b981;
      margin: 0;
    }
    .card {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border: 1px solid #475569;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    h1 {
      color: #10b981;
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    p {
      color: #cbd5e1;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #475569;
    }
    .footer p {
      color: #64748b;
      font-size: 14px;
    }
    .support {
      background: #1e293b;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .support strong {
      color: #3b82f6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐺</div>
      <h2 class="brand">Wolf Shield</h2>
    </div>
    
    <div class="card">
      <h1>Welcome to Wolf Shield!</h1>
      
      <p>Thanks for signing up! You're one click away from simplifying your property management.</p>
      
      <p>Click the button below to verify your email and access your dashboard:</p>
      
      <p style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">
          Verify My Email & Get Started
        </a>
      </p>
      
      <p style="font-size: 14px; color: #94a3b8;">
        Or copy and paste this link into your browser:<br>
        <span style="color: #10b981;">{{ .ConfirmationURL }}</span>
      </p>
      
      <div class="support">
        <p style="margin: 0;"><strong>Need help?</strong></p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">
          Email us at <a href="mailto:support@isoflux.app" style="color: #3b82f6;">support@isoflux.app</a><br>
          or call <a href="tel:+18562748668" style="color: #3b82f6;">(856) 274-8668</a>
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p>
        Wolf Shield by New Jerusalem Holdings, LLC<br>
        Wyoming, USA
      </p>
      <p style="font-size: 12px;">
        This email was sent because you signed up for Wolf Shield.<br>
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 🔐 REDIRECT URL CONFIGURATION

**Location**: Authentication → URL Configuration

Set these URLs:
- **Site URL**: `https://www.isoflux.app`
- **Redirect URLs**: Add these:
  ```
  https://www.isoflux.app/verify-email
  http://localhost:3000/verify-email (for testing)
  ```

---

## ✅ HOW IT WORKS NOW

### User Signup Flow:

1. **User fills out signup form** → Submits
2. **Account created** but `email_verified: false`
3. **Email sent** from `support@isoflux.app` (or Supabase default)
4. **Redirect** to `/verify-email` page (shows "Check your inbox")
5. **User clicks** verification link in email
6. **Redirects** to `/verify-email#access_token=...`
7. **API call** to `/api/auth/verify-email`
8. **Updates**:
   - `users.email_verified = true`
   - `subscriptions.status = ACTIVE` (from TRIALING)
   - Logs audit event
9. **Redirects** user to `/dashboard` with active session

### Files Changed:
- ✅ `/api/auth/signup/route.ts` - Now requires email verification
- ✅ `/app/signup/page.tsx` - Redirects to verify-email page
- ✅ `/app/verify-email/page.tsx` - NEW - Verification UI
- ✅ `/api/auth/verify-email/route.ts` - NEW - Verification handler
- ✅ `/api/auth/resend-verification/route.ts` - NEW - Resend email

---

## 🧪 TESTING

### Local Testing:
1. Sign up with your email
2. Check Supabase Dashboard → Authentication → Users
3. You'll see the user with `email_confirmed_at: null`
4. In Supabase Dashboard → Authentication → Logs, you'll see the email sent
5. Click the "Copy confirmation URL" in the logs
6. Paste into browser to test verification

### Production Testing:
- Use a real email address
- Check your inbox for the verification email
- Click the link
- Should redirect to dashboard with active account

---

## 📧 QUICK START (OPTION A)

If you want to test immediately without custom domain:

1. The code is ready - just deploy
2. Emails will send from `noreply@mail.qmctxtmmzeutlgegjrnb.supabase.co`
3. Works fine for testing
4. Upgrade to custom domain later

---

## 🚀 DEPLOYMENT

All code is ready! Just:
```bash
git add -A
git commit -m "feat: Add email verification flow with support@isoflux.app"
git push origin main
```

Then configure Supabase email settings (5-10 minutes).

**STATUS**: ✅ CODE COMPLETE | ⏳ SUPABASE CONFIG NEEDED
