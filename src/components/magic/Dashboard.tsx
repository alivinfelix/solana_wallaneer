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
    <div className="home-page">
      {/* <BackgroundDecorations /> */}
      <div className="w-full max-w-6xl mx-auto px-4 flex justify-center">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-auto pt-8">
            <Header />
          </div>
          <div className="w-full md:flex-1 cards-container pt-4 flex justify-center">
            <PhoneFrame>
              <UserInfo token={token} setToken={setToken} />
            </PhoneFrame>
          </div>
        </div>
      </div>
      <Spacer size={15} />
    </div>
  );
}
