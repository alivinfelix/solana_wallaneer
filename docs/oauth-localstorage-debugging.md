# OAuth localStorage State Debugging Guide

## Current Issue

The OAuth callback is failing with:
```
OAuth state verification failed. The authentication session may have expired.
```

This means the `magic:state` is NOT present in localStorage when the OAuth callback page loads.

## Updated Code - Debug Mode

The code has been updated to log all Magic-related localStorage keys to help diagnose the issue.

### What to Check

#### 1. Before OAuth Redirect

When you click "Continue with Twitter", check the browser console for:

```
=== localStorage BEFORE loginWithRedirect ===
Magic-related keys before: [...]
```

**Expected:** Should show any existing Magic keys (might be empty on first login)

#### 2. After Redirect (On Callback Page)

When you land back on `/oauth/callback`, check the browser console for:

```
=== Checking localStorage for Magic SDK state ===
All localStorage keys with "magic": [...]
  <key>: <value>...
magic:state specifically: true/false
```

**Expected:** Should show `magic:state specifically: true`
**Problem:** If it shows `false`, the state is missing

## Possible Causes & Solutions

### 1. Browser Privacy Settings

**Symptom:** localStorage is cleared between redirects

**Browsers Affected:**
- Safari with "Prevent Cross-Site Tracking" enabled
- Firefox with Enhanced Tracking Protection (Strict mode)
- Brave with Shield settings
- Any browser in Private/Incognito mode

**Solution:**
```
Option A: Add your domain to browser exceptions
Option B: Test in a different browser (Chrome standard mode)
Option C: Disable strict tracking protection for your domain
```

### 2. Cross-Origin localStorage Isolation

**Symptom:** State is stored under a different origin than expected

**Check:**
- Main site origin: `https://solana-wallaneer.vercel.app`
- Callback origin: `https://solana-wallaneer.vercel.app/oauth/callback`

These **must be the same origin** (same protocol, domain, and port)

**Solution:**
Ensure your redirect URI matches your site's origin exactly:
```typescript
redirectURI: `${window.location.origin}/oauth/callback`
```

### 3. Magic SDK State Key Format

**Symptom:** Magic SDK uses a different key format than expected

Magic SDK might store state under keys like:
- `magic:state`
- `magic_state`
- `@magic/<api-key>:state`
- `oauth:state`

**Check Console Output:**
Look at "All localStorage keys with 'magic'" to see what's actually stored

**Solution:**
Based on the console output, we may need to adjust our state checking logic

### 4. Service Worker or Cache Issues

**Symptom:** Old JavaScript is cached, changes not applied

**Solution:**
1. Open DevTools
2. Go to Application tab → Service Workers
3. Click "Unregister" if any service worker exists
4. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
5. Clear cache and hard reload

### 5. Vercel Deployment Issue

**Symptom:** Changes deployed but not reflected

**Check:**
```bash
# View deployment logs
vercel logs

# Force new deployment
vercel --prod --force
```

**Solution:**
1. Clear Vercel's edge cache
2. Redeploy with a new commit
3. Check deployment preview matches your local code

### 6. Magic SDK Instance Mismatch

**Symptom:** Different Magic instances for initiation vs. callback

**Problem:** 
- Login initiated with `solanaMagic` instance
- Callback trying to verify with a different instance

**Solution:**
Ensure both use the same instance (already implemented: both use `solanaMagic`)

## Testing Steps

### Step 1: Clear Everything
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then hard refresh (Ctrl+Shift+R)
```

### Step 2: Initiate OAuth
1. Click "Continue with Twitter"
2. **BEFORE** being redirected, check console logs
3. Note what localStorage keys were created

### Step 3: Complete OAuth
1. Authenticate on Twitter
2. When redirected back, **IMMEDIATELY** open console
3. Check localStorage keys again
4. Compare with what was there before

### Step 4: Analyze the Difference

**If keys exist in Step 2 but not in Step 3:**
→ Browser is clearing localStorage (privacy settings)

**If keys never appear:**
→ Magic SDK not creating state (configuration issue)

**If keys exist but with different names:**
→ We're checking the wrong key name

## Debug Commands

### Check All localStorage Keys
```javascript
// In browser console
Object.keys(localStorage).forEach(key => {
  console.log(key, ':', localStorage.getItem(key));
});
```

### Monitor localStorage Changes
```javascript
// Add this before clicking login
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  console.log('localStorage.setItem:', key, '=', value.substring(0, 50));
  originalSetItem.apply(this, arguments);
};

const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
  console.log('localStorage.removeItem:', key);
  originalRemoveItem.apply(this, arguments);
};
```

### Check if localStorage Works
```javascript
// Test basic localStorage functionality
try {
  localStorage.setItem('test', 'value');
  const retrieved = localStorage.getItem('test');
  localStorage.removeItem('test');
  console.log('localStorage works:', retrieved === 'value');
} catch (e) {
  console.error('localStorage is blocked:', e);
}
```

## Expected Console Output (Success Case)

### Before Redirect:
```
Starting OAuth flow with provider: twitter
Redirect URI: https://solana-wallaneer.vercel.app/oauth/callback
=== localStorage BEFORE loginWithRedirect ===
Magic-related keys before: []
OAuth config: {provider: 'twitter', redirectURI: 'https://...'}
Using loginWithRedirect for: twitter
```

### On Callback:
```
Magic SDK available, processing OAuth callback...
OAuth extension available: Yes
=== Checking localStorage for Magic SDK state ===
All localStorage keys with "magic": ["magic:state", "magic:user"]
  magic:state: eyJhbGc...
magic:state specifically: true
URL state parameter present: true
URL code parameter present: true
Calling solanaMagic.oauth2.getRedirectResult() now...
✓ Result received
✓ DID token received, saving...
```

## Next Steps

1. **Deploy these debug changes** to production
2. **Test the OAuth flow** again
3. **Copy the console logs** and share them
4. **Based on the logs**, we can identify:
   - What key Magic SDK actually uses
   - Whether localStorage persists across redirect
   - If there are browser-specific issues

## Alternative Solutions

If localStorage continues to be problematic:

### Option A: Use SessionStorage
```typescript
// Store state in sessionStorage instead
sessionStorage.setItem('oauth:state', stateValue);
```

### Option B: Use URL Parameters
```typescript
// Pass state through URL (less secure)
const customState = generateState();
redirectURI: `${origin}/oauth/callback?custom_state=${customState}`
```

### Option C: Use Cookies
```typescript
// Store in HTTP-only cookie (requires backend)
document.cookie = `oauth_state=${stateValue}; SameSite=Lax; Secure`;
```

### Option D: Try Magic's Popup Mode
```typescript
// Instead of redirect, use popup (if supported)
const result = await activeMagic.oauth2.loginWithPopup({
  provider: 'twitter',
});
```

---

**Status:** Debug logging added, awaiting test results  
**Next:** Run OAuth flow and analyze console output  
**Goal:** Identify why `magic:state` is not persisting

