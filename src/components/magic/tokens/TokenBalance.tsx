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
  {
    symbol: 'MAGAL',
    name: 'Magal',
    logo: '/assets/magal.jpg',
    balance: '0',
    decimals: 6,
    network: 'solana',
    address: 'A2ZbCHUEiHgSwFJ9EqgdYrFF255RQpAZP2xEC62fpump'
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    logo: '/assets/polygon.png',
    balance: '0',
    decimals: 18,
    network: 'polygon',
  },
  {
    symbol: 'BASE_ETH',
    name: 'Base ETH',
    logo: '/assets/base.png',
    balance: '0',
    decimals: 18,
    network: 'base',
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
  
];

const TokenBalance: React.FC<{ 
  publicAddress?: string;
  onTokenClick?: (token: Token) => void;
}> = ({ 
  publicAddress,
  onTokenClick
}) => {
  const { 
    magic, 
    solanaMagic, 
    ethereumMagic, 
    bitcoinMagic, 
    polygonMagic, 
    baseMagic, 
    connection, 
    isEthereum, 
    isSolana, 
    isBitcoin, 
    isPolygon, 
    isBase, 
    currentNetwork 
  } = useMagic();
  const [tokens, setTokens] = useState<Token[]>(DEFAULT_TOKENS);
  const [isLoading, setIsLoading] = useState(true);

  // Store chain-specific addresses
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [bitcoinAddress, setBitcoinAddress] = useState<string | null>(null);

  // Fetch token balances for all networks regardless of which one is currently active
  const fetchTokenBalances = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Create a copy of the default tokens
      const updatedTokens = [...DEFAULT_TOKENS];
      
      // Helper function to format Ethereum-compatible addresses
      const formatEthAddress = (address: string) => {
        if (address && !address.startsWith('0x')) {
          return `0x${address}`;
        }
        return address;
      };
      
      // Magic instances are already available from the useMagic hook
      // No need to destructure from magic
      
      // Fetch Solana tokens (SOL and SPL tokens) - ALWAYS fetch if we have a connection
      if (connection && solanaAddress) {
        // Fetch SOL balance
        try {
          const balance = await connection.getBalance(new PublicKey(solanaAddress));
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
            const walletAddress = new PublicKey(solanaAddress);
            
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
      
      // Helper function to fetch EVM chain balances
      const fetchEvmBalance = async (
        provider: any, 
        address: string, 
        networkName: string
      ): Promise<string> => {
        try {
          const formattedAddress = formatEthAddress(address);
          console.log(`Fetching ${networkName} balance for address:`, formattedAddress);
          
          const balanceInWei = await provider.request({
            method: 'eth_getBalance',
            params: [formattedAddress, 'latest']
          });
          
          // Convert from Wei to ETH/MATIC/etc (1 = 10^18 Wei)
          const balance = parseInt(balanceInWei, 16) / 1e18;
          console.log(`${networkName} balance:`, balance);
          return balance.toString();
        } catch (error) {
          console.error(`Error fetching ${networkName} balance:`, error);
          return '0';
        }
      };
      
      // Fetch Ethereum tokens - ALWAYS fetch if we have ethereumMagic
      if (ethereumMagic && ethereumMagic.rpcProvider && evmAddress) {
        const ethToken = updatedTokens.find(token => token.symbol === 'ETH' && token.network === 'ethereum');
        
          if (ethToken) {
          try {
            const provider = ethereumMagic.rpcProvider;
            let formattedAddress = evmAddress;
            if (!formattedAddress.startsWith('0x')) {
              formattedAddress = `0x${formattedAddress}`;
            }
            
            const balanceInWei = await provider.request({
              method: 'eth_getBalance',
              params: [formattedAddress, 'latest']
            });
            
            const balanceInEth = parseInt(balanceInWei, 16) / 1e18;
            ethToken.balance = balanceInEth.toString();
          } catch (error) {
            console.error('Error fetching ETH balance:', error);
            ethToken.balance = '0';
          }
        }
      }
      
      // Fetch Polygon tokens - ALWAYS fetch if we have polygonMagic
      if (polygonMagic && polygonMagic.rpcProvider && evmAddress) {
        const maticToken = updatedTokens.find(token => token.symbol === 'MATIC');
        
        if (maticToken) {
          try {
            const provider = polygonMagic.rpcProvider;
            let formattedAddress = evmAddress;
            if (!formattedAddress.startsWith('0x')) {
              formattedAddress = `0x${formattedAddress}`;
            }
            
            const balanceInWei = await provider.request({
              method: 'eth_getBalance',
              params: [formattedAddress, 'latest']
            });
            
            const balanceInMatic = parseInt(balanceInWei, 16) / 1e18;
            maticToken.balance = balanceInMatic.toString();
          } catch (error) {
            console.error('Error fetching MATIC balance:', error);
            maticToken.balance = '0';
          }
        }
      }
      
      // Fetch Base tokens - ALWAYS fetch if we have baseMagic
      if (baseMagic && baseMagic.rpcProvider && evmAddress) {
        const baseEthToken = updatedTokens.find(token => token.symbol === 'BASE_ETH');
        
        if (baseEthToken) {
          try {
            const provider = baseMagic.rpcProvider;
            let formattedAddress = evmAddress;
            if (!formattedAddress.startsWith('0x')) {
              formattedAddress = `0x${formattedAddress}`;
            }
            
            const balanceInWei = await provider.request({
              method: 'eth_getBalance',
              params: [formattedAddress, 'latest']
            });
            
            const balanceInEth = parseInt(balanceInWei, 16) / 1e18;
            baseEthToken.balance = balanceInEth.toString();
        } catch (error) {
            console.error('Error fetching BASE ETH balance:', error);
            baseEthToken.balance = '0';
          }
        }
      }
      
      // Fetch Bitcoin balance - ALWAYS set to 0 (placeholder)
      const btcToken = updatedTokens.find(token => token.symbol === 'BTC');
      if (btcToken) {
        btcToken.balance = '0'; // Placeholder until proper Bitcoin balance fetching is implemented
      }
      
      setTokens(updatedTokens);
      // showToast({
      //   message: 'Token balances updated',
      //   type: 'success',
      // });
    } catch (error) {
      console.error('Error fetching token balances:', error);
      showToast({
        message: 'Failed to fetch some token balances',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    connection, 
    ethereumMagic,
    polygonMagic,
    baseMagic,
    bitcoinMagic,
    solanaMagic,
    solanaAddress,
    evmAddress,
    bitcoinAddress
  ]);

  // Helper function to fetch EVM chain balances
  const fetchEvmBalance = useCallback(async (
    provider: any, 
    address: string, 
    networkName: string
  ): Promise<string> => {
    try {
      // Format address for EVM chains
      const formattedAddress = address && !address.startsWith('0x') ? `0x${address}` : address;
      console.log(`Fetching ${networkName} balance for address:`, formattedAddress);
      
      const balanceInWei = await provider.request({
        method: 'eth_getBalance',
        params: [formattedAddress, 'latest']
      });
      
      // Convert from Wei to ETH/MATIC/etc (1 = 10^18 Wei)
      const balance = parseInt(balanceInWei, 16) / 1e18;
      console.log(`${networkName} balance:`, balance);
      return balance.toString();
    } catch (error) {
      console.error(`Error fetching ${networkName} balance:`, error);
      return '0';
    }
  }, []);

  // Refresh a specific token's balance
  const refreshTokenBalance = useCallback(async (token: Token) => {
    // Need at least one chain-specific address
    if (!solanaAddress && !evmAddress && !bitcoinAddress) return;
    
    try {
      // Create a copy of the current tokens and set to loading
      const loadingTokens = tokens.map(t => 
        t.symbol === token.symbol 
          ? { ...t, balance: 'loading...' }
          : t
      );
      setTokens(loadingTokens);
      
      let newBalance = '0';
      
      // Fetch the specific token balance
      if (token.symbol === 'SOL' && connection && solanaAddress) {
        try {
          const balance = await connection.getBalance(new PublicKey(solanaAddress));
          newBalance = (balance / LAMPORTS_PER_SOL).toString();
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
          newBalance = 'Error';
        }
      } else if (token.symbol === 'ETH' && token.network === 'ethereum') {
        // Use the EVM address for Ethereum and always try to fetch if we have an EVM address
        if (evmAddress && ethereumMagic?.rpcProvider) {
          try {
            const provider = ethereumMagic.rpcProvider;
            
            // Make sure we're using a valid Ethereum address
            let formattedAddress = evmAddress;
            if (!formattedAddress.startsWith('0x')) {
              formattedAddress = `0x${formattedAddress}`;
            }
            
            console.log('Refreshing ETH balance for address:', formattedAddress);
            
            // Direct RPC call to Ethereum network
          const balanceInWei = await provider.request({
            method: 'eth_getBalance',
              params: [formattedAddress, 'latest']
          });
          
            // Convert from Wei to ETH (1 ETH = 10^18 Wei)
          const balanceInEth = parseInt(balanceInWei, 16) / 1e18;
            console.log('ETH BALANCE (refresh): ', balanceInEth);
            
            newBalance = balanceInEth.toString();
        } catch (error) {
            console.error('Error refreshing ETH balance:', error);
            newBalance = '0';
          }
        } else {
          newBalance = '0';
          console.log('Could not refresh ETH balance: No Ethereum provider or EVM address');
        }
      } else if (token.symbol === 'MATIC') {
        // Use the EVM address for Polygon and always try to fetch if we have an EVM address
        if (evmAddress && polygonMagic?.rpcProvider) {
          try {
            const provider = polygonMagic.rpcProvider;
            
            // Make sure we're using a valid Ethereum-compatible address
            let formattedAddress = evmAddress;
            if (!formattedAddress.startsWith('0x')) {
              formattedAddress = `0x${formattedAddress}`;
            }
            
            console.log('Refreshing MATIC balance for address:', formattedAddress);
            
            // Direct RPC call to Polygon network
            const balanceInWei = await provider.request({
              method: 'eth_getBalance',
              params: [formattedAddress, 'latest']
            });
            
            // Convert from Wei to MATIC (1 MATIC = 10^18 Wei)
            const balanceInMatic = parseInt(balanceInWei, 16) / 1e18;
            console.log('MATIC BALANCE (refresh): ', balanceInMatic);
            
            newBalance = balanceInMatic.toString();
          } catch (error) {
            console.error('Error refreshing MATIC balance:', error);
            newBalance = '0';
          }
          } else {
          newBalance = '0';
          console.log('Could not refresh MATIC balance: No Polygon provider or EVM address');
        }
      } else if (token.symbol === 'BASE_ETH') {
        // Use the EVM address for Base and always try to fetch if we have an EVM address
        if (evmAddress && baseMagic?.rpcProvider) {
          try {
            const provider = baseMagic.rpcProvider;
            
            // Make sure we're using a valid Ethereum-compatible address
            let formattedAddress = evmAddress;
            if (!formattedAddress.startsWith('0x')) {
              formattedAddress = `0x${formattedAddress}`;
            }
            
            console.log('Refreshing BASE ETH balance for address:', formattedAddress);
            
            // Direct RPC call to Base network
            const balanceInWei = await provider.request({
              method: 'eth_getBalance',
              params: [formattedAddress, 'latest']
            });
            
            // Convert from Wei to ETH (1 ETH = 10^18 Wei)
            const balanceInEth = parseInt(balanceInWei, 16) / 1e18;
            console.log('BASE ETH BALANCE (refresh): ', balanceInEth);
            
            newBalance = balanceInEth.toString();
          } catch (error) {
            console.error('Error refreshing BASE ETH balance:', error);
            newBalance = '0';
          }
        } else {
          newBalance = '0';
          console.log('Could not refresh BASE ETH balance: No Base provider or EVM address');
        }
      } else if (token.symbol === 'BTC') {
        // Placeholder for Bitcoin
        newBalance = '0';
      } else if (token.symbol === 'MAGAL' && connection && token.address && solanaAddress) {
        try {
          const tokenMint = new PublicKey(token.address);
          const walletAddress = new PublicKey(solanaAddress);
          
          const tokenAccount = await getAssociatedTokenAddress(tokenMint, walletAddress);
          
          try {
            const account = await getAccount(connection, tokenAccount);
            const balance = Number(account.amount) / Math.pow(10, token.decimals);
            newBalance = balance.toString();
          } catch (err) {
            newBalance = '0';
          }
        } catch (error) {
          console.error(`Error fetching ${token.symbol} balance:`, error);
          newBalance = 'Error';
        }
      }
      
      // Update the tokens array with the new balance
      const updatedTokens = tokens.map(t => 
        t.symbol === token.symbol 
          ? { ...t, balance: newBalance }
          : t
      );
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
  }, [
    connection, 
    magic, 
    solanaMagic,
    ethereumMagic,
    bitcoinMagic,
    polygonMagic,
    baseMagic,
    publicAddress, 
    tokens, 
    isEthereum, 
    isSolana, 
    isBitcoin, 
    isPolygon, 
    isBase
  ]);

  // Get chain-specific addresses - this is the first thing we need to do
  useEffect(() => {
    const getAddresses = async () => {
      console.log('Starting address retrieval for all chains...');
      
      const addressPromises = [];
      
      // For Solana address
      if (solanaMagic) {
        addressPromises.push((async () => {
          try {
            const solanaMetadata = await solanaMagic.user.getInfo();
            if (solanaMetadata && solanaMetadata.publicAddress) {
              setSolanaAddress(solanaMetadata.publicAddress);
              console.log('Got Solana address:', solanaMetadata.publicAddress);
              return { type: 'solana', address: solanaMetadata.publicAddress };
            }
          } catch (error) {
            console.error('Error getting Solana address:', error);
          }
          return null;
        })());
      } else if (magic && isSolana) {
        addressPromises.push((async () => {
          try {
            const metadata = await magic.user.getInfo();
            if (metadata && metadata.publicAddress) {
              setSolanaAddress(metadata.publicAddress);
              console.log('Got Solana address from main magic:', metadata.publicAddress);
              return { type: 'solana', address: metadata.publicAddress };
            }
          } catch (error) {
            console.error('Error getting Solana address from main magic:', error);
          }
          return null;
        })());
      }
      
      // For EVM address (Ethereum, Polygon, Base)
      if (ethereumMagic) {
        addressPromises.push((async () => {
          try {
            const ethMetadata = await ethereumMagic.user.getInfo();
            if (ethMetadata && ethMetadata.publicAddress) {
              let ethAddress = ethMetadata.publicAddress;
              if (!ethAddress.startsWith('0x')) {
                ethAddress = `0x${ethAddress}`;
              }
              setEvmAddress(ethAddress);
              console.log('Got EVM address from ethereumMagic:', ethAddress);
              return { type: 'evm', address: ethAddress };
            }
          } catch (error) {
            console.error('Error getting Ethereum address:', error);
          }
          return null;
        })());
      } else if (polygonMagic) {
        addressPromises.push((async () => {
          try {
            const polygonMetadata = await polygonMagic.user.getInfo();
            if (polygonMetadata && polygonMetadata.publicAddress) {
              let ethAddress = polygonMetadata.publicAddress;
              if (!ethAddress.startsWith('0x')) {
                ethAddress = `0x${ethAddress}`;
              }
              setEvmAddress(ethAddress);
              console.log('Got EVM address from polygonMagic:', ethAddress);
              return { type: 'evm', address: ethAddress };
            }
          } catch (error) {
            console.error('Error getting Polygon address:', error);
          }
          return null;
        })());
      } else if (baseMagic) {
        addressPromises.push((async () => {
          try {
            const baseMetadata = await baseMagic.user.getInfo();
            if (baseMetadata && baseMetadata.publicAddress) {
              let ethAddress = baseMetadata.publicAddress;
              if (!ethAddress.startsWith('0x')) {
                ethAddress = `0x${ethAddress}`;
              }
              setEvmAddress(ethAddress);
              console.log('Got EVM address from baseMagic:', ethAddress);
              return { type: 'evm', address: ethAddress };
            }
          } catch (error) {
            console.error('Error getting Base address:', error);
          }
          return null;
        })());
      } else if (magic && (isEthereum || isPolygon || isBase)) {
        addressPromises.push((async () => {
          try {
            const metadata = await magic.user.getInfo();
            if (metadata && metadata.publicAddress) {
              let ethAddress = metadata.publicAddress;
              if (!ethAddress.startsWith('0x')) {
                ethAddress = `0x${ethAddress}`;
              }
              setEvmAddress(ethAddress);
              console.log('Got EVM address from main magic:', ethAddress);
              return { type: 'evm', address: ethAddress };
            }
          } catch (error) {
            console.error('Error getting EVM address from main magic:', error);
          }
          return null;
        })());
      }
      
      // For Bitcoin address
      if (bitcoinMagic) {
        addressPromises.push((async () => {
          try {
            const btcMetadata = await bitcoinMagic.user.getInfo();
            if (btcMetadata && btcMetadata.publicAddress) {
              setBitcoinAddress(btcMetadata.publicAddress);
              console.log('Got Bitcoin address:', btcMetadata.publicAddress);
              return { type: 'bitcoin', address: btcMetadata.publicAddress };
            }
          } catch (error) {
            console.error('Error getting Bitcoin address:', error);
          }
          return null;
        })());
      } else if (magic && isBitcoin) {
        addressPromises.push((async () => {
          try {
            const metadata = await magic.user.getInfo();
            if (metadata && metadata.publicAddress) {
              setBitcoinAddress(metadata.publicAddress);
              console.log('Got Bitcoin address from main magic:', metadata.publicAddress);
              return { type: 'bitcoin', address: metadata.publicAddress };
            }
          } catch (error) {
            console.error('Error getting Bitcoin address from main magic:', error);
          }
          return null;
        })());
      }
      
      // Wait for all address retrievals to complete
      try {
        const results = await Promise.all(addressPromises);
        const addresses = results.filter(result => result !== null);
        
        console.log('All addresses retrieved:', addresses);
        
        // If we have addresses, trigger a balance fetch
        if (addresses.length > 0) {
          console.log('Addresses retrieved, fetching balances...');
          // We'll let the main useEffect handle fetching balances
          // This avoids dependency issues with fetchTokenBalances
        }
      } catch (error) {
        console.error('Error retrieving addresses:', error);
      }
    };
    
    getAddresses();
  }, [
    magic, 
    solanaMagic, 
    ethereumMagic, 
    bitcoinMagic,
    polygonMagic,
    baseMagic,
    isSolana, 
    isEthereum, 
    isBitcoin, 
    isPolygon, 
    isBase, 
    currentNetwork
  ]);

  // Fetch balances when addresses are available
  useEffect(() => {
    // Only fetch if we have at least one address
    if (solanaAddress || evmAddress || bitcoinAddress) {
      console.log('Fetching all token balances...', {
        solana: solanaAddress,
        evm: evmAddress,
        bitcoin: bitcoinAddress
      });
    fetchTokenBalances();
    }
  }, [fetchTokenBalances, solanaAddress, evmAddress, bitcoinAddress]);

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
      case 'base':
        return 'bg-gradient-to-br from-blue-400 to-blue-500';
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
      case 'base':
        return 'bg-blue-400';
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
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {tokens.map((token) => (
            <div 
              key={token.symbol} 
              className="flex items-center justify-between p-3 hover:bg-[#2a2a2a] rounded-xl transition-colors duration-200 cursor-pointer"
              onClick={() => onTokenClick && onTokenClick(token)}
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
                  <div className="font-medium text-white">{token.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${getNetworkColor(token.network)}`}></span>
                    {formatNetworkName(token.network)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">{formatBalance(token.balance, token)}</div>
                <div className="flex items-center justify-end">
                  <div className="text-xs text-gray-400 mt-0.5">{token.symbol}</div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshTokenBalance(token);
                    }} 
                    className="ml-2 text-xs text-blue-400 hover:text-blue-300"
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
