# Content Security Policy (CSP) Configuration for Wallaneer

## Overview

This document explains the Content Security Policy configuration required for Wallaneer to work properly with Magic SDK and OAuth providers, especially Telegram.

## Why CSP is Important

Content Security Policy (CSP) is a security feature that helps prevent:
- Cross-site scripting (XSS) attacks
- Data injection attacks
- Unauthorized script execution
- Clickjacking

For OAuth authentication to work, we need to explicitly allow scripts and frames from trusted OAuth providers.

## CSP Configuration for Telegram OAuth

Telegram OAuth requires allowing scripts and frames from:
- `https://telegram.org`
- `https://web.telegram.org`
- `https://oauth.telegram.org`

**Important**: These must be configured in YOUR application's CSP, NOT in Magic Dashboard settings. Magic Dashboard CSP settings are only for custom RPC URLs and blockchain nodes.

## Implementation in Wallaneer

We've implemented CSP in two places for maximum compatibility:

### 1. Next.js Configuration (`next.config.js`)

Primary CSP configuration via HTTP headers:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.magic.link https://telegram.org https://web.telegram.org",
              "connect-src 'self' https://auth.magic.link https://api.magic.link https://rpc.magic.link https://*.solana.com https://*.helius-rpc.com wss://*.solana.com https://telegram.org https://web.telegram.org",
              "frame-src 'self' https://auth.magic.link https://verify.magic.link https://oauth.telegram.org",
              "img-src 'self' data: https: blob:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
}
```

### 2. HTML Meta Tag (`_document.tsx`)

Backup CSP via meta tag (for environments where headers aren't supported):

```jsx
<Head>
  <meta 
    httpEquiv="Content-Security-Policy" 
    content="script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.magic.link https://telegram.org https://web.telegram.org; frame-src 'self' https://auth.magic.link https://verify.magic.link https://oauth.telegram.org;" 
  />
</Head>
```

## CSP Directives Explained

### `script-src`
Controls which scripts can be executed:
- `'self'` - Scripts from your own domain
- `'unsafe-eval'` - Required for some JavaScript frameworks
- `'unsafe-inline'` - Inline scripts (needed for Next.js)
- `https://auth.magic.link` - Magic SDK scripts
- `https://telegram.org` - Telegram OAuth scripts
- `https://web.telegram.org` - Telegram web app scripts

### `connect-src`
Controls which URLs can be loaded using script interfaces:
- `'self'` - Your own API endpoints
- `https://auth.magic.link` - Magic authentication
- `https://api.magic.link` - Magic API calls
- `https://rpc.magic.link` - Magic RPC endpoints
- `https://*.solana.com` - Solana RPC nodes
- `https://*.helius-rpc.com` - Helius RPC endpoints
- `wss://*.solana.com` - WebSocket connections to Solana
- `https://telegram.org` - Telegram API
- `https://web.telegram.org` - Telegram web services

### `frame-src`
Controls which URLs can be embedded in frames/iframes:
- `'self'` - Your own domain
- `https://auth.magic.link` - Magic authentication frames
- `https://verify.magic.link` - Magic verification frames
- `https://oauth.telegram.org` - Telegram OAuth popup

### `img-src`
Controls image sources:
- `'self'` - Your own images
- `data:` - Data URLs (base64 images)
- `https:` - All HTTPS images (including user profile pictures)
- `blob:` - Blob URLs (for dynamic images)

### `style-src`
Controls stylesheets:
- `'self'` - Your own stylesheets
- `'unsafe-inline'` - Inline styles (needed for many CSS-in-JS solutions)

### `font-src`
Controls font sources:
- `'self'` - Your own fonts
- `data:` - Data URL fonts

## Additional Security Headers

We also set these security headers:

```javascript
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN',
},
{
  key: 'X-Content-Type-Options',
  value: 'nosniff',
},
{
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin',
}
```

## Testing CSP Configuration

### 1. Check Browser Console
- Open DevTools (F12)
- Look for CSP violations in Console tab
- Should see no CSP errors related to Telegram

### 2. Test Telegram Login
- Click "Continue with Telegram"
- Popup should open without CSP errors
- Check Console for any blocked resources

### 3. Verify Headers
```bash
# Check CSP headers
curl -I http://localhost:3000 | grep -i content-security
```

## Troubleshooting

### Issue: "Refused to load the script"
**Symptom**: Console shows CSP violation for Telegram scripts
**Solution**: Verify `script-src` includes `https://telegram.org` and `https://web.telegram.org`

### Issue: "Refused to display in a frame"
**Symptom**: Telegram popup doesn't open or shows blank
**Solution**: Add `https://oauth.telegram.org` to `frame-src`

### Issue: CSP not applying
**Symptom**: No CSP headers in Network tab
**Solutions**:
1. Restart Next.js dev server: `npm run dev`
2. Clear browser cache
3. Check `next.config.js` syntax

### Issue: Too restrictive CSP
**Symptom**: Other features breaking
**Solution**: Review each directive and add necessary domains incrementally

## Production Considerations

### For Vercel Deployment
CSP headers from `next.config.js` work automatically on Vercel.

### For Custom Server
If using a custom server, implement CSP headers at the server level:

**Nginx:**
```nginx
add_header Content-Security-Policy "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.magic.link https://telegram.org https://web.telegram.org; ...";
```

**Express:**
```javascript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-eval' ...");
  next();
});
```

### For Docker
Ensure CSP headers are set either in:
1. `next.config.js` (recommended)
2. Reverse proxy (nginx/apache)
3. Application server

## CSP Reporting

To monitor CSP violations in production:

```javascript
// Add to next.config.js CSP
"report-uri /api/csp-report",
"report-to csp-endpoint"
```

Then create an endpoint to collect reports:

```javascript
// pages/api/csp-report.js
export default function handler(req, res) {
  console.log('CSP Violation:', req.body);
  res.status(204).end();
}
```

## Best Practices

1. **Start Strict**: Begin with restrictive CSP and loosen as needed
2. **Test Thoroughly**: Test all OAuth providers after CSP changes
3. **Monitor Violations**: Set up CSP reporting in production
4. **Document Changes**: Keep this file updated with CSP modifications
5. **Regular Review**: Audit CSP quarterly for unnecessary permissions

## Related OAuth Providers

If you add more OAuth providers in the future, you may need to add:

### GitHub
- Already covered by default CSP (uses Magic's OAuth flow)

### Google
- Already covered by default CSP (uses Magic's OAuth flow)

### Facebook
- Already covered by default CSP (uses Magic's OAuth flow)

### Discord
- May need: `https://discord.com` in `script-src` and `frame-src`

### Apple
- May need: `https://appleid.apple.com` in `frame-src`

## Resources

- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Magic SDK Documentation](https://magic.link/docs)
- [Telegram OAuth Documentation](https://core.telegram.org/widgets/login)

## Last Updated

Date: October 16, 2025
Status: Production-ready configuration with Telegram OAuth support
