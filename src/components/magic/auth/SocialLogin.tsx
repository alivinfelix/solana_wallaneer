import { useMagic } from '../MagicProvider';
import showToast from '@/utils/showToast';
import Spinner from '../../ui/Spinner';
import { RPCError, RPCErrorCode } from 'magic-sdk';
import { LoginProps } from '@/utils/types';
import { saveToken } from '@/utils/common';
import Card from '../../ui/Card';
import CardHeader from '../../ui/CardHeader';
import { useState } from 'react';
import Image from 'next/image';

type SocialProvider = 'google' | 'twitter' | 'telegram';

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

const SocialLogin = ({ token, setToken }: LoginProps) => {
  const { magic, solanaMagic, ethereumMagic, bitcoinMagic, polygonMagic, baseMagic } = useMagic();
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<SocialProvider | null>(null);

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setIsLoading(true);
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

  return (
    <Card>
      <CardHeader id="social-login">Social Login</CardHeader>
      <div className="flex flex-col space-y-4 py-4">
        <SocialButton
          provider="google"
          isLoading={isLoading && currentProvider === 'google'}
          onClick={handleSocialLogin}
        />
        <SocialButton
          provider="twitter"
          isLoading={isLoading && currentProvider === 'twitter'}
          onClick={handleSocialLogin}
        />
        <SocialButton
          provider="telegram"
          isLoading={isLoading && currentProvider === 'telegram'}
          onClick={handleSocialLogin}
        />
      </div>
    </Card>
  );
};

export default SocialLogin;