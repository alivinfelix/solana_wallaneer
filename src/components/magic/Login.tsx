import { LoginProps } from '@/utils/types'
import Header from './Header'
import BackgroundDecorations from '@/components/ui/BackgroundDecorations';
import EmailOTP from './auth/EmailOTP';
import SocialLogin from './auth/SocialLogin';

const Login = ({ token, setToken }: LoginProps) => {
  return (
    <div className="login-page min-h-screen">
      <div className="hidden md:block">
        <Header />
      </div>
      <div className={`max-w-[100%] grid grid-cols-1 md:grid-cols-2 grid-flow-row auto-rows-fr gap-4 md:gap-5 p-4 md:p-4 mt-4 md:mt-8`}>
        <EmailOTP token={token} setToken={setToken} />
        <SocialLogin token={token} setToken={setToken} />
      </div>
    </div>
  )
}

export default Login
