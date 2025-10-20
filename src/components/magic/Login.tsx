import { LoginProps } from '@/utils/types'
import Header from './Header'
import BackgroundDecorations from '@/components/ui/BackgroundDecorations';
import MergedLogin from './auth/MergedLogin';
import Image from 'next/image';
import Logo from 'public/wallaneer.svg';
import { useState } from 'react';

const Login = ({ token, setToken }: LoginProps) => {
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  return (
    <div className="login-page min-h-screen flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 flex flex-col h-screen">
        {/* Logo and Title - 2/3 from top - Hide when login options are shown */}
        {!showLoginOptions && (
          <div className="flex-[2] flex items-end justify-center pb-8">
            <div className="flex flex-col items-center justify-center">
              <div className="logo-glow">
                <div className="logo-glow-inner"></div>
                <Image
                  src={Logo}
                  alt="Wallaneer Logo"
                  width={110}
                  height={110}
                  className="w-[110px] h-[110px]"
                />
              </div>
              <div
                className="text-[2rem] uppercase mt-4"
                style={{
                  color: '#f7bc15',
                  fontFamily: "'Montserrat', 'Poppins', 'Arial', sans-serif",
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                WALLANEER
              </div>
              <div
                className="text-[0.9rem] font-extrabold font-['Inter']"
                style={{ color: '#f5bd13' }}
              >
                Muti-chain. Secure. By Magallaneer.
              </div>
            </div>
          </div>
        )}

        {/* Spacer - Hide when login options are shown */}
        {!showLoginOptions && <div className="flex-[1]"></div>}

        {/* Login Component - 4/5 from bottom */}
        <div className={`${showLoginOptions ? 'flex-1' : 'flex-[1]'} flex items-start justify-center ${showLoginOptions ? 'pt-0' : 'pt-8'}`}>
          <MergedLogin
            token={token}
            setToken={setToken}
            showLoginOptions={showLoginOptions}
            setShowLoginOptions={setShowLoginOptions}
          />
        </div>
        {/* Footer Section */}
        <div className="w-full px-6 pb-8">
          <div className="max-w-sm mx-auto">
            <p className="text-xs text-gray-500 mb-2 text-center">
              © 2025 Wallaneer. Powered by Magallaneer.
            </p>
            <p className="text-xs text-[#f7bc15] font-medium mb-6 text-center">
              Multi-chain. Secure. Borderless.
            </p>
            <div className="flex items-center justify-center gap-6">
              <a
                href="https://x.com/magallaneer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#f7bc1517] border border-[#f7bc1533] hover:bg-[#f7bc1533] hover:border-[#f7bc15] transition-all group"
              >
                <svg width="18" height="18" viewBox="0 0 600 600" fill="currentColor" className="text-[#f7bc15] group-hover:scale-110 transition-transform">
                  <path d="M403.6 89.6h90.1L356 273.5l152.5 237H359.6l-103.9-155.9-118.8 155.9H47.2l146.2-191.9L49.7 89.6h200.8l94.4 141.9 113.6-141.9zm-31.5 382.7h49.9L185.4 119.7h-53.8l240.5 352.6z"/>
                </svg>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">@wallaneer</span>
              </a>
              
              <a
                href="mailto:contact@wallaneer.io"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#f7bc1517] border border-[#f7bc1533] hover:bg-[#f7bc1533] hover:border-[#f7bc15] transition-all group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#f7bc15] group-hover:scale-110 transition-transform">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zm-16 12V8.83l7.88 6.88a1 1 0 0 0 1.24 0L20 8.83V18H4z"/>
                </svg>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Email</span>
              </a>
            </div>
            {/* Legal Links */}
            <div className="flex items-center justify-center gap-3 text-xs mt-6">
              <a 
                href="/terms" 
                className="text-gray-400 hover:text-[#f7bc15] transition-colors"
              >
                Terms of Use
              </a>
              <span className="text-gray-600">|</span>
              <a 
                href="/privacy" 
                className="text-gray-400 hover:text-[#f7bc15] transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
        
      </div>

      {/* Desktop Layout - Same structure as mobile, different sizes */}
      <div className="hidden md:flex flex-1 flex-col h-screen">
        {/* Logo - 2/3 from top (same as mobile) - Hide when login options are shown */}
        {!showLoginOptions && (
          <div className="flex-[2] flex items-end justify-center pb-12">
            <div className="flex flex-col items-center justify-center">
              <div className="logo-glow">
                <div className="logo-glow-inner z-0"></div>
                <Image
                  src={Logo}
                  alt="Wallaneer Logo"
                  width={160}
                  height={160}
                  className="w-[160px] h-[160px] z-1"
                />
              </div>
              <div
                className="text-[4.5rem] font-extrabold font-['Inter'] mt-6"
                style={{ color: '#f5bd13' }}
              >
                WALLANEER
              </div>
              <div
                className="text-[2rem] font-extrabold font-['Inter']"
                style={{ color: '#f5bd13' }}
              >
                Muti-chain. Secure. By Magallaneer.
              </div>
            </div>
          </div>
        )}
        {/* Spacer - Hide when login options are shown */}
        {!showLoginOptions && <div className="flex-[1]"></div>}

        {/* Login Component - 4/5 from bottom (same as mobile) */}
        <div className={`${showLoginOptions ? 'flex-1' : 'flex-[1]'} flex items-start justify-center ${showLoginOptions ? 'pt-0' : 'pt-12'}`}>
          <MergedLogin
            token={token}
            setToken={setToken}
            showLoginOptions={showLoginOptions}
            setShowLoginOptions={setShowLoginOptions}
          />
          
        </div>
        <div className="w-full px-6 pb-8">
          <div className="max-w-sm mx-auto">
            <p className="text-xs text-gray-500 mb-2 text-center">
              © 2025 Wallaneer. Powered by Magallaneer.
            </p>
            <p className="text-xs text-[#f7bc15] font-medium mb-6 text-center">
              Multi-chain. Secure. Borderless.
            </p>
            <div className="flex items-center justify-center gap-6">
              <a
                href="https://x.com/magallaneer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#f7bc1517] border border-[#f7bc1533] hover:bg-[#f7bc1533] hover:border-[#f7bc15] transition-all group"
              >
                <svg width="18" height="18" viewBox="0 0 600 600" fill="currentColor" className="text-[#f7bc15] group-hover:scale-110 transition-transform">
                  <path d="M403.6 89.6h90.1L356 273.5l152.5 237H359.6l-103.9-155.9-118.8 155.9H47.2l146.2-191.9L49.7 89.6h200.8l94.4 141.9 113.6-141.9zm-31.5 382.7h49.9L185.4 119.7h-53.8l240.5 352.6z"/>
                </svg>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">@wallaneer</span>
              </a>
              
              <a
                href="mailto:contact@wallaneer.io"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#f7bc1517] border border-[#f7bc1533] hover:bg-[#f7bc1533] hover:border-[#f7bc15] transition-all group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#f7bc15] group-hover:scale-110 transition-transform">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zm-16 12V8.83l7.88 6.88a1 1 0 0 0 1.24 0L20 8.83V18H4z"/>
                </svg>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Email</span>
              </a>
            </div>
            {/* Legal Links */}
            <div className="flex items-center justify-center gap-3 text-xs mt-6">
              <a 
                href="/terms" 
                className="text-gray-400 hover:text-[#f7bc15] transition-colors"
              >
                Terms of Use
              </a>
              <span className="text-gray-600">|</span>
              <a 
                href="/privacy" 
                className="text-gray-400 hover:text-[#f7bc15] transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
