import React, { useCallback, useEffect, useState } from 'react';
import { useMagic } from '../MagicProvider';
import Spinner from '@/components/ui/Spinner';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import showToast from '@/utils/showToast';
import { Network } from '@/utils/network';

// Token interface for multiple blockchain tokens
interface Token {
  symbol: string;
  name: string;
  logo?: string;
  balance: string;
  decimals: number;
  network: string;
  chainId?: string;
  address?: string; // Token contract address
}

// Default tokens to display across multiple blockchains
const DEFAULT_TOKENS: Token[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    logo: '/assets/bitcoin.png',
    balance: '0',
    decimals: 8,
    network: 'bitcoin',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    logo: '/assets/ethereum.png',
    balance: '0',
    decimals: 18,
    network: 'ethereum',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    logo: '/assets/solana.png',
    balance: '0',
    decimals: 9,
    network: 'solana',
  },
  // {
  //   symbol: 'BNB',
  //   name: 'Binance Coin',
  //   logo: '/assets/bsc.png',
  //   balance: '0',
  //   decimals: 18,
  //   network: 'bsc',
  // },
  // {
  //   symbol: 'MATIC',
  //   name: 'Polygon',
  //   logo: '/assets/polygon.png',
  //   balance: '0',
  //   decimals: 18,
  //   network: 'polygon',
  // },
  // {
  //   symbol: 'AVAX',
  //   name: 'Avalanche',
  //   logo: '/assets/avalanche.png',
  //   balance: '0',
  //   decimals: 18,
  //   network: 'avalanche',
  // },
  // {
  //   symbol: 'USDC',
  //   name: 'USD Coin',
  //   logo: '/assets/usdc.png',
  //   balance: '0',
  //   decimals: 6,
  //   network: 'ethereum',
  // },
  // {
  //   symbol: 'USDT',
  //   name: 'Tether',
  //   logo: '/assets/usdt.png',
  //   balance: '0',
  //   decimals: 6,
  //   network: 'ethereum',
  // },
  // {
  //   symbol: 'BONK',
  //   name: 'Bonk',
  //   logo: '/assets/bonk-logo.png',
  //   balance: '0',
  //   decimals: 5,
  //   network: 'solana',
  // },
  {
    symbol: 'MAGAL',
    name: 'Magal',
    logo: '/assets/magal.jpg',
    balance: '0',
    decimals: 9,
    network: 'solana',
    address: 'A2ZbCHUEiHgSwFJ9EqgdYrFF255RQpAZP2xEC62fpump'
  }
];

const TokenBalance: React.FC<{ publicAddress?: string }> = ({ publicAddress }) => {
  const { magic, connection, isEthereum, isSolana, isBitcoin, currentNetwork } = useMagic();
  const [tokens, setTokens] = useState<Token[]>(DEFAULT_TOKENS);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch token balances
  const fetchTokenBalances = useCallback(async () => {
    if (!publicAddress) return;
    
    setIsLoading(true);
    
    try {
      // Create a copy of the default tokens
      const updatedTokens = [...DEFAULT_TOKENS];
      
      // Fetch Solana tokens (SOL and SPL tokens)
      if (connection) {
        // Fetch SOL balance
        try {
          const balance = await connection.getBalance(new PublicKey(publicAddress));
          const solToken = updatedTokens.find(token => token.symbol === 'SOL');
          if (solToken) {
            solToken.balance = (balance / LAMPORTS_PER_SOL).toString();
          }
        } catch (error) {
          console.error('Error fetching SOL balance:', error);
        }
        
        // Fetch MAGAL SPL token balance
        try {
          const magalToken = updatedTokens.find(token => token.symbol === 'MAGAL');
          if (magalToken && magalToken.address) {
            const tokenMint = new PublicKey(magalToken.address);
            const walletAddress = new PublicKey(publicAddress);
            
            try {
              // Get the associated token account address
              const tokenAccount = await getAssociatedTokenAddress(
                tokenMint,
                walletAddress
              );
              
              // Check if the token account exists
              try {
                const account = await getAccount(connection, tokenAccount);
                const balance = Number(account.amount) / Math.pow(10, magalToken.decimals);
                magalToken.balance = balance.toString();
              } catch (err) {
                // Token account doesn't exist or has no balance
                magalToken.balance = '0';
              }
            } catch (err) {
              console.error('Error getting token account:', err);
              magalToken.balance = '0';
            }
          }
        } catch (error) {
          console.error('Error fetching MAGAL token balance:', error);
        }
      }
      
      // Fetch Ethereum tokens
      if (magic && magic.rpcProvider && isEthereum) {
        // Fetch ETH balance
        try {
          const provider = magic.rpcProvider;
          
          // Make sure we're using a valid Ethereum address
          // Check if the address is properly formatted (should start with 0x for Ethereum)
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
          
          const ethToken = updatedTokens.find(token => token.symbol === 'ETH');
          if (ethToken) {
            ethToken.balance = balanceInEth.toString();
          }
        } catch (error) {
          console.error('Error fetching ETH balance:', error);
          // Set balance to 0 on error for better UX
          const ethToken = updatedTokens.find(token => token.symbol === 'ETH');
          if (ethToken) {
            ethToken.balance = '0';
          }
        }
      }
      
      // Fetch Bitcoin balance using Magic's Bitcoin extension
      const btcToken = updatedTokens.find(token => token.symbol === 'BTC');
      if (btcToken) {
        try {
          if (magic && magic.rpcProvider && isBitcoin) {
            // Get Bitcoin address from user metadata
            const metadata = await magic.user.getInfo();
            const btcAddress = metadata.publicAddress;
            
            // For Bitcoin, we don't have a direct getBalance method in the extension
            // We would need to use a Bitcoin RPC call or an external API
            // For now, we'll log the address and set a placeholder value
            console.log('BTC address:', btcAddress);
            
            // In a production app, you would make an API call to a Bitcoin service
            // Example: const balance = await fetchBitcoinBalance(btcAddress);
            btcToken.balance = '0'; // Placeholder until proper Bitcoin balance fetching is implemented
          } else {
            // If Bitcoin extension is not available, set to 0
            btcToken.balance = '0';
            console.log('Bitcoin extension not available, setting balance to 0');
          }
        } catch (error) {
          console.error('Error fetching BTC balance:', error);
          btcToken.balance = '0'; // Set to 0 instead of Error for consistency
        }
      }
      
      setTokens(updatedTokens);
      showToast({
        message: 'Token balances updated',
        type: 'success',
      });
    } catch (error) {
      console.error('Error fetching token balances:', error);
      showToast({
        message: 'Failed to fetch some token balances',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [connection, magic, publicAddress, isBitcoin]);

  // Refresh a specific token's balance
  const refreshTokenBalance = useCallback(async (token: Token) => {
    if (!publicAddress) return;
    
    try {
      // Create a copy of the current tokens
      const updatedTokens = [...tokens];
      const tokenToUpdate = updatedTokens.find(t => t.symbol === token.symbol);
      
      if (!tokenToUpdate) return;
      
      // Set token to loading state
      tokenToUpdate.balance = 'loading...';
      setTokens(updatedTokens);
      
      // Fetch the specific token balance
      if (token.symbol === 'SOL' && connection) {
        try {
          const balance = await connection.getBalance(new PublicKey(publicAddress));
          tokenToUpdate.balance = (balance / LAMPORTS_PER_SOL).toString();
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
          tokenToUpdate.balance = 'Error';
        }
      } else if (token.symbol === 'ETH' && magic && magic.rpcProvider && isEthereum) {
        try {
          const provider = magic.rpcProvider;
          
          // Make sure we're using a valid Ethereum address
          // Check if the address is properly formatted (should start with 0x for Ethereum)
          let formattedAddress = publicAddress;
          if (publicAddress && !publicAddress.startsWith('0x')) {
            formattedAddress = `0x${publicAddress}`;
          }
          
          const balanceInWei = await provider.request({
            method: 'eth_getBalance',
            params: [formattedAddress, 'latest']
          });
          
          const balanceInEth = parseInt(balanceInWei, 16) / 1e18;
          tokenToUpdate.balance = balanceInEth.toString();
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
          tokenToUpdate.balance = '0'; // Set to 0 instead of Error for better UX
        }
      } else if (token.symbol === 'BTC') {
        try {
          if (magic && magic.rpcProvider && isBitcoin) {
            // Get Bitcoin address from user metadata
            const metadata = await magic.user.getInfo();
            const btcAddress = metadata.publicAddress;
            
            // For Bitcoin, we don't have a direct getBalance method in the extension
            // We would need to use a Bitcoin RPC call or an external API
            console.log(`${token.symbol} address:`, btcAddress);
            
            // In a production app, you would make an API call to a Bitcoin service
            // Example: const balance = await fetchBitcoinBalance(btcAddress);
            tokenToUpdate.balance = '0'; // Placeholder until proper Bitcoin balance fetching is implemented
          } else {
            // If Bitcoin extension is not available, set to 0
            tokenToUpdate.balance = '0';
            console.log('Bitcoin extension not available, setting balance to 0');
          }
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
          tokenToUpdate.balance = '0'; // Set to 0 instead of Error for consistency
        }
      } else if (token.symbol === 'MAGAL' && connection && token.address) {
        try {
          const tokenMint = new PublicKey(token.address);
          const walletAddress = new PublicKey(publicAddress);
          
          const tokenAccount = await getAssociatedTokenAddress(tokenMint, walletAddress);
          
          try {
            const account = await getAccount(connection, tokenAccount);
            const balance = Number(account.amount) / Math.pow(10, token.decimals);
            tokenToUpdate.balance = balance.toString();
          } catch (err) {
            tokenToUpdate.balance = '0';
          }
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
          tokenToUpdate.balance = 'Error';
        }
      }
      
      setTokens(updatedTokens);
      showToast({
        message: `${token.symbol} balance updated`,
        type: 'success',
      });
    } catch (error) {
      console.error(`Error refreshing ${token.symbol} balance:`, error);
      showToast({
        message: `Failed to update ${token.symbol} balance`,
        type: 'error',
      });
    }
  }, [connection, magic, publicAddress, tokens]);

  // Fetch balances on mount and when network changes
  useEffect(() => {
    fetchTokenBalances();
  }, [fetchTokenBalances, currentNetwork, publicAddress]);

  // Format balance for display based on token type and amount
  const formatBalance = (balance: string, token?: Token): string => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0';
    if (num === 0) return '0';
    
    // Very small amounts
    if (num < 0.000001) return '< 0.000001';
    
    // Format based on token and size
    if (token) {
      switch (token.symbol) {
        case 'BTC':
          // Bitcoin typically shows 8 decimal places
          return num.toFixed(8);
        case 'ETH':
          // Ethereum typically shows 6 decimal places for small amounts
          return num < 0.01 ? num.toFixed(6) : num.toFixed(4);
        case 'SOL':
          // Solana typically shows 6 decimal places
          return num.toFixed(6);
        default:
          // Default formatting based on size
          if (num < 0.01) {
            return num.toFixed(6);
          } else if (num < 1) {
            return num.toFixed(4);
          } else if (num < 1000) {
            return num.toFixed(2);
          } else {
            return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
          }
      }
    } else {
      // Default formatting if no token is provided
      if (num < 0.01) {
        return num.toFixed(6);
      } else if (num < 1) {
        return num.toFixed(4);
      } else if (num < 1000) {
        return num.toFixed(2);
      } else {
        return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
      }
    }
  };
  
  // Get network-specific gradient
  const getNetworkGradient = (network: string): string => {
    switch (network.toLowerCase()) {
      case 'bitcoin':
        return 'bg-gradient-to-br from-orange-400 to-orange-600';
      case 'ethereum':
        return 'bg-gradient-to-br from-blue-400 to-purple-600';
      case 'solana':
        return 'bg-gradient-to-br from-purple-400 to-purple-600';
      case 'bsc':
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 'polygon':
        return 'bg-gradient-to-br from-indigo-400 to-indigo-600';
      case 'avalanche':
        return 'bg-gradient-to-br from-red-400 to-red-600';
      case 'fantom':
        return 'bg-gradient-to-br from-blue-400 to-blue-600';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-600';
    }
  };
  
  // Get network-specific color for the indicator dot
  const getNetworkColor = (network: string): string => {
    switch (network.toLowerCase()) {
      case 'bitcoin':
        return 'bg-orange-500';
      case 'ethereum':
        return 'bg-blue-500';
      case 'solana':
        return 'bg-purple-500';
      case 'bsc':
        return 'bg-yellow-500';
      case 'polygon':
        return 'bg-indigo-500';
      case 'avalanche':
        return 'bg-red-500';
      case 'fantom':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Format network name for display
  const formatNetworkName = (network: string): string => {
    switch (network.toLowerCase()) {
      case 'bsc':
        return 'Binance Smart Chain';
      default:
        return network.charAt(0).toUpperCase() + network.slice(1);
    }
  };

  return (
    <div className="token-balances">
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-2">
          {tokens.map((token) => (
            <div 
              key={token.symbol} 
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full overflow-hidden mr-3 shadow-sm ${token.logo ? '' : getNetworkGradient(token.network)}`}>
                  {token.logo ? (
                    <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{token.symbol.substring(0, 2)}</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{token.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${getNetworkColor(token.network)}`}></span>
                    {formatNetworkName(token.network)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{formatBalance(token.balance, token)}</div>
                <div className="flex items-center justify-end">
                  <div className="text-xs text-gray-500 mt-0.5">{token.symbol}</div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshTokenBalance(token);
                    }} 
                    className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                    title="Refresh balance"
                    disabled={token.balance === 'loading...'}
                  >
                    {token.balance === 'loading...' ? '⌛' : '↻'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenBalance;
