# Quick Debug Guide - Twitter OAuth

## ⚡ Quick Start

1. **Deploy the changes** (already committed if you accepted them)
2. **Open browser console** (F12 → Console tab)
3. **Clear browser data** (Ctrl+Shift+Delete → Clear localStorage)
4. **Try Twitter login**
5. **Copy ALL console logs**
6. **Share the logs**

## 🔍 What to Look For

### When You Click "Continue with Twitter"

```
✅ GOOD: You see these logs
Starting OAuth flow with provider: twitter
=== localStorage BEFORE loginWithRedirect ===

❌ BAD: No logs appear
→ Code not deployed or console filtered
```

### When You Return from Twitter

```
✅ GOOD: You see
=== Checking localStorage for Magic SDK state ===
All localStorage keys with "magic": ["magic:state"]
magic:state specifically: true

❌ BAD: You see
All localStorage keys with "magic": []
magic:state specifically: false
→ State is missing! This is the problem.
```

### If You Get the -32600 Error

```
Look for this section in console:
===== STATE VERIFICATION ERROR =====
Current localStorage state: <X>
URL state parameter: <Y>
Do they match?: true/false

Copy this entire section and share it.
```

## 📋 Info to Collect

1. **Full console logs** (select all, copy, paste)
2. **Browser**: Chrome/Firefox/Safari + version
3. **URL when error occurs**: Copy from address bar
4. **localStorage contents**: Run this in console:
   ```javascript
   Object.keys(localStorage).filter(k=>k.includes('magic'))
   ```

## 🎯 Most Likely Causes

### If `magic:state` is missing:
→ **Browser privacy settings** blocking localStorage  
→ **Try:** Chrome without extensions, not incognito

### If states don't match:
→ **Multiple sessions** or **expired state**  
→ **Try:** Clear all data, single attempt

### If redirect URI error:
→ **Configuration mismatch**  
→ **Check:** Magic Dashboard + Twitter Developer Portal

## 🚀 Quick Fixes to Try

### Fix 1: Different Browser
- Try Chrome (not incognito)
- Disable all extensions
- Allow all cookies/storage

### Fix 2: Clear Everything
```javascript
// In console:
localStorage.clear();
sessionStorage.clear();
// Then hard refresh: Ctrl+Shift+R
```

### Fix 3: Check URLs Match
- Magic Dashboard: `https://solana-wallaneer.vercel.app/oauth/callback`
- Twitter Settings: `https://solana-wallaneer.vercel.app/oauth/callback`
- Code uses: `${window.location.origin}/oauth/callback`

All must be EXACTLY the same (no trailing slashes, same protocol).

## 📞 What to Send

**Subject:** Twitter OAuth Debug Logs

**Message:**
```
Browser: [Chrome 120 / Firefox 115 / Safari 17]
OS: [Windows / Mac / Linux]
URL when error occurred: [paste from address bar]

Console logs:
[paste entire console output from clicking login through to error]
```

## ✅ Success Looks Like

```
Calling solanaMagic.oauth2.getRedirectResult() now...
getRedirectResult() returned
✓ Result received
✓ magic property exists
✓ DID token received, saving...
✓ Token saved to localStorage
Redirecting to dashboard...

[Then you see the dashboard]
```

---

**Need help?** Share the console logs and we can diagnose the exact issue.

