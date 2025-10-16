# Telegram OAuth with Magic SDK - Popup Only

## Important Discovery

**Telegram OAuth IS supported by Magic SDK**, but ONLY with `loginWithPopup`, NOT with `loginWithRedirect` method.

## The Issue

When attempting to use Telegram OAuth with Magic SDK's `loginWithRedirect`:

```typescript
await activeMagic.oauth2.loginWithRedirect({
  provider: 'telegram',
  redirectURI: `${window.location.origin}/oauth/callback`,
});
```

**Error:**
```
Magic RPC Error: [-32602] RPC route not enabled or provider not supported
```

## Why This Happens

Magic SDK's OAuth2 extension has a **limited set of supported providers** for the `loginWithRedirect` and `loginWithPopup` methods:

### Supported OAuth Providers:
- ✅ Google
- ✅ Facebook  
- ✅ Apple
- ✅ GitHub
- ✅ Bitbucket
- ✅ GitLab
- ✅ LinkedIn
- ✅ Twitter (X)
- ✅ Discord
- ✅ Twitch
- ✅ Microsoft

### NOT Supported:
- ❌ **Telegram**
- ❌ WhatsApp
- ❌ Signal
- ❌ Other messaging apps

## Magic Dashboard vs SDK Support

The confusion arises because:

1. **Magic Dashboard** shows Telegram as an available OAuth provider
2. You can enable and test Telegram in the Dashboard successfully
3. **BUT** the Magic SDK doesn't support Telegram through the standard OAuth methods

This is a limitation of the SDK, not the Magic service itself.

## Alternatives for Telegram

### Option 1: Use Email OTP Instead
For users who want to log in, offer:
- Email OTP login (fully supported by Magic)
- Other supported OAuth providers (Google, GitHub, Twitter)

### Option 2: Custom Implementation (Advanced)
If you absolutely need Telegram login, you would need to:
1. Implement Telegram OAuth yourself (using Telegram Bot API)
2. Use Magic's custom authentication flow
3. Link the Telegram account to a Magic wallet

This is significantly more complex and beyond the scope of standard Magic SDK usage.

### Option 3: Wait for SDK Support
Monitor Magic SDK updates for potential Telegram support in future versions.

## Current Wallaneer Implementation

We've updated Wallaneer to use a **hybrid approach**:

1. **Telegram uses `loginWithPopup`** - Opens in a popup window
2. **Other providers use `loginWithRedirect`** - Full page redirect (better UX, no popup blockers)
3. **Automatic detection** - Code automatically chooses the right method per provider

### Current Social Login Options:
- Google (redirect)
- Twitter/X (redirect)
- Telegram (popup)

### Implementation:
```typescript
if (provider === 'telegram') {
  // Use popup for Telegram
  await activeMagic.oauth2.loginWithPopup({ provider: 'telegram' });
} else {
  // Use redirect for all other providers
  await activeMagic.oauth2.loginWithRedirect({
    provider: provider,
    redirectURI: `${window.location.origin}/oauth/callback`,
  });
}
```

### UI Message:
> "Note: Telegram uses popup authentication (others use redirect)"

## Technical Details

### Supported Providers Check
We've added validation in the code:

```typescript
const supportedProviders = [
  'google', 'facebook', 'apple', 'github', 
  'bitbucket', 'gitlab', 'linkedin', 'twitter', 
  'discord', 'twitch', 'microsoft'
];

if (!supportedProviders.includes(provider.toLowerCase())) {
  showToast({
    message: `${provider} is not supported by Magic SDK`,
    type: 'warning',
  });
}
```

## Recommendations

### For Development:
- Use Google OAuth (easiest to set up)
- Add GitHub OAuth (developer-friendly)
- Keep Twitter OAuth (broad reach)

### For Production:
- Offer multiple OAuth options
- Prominently feature Email OTP as primary method
- Document which OAuth providers are available

### For Users:
- Email OTP works universally
- Choose from supported OAuth providers
- All methods provide the same wallet access

## Conclusion

While Telegram appears in Magic Dashboard, it's not usable through the Magic SDK's standard OAuth methods. We've adapted Wallaneer to use GitHub instead, which is fully supported and provides a similar user experience for developers and tech-savvy users.

## Reference Links

- [Magic SDK OAuth Documentation](https://magic.link/docs/auth/login-with-oauth)
- [Magic Supported OAuth Providers](https://magic.link/docs/auth/login-with-oauth/social-logins)
- [GitHub Issue (if reported)](https://github.com/magiclabs/magic-js/issues)

## Last Updated

Date: October 16, 2025
Status: Telegram not supported, GitHub added as alternative
