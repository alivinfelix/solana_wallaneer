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
import { Network, getNetworkFromTokenNetwork } from '@/utils/network';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import showToast from '@/utils/showToast';
import TokenBalance from '../tokens/TokenBalance';
import SendTransaction from './SendTransactionCard';
import FullScreenModal from '@/components/ui/FullScreenModal';

const UserInfo = ({ token, setToken }: LoginProps) => {
  const { magic, connection, isEthereum, isSolana, isBitcoin, isPolygon, isBase, currentNetwork, switchNetwork } = useMagic();

  const [balance, setBalance] = useState('...');
  const [copied, setCopied] = useState('Copy');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRevealingKey, setIsRevealingKey] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);

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
    } else if (isEthereum && magic && magic.rpcProvider) {
      // Get Ethereum balance
      try {
        // For Ethereum, we need to use the provider to get the balance
        const provider = magic.rpcProvider;
        
        // Make sure we're using a valid Ethereum address
        let formattedAddress = publicAddress;
        if (publicAddress && !publicAddress.startsWith('0x')) {
          formattedAddress = `0x${publicAddress}`;
        }
        
        const balanceInWei = await provider.request({
          method: 'eth_getBalance',
          params: [formattedAddress, 'latest']
        });
        
        // Convert from Wei to ETH (1 ETH = 10^18 Wei)
        const balanceInEth = parseInt(balanceInWei, 16) / 1e18;
        setBalance(balanceInEth.toString());
        console.log('ETH BALANCE: ', balanceInEth);
      } catch (error) {
        console.error('Error getting Ethereum balance:', error);
        setBalance('Error');
      }
    } else if (isPolygon && magic && magic.rpcProvider) {
      // Get Polygon (MATIC) balance
      try {
        const provider = magic.rpcProvider;
        
        // Make sure we're using a valid Ethereum-compatible address
        let formattedAddress = publicAddress;
        if (publicAddress && !publicAddress.startsWith('0x')) {
          formattedAddress = `0x${publicAddress}`;
        }
        
        const balanceInWei = await provider.request({
          method: 'eth_getBalance',
          params: [formattedAddress, 'latest']
        });
        
        // Convert from Wei to MATIC (1 MATIC = 10^18 Wei)
        const balanceInMatic = parseInt(balanceInWei, 16) / 1e18;
        setBalance(balanceInMatic.toString());
        console.log('MATIC BALANCE: ', balanceInMatic);
      } catch (error) {
        console.error('Error getting Polygon balance:', error);
        setBalance('Error');
      }
    } else if (isBase && magic && magic.rpcProvider) {
      // Get Base (ETH on Base) balance
      try {
        const provider = magic.rpcProvider;
        
        // Make sure we're using a valid Ethereum-compatible address
        let formattedAddress = publicAddress;
        if (publicAddress && !publicAddress.startsWith('0x')) {
          formattedAddress = `0x${publicAddress}`;
        }
        
        const balanceInWei = await provider.request({
          method: 'eth_getBalance',
          params: [formattedAddress, 'latest']
        });
        
        // Convert from Wei to ETH (1 ETH = 10^18 Wei)
        const balanceInEth = parseInt(balanceInWei, 16) / 1e18;
        setBalance(balanceInEth.toString());
        console.log('BASE ETH BALANCE: ', balanceInEth);
      } catch (error) {
        console.error('Error getting Base balance:', error);
        setBalance('Error');
      }
    } else if (isBitcoin) {
      // Get Bitcoin balance
      try {
        if (magic && magic.rpcProvider) {
          // Get the user's Bitcoin address
          const metadata = await magic.user.getInfo();
          const btcAddress = metadata.publicAddress;
          
          // Use Bitcoin RPC to get the balance
          // Default to 0 for now as we need a proper Bitcoin RPC implementation
          console.log('Bitcoin address:', btcAddress);
          setBalance('0');
        } else {
          // If RPC provider is not available, set to 0
          setBalance('0');
          console.log('Bitcoin RPC provider not available, setting balance to 0');
        }
      } catch (error) {
        console.error('Error getting Bitcoin balance:', error);
        setBalance('0'); // Set to 0 on error for better UX
      }
    }
  }, [connection, publicAddress, isEthereum, isSolana, isBitcoin, isPolygon, isBase, magic]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await getBalance();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, [getBalance]);

  useEffect(() => {
    if ((connection && isSolana) || (magic && isEthereum) || (magic && isBitcoin) || (magic && isPolygon) || (magic && isBase)) {
      refresh();
    }
  }, [connection, magic, isSolana, isEthereum, isBitcoin, isPolygon, isBase, refresh]);

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

  // Get the currency symbol based on the current network
  const getCurrencySymbol = () => {
    if (isSolana) return 'SOL';
    if (isEthereum) return 'ETH';
    if (isBitcoin) return 'BTC';
    if (isPolygon) return 'MATIC';
    if (isBase) return 'ETH';
    return '';
  };

  const handleRevealKey = useCallback(async () => {
    if (!magic) return;
    
    try {
      setIsRevealingKey(true);
      const privateKey = await magic.user.revealPrivateKey();
      console.log('Private Key: ' + privateKey);
      showToast({
        message: 'Private key revealed in wallet',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        message: error.message || 'Failed to reveal private key',
        type: 'error',
      });
    } finally {
      setIsRevealingKey(false);
    }
  }, [magic]);

  return (
    <Card>
      {/* Main wallet content */}
      <div>
        <CardHeader id="Wallet">
          <span className="hidden md:inline">Wallet</span>
          <span className="md:hidden">Wallaneer</span>
        </CardHeader>
        <CardLabel leftHeader="Network" rightAction={<div onClick={disconnect}>Disconnect</div>} isDisconnect />
        <div className="flex-row items-center">
          <div className="green-dot mr-2" />
          <select
            value={currentNetwork}
            onChange={(e) => switchNetwork(e.target.value as Network)}
            className="p-1 bg-[#2a2a2a78] text-white border border-gray-700 rounded-md shadow-sm text-base"
          >
            <option value={Network.BITCOIN_MAINNET}>Bitcoin</option>
            <option value={Network.ETHEREUM_MAINNET}>Ethereum</option>
            <option value={Network.SOLANA_MAINNET_BETA}>Solana</option>
            <option value={Network.POLYGON_MAINNET}>Polygon</option>
            <option value={Network.BASE_MAINNET}>Base</option>
          </select>
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
        <div className="code">{balance} {getCurrencySymbol()}</div>
        <Divider />
        <CardLabel leftHeader="Assets" />
        <div className="mt-3">
          <TokenBalance 
            publicAddress={publicAddress !== 'Fetching address...' ? publicAddress || undefined : undefined}
            onTokenClick={(token) => {
              // First switch to the corresponding network
              const targetNetwork = getNetworkFromTokenNetwork(token.network);
              
              // Only switch if we're not already on this network
              if (currentNetwork !== targetNetwork) {
                switchNetwork(targetNetwork);
                
                // Show a toast to indicate network switch
                showToast({
                  message: `Switching to ${token.network} network...`,
                  type: 'info',
                });
                
                // Set a small delay before showing the modal to allow network switch to complete
                setTimeout(() => {
                  // Pass the complete token object including address, decimals, and balance
                  setSelectedToken(token);
                  setShowSendModal(true);
                }, 1000);
              } else {
                // If already on the correct network, show modal immediately
                // Pass the complete token object including address, decimals, and balance
                setSelectedToken(token);
                setShowSendModal(true);
              }
            }}
          />
        </div>
        <Divider />
        <CardLabel leftHeader="Security" />
        <div className="mt-1">
          <button 
            onClick={handleRevealKey} 
            disabled={isRevealingKey || !magic}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isRevealingKey ? 'Revealing...' : 'Reveal Private Key'}
          </button>
        </div>
      </div>
      
      {/* Send Transaction Modal - Full Screen */}
      <FullScreenModal 
        isOpen={showSendModal} 
        onClose={() => setShowSendModal(false)}
        title={`Send ${selectedToken?.name || 'Token'}`}
      >
        <div className="bg-[#12120de6] text-white">
          <SendTransaction selectedToken={selectedToken} />
        </div>
      </FullScreenModal>
    </Card>
  );
};

export default UserInfo;
