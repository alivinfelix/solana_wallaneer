# OAuth Console Debugging - What to Look For

## Current Status

The code has been updated with extensive console logging to help diagnose the `-32600` OAuth verification error.

## How to Debug

### Step 1: Open Browser Console

1. Open your browser DevTools (F12)
2. Go to the **Console** tab
3. Clear the console (important for clean logs)

### Step 2: Initiate OAuth Login

1. Navigate to: `https://solana-wallaneer.vercel.app`
2. Click "Login / Sign up"
3. Click "Continue with X (Twitter)"

### Step 3: Check "Before Redirect" Logs

Look for these console logs **before** being redirected to Twitter:

```
Starting OAuth flow with provider: twitter
Redirect URI: https://solana-wallaneer.vercel.app/oauth/callback
OAuth config: {provider: 'twitter', redirectURI: '...'}
Using loginWithRedirect for: twitter

=== localStorage BEFORE loginWithRedirect ===
Magic-related keys before: [...]

=== localStorage AFTER loginWithRedirect (if this shows, redirect was delayed) ===
Magic-related keys after: [...]
```

**What to Note:**
- Did you see "localStorage AFTER" logs? (Usually no, because redirect happens immediately)
- Were there any Magic-related keys listed?

### Step 4: Complete Twitter Authentication

1. You'll be redirected to Twitter
2. Click "Authorize app"
3. You'll be redirected back to `/oauth/callback`

### Step 5: Check "Callback" Logs

When you land on the callback page, look for these logs:

```
=== OAuth Callback Handler - Attempt X ===
Magic SDK available, processing OAuth callback...
OAuth extension available: Yes

=== Checking localStorage for Magic SDK state ===
All localStorage keys with "magic": [...]
  <key>: <value>...
magic:state specifically: true/false

URL state parameter present: true/false
URL code parameter present: true/false

Calling solanaMagic.oauth2.getRedirectResult() now...
```

### Step 6: Check for Error Logs

If the `-32600` error occurs, you should see:

```
OAuth callback error: RPCError: ...
RPCError code: -32600 message: There was an issue verifying OAuth credentials.

===== STATE VERIFICATION ERROR =====
This error means Magic SDK could not verify the OAuth state.
Possible causes:
1. State mismatch between stored and returned values
2. State expired or was cleared
3. Redirect URI mismatch
4. OAuth flow was initiated from a different domain
====================================

Current localStorage state: <value or null>
URL state parameter: <value>
Do they match?: true/false
```

## Critical Information to Collect

### A. localStorage Keys

**Question:** What keys are present in localStorage?

```
All localStorage keys with "magic": [...]
```

**We need to see:**
- The exact key names
- Whether `magic:state` exists or Magic uses a different key

### B. State Comparison

**Question:** Do the states match?

```
Current localStorage state: <stored_value>
URL state parameter: <url_value>
Do they match?: true/false
```

**Scenarios:**
1. **Both null** = State never created → Magic SDK init issue
2. **localStorage null, URL has value** = State cleared/lost → Browser privacy issue
3. **Both have values, don't match** = State mismatch → Security issue
4. **Both have same value** = Should work → Different problem

### C. URL Parameters

**Question:** Does the callback URL have required parameters?

Check the browser address bar:
```
https://solana-wallaneer.vercel.app/oauth/callback?state=XXXX&code=YYYY
```

Should have both `state` and `code` parameters.

## Common Issues & What Logs Will Show

### Issue 1: localStorage Cleared by Browser

**Logs you'll see:**
```
=== localStorage BEFORE loginWithRedirect ===
Magic-related keys before: []  ← Empty or has previous session

[Redirect to Twitter]
[Redirect back]

=== Checking localStorage for Magic SDK state ===
All localStorage keys with "magic": []  ← Empty!
magic:state specifically: false
```

**Diagnosis:** Browser privacy settings are clearing localStorage

**Solution:** 
- Test in Chrome (standard mode, not incognito)
- Disable tracking protection for your domain
- Check browser console for storage warnings

### Issue 2: Magic SDK Uses Different Key

**Logs you'll see:**
```
=== Checking localStorage for Magic SDK state ===
All localStorage keys with "magic": ["@magic/abc123:oauth", "magic_session"]
magic:state specifically: false
```

**Diagnosis:** Magic stores state under a different key name

**Solution:** 
- Note the actual key names from the logs
- Update our code to check the correct key
- Might be versioned or API-key-specific

### Issue 3: State Mismatch

**Logs you'll see:**
```
===== STATE VERIFICATION ERROR =====
Current localStorage state: "abc123xyz"
URL state parameter: "def456uvw"
Do they match?: false
```

**Diagnosis:** The state values don't match (serious security issue)

**Possible Causes:**
- Multiple OAuth attempts overlapping
- State from different session
- MITM attack (unlikely but possible)

**Solution:**
- Clear all browser data
- Try again with only one attempt
- Check if multiple tabs are running OAuth

### Issue 4: Redirect URI Mismatch

**Logs you'll see:**
```
OAuth callback error: redirect_uri_mismatch
```

**Diagnosis:** The callback URL doesn't match what's registered

**Solution:**
- Check Magic Dashboard allowlist
- Check Twitter app settings
- Ensure exact match (no trailing slashes, correct protocol)

## What to Send for Debugging

Please copy and send the following from the console:

### 1. Before Redirect Section
```
[Copy everything from "Starting OAuth flow" to the point where redirect happens]
```

### 2. Callback Section  
```
[Copy everything from "Magic SDK available" to the error or success message]
```

### 3. localStorage Contents
```javascript
// Run this in console and send output:
const allStorage = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.toLowerCase().includes('magic')) {
    allStorage[key] = localStorage.getItem(key)?.substring(0, 50) + '...';
  }
}
console.log(JSON.stringify(allStorage, null, 2));
```

### 4. URL When Error Occurs
```
[Copy the full URL from address bar when on callback page]
```

## Expected Success Flow

When everything works, you should see:

```
[BEFORE REDIRECT]
Starting OAuth flow with provider: twitter
...

[ON CALLBACK]
Magic SDK available, processing OAuth callback...
All localStorage keys with "magic": ["magic:state"]
magic:state specifically: true
URL state parameter present: true
URL code parameter present: true
Calling solanaMagic.oauth2.getRedirectResult() now...
getRedirectResult() returned
Result type: object
✓ Result received
✓ magic property exists
✓ DID token received, saving...
✓ Token saved to localStorage
Redirecting to dashboard...
```

## Next Steps Based on Logs

**Scenario A: State exists, matches, still get -32600**
→ Likely a redirect URI or provider configuration issue

**Scenario B: State missing from localStorage**
→ Browser privacy issue or Magic SDK not creating state

**Scenario C: State exists but doesn't match**
→ Session or timing issue, need to investigate state lifecycle

**Scenario D: Different Magic keys in localStorage**
→ Need to update code to use correct key names

---

**Action Required:** 
1. Deploy these changes
2. Test OAuth flow
3. Copy ALL console logs
4. Share logs for analysis

**Files Changed:**
- `src/pages/oauth/callback.tsx` (extensive logging added)
- `src/components/magic/auth/MergedLogin.tsx` (before-redirect logging added)

