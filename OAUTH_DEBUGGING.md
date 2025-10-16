# OAuth Debugging Guide

## Current Issue
The OAuth callback page is stuck in "Processing Login..." state and not completing the authentication.

## Steps to Debug

### 1. Check Browser Console
Open the browser developer console (F12) and look for the detailed logs:
- Should see "=== OAuth Callback Handler - Attempt X ===" 
- Check if Magic SDK is available
- See what `getRedirectResult()` returns

### 2. Check the URL Parameters
When you land on the callback page, the URL should have:
- `state=` parameter
- `code=` parameter
- Full URL example: `http://localhost:3000/oauth/callback?state=...&code=...`

### 3. Common Issues and Solutions

#### Issue: `getRedirectResult()` returns null
**Cause**: Magic SDK doesn't recognize this as an OAuth callback
**Solutions**:
1. The `redirectURI` in your code must EXACTLY match what's registered in Magic Dashboard
2. Check Magic Dashboard → Settings → Allowed Origins & Redirects
3. Make sure `http://localhost:3000/oauth/callback` is in the allowlist

#### Issue: Magic SDK not loading
**Cause**: Magic instances not initializing properly
**Solutions**:
1. Check that `NEXT_PUBLIC_MAGIC_API_KEY` is set in `.env.local`
2. Verify the OAuth extension is included in the Magic initialization
3. Check the MagicProvider is wrapping the app properly

#### Issue: redirect_uri_mismatch error
**Cause**: Mismatch between code and Magic Dashboard configuration
**Solutions**:
1. In `MergedLogin.tsx`, the `redirectURI` should be: `http://localhost:3000/oauth/callback`
2. In Magic Dashboard, add this exact URL to the allowlist
3. Also add it to Google OAuth settings if using Google

### 4. Quick Fixes to Try

#### Fix 1: Update redirectURI to use dynamic origin
```typescript
// In MergedLogin.tsx
redirectURI: `${window.location.origin}/oauth/callback`,
```

#### Fix 2: Ensure Magic Dashboard Configuration
1. Go to https://dashboard.magic.link
2. Select your app
3. Go to Settings → Allowed Origins & Redirects
4. Make sure these are added:
   ```
   http://localhost:3000
   http://localhost:3000/oauth/callback
   ```

#### Fix 3: Check if OAuth is happening at all
Add this before `loginWithRedirect`:
```typescript
console.log('Starting OAuth with:', {
  provider,
  redirectURI: 'http://localhost:3000/oauth/callback',
  origin: window.location.origin
});
```

### 5. Testing Steps

1. **Clear everything**:
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Start fresh**:
   - Go to login page
   - Open browser console
   - Click Google login
   - Watch the console logs

3. **After redirect back**:
   - You should see detailed logs in console
   - Check what `getRedirectResult()` returns
   - If it returns `null`, that's the problem

### 6. Alternative: Use popup instead of redirect (temporary test)

To quickly test if OAuth works at all, temporarily change back to popup:

```typescript
// In MergedLogin.tsx - TEMPORARY TEST ONLY
await activeMagic.oauth2.loginWithPopup({
  provider: provider as any,
});
```

If popup works but redirect doesn't, it's definitely a redirect URI configuration issue.

### 7. Check Network Tab

In browser DevTools → Network tab:
1. Look for requests to `auth.magic.link`
2. Check for any errors
3. Look for redirect responses (302/301)

## Expected Console Output (Success)

```
=== OAuth Callback Handler - Attempt 1 ===
Current URL: http://localhost:3000/oauth/callback?state=...&code=...
URL params: ?state=...&code=...
Has state: true
Has code: true
✓ Magic SDK available
✓ OAuth extension available
Calling getRedirectResult()...
getRedirectResult() returned
Result type: object
Result value: {...}
✓ Result received
✓ magic property exists
✓ DID token received, saving...
✓ Token saved to localStorage
Redirecting to dashboard...
```

## Expected Console Output (Failure - No OAuth detected)

```
=== OAuth Callback Handler - Attempt 1 ===
Current URL: http://localhost:3000/oauth/callback?state=...&code=...
URL params: ?state=...&code=...
Has state: true
Has code: true
✓ Magic SDK available
✓ OAuth extension available
Calling getRedirectResult()...
getRedirectResult() returned
Result type: undefined
Result value: null
✗ getRedirectResult() returned null/undefined
This usually means no OAuth flow is detected
```

If you see the failure output, the issue is that Magic doesn't recognize the callback URL.

## Next Steps

After running with the enhanced logging:
1. Copy the console output
2. Check what `getRedirectResult()` returns
3. If it returns null → redirect URI mismatch
4. If it throws an error → check the error message
5. If Magic SDK never loads → check initialization
