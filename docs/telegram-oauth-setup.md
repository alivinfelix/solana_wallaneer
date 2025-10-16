# Telegram OAuth Setup for Wallaneer

## Overview
Telegram OAuth integration has been successfully enabled in the Magic Dashboard. This guide explains how Telegram authentication works in Wallaneer.

## Test Connection Response
When testing the Telegram connection in Magic Dashboard, you should receive a response like this:

```json
{
  "oauth": {
    "provider": "telegram",
    "scope": [],
    "userHandle": "CfbPNVknKWBaPdosFDmidNub7LRAB5dh0WtJZdz3PD4=",
    "userInfo": {
      "telegramUserId": 7810869982,
      "telegramUsername": "zezgreen",
      "firstName": "Green",
      "lastName": null,
      "photoUrl": "https://t.me/i/userpic/320/..."
    }
  },
  "magic": {
    "idToken": "...",
    "userMetadata": {
      "issuer": "did:ethr:0x3ECc0f2E2e5c8BE592DC323C66D104526f589F9B",
      "publicAddress": "0x3ECc0f2E2e5c8BE592DC323C66D104526f589F9B",
      "email": "",
      "phoneNumber": null,
      "isMfaEnabled": false,
      "recoveryFactors": [],
      "firstLoginAt": "1970-01-21T09:01:17.984Z"
    }
  }
}
```

## User Information Available
From Telegram OAuth, you can access:
- **Telegram User ID**: Unique identifier for the user
- **Username**: Telegram username (e.g., @zezgreen)
- **First Name**: User's first name
- **Last Name**: User's last name (may be null)
- **Photo URL**: Link to user's profile picture

## Important Notes

### 1. No Email Address
Unlike Google or other providers, Telegram OAuth **does not provide an email address**. The `email` field in `userMetadata` will be empty.

### 2. Public Address
Magic still generates a blockchain wallet address (`publicAddress`) for the user, even without an email.

### 3. User Identification
Users are identified by their Telegram username and user ID, not by email.

## Implementation Details

### OAuth Configuration

**IMPORTANT**: Telegram only supports `loginWithPopup`, NOT `loginWithRedirect`

```typescript
// Telegram uses popup (NOT redirect)
const result = await activeMagic.oauth2.loginWithPopup({
  provider: 'telegram',
});

if (result) {
  const didToken = await activeMagic.user.getIdToken();
  // Save token and complete login
}
```

### Why Popup for Telegram?

Telegram's OAuth implementation in Magic SDK only supports the popup method. Other providers (Google, Twitter, GitHub, etc.) support redirect, but Telegram requires a popup window for authentication.

### Handling Telegram Users
When a user logs in with Telegram:
1. They will have a blockchain wallet address
2. The `email` field will be empty
3. You should use `telegramUsername` or `telegramUserId` for user identification
4. Profile picture is available via `photoUrl`

## Magic Dashboard Configuration

### Required Settings
1. **Enable Telegram OAuth**:
   - Go to Magic Dashboard
   - Navigate to Social Login
   - Toggle ON Telegram provider
   - Save changes

2. **Configure Redirect URLs**:
   - Go to Settings → Allowed Origins & Redirects
   - Add your callback URL: `http://localhost:3000/oauth/callback` (for development)
   - Add production URLs when deploying

### Telegram Bot Setup
Magic handles the Telegram OAuth flow automatically. You don't need to create a separate Telegram bot or configure bot settings.

## User Experience

### Login Flow
1. User clicks "Continue with Telegram"
2. User is redirected to Telegram's OAuth page
3. User authorizes the application
4. User is redirected back to your callback URL
5. Magic SDK processes the OAuth result
6. User is logged in with their Telegram-linked wallet

### First-Time Users
- A new blockchain wallet is created automatically
- The wallet is linked to their Telegram account
- No email verification is required

### Returning Users
- Users are identified by their Telegram account
- They access the same wallet they used before
- Login is seamless and fast

## Error Handling

### Common Errors

#### "RPC route not enabled or provider not supported"
**Cause**: Telegram OAuth is not enabled in Magic Dashboard
**Solution**: Go to Magic Dashboard → Social Login → Enable Telegram

#### "Failed to finish OAuth verification"
**Cause**: Missing OAuth state data
**Solution**: Ensure `magic:state` is preserved in localStorage during the redirect

#### "redirect_uri_mismatch"
**Cause**: Callback URL doesn't match Magic Dashboard configuration
**Solution**: Verify redirect URLs in Magic Dashboard settings

## Testing

### Development Testing
1. Ensure Telegram OAuth is enabled in Magic Dashboard
2. Clear browser cache and localStorage
3. Click "Continue with Telegram"
4. Check browser console for OAuth logs
5. Verify successful login

### Expected Console Output
```
Starting OAuth flow with provider: telegram
Redirect URI: http://localhost:3000/oauth/callback
OAuth config: {provider: 'telegram', redirectURI: '...'}
✓ Magic SDK available
✓ OAuth extension available
✓ Result received
✓ DID token received, saving...
Redirecting to dashboard...
```

## Advantages of Telegram OAuth

1. **Fast Authentication**: No email verification needed
2. **Global Reach**: Popular in many countries
3. **Privacy-Focused**: Users don't need to share email
4. **Built-in Profile**: Access to username and photo
5. **Mobile-Friendly**: Works seamlessly on mobile devices

## Limitations

1. **No Email**: Cannot send email notifications
2. **Telegram Required**: Users must have a Telegram account
3. **Username Changes**: Telegram usernames can change
4. **Limited Info**: Less user data compared to Google/Facebook

## Best Practices

1. **Handle Empty Emails**: Don't assume users have email addresses
2. **Use Telegram ID**: Use `telegramUserId` as the primary identifier
3. **Display Username**: Show Telegram username in the UI
4. **Profile Pictures**: Cache user profile pictures
5. **Alternative Contact**: Provide alternative ways to contact users

## Integration with Wallaneer

### User Profile Display
```typescript
if (userInfo.telegramUsername) {
  displayName = `@${userInfo.telegramUsername}`;
} else if (userInfo.firstName) {
  displayName = userInfo.firstName;
} else {
  displayName = 'Telegram User';
}
```

### Wallet Association
Each Telegram user gets a unique Ethereum wallet address that remains consistent across logins.

## Troubleshooting

### Issue: Telegram button shows error
**Check**:
1. Is Telegram enabled in Magic Dashboard?
2. Is the redirect URI properly configured?
3. Are there any console errors?

### Issue: Login works but user has no email
**This is expected**: Telegram doesn't provide email addresses. Design your app to work without email.

### Issue: User data not persisting
**Check**:
1. Is the DID token being saved to localStorage?
2. Is the token being loaded on page refresh?
3. Check the `loginType` in localStorage (should be 'SOCIAL')

## Production Deployment

When deploying to production:
1. Update Magic Dashboard with production redirect URLs
2. Ensure HTTPS is enabled (required for OAuth)
3. Test the Telegram OAuth flow in production
4. Monitor for any OAuth-related errors
5. Have a fallback authentication method (email OTP)

## Support

For issues with Telegram OAuth:
1. Check Magic Dashboard logs
2. Review browser console for errors
3. Verify Telegram OAuth is enabled
4. Contact Magic support if needed
