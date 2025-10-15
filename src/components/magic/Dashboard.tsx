import React from 'react';
import WalletMethods from './cards/WalletMethodsCard';
import SendTransaction from './cards/SendTransactionCard';
import Spacer from '@/components/ui/Spacer';
import { LoginProps } from '@/utils/types';
import UserInfo from './cards/UserInfoCard';
import DevLinks from './DevLinks';
import Header from './Header';
import NetworkSwitcher from './NetworkSwitcher';
import BackgroundDecorations from '@/components/ui/BackgroundDecorations';
import PhoneFrame from '@/components/ui/PhoneFrame';

export default function Dashboard({ token, setToken }: LoginProps) {
  return (
    <div className="home-page min-h-screen md:min-h-screen h-screen md:h-auto w-full">
      <div className="w-full max-w-6xl mx-auto px-0 md:px-4 flex justify-center h-full md:h-auto">
        <div className="flex flex-col md:flex-row items-center gap-0 md:gap-10 w-full h-full md:h-auto">
          {/* Header - hidden on mobile since UserInfo has its own header */}
          <div className="hidden md:block w-full md:w-auto pt-4 md:pt-8">
            <Header />
          </div>
          <div className="w-full md:flex-1 cards-container pt-0 md:pt-4 h-full md:h-auto">
            <PhoneFrame>
              <UserInfo token={token} setToken={setToken} />
            </PhoneFrame>
          </div>
        </div>
      </div>
      <div className="hidden md:block">
        <Spacer size={15} />
      </div>
    </div>
  );
}
