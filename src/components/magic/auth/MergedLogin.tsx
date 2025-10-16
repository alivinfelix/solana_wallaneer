import { useMagic } from '../MagicProvider';
import showToast from '@/utils/showToast';
import Spinner from '../../ui/Spinner';
import { RPCError, RPCErrorCode } from 'magic-sdk';
import { LoginProps } from '@/utils/types';
import { saveToken } from '@/utils/common';
import Card from '../../ui/Card';
import CardHeader from '../../ui/CardHeader';
import { useState } from 'react';
import FormInput from '@/components/ui/FormInput';
import Image from 'next/image';

interface MergedLoginProps extends LoginProps {
  showLoginOptions: boolean;
  setShowLoginOptions: (show: boolean) => void;
}

type SocialProvider = 'google' | 'twitter' | 'telegram' | 'github';

interface SocialButtonProps {
  provider: SocialProvider;
  isLoading: boolean;
  onClick: (provider: SocialProvider) => void;
}

const SocialButton = ({ provider, isLoading, onClick }: SocialButtonProps) => {
  const getProviderName = () => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'twitter':
        return 'X (Twitter)';
      case 'telegram':
        return 'Telegram';
      case 'github':
        return 'GitHub';
    }
  };

  const getProviderIcon = () => {
    switch (provider) {
      case 'google':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
        );
      case 'twitter':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="24px" height="24px">
            <path d="M 11 4 C 7.1456661 4 4 7.1456661 4 11 L 4 39 C 4 42.854334 7.1456661 46 11 46 L 39 46 C 42.854334 46 46 42.854334 46 39 L 46 11 C 46 7.1456661 42.854334 4 39 4 L 11 4 z M 31.132812 13 L 36.832031 13 L 28.158203 23.035156 L 38.306641 37 L 32.076172 37 L 25.773438 28.277344 L 18.542969 37 L 12.845703 37 L 22.078125 26.34375 L 12.4375 13 L 18.832031 13 L 24.521484 20.992188 L 31.132812 13 z" fill="#1DA1F2" />
          </svg>
        );
      case 'telegram':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#29b6f6" d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z" />
            <path fill="#fff" d="M33.95,15l-3.746,19.126c0,0-0.161,0.874-1.245,0.874c-0.576,0-0.873-0.274-0.873-0.274l-8.114-6.733 l-3.97-2.001l-5.095-1.355c0,0-0.907-0.262-0.907-1.012c0-0.625,0.933-0.923,0.933-0.923l21.316-8.468 c-0.001-0.001,0.651-0.235,1.126-0.234C33.667,14,34,14.125,34,14.5C34,14.75,33.95,15,33.95,15z" />
            <path fill="#b0bec5" d="M23,30.505l-3.426,3.374c0,0-0.149,0.115-0.348,0.12c-0.069,0.002-0.143-0.009-0.219-0.043 l0.964-5.965L23,30.505z" />
            <path fill="#cfd8dc" d="M29.897,18.196c-0.169-0.22-0.481-0.26-0.701-0.093L16,26c0,0,2.106,5.892,2.427,6.912 c0.322,1.021,0.58,1.045,0.58,1.045l0.964-5.965l9.832-9.096C30.023,18.729,30.064,18.416,29.897,18.196z" />
          </svg>
        );
      case 'github':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill="white">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
    }
  };

  return (
    <button
      className="social-login-button"
      onClick={() => onClick(provider)}
      disabled={isLoading}
    >
      <div className="flex items-center justify-center w-full">
        <div className="mr-3">{getProviderIcon()}</div>
        <span>Continue with {getProviderName()}</span>
        {isLoading && <Spinner className="ml-2" />}
      </div>
    </button>
  );
};

const MergedLogin = ({ token, setToken, showLoginOptions, setShowLoginOptions }: MergedLoginProps) => {
  const { magic, solanaMagic, ethereumMagic, bitcoinMagic, polygonMagic, baseMagic } = useMagic();
  
  // Email OTP state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [isEmailLoginInProgress, setEmailLoginInProgress] = useState(false);
  
  // Social login state
  const [isSocialLoading, setSocialLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<SocialProvider | null>(null);

  const handleEmailLogin = async () => {
    if (!email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
      setEmailError(true);
    } else {
      try {
        setEmailLoginInProgress(true);
        setEmailError(false);
        const token = await magic?.auth.loginWithEmailOTP({ email });
        if (token) {
          saveToken(token, setToken, 'EMAIL');
          setEmail('');
        }
      } catch (e) {
        console.log('login error: ' + JSON.stringify(e));
        if (e instanceof RPCError) {
          switch (e.code) {
            case RPCErrorCode.MagicLinkFailedVerification:
            case RPCErrorCode.MagicLinkExpired:
            case RPCErrorCode.MagicLinkRateLimited:
            case RPCErrorCode.UserAlreadyLoggedIn:
              showToast({ message: e.message, type: 'error' });
              break;
            default:
              showToast({
                message: 'Something went wrong. Please try again',
                type: 'error',
              });
          }
        }
      } finally {
        setEmailLoginInProgress(false);
      }
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setSocialLoading(true);
      setCurrentProvider(provider);

      console.log('Magic instances:', {
        magic: !!magic,
        solanaMagic: !!solanaMagic,
        ethereumMagic: !!ethereumMagic,
        bitcoinMagic: !!bitcoinMagic,
        polygonMagic: !!polygonMagic,
        baseMagic: !!baseMagic
      });
      
      // Use solanaMagic as default since it's the primary network
      const activeMagic = solanaMagic || magic;
      
      console.log('Active Magic instance:', activeMagic);
      console.log('OAuth extension available:', activeMagic?.oauth2 ? 'Yes' : 'No');
      
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
      
      // Clear any existing Magic state to prevent conflicts
      localStorage.removeItem('magic:state');
      
      // Use loginWithRedirect instead of loginWithPopup
      console.log('Starting OAuth flow with provider:', provider);
      console.log('Redirect URI:', `${window.location.origin}/oauth/callback`);
      
      // Telegram only supports popup, not redirect
      if (provider === 'telegram') {
        console.log('Using loginWithPopup for Telegram');
        
        const result = await activeMagic.oauth2.loginWithPopup({
          provider: 'telegram',
        });
        
        if (result) {
          const didToken = await activeMagic.user.getIdToken();
          if (didToken) {
            saveToken(didToken, setToken, 'SOCIAL');
            showToast({
              message: 'Successfully logged in with Telegram',
              type: 'success',
            });
          }
        }
        return; // Exit early for Telegram
      }
      
      // For other providers, use loginWithRedirect
      const supportedRedirectProviders = ['google', 'facebook', 'apple', 'github', 'bitbucket', 'gitlab', 'linkedin', 'twitter', 'discord', 'twitch', 'microsoft'];
      
      if (!supportedRedirectProviders.includes(provider.toLowerCase())) {
        showToast({
          message: `${provider} redirect is not supported. Supported: ${supportedRedirectProviders.join(', ')}`,
          type: 'warning',
        });
      }
      
      // Configure provider-specific options
      const oauthConfig: any = {
        provider: provider.toLowerCase(),
        redirectURI: `${window.location.origin}/oauth/callback`,
      };
      
      // Add scopes for specific providers
      if (provider === 'google') {
        oauthConfig.scope = ['email', 'profile'];
      }
      
      console.log('OAuth config:', oauthConfig);
      console.log('Using loginWithRedirect for:', provider);
      
      await activeMagic.oauth2.loginWithRedirect(oauthConfig);
      
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
      
      setSocialLoading(false);
      setCurrentProvider(null);
    }
  };

  if (!showLoginOptions) {
    // Initial state: Just show the main login button
    return (
      <div className="w-full px-6">
        <button
          className="form-button w-full max-w-sm mx-auto block !bg-[#f5bd13] !text-[#060606]"
          onClick={() => setShowLoginOptions(true)}
        >
          Login / Sign up
        </button>
      </div>
    );
  }

  // Show login options - full page on mobile, centered full screen on desktop
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header with Welcome message - only on mobile */}
      <div className="md:hidden flex items-center justify-between p-6 border-b border-gray-700">
        <button 
          className="text-gray-400 hover:text-white flex items-center gap-2 text-sm"
          onClick={() => setShowLoginOptions(false)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        
        <div className="flex items-center gap-1 pl-5">
          <img src="/wallaneer.svg" alt="Wallaneer Logo" style={{ width: 36, height: 36 }} />
          <h1 
            className="text-xl font-extrabold font-['Inter']" 
            style={{ color: '#f7bc15', paddingTop: '8px'}}
          >
            WALLANEER
          </h1>
        </div>
        
        <div className="w-12"></div> {/* Spacer for centering */}
      </div>
      
      {/* Desktop back button - positioned absolutely */}
      <div className="hidden md:block absolute top-8 left-8 z-10">
        <button 
          className="text-gray-400 hover:text-white flex items-center gap-2 text-sm"
          onClick={() => setShowLoginOptions(false)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back
        </button>
      </div>
      
      {/* Login Content - Full screen centered */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md md:bg-[#1e1e1e] md:rounded-xl md:p-8 md:shadow-lg">
          {/* Desktop title */}
          <div className="hidden md:block mb-8">
            <h2 className="text-2xl font-extrabold text-center" style={{ color: '#f7bc15' }}>
              Welcome to WALLANEER
            </h2>
          </div>
          
          {/* Email OTP Section */}
          <div className="mb-8">
            <FormInput
              onChange={(e) => {
                if (emailError) setEmailError(false);
                setEmail(e.target.value);
              }}
              placeholder={token.length > 0 ? 'Already logged in' : 'Enter your email'}
              value={email}
            />
            {emailError && <span className="error">Enter a valid email</span>}
            <button
              className="form-button w-full mt-4"
              disabled={isEmailLoginInProgress || (token.length > 0 ? false : email.length == 0)}
              onClick={() => handleEmailLogin()}
            >
              {isEmailLoginInProgress ? <Spinner /> : 'Continue with Email'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">or continue with</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Social Login Section */}
          <div className="flex flex-col space-y-4">
            <SocialButton
              provider="google"
              isLoading={isSocialLoading && currentProvider === 'google'}
              onClick={handleSocialLogin}
            />
            <SocialButton
              provider="twitter"
              isLoading={isSocialLoading && currentProvider === 'twitter'}
              onClick={handleSocialLogin}
            />
            <SocialButton
              provider="telegram"
              isLoading={isSocialLoading && currentProvider === 'telegram'}
              onClick={handleSocialLogin}
            />
          </div>
          <div className="mt-4 text-xs text-gray-400 text-center">
            <p>Note: Telegram uses popup authentication (others use redirect)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergedLogin;
