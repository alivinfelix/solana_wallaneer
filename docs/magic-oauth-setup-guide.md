# Magic OAuth Setup Guide

This guide provides step-by-step instructions for setting up and implementing OAuth authentication with Magic SDK in the Wallaneer application.

## Magic Dashboard Configuration

### Access Dashboard
1. Go to [Magic Dashboard](https://dashboard.magic.link)
2. Select your Wallaneer application

### Social Login Setup
1. Navigate to **Social Login** from the sidebar
2. Toggle ON your desired providers:
   - Google
   - Twitter (X)
   - Telegram
   - Others as needed

### Redirect Allowlist Configuration
1. Go to the **Settings** tab
2. Find the "**Allowed Origins & Redirects**" section
3. Toggle the **Redirect** switch to enable it
4. Add your redirect URLs:
   ```
   https://wallaneer.com/oauth/callback
   https://app.wallaneer.com/oauth/callback
   http://localhost:3000/oauth/callback
   ```
   > Note: Multiple URLs can be separated by commas or line breaks
5. Click **Save**

### Provider-Specific Setup

For each OAuth provider, you need to whitelist your redirectURI in their respective dashboards:

#### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth Client ID
4. Add your redirect URIs to **Authorized Redirect URIs**:
   ```
   https://wallaneer.com/oauth/callback
   https://app.wallaneer.com/oauth/callback
   http://localhost:3000/oauth/callback
   ```

#### Twitter/X
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Navigate to your Project/App settings
3. Update the **Callback URLs** with your redirect URIs

#### Facebook
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Navigate to your App settings
3. Under **Facebook Login** > **Settings**
4. Add your redirect URIs to **Valid OAuth Redirect URIs**

#### Apple
1. Go to [Apple Developer](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select your App ID
4. Under **Sign In with Apple**, add your domains and redirect URIs

## Implementation in Wallaneer

### 1. Update SocialLogin.tsx

Replace the current `loginWithPopup` implementation with `loginWithRedirect`:

```typescript
// src/components/magic/auth/SocialLogin.tsx

const handleSocialLogin = async (provider: SocialProvider) => {
  try {
    setIsLoading(true);
    setCurrentProvider(provider);
    
    // Use solanaMagic as default since it's the primary network
    const activeMagic = solanaMagic || magic;
    
    if (!activeMagic?.oauth2) {
      showToast({
        message: 'OAuth extension not available. Please check your Magic configuration.',
        type: 'error',
      });
      return;
    }

    // Store in session storage that we're attempting OAuth
    sessionStorage.setItem('magicOAuthAttempt', 'true');
    sessionStorage.setItem('magicOAuthProvider', provider);
    
    // Use loginWithRedirect instead of loginWithPopup
    await activeMagic.oauth2.loginWithRedirect({
      provider: provider as any,
      redirectURI: `${window.location.origin}/oauth/callback`,
      // Optional scopes based on provider
      scope: provider === 'google' ? ['email', 'profile'] : undefined
    });
    
    // Note: The flow will redirect away from the current page,
    // so the code below won't execute until the user returns
    
  } catch (e) {
    console.error('Social login error:', e);
    if (e instanceof RPCError) {
      showToast({ message: e.message, type: 'error' });
    } else {
      showToast({
        message: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`,
        type: 'error',
      });
    }
    
    // Clear OAuth attempt flag on error
    sessionStorage.removeItem('magicOAuthAttempt');
    sessionStorage.removeItem('magicOAuthProvider');
    
    setIsLoading(false);
    setCurrentProvider(null);
  }
};
```

### 2. Create OAuth Callback Page

Create a dedicated callback page at `/oauth/callback`:

```typescript
// src/pages/oauth/callback.tsx

import { useEffect, useState } from 'react';
import { useMagic } from '@/components/magic/MagicProvider';
import { saveToken } from '@/utils/common';
import showToast from '@/utils/showToast';
import { useRouter } from 'next/router';
import Spinner from '@/components/ui/Spinner';

const OAuthCallback = () => {
  const { solanaMagic } = useMagic();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleOAuthResult = async () => {
      if (!solanaMagic?.oauth2) {
        console.log('Magic SDK not available yet, waiting...');
        return;
      }
      
      try {
        console.log('Processing OAuth callback...');
        
        // Get the result of the OAuth redirect
        const result = await solanaMagic.oauth2.getRedirectResult();
        console.log('OAuth result:', result);
        
        if (result) {
          // Get the DID token
          const didToken = result.magic.idToken;
          
          if (didToken) {
            // Save the token in localStorage
            localStorage.setItem('token', didToken);
            localStorage.setItem('loginType', 'SOCIAL');
            
            // Show success message
            showToast({
              message: 'Successfully logged in with social provider',
              type: 'success',
            });
            
            // Redirect to the dashboard
            router.push('/');
          } else {
            setError('No authentication token received');
          }
        } else {
          setError('Authentication failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsProcessing(false);
        sessionStorage.removeItem('magicOAuthAttempt');
        sessionStorage.removeItem('magicOAuthProvider');
      }
    };
    
    // Add a small delay to ensure Magic SDK is fully initialized
    const timer = setTimeout(handleOAuthResult, 500);
    
    return () => clearTimeout(timer);
  }, [solanaMagic, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          {isProcessing ? 'Processing Login...' : error ? 'Login Error' : 'Login Successful'}
        </h1>
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center">
            <Spinner className="w-12 h-12 mb-4" />
            <p className="text-gray-300">Please wait while we complete your authentication...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-green-400 mb-4">Authentication successful! Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
```

### 3. Update OAuthCallbackHandler Component

Update the existing `OAuthCallbackHandler` component to work with both redirect and popup methods:

```typescript
// src/components/magic/OAuthCallbackHandler.tsx

import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useMagic } from './MagicProvider';
import { saveToken } from '@/utils/common';
import showToast from '@/utils/showToast';
import { useRouter } from 'next/router';

interface OAuthCallbackHandlerProps {
  setToken: Dispatch<SetStateAction<string>>;
}

const OAuthCallbackHandler: React.FC<OAuthCallbackHandlerProps> = ({ setToken }) => {
  const { solanaMagic } = useMagic();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only run on the main page, not on the dedicated callback page
    if (window.location.pathname === '/oauth/callback') {
      return;
    }

    const checkForOAuthResult = async () => {
      // Don't proceed if Magic SDK isn't available
      if (!solanaMagic?.oauth2) {
        console.log('Magic SDK not available yet, waiting...');
        return;
      }
      
      // Check if we're returning from a popup OAuth flow
      // This is a fallback for popup flow, as we're primarily using redirect flow now
      const isOAuthAttempt = sessionStorage.getItem('magicOAuthAttempt') === 'true';
      
      if (!isOAuthAttempt) {
        // No OAuth attempt in progress, don't need to check
        return;
      }
      
      try {
        setIsProcessing(true);
        console.log('Checking for OAuth result...');
        
        // Wait a moment for Magic to process any pending redirects
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // This will return null if there's no pending result
        const result = await solanaMagic.oauth2.getRedirectResult();
        
        if (result) {
          console.log('OAuth result found!', result);
          // Get the DID token
          const didToken = result.magic.idToken;
          
          if (didToken) {
            // Save the token
            saveToken(didToken, setToken, 'SOCIAL');
            
            // Show success message
            showToast({
              message: 'Successfully logged in with social provider',
              type: 'success',
            });
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        
        // Only show error if it looks like we're processing a callback
        const isLikelyCallback = 
          window.location.href.includes('state=') || 
          window.location.href.includes('code=') ||
          window.location.href.includes('magic_credential') ||
          isOAuthAttempt;
          
        if (isLikelyCallback) {
          showToast({
            message: `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            type: 'error',
          });
        }
      } finally {
        setIsProcessing(false);
        // Clear the OAuth attempt flag
        sessionStorage.removeItem('magicOAuthAttempt');
        sessionStorage.removeItem('magicOAuthProvider');
      }
    };
    
    // Add a small delay to ensure Magic SDK is fully initialized
    const timer = setTimeout(checkForOAuthResult, 300);
    
    return () => clearTimeout(timer);
  }, [solanaMagic, setToken, router]);

  // This component doesn't render anything visible
  return null;
};

export default OAuthCallbackHandler;
```

## Testing the OAuth Flow

1. **Start the Application**:
   ```
   npm run dev
   ```

2. **Test Social Login**:
   - Navigate to the login page
   - Click on a social provider button (e.g., Google)
   - You should be redirected to the provider's login page
   - After authentication, you should be redirected back to your callback URL
   - The callback page should process the result and redirect you to the dashboard

3. **Debug Common Issues**:
   - Check browser console for errors
   - Verify that the redirect URI exactly matches what's configured in Magic Dashboard
   - Ensure all providers have the correct redirect URIs configured
   - Check that `sessionStorage` is being properly set and cleared

## Key Differences from Magic Login Widget

The main difference when using `loginWithRedirect` instead of Magic's default popup approach:

1. **Full Control**: You control the redirect flow and UI
2. **No Popups**: Avoids popup blockers that can interfere with authentication
3. **Custom Callback**: You implement your own callback page
4. **Mobile Friendly**: Better experience on mobile devices
5. **Provider Configuration**: You must configure each provider with your redirectURI

## Troubleshooting

### Redirect URI Mismatch
If you see a "redirect_uri_mismatch" error:
- Ensure the exact redirectURI you pass to `loginWithRedirect` is whitelisted in both Magic Dashboard and the provider's dashboard
- Check for typos, protocol differences (http vs https), or trailing slashes

### Authentication Fails Silently
- Check that `getRedirectResult()` is being called on your callback page
- Verify that session storage flags are being set before redirect and cleared after processing

### Provider-Specific Issues
- Google: Ensure your Google Cloud project has the necessary APIs enabled
- Twitter: Check that your app has the correct permissions
- Apple: Make sure your domain is properly verified

### Network or CORS Issues
- Check that your application is running on an allowed origin
- Verify that your domain is properly configured in Magic Dashboard
