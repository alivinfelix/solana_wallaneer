import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useMagic } from './MagicProvider';
import { saveToken } from '@/utils/common';
import showToast from '@/utils/showToast';

interface OAuthCallbackHandlerProps {
  setToken: Dispatch<SetStateAction<string>>;
}

const OAuthCallbackHandler: React.FC<OAuthCallbackHandlerProps> = ({ setToken }) => {
  const { solanaMagic } = useMagic();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkForOAuthResult = async () => {
      // Don't proceed if Magic SDK isn't available
      if (!solanaMagic?.oauth2) {
        console.log('Magic SDK not available yet, waiting...');
        return;
      }
      
      console.log('Magic SDK available, checking for OAuth result...');
      console.log('Current URL:', window.location.href);
      console.log('Session storage OAuth attempt:', sessionStorage.getItem('magicOAuthAttempt'));
      
      try {
        setIsProcessing(true);
        
        // Wait a moment for Magic to process any pending redirects
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // This will return null if there's no pending result
        const result = await solanaMagic.oauth2.getRedirectResult();
        console.log('OAuth result check:', result);
        
        if (result) {
          console.log('OAuth result found!', result);
          // Get the DID token
          const didToken = result.magic.idToken;
          
          if (didToken) {
            console.log('DID token found, saving...');
            // Save the token
            saveToken(didToken, setToken, 'SOCIAL');
            
            // Show success message
            showToast({
              message: 'Successfully logged in with social provider',
              type: 'success',
            });
            
            console.log('OAuth login completed successfully');
          } else {
            console.log('No DID token in result');
          }
        } else {
          console.log('No OAuth result found');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        
        // Only show error if it looks like we're processing a callback
        // This prevents showing errors during normal page loads
        const isLikelyCallback = 
          window.location.href.includes('state=') || 
          window.location.href.includes('code=') ||
          window.location.href.includes('magic_credential') ||
          sessionStorage.getItem('magicOAuthAttempt') === 'true';
          
        if (isLikelyCallback) {
          console.error('Showing OAuth error to user:', error);
          showToast({
            message: `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            type: 'error',
          });
        } else {
          // Just log the error without showing a toast for normal page loads
          console.log('No OAuth result found (expected during normal page load)');
        }
      } finally {
        setIsProcessing(false);
        // Clear the OAuth attempt flag after a delay to allow for processing
        setTimeout(() => {
          sessionStorage.removeItem('magicOAuthAttempt');
        }, 2000);
      }
    };
    
    // Add a small delay to ensure Magic SDK is fully initialized
    const timer = setTimeout(checkForOAuthResult, 100);
    
    return () => clearTimeout(timer);
  }, [solanaMagic, setToken]);

  // This component doesn't render anything visible
  return null;
};

export default OAuthCallbackHandler;
