import { useCallback, useEffect, useState } from 'react';
import Divider from '@/components/ui/Divider';
import { LoginProps } from '@/utils/types';
import { logout } from '@/utils/common';
import { useMagic } from '../MagicProvider';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import CardLabel from '@/components/ui/CardLabel';
import Spinner from '@/components/ui/Spinner';
import { getNetworkName } from '@/utils/network';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

const UserInfo = ({ token, setToken }: LoginProps) => {
  const { magic, connection, isEthereum, isSolana, currentNetwork } = useMagic();

  const [balance, setBalance] = useState('...');
  const [copied, setCopied] = useState('Copy');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [publicAddress, setPublicAddress] = useState(localStorage.getItem('user'));

  const fetchUserAddress = useCallback(async () => {
    if (!magic) return;
    
    const isLoggedIn = await magic.user.isLoggedIn();
    if (isLoggedIn) {
      try {
        const metadata = await magic.user.getInfo();
        if (metadata) {
          localStorage.setItem('user', metadata.publicAddress);
          setPublicAddress(metadata.publicAddress);
        }
      } catch (e) {
        console.log('error in fetching address: ' + e);
      }
    }
  }, [magic]);

  // Fetch address on initial load
  useEffect(() => {
    setTimeout(() => fetchUserAddress(), 5000);
  }, [fetchUserAddress]);
  
  // Fetch address when network changes
  useEffect(() => {
    if (magic) {
      fetchUserAddress();
    }
  }, [magic, currentNetwork, fetchUserAddress]);

  const getBalance = useCallback(async () => {
    if (!publicAddress) return;
    
    if (isSolana && connection) {
      // Get Solana balance
      try {
        const balance = await connection.getBalance(new PublicKey(publicAddress));
        if (balance == 0) {
          setBalance('0');
        } else {
          setBalance((balance / LAMPORTS_PER_SOL).toString());
        }
        console.log('SOLANA BALANCE: ', balance);
      } catch (error) {
        console.error('Error getting Solana balance:', error);
        setBalance('Error');
      }
    } else if (isEthereum && magic) {
      // Get Ethereum balance
      try {
        // For Ethereum, we need to use the provider to get the balance
        const provider = magic.rpcProvider;
        const balanceInWei = await provider.request({
          method: 'eth_getBalance',
          params: [publicAddress, 'latest']
        });
        
        // Convert from Wei to ETH (1 ETH = 10^18 Wei)
        const balanceInEth = parseInt(balanceInWei, 16) / 1e18;
        setBalance(balanceInEth.toString());
        console.log('ETH BALANCE: ', balanceInEth);
      } catch (error) {
        console.error('Error getting Ethereum balance:', error);
        setBalance('Error');
      }
    }
  }, [connection, publicAddress, isEthereum, isSolana, magic]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await getBalance();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, [getBalance]);

  useEffect(() => {
    if ((connection && isSolana) || (magic && isEthereum)) {
      refresh();
    }
  }, [connection, magic, isSolana, isEthereum, refresh]);

  useEffect(() => {
    setBalance('...');
    // Reset address display while fetching new address
    setPublicAddress('Fetching address...');
  }, [magic, currentNetwork]);

  const disconnect = useCallback(async () => {
    if (magic) {
      await logout(setToken, magic);
    }
  }, [magic, setToken]);

  const copy = useCallback(() => {
    if (publicAddress && copied === 'Copy') {
      setCopied('Copied!');
      navigator.clipboard.writeText(publicAddress);
      setTimeout(() => {
        setCopied('Copy');
      }, 1000);
    }
  }, [copied, publicAddress]);

  return (
    <Card>
      <CardHeader id="Wallet">Wallet</CardHeader>
      <CardLabel leftHeader="Status" rightAction={<div onClick={disconnect}>Disconnect</div>} isDisconnect />
      <div className="flex-row">
        <div className="green-dot" />
        <div className="connected">Connected to {getNetworkName(currentNetwork)}</div>
      </div>
      <Divider />
      <CardLabel leftHeader="Address" rightAction={publicAddress && publicAddress !== 'Fetching address...' ? <div onClick={copy}>{copied}</div> : <Spinner />} />
      <div className="code">{publicAddress || 'Fetching address...'}</div>
      <Divider />
      <CardLabel
        leftHeader="Balance"
        rightAction={
          isRefreshing ? (
            <div className="loading-container">
              <Spinner />
            </div>
          ) : (
            <div onClick={refresh}>Refresh</div>
          )
        }
      />
      <div className="code">{balance} {isSolana ? 'SOL' : 'ETH'}</div>
    </Card>
  );
};

export default UserInfo;
