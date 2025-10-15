import { LoginProps } from '@/utils/types'
import Header from './Header'
import BackgroundDecorations from '@/components/ui/BackgroundDecorations';
import EmailOTP from './auth/EmailOTP';
import SocialLogin from './auth/SocialLogin';
import Image from 'next/image';
import Logo from 'public/favicon.ico';

const Login = ({ token, setToken }: LoginProps) => {
  return (
    <div className="login-page min-h-screen">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* Mobile Header */}
      <div className="block md:hidden pt-8 pb-6">
        <div className="flex flex-col items-center justify-center gap-3">
          <Image 
            src={Logo} 
            alt="Wallaneer Logo" 
            width={60} 
            height={60}
            className="w-[60px] h-[60px]"
          />
          <div 
            className="text-[2rem] font-extrabold font-['Inter']" 
            style={{ color: '#e2db42' }}
          >
            Wallaneer
          </div>
        </div>
      </div>
      
      <div className={`max-w-[100%] grid grid-cols-1 md:grid-cols-2 grid-flow-row auto-rows-fr gap-4 md:gap-5 p-4 md:p-4 mt-0 md:mt-8`}>
        <EmailOTP token={token} setToken={setToken} />
        <SocialLogin token={token} setToken={setToken} />
      </div>
    </div>
  )
}

export default Login
