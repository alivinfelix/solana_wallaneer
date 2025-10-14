import React from 'react';
import WalletMethods from './cards/WalletMethodsCard';
import SendTransaction from './cards/SendTransactionCard';
import Spacer from '@/components/ui/Spacer';
import { LoginProps } from '@/utils/types';
import UserInfo from './cards/UserInfoCard';
import DevLinks from './DevLinks';
import Header from './Header';
import NetworkSwitcher from './NetworkSwitcher';

export default function Dashboard({ token, setToken }: LoginProps) {
  return (
    <div className="home-page">
      <div className="w-full max-w-4xl mx-auto px-4 flex justify-center">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-auto pt-8">
            <Header />
          </div>
          <div className="w-full md:w-[400px] cards-container pt-4 ">
            <UserInfo token={token} setToken={setToken} />
          </div>
        </div>
      </div>
      <Spacer size={15} />
    </div>
  );
}
