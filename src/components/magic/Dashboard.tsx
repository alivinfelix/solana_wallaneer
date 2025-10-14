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
      <Header />
      <div className="cards-container">
        <UserInfo token={token} setToken={setToken} />
        <Spacer size={10} />
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Network</h3>
          </div>
          <div className="card-content">
            <NetworkSwitcher />
          </div>
        </div>
        <Spacer size={10} />
        <SendTransaction />
        <Spacer size={10} />
        <WalletMethods token={token} setToken={setToken} />
        <Spacer size={15} />
      </div>
    </div>
  );
}
