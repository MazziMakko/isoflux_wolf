# 📧 EMAIL TEMPLATE CONFIGURATION GUIDE

## 🎯 OVERVIEW

This guide covers configuring Supabase email templates for IsoFlux Wolf Shield authentication flows.

---

## 📋 TEMPLATES TO CONFIGURE

### **1. Confirmation Email** (Signup)
**Purpose**: Sent when users sign up to verify email address  
**Template ID**: `confirm_signup`

### **2. Password Reset Email**
**Purpose**: Sent when users request password reset  
**Template ID**: `reset_password`

### **3. Magic Link Email** (Optional)
**Purpose**: Passwordless login via email link  
**Template ID**: `magic_link`

### **4. Email Change Email** (Optional)
**Purpose**: Confirm email address change  
**Template ID**: `email_change`

---

## 🚀 CONFIGURATION STEPS

### **Step 1: Access Email Templates**

1. **Go to Supabase Dashboard**:
   https://supabase.com/dashboard/project/qmctxtmmzeutlgegjrnb/auth/templates

2. **Navigate**: Authentication → Email Templates

---

### **Step 2: Configure Confirmation Email**

**Click**: "Confirm signup" template

**Subject**:
```
Confirm your IsoFlux Wolf Shield account
```

**HTML Body**:
```html
<h2>Welcome to Wolf Shield! 🐺</h2>

<p>Thank you for signing up for IsoFlux Wolf Shield, the HUD-compliant property management platform with a mathematically immutable ledger.</p>

<p>Follow this link to confirm your email address and activate your account:</p>

<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
    Confirm Your Email
  </a>
</p>

<p>Or copy and paste this URL into your browser:</p>
<p style="color: #6b7280; font-size: 14px; word-break: break-all;">{{ .ConfirmationURL }}</p>

<p style="margin-top: 24px;"><strong>What's next?</strong></p>
<ul style="color: #374151;">
  <li>Confirm your email (click button above)</li>
  <li>Complete your organization profile</li>
  <li>Import your first property</li>
  <li>Start your 30-day free trial</li>
</ul>

<p>If you didn't create this account, you can safely ignore this email.</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

<p style="font-size: 12px; color: #6b7280;">
  <strong>IsoFlux Wolf Shield</strong><br>
  Advanced HUD Compliance & Property Management<br>
  New Jerusalem Holdings, LLC<br>
  <br>
  📧 Email: <a href="mailto:support@isoflux.app" style="color: #10b981;">support@isoflux.app</a><br>
  📞 Phone: <a href="tel:+18562748668" style="color: #10b981;">(856) 274-8668</a><br>
  🌐 Website: <a href="https://isoflux.app" style="color: #10b981;">https://isoflux.app</a>
</p>
```

---

### **Step 3: Configure Password Reset Email**

**Click**: "Reset password" template

**Subject**:
```
Reset your Wolf Shield password
```

**HTML Body**:
```html
<h2>Password Reset Request 🔒</h2>

<p>We received a request to reset your password for your IsoFlux Wolf Shield account.</p>

<p>Follow this link to set a new password:</p>

<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
    Reset Your Password
  </a>
</p>

<p>Or copy and paste this URL into your browser:</p>
<p style="color: #6b7280; font-size: 14px; word-break: break-all;">{{ .ConfirmationURL }}</p>

<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 24px 0;">
  <p style="margin: 0; color: #92400e;"><strong>⚠️ Security Notice:</strong></p>
  <ul style="margin: 8px 0 0 0; color: #92400e;">
    <li>This link expires in <strong>1 hour</strong></li>
    <li>It can only be used <strong>once</strong></li>
    <li>If you didn't request this, <strong>ignore this email</strong></li>
  </ul>
</div>

<p>If you didn't request a password reset, someone may be trying to access your account. Your password will NOT be changed unless you click the link above.</p>

<p><strong>Need help?</strong> Contact our support team at (856) 274-8668 or support@isoflux.app</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

<p style="font-size: 12px; color: #6b7280;">
  <strong>IsoFlux Wolf Shield</strong><br>
  Advanced HUD Compliance & Property Management<br>
  New Jerusalem Holdings, LLC<br>
  <br>
  📧 Email: <a href="mailto:support@isoflux.app" style="color: #10b981;">support@isoflux.app</a><br>
  📞 Phone: <a href="tel:+18562748668" style="color: #10b981;">(856) 274-8668</a><br>
  🌐 Website: <a href="https://isoflux.app" style="color: #10b981;">https://isoflux.app</a>
</p>

<p style="font-size: 11px; color: #9ca3af;">
  For security reasons, this password reset link can only be used once and expires in 1 hour.
</p>
```

---

### **Step 4: Configure Magic Link Email** (Optional)

**Click**: "Magic link" template

**Subject**:
```
Your Wolf Shield login link
```

**HTML Body**:
```html
<h2>Your Secure Login Link 🔐</h2>

<p>Click the button below to securely log in to your IsoFlux Wolf Shield account:</p>

<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
    Log In to Wolf Shield
  </a>
</p>

<p>Or copy and paste this URL into your browser:</p>
<p style="color: #6b7280; font-size: 14px; word-break: break-all;">{{ .ConfirmationURL }}</p>

<p style="margin-top: 24px;"><strong>⚠️ This link expires in 1 hour</strong> and can only be used once.</p>

<p>If you didn't request this login link, you can safely ignore this email.</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

<p style="font-size: 12px; color: #6b7280;">
  <strong>IsoFlux Wolf Shield</strong><br>
  📧 support@isoflux.app | 📞 (856) 274-8668
</p>
```

---

## ⚙️ EMAIL SETTINGS CONFIGURATION

### **Sender Configuration**

**Go to**: Settings → Auth → Email Settings

**1. Sender Name**:
```
IsoFlux Wolf Shield
```

**2. Sender Email**:
```
noreply@isoflux.app
```
or
```
support@isoflux.app
```

**3. Reply-To Email**:
```
support@isoflux.app
```

---

### **Domain Verification** (Production)

For custom domain emails, you need to add DNS records:

**Go to**: Settings → Auth → Custom SMTP

**Add these DNS records** to your domain registrar:

```
Type: TXT
Name: @
Value: [Provided by email service]

Type: CNAME
Name: em[xxxx]
Value: [Provided by email service]
```

---

### **Rate Limits**

**Default**: 4 emails per hour per user

**Adjust**: Settings → Auth → Rate Limits

**Recommended for Production**:
- Confirmation emails: 3 per hour
- Password reset: 3 per hour
- Magic link: 5 per hour

---

## 🔧 CUSTOM SMTP CONFIGURATION

For production, use a dedicated email service for better deliverability.

### **Recommended Providers**

| Provider | Free Tier | Pricing | Deliverability |
|----------|-----------|---------|----------------|
| **SendGrid** | 100/day | $19.95/mo (40K emails) | ⭐⭐⭐⭐⭐ |
| **Mailgun** | 5,000/mo | $35/mo (50K emails) | ⭐⭐⭐⭐⭐ |
| **AWS SES** | 62,000/mo | $0.10 per 1K | ⭐⭐⭐⭐ |
| **Postmark** | None | $15/mo (10K emails) | ⭐⭐⭐⭐⭐ |

---

### **Configure Custom SMTP** (SendGrid Example)

1. **Sign up for SendGrid**: https://sendgrid.com

2. **Create API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name: `IsoFlux Wolf Shield`
   - Permissions: "Full Access" or "Mail Send"

3. **Configure in Supabase**:
   - Go to: Settings → Auth → SMTP Settings
   - Enable "Custom SMTP"
   - Fill in:
     ```
     SMTP Host: smtp.sendgrid.net
     SMTP Port: 587
     SMTP Username: apikey
     SMTP Password: [Your SendGrid API Key]
     Sender Email: noreply@isoflux.app
     Sender Name: IsoFlux Wolf Shield
     ```

4. **Verify Domain**:
   - SendGrid → Settings → Sender Authentication
   - Authenticate Domain: `isoflux.app`
   - Add DNS records provided by SendGrid

---

## 🧪 TESTING EMAIL TEMPLATES

### **Send Test Emails**

1. **In Supabase Dashboard**:
   - Go to Email Templates
   - Click "Send Test Email"
   - Enter your email address
   - Check inbox

2. **Test Signup Flow**:
   ```bash
   # Start app
   npm run dev
   
   # Sign up at:
   http://localhost:3000/signup
   
   # Check email for confirmation link
   ```

3. **Test Password Reset**:
   ```bash
   # Go to:
   http://localhost:3000/forgot-password
   
   # Enter email
   # Check email for reset link
   ```

---

## 📊 EMAIL DELIVERY MONITORING

### **Check Email Logs**

**Go to**: https://supabase.com/dashboard/project/qmctxtmmzeutlgegjrnb/logs

**Filter**: Email events

**Monitor**:
- ✅ Emails sent successfully
- ❌ Failed deliveries
- 📊 Open rates (if using custom SMTP with tracking)

---

## 🐛 TROUBLESHOOTING

### **Email Not Received**

1. **Check spam folder**
2. **Verify email address is correct**
3. **Check Supabase logs** for delivery errors
4. **Verify domain reputation** (if using custom domain)

### **Confirmation Link Doesn't Work**

1. **Check link hasn't expired** (1 hour default)
2. **Verify redirect URLs** in Supabase settings
3. **Check browser console** for errors

### **Custom Domain Emails Bouncing**

1. **Verify DNS records** are correctly configured
2. **Check SPF, DKIM, DMARC** records
3. **Wait 24-48 hours** for DNS propagation

---

## ✅ CONFIGURATION CHECKLIST

### **Before Launch**

- [ ] Confirmation email template configured
- [ ] Password reset email template configured
- [ ] Sender email configured
- [ ] Custom SMTP configured (production)
- [ ] Domain verified (if using custom domain)
- [ ] DNS records added
- [ ] Test emails sent and received
- [ ] Spam score checked (use mail-tester.com)
- [ ] Rate limits configured
- [ ] Email logs monitored

---

## 📞 SUPPORT

**Email Issues**: support@isoflux.app  
**Phone**: (856) 274-8668  
**SendGrid Support**: https://support.sendgrid.com  
**Supabase Docs**: https://supabase.com/docs/guides/auth/auth-email

---

*Sovereign Architect: Email templates ready for deployment. Professional HTML formatting included. Custom SMTP configuration documented. Production-ready email infrastructure established.*
