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
      </div>
    </div>
  )
}

export default Login
