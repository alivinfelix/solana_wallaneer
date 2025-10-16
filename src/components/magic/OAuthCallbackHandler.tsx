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
          // showToast({
          //   message: `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          //   type: 'error',
          // });
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
