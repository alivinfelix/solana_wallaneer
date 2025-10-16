/**
 * OAuth Flow Test Script
 * 
 * This script helps verify that your OAuth configuration is working correctly.
 * Run this script in your browser console when testing the OAuth flow.
 */

(function() {
  console.log('=== OAuth Flow Test Script ===');
  
  // Check if we're on the right pages
  const isLoginPage = window.location.pathname === '/' || window.location.pathname === '/login';
  const isCallbackPage = window.location.pathname === '/oauth/callback';
  const isDashboardPage = window.location.pathname.includes('/dashboard');
  
  console.log('Current page:', window.location.pathname);
  
  if (isLoginPage) {
    console.log('✓ On login page, ready to test OAuth flow');
    console.log('Steps to test:');
    console.log('1. Click on a social login button (e.g., Google)');
    console.log('2. You should be redirected to the provider login page');
    console.log('3. After authentication, you should be redirected back to /oauth/callback');
    console.log('4. The callback page should process the result and redirect you to the dashboard');
    
    // Check for Magic SDK
    if (window.magic) {
      console.log('✓ Magic SDK found in window object');
    } else {
      console.log('✗ Magic SDK not found in window object');
    }
    
    // Check for OAuth extension
    setTimeout(() => {
      const magicInstance = window.magic || (window.solanaMagic || {});
      if (magicInstance.oauth2) {
        console.log('✓ OAuth extension found');
      } else {
        console.log('✗ OAuth extension not found');
      }
    }, 1000);
    
  } else if (isCallbackPage) {
    console.log('✓ On OAuth callback page');
    console.log('Checking URL parameters:');
    
    // Check for expected OAuth parameters
    const hasState = window.location.href.includes('state=');
    const hasCode = window.location.href.includes('code=');
    const hasMagicCredential = window.location.href.includes('magic_credential');
    
    console.log('- state parameter:', hasState ? '✓ Present' : '✗ Missing');
    console.log('- code parameter:', hasCode ? '✓ Present' : '✗ Missing');
    console.log('- magic_credential:', hasMagicCredential ? '✓ Present' : '✗ Missing');
    
    if (!hasState && !hasCode && !hasMagicCredential) {
      console.log('⚠️ No OAuth parameters found in URL. This might not be a valid OAuth callback.');
    }
    
    // Check session storage
    const oauthAttempt = sessionStorage.getItem('magicOAuthAttempt');
    const oauthProvider = sessionStorage.getItem('magicOAuthProvider');
    
    console.log('Session storage:');
    console.log('- magicOAuthAttempt:', oauthAttempt ? `✓ Set to ${oauthAttempt}` : '✗ Not set');
    console.log('- magicOAuthProvider:', oauthProvider ? `✓ Set to ${oauthProvider}` : '✗ Not set');
    
  } else if (isDashboardPage) {
    console.log('✓ On dashboard page, OAuth flow completed');
    
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    const loginType = localStorage.getItem('loginType');
    
    console.log('Local storage:');
    console.log('- token:', token ? '✓ Present' : '✗ Missing');
    console.log('- loginType:', loginType ? `✓ Set to ${loginType}` : '✗ Not set');
    
    if (token && loginType === 'SOCIAL') {
      console.log('✓ OAuth authentication successful!');
    } else {
      console.log('⚠️ Token missing or not from social login');
    }
  } else {
    console.log('⚠️ Not on a recognized page for OAuth testing');
  }
  
  // Check Magic configuration
  console.log('\nMagic Configuration:');
  try {
    // Try to access Magic configuration
    setTimeout(() => {
      const magicInstance = window.magic || window.solanaMagic;
      if (magicInstance) {
        console.log('✓ Magic instance found');
        
        // Check if we can access the API key (might be restricted)
        try {
          const apiKey = magicInstance.apiKey;
          console.log('- API Key:', apiKey ? `✓ Set to ${apiKey}` : '✗ Not accessible');
        } catch (e) {
          console.log('- API Key: ✗ Not accessible (expected for security)');
        }
        
        // Check OAuth extension
        if (magicInstance.oauth2) {
          console.log('✓ OAuth extension initialized');
        } else {
          console.log('✗ OAuth extension not initialized');
        }
      } else {
        console.log('✗ No Magic instance found');
      }
    }, 1000);
  } catch (e) {
    console.log('Error accessing Magic configuration:', e);
  }
  
  console.log('\nTo debug OAuth issues:');
  console.log('1. Check the Network tab for requests to auth.magic.link');
  console.log('2. Look for redirect_uri_mismatch errors in the response');
  console.log('3. Verify that your redirectURI matches what\'s configured in Magic Dashboard');
  console.log('4. Check that sessionStorage is being properly set before redirect');
})();
