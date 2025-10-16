# OAuth Flow Diagram - Twitter/X Login

## 🔄 OAuth Flow (Corrected)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INITIATES LOGIN                        │
│                  (Clicks "Continue with Twitter")                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     MergedLogin.tsx                                 │
│  1. User clicks Twitter button                                      │
│  2. handleSocialLogin('twitter') is called                          │
│  3. Set session storage flags:                                      │
│     - magicOAuthAttempt = 'true'                                    │
│     - magicOAuthProvider = 'twitter'                                │
│  4. ✅ DO NOT clear magic:state (THIS WAS THE BUG!)                 │
│  5. Call: activeMagic.oauth2.loginWithRedirect({                   │
│       provider: 'twitter',                                          │
│       redirectURI: 'https://app.com/oauth/callback'                │
│     })                                                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Magic SDK (Before Redirect)                      │
│  1. Generate random state token (e.g., "abc123xyz")                 │
│  2. 💾 Store in localStorage['magic:state'] = "abc123xyz"          │
│  3. Build Twitter OAuth URL with:                                   │
│     - client_id                                                     │
│     - redirect_uri = 'https://app.com/oauth/callback'              │
│     - state = "abc123xyz"                                           │
│     - code_challenge (PKCE)                                         │
│  4. Redirect browser to Twitter                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Twitter OAuth Page                            │
│  1. User sees: "Wallaneer wants to access your Twitter account"    │
│  2. User clicks "Authorize app"                                     │
│  3. Twitter validates the request                                   │
│  4. Twitter generates authorization code                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Twitter Redirects Back                             │
│  URL: https://app.com/oauth/callback?                               │
│       state=abc123xyz&                                              │
│       code=twitter_auth_code_here                                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  oauth/callback.tsx (Our Handler)                   │
│  1. Page loads, useEffect runs                                      │
│  2. ✅ Check: localStorage['magic:state'] exists?                  │
│     - If NO: Show error (state was cleared - THIS WAS THE BUG!)    │
│     - If YES: Continue ✓                                            │
│  3. ✅ Check: URL has 'state' and 'code' parameters?               │
│     - If NO: Show error                                             │
│     - If YES: Continue ✓                                            │
│  4. Call: solanaMagic.oauth2.getRedirectResult()                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Magic SDK (Processing Callback)                        │
│  1. Read state from URL: "abc123xyz"                                │
│  2. Read state from localStorage['magic:state']: "abc123xyz"       │
│  3. ✅ Compare: Do they match?                                      │
│     - If NO: Throw error "[-32600] Issue verifying credentials"    │
│     - If YES: Continue ✓                                            │
│  4. Exchange authorization code for access token                    │
│  5. Create DID token from Twitter user info                         │
│  6. Return result with magic.idToken                                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  oauth/callback.tsx (Success)                       │
│  1. Receive result from getRedirectResult()                         │
│  2. Extract: didToken = result.magic.idToken                        │
│  3. Save to localStorage:                                           │
│     - localStorage['token'] = didToken                              │
│     - localStorage['loginType'] = 'SOCIAL'                          │
│  4. Show success toast                                              │
│  5. Redirect to dashboard: router.push('/')                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        USER IS LOGGED IN! 🎉                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ❌ What Was Wrong (Before Fix)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MergedLogin.tsx                                 │
│  ...                                                                │
│  4. ❌ localStorage.removeItem('magic:state')  ← BUG HERE!          │
│     (Clearing the state before OAuth starts)                        │
│  5. Call: activeMagic.oauth2.loginWithRedirect(...)                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Magic SDK (Before Redirect)                      │
│  1. Generate random state token: "abc123xyz"                        │
│  2. 💾 Store in localStorage['magic:state'] = "abc123xyz"          │
│     (State is created AFTER we cleared it, so it exists initially)  │
│  3. Redirect to Twitter...                                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                  [User authenticates on Twitter]
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  oauth/callback.tsx (Our Handler)                   │
│  1. Page loads                                                      │
│  2. ❌ Check: localStorage['magic:state']                          │
│     Result: May exist or may not (timing issue)                     │
│  4. Call: solanaMagic.oauth2.getRedirectResult()                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Magic SDK (Processing Callback)                        │
│  1. Read state from URL: "abc123xyz"                                │
│  2. Try to read localStorage['magic:state']                         │
│  3. ❌ State might be missing or mismatched!                        │
│  4. ⚠️ Throw error: "[-32600] Issue verifying credentials"         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Why State Verification is Important

The `state` parameter prevents **Cross-Site Request Forgery (CSRF)** attacks:

### Without State Verification (Vulnerable):
```
1. Attacker creates malicious OAuth link
2. Victim clicks link while logged in
3. Attacker gains access to victim's account
```

### With State Verification (Secure):
```
1. Your app generates random state: "abc123xyz"
2. Stores it locally and sends to OAuth provider
3. OAuth provider returns the same state
4. Your app verifies: sent_state === returned_state
5. If they don't match → Reject (potential attack)
6. If they match → Accept (legitimate request)
```

### The Flow:
```
┌─────────┐                    ┌─────────┐                   ┌─────────┐
│  Your   │  state=abc123xyz   │ Twitter │  state=abc123xyz  │  Your   │
│   App   │ ──────────────────>│  OAuth  │ ─────────────────>│   App   │
│ (Start) │                    │         │                   │ (Verify)│
└─────────┘                    └─────────┘                   └─────────┘
     │                                                             │
     │ Store locally:                                              │
     │ magic:state = "abc123xyz"                                   │
     │                                                             │
     └─────────────────────────────────────────────────────────────┘
                      Verify: stored === returned
```

---

## 📊 Key Takeaways

1. **Never clear `magic:state`** from localStorage during OAuth flow
2. The state is automatically managed by Magic SDK
3. State verification prevents security vulnerabilities
4. Both URL state and localStorage state must match for verification
5. The state is only valid for one OAuth session

---

## 🛠️ Debugging Tips

### Check State at Each Step:

**Before initiating OAuth:**
```javascript
// Should be null or from a previous session
console.log('State before:', localStorage.getItem('magic:state'));
```

**After clicking login (but before redirect):**
```javascript
// Magic SDK should have created a new state
console.log('State after loginWithRedirect:', localStorage.getItem('magic:state'));
```

**On callback page:**
```javascript
// Should still exist and match URL parameter
const storedState = localStorage.getItem('magic:state');
const urlState = new URLSearchParams(window.location.search).get('state');
console.log('Stored state:', storedState);
console.log('URL state:', urlState);
console.log('Match:', storedState === urlState);
```

---

**Diagram Version:** 1.0  
**Last Updated:** After OAuth verification fix  
**Status:** Reflects corrected implementation

