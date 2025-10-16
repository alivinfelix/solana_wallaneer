# Telegram OAuth Setup Guide

This guide provides step-by-step instructions to properly configure Telegram OAuth for your Wallaneer application.

## Prerequisites

1. A Telegram account
2. Access to [@BotFather](https://t.me/BotFather) on Telegram
3. Access to your [Magic Dashboard](https://dashboard.magic.link)
4. Admin access to your application's domain settings

## Step 1: Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Start a conversation and send `/newbot` command
3. Follow the prompts to create your bot:
   - Set a name (e.g., "Wallaneer Auth")
   - Set a username (e.g., "wallaneers_bot") - must end with "bot"
4. **Save the HTTP API token** provided by BotFather (looks like `123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ`)

## Step 2: Configure Bot Domain

1. In your BotFather chat, send the `/setdomain` command
2. Select your bot from the list
3. Enter your domain **exactly as it appears in your Magic Dashboard**:
   ```
   solana-wallaneer.vercel.app
   ```
   - **IMPORTANT**: Do NOT include protocol (http/https) or trailing slashes
   - This must be an exact match to your site's domain

## Step 3: Configure Magic Dashboard

1. Go to [Magic Dashboard](https://dashboard.magic.link)
2. Select your application
3. Navigate to **Social Login** section
4. Find and enable **Telegram**
5. Enter the following information:
   - **Bot Name**: `wallaneers_bot` (without @ symbol)
   - **Bot Token**: Paste the HTTP API token from Step 1
   - **Bot Domain**: `solana-wallaneer.vercel.app` (same as in Step 2)
6. Click **Save**

## Step 4: Verify Implementation

Your code is already correctly using `loginWithPopup` for Telegram:

```typescript
// This is correct - Telegram ONLY supports popup mode
if (provider === 'telegram') {
  const result = await activeMagic.oauth2.loginWithPopup({
    provider: 'telegram',
  });
  
  // Process result...
}
```

## Step 5: Content Security Policy (CSP)

If you have CSP enabled, ensure these domains are allowed:

```html
<meta http-equiv="Content-Security-Policy" content="
  script-src 'self' https://telegram.org https://web.telegram.org;
  frame-src 'self' https://telegram.org https://web.telegram.org;
">
```

Or in your server headers:

```
Content-Security-Policy: script-src 'self' https://telegram.org https://web.telegram.org; frame-src 'self' https://telegram.org https://web.telegram.org;
```

## Step 6: Testing & Troubleshooting

### Test Your Setup

1. Clear browser cache and cookies
2. Open your application
3. Click "Continue with Telegram"
4. You should see a Telegram popup
5. Authorize your bot
6. You should be logged in successfully

### Common Issues & Solutions

#### Popup Opens But No Code Received

**Cause**: Domain mismatch between BotFather and Magic Dashboard

**Solution**:
1. Verify the domain in BotFather with `/setdomain` command
2. Ensure it's EXACTLY the same as in Magic Dashboard
3. Domain should be just `solana-wallaneer.vercel.app` (no protocol, no path)

#### Popup Blocked by Browser

**Cause**: Browser popup blocker

**Solution**:
1. Check browser console for "Popup blocked" warnings
2. Allow popups for your domain
3. Ensure popup is triggered by a direct user action (click)

#### CSP Errors

**Cause**: Content Security Policy blocking Telegram scripts

**Solution**:
1. Check browser console for CSP violation errors
2. Add Telegram domains to your CSP as shown in Step 5

#### Authentication Error

**Cause**: Incorrect bot token or configuration

**Solution**:
1. Verify bot token in Magic Dashboard matches the one from BotFather
2. Ensure bot is active and not blocked
3. Try recreating the bot if necessary

## Step 7: Debugging

Add these console logs to help diagnose issues:

```javascript
// Before popup
console.log('Telegram OAuth configuration:');
console.log('- Origin:', window.location.origin);
console.log('- Host:', window.location.host);

// After popup
console.log('Telegram popup result:', result);
```

## Important Notes

1. **Telegram Only Supports Popup**: Unlike other providers, Telegram only works with `loginWithPopup`, not `loginWithRedirect`
2. **Domain Matching is Strict**: The domain must match exactly between BotFather and Magic Dashboard
3. **No Protocol**: Don't include `https://` in the domain settings
4. **No Trailing Slash**: Don't include `/` at the end of the domain
5. **Bot Username Format**: Use `wallaneers_bot` (without @ symbol) in Magic Dashboard

## Reference

- [Magic Telegram OAuth Documentation](https://magic.link/docs/auth/login-methods/social-logins/telegram)
- [Telegram Login Widget Documentation](https://core.telegram.org/widgets/login)
- [BotFather Commands Reference](https://core.telegram.org/bots#commands)

---

If you continue to have issues after following this guide, please check the browser console for specific error messages and ensure all configuration values match exactly.
