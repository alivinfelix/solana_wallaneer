import { useEffect, useState } from 'react';
import { useMagic } from '@/components/magic/MagicProvider';
import { saveToken } from '@/utils/common';
import showToast from '@/utils/showToast';
import { useRouter } from 'next/router';
import Spinner from '@/components/ui/Spinner';
import { RPCError } from 'magic-sdk';

const OAuthCallback = () => {
  const { solanaMagic } = useMagic();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Handle client-side mounting to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    
    const handleOAuthResult = async () => {
      // Log URL parameters for debugging
      //console.log('=== OAuth Callback Handler - Attempt', retryCount + 1, '===');
      //console.log('Current URL:', window.location.href);
      //console.log('URL params:', window.location.search);
      //console.log('Has state:', window.location.search.includes('state='));
      //console.log('Has code:', window.location.search.includes('code='));
      
      if (!solanaMagic?.oauth2) {
        //console.log('Magic SDK not available yet, waiting...');
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Retry after a delay if Magic SDK is not available
          setTimeout(handleOAuthResult, 1000);
        } else {
          //console.error('Max retries reached, Magic SDK still not available');
          setError('Magic SDK failed to load after multiple attempts');
          setIsProcessing(false);
        }
        return;
      }
      
      //console.log('✓ Magic SDK available');
      //console.log('✓ OAuth extension available');
      
      try {
        console.log('Magic SDK available, processing OAuth callback...');
        console.log('Magic instance:', solanaMagic);
        console.log('OAuth extension available:', solanaMagic.oauth2 ? 'Yes' : 'No');
        
        // Check for magic:state in localStorage - this is crucial for OAuth verification
        const magicState = localStorage.getItem('magic:state');
        console.log('Magic state present in localStorage:', !!magicState);
        
        if (!magicState) {
          console.error('No magic:state found in localStorage!');
          console.error('This is required for OAuth verification.');
          console.error('The state should have been created during loginWithRedirect.');
          setError('OAuth state verification failed. The authentication session may have expired. Please try logging in again.');
          setIsProcessing(false);
          return;
        }
        
        // Get the result of the OAuth redirect
        console.log('Calling getRedirectResult()...');
        
        // Make sure we have the URL state parameter
        const urlParams = new URLSearchParams(window.location.search);
        const stateParam = urlParams.get('state');
        const codeParam = urlParams.get('code');
        console.log('URL state parameter present:', !!stateParam);
        console.log('URL code parameter present:', !!codeParam);
        
        if (!stateParam || !codeParam) {
          console.error('Missing required OAuth parameters in URL');
          setError('Invalid OAuth callback. Missing required parameters.');
          setIsProcessing(false);
          return;
        }
        
        // This will return null if there's no pending result
        console.log('Calling solanaMagic.oauth2.getRedirectResult() now...');
        const result = await solanaMagic.oauth2.getRedirectResult();
        
        //console.log('getRedirectResult() returned');
        //console.log('Result type:', typeof result);
        //console.log('Result value:', result);
        //console.log('Result stringified:', JSON.stringify(result, null, 2));
        
        if (result) {
          //console.log('✓ Result received');
          //console.log('Result structure:', Object.keys(result));
          
          // Check if magic property exists
          if (result.magic) {
            //console.log('✓ magic property exists');
            //console.log('magic structure:', Object.keys(result.magic));
            
            // Get the DID token
            const didToken = result.magic.idToken;
            //console.log('DID token present:', !!didToken);
            //console.log('DID token length:', didToken ? didToken.length : 0);
            
            if (didToken) {
              //console.log('✓ DID token received, saving...');
              
              // Save the token in localStorage
              localStorage.setItem('token', didToken);
              localStorage.setItem('loginType', 'SOCIAL');
              //console.log('✓ Token saved to localStorage');
              
              // Show success message
              showToast({
                message: 'Successfully logged in with social provider',
                type: 'success',
              });
              
              //console.log('Redirecting to dashboard...');
              // Redirect to the dashboard after a short delay
              setTimeout(() => {
                router.push('/');
              }, 500);
            } else {
              //console.error('✗ No DID token in result');
              //console.error('result.magic:', result.magic);
              setError('No authentication token received from provider');
            }
          } else {
            //console.error('✗ No magic property in result');
            //console.error('Available properties:', Object.keys(result));
            setError('Invalid authentication result structure');
          }
        } else {
          //console.error('✗ getRedirectResult() returned null/undefined');
          //console.error('This usually means no OAuth flow is detected');
          setError('No OAuth authentication detected. Please try logging in again.');
        }
      } catch (error) {
        //console.error('OAuth callback error:', error);
        
        // More detailed error handling
        if (error instanceof RPCError) {
          //console.error('RPCError code:', error.code, 'message:', error.message);
          setError(`Magic authentication error: ${error.message}`);
        } else {
          setError(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        // Log the error stack if available
        if (error instanceof Error && error.stack) {
          //console.error('Error stack:', error.stack);
        }
      } finally {
        setIsProcessing(false);
        // Don't remove session storage here, as it might be needed for debugging
        // We'll clear it after successful redirect or when the user manually navigates away
      }
    };
    
    // Add a small delay to ensure Magic SDK is fully initialized
    const timer = setTimeout(handleOAuthResult, 1000);
    
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
            {isMounted && (
              <div className="mt-8 text-xs text-gray-500">
                <p>URL: {window.location.href.substring(0, 50) + '...'}</p>
                <p>Has state param: {window.location.search.includes('state=') ? 'Yes' : 'No'}</p>
                <p>Has code param: {window.location.search.includes('code=') ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            {isMounted && (
              <div className="bg-gray-900 p-3 rounded mb-4 text-left text-xs text-gray-400 overflow-auto max-h-32">
                <p>Debug info:</p>
                <p>URL: {window.location.href.substring(0, 50) + '...'}</p>
                <p>Magic SDK loaded: {solanaMagic ? 'Yes' : 'No'}</p>
                <p>OAuth extension: {solanaMagic?.oauth2 ? 'Available' : 'Not available'}</p>
              </div>
            )}
            <button 
              onClick={() => {
                // Clear session storage on manual return
                sessionStorage.removeItem('magicOAuthAttempt');
                sessionStorage.removeItem('magicOAuthProvider');
                router.push('/');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Return to Login
            </button>
            <button 
              onClick={() => {
                // Retry the authentication
                setIsProcessing(true);
                setError(null);
                setTimeout(() => {
                  const handleOAuthResult = async () => {
                    try {
                      const result = await solanaMagic?.oauth2.getRedirectResult();
                      if (result?.magic?.idToken) {
                        localStorage.setItem('token', result.magic.idToken);
                        localStorage.setItem('loginType', 'SOCIAL');
                        showToast({ message: 'Successfully logged in!', type: 'success' });
                        router.push('/');
                      } else {
                        setError('Still no result from authentication provider');
                        setIsProcessing(false);
                      }
                    } catch (e) {
                      setError(`Retry failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
                      setIsProcessing(false);
                    }
                  };
                  handleOAuthResult();
                }, 1000);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 ml-2"
            >
              Retry
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
