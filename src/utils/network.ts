export enum Network {
  SOLANA_DEVNET = 'solana-devnet',
  SOLANA_MAINNET_BETA = 'solana-mainnet',
  ETHEREUM_SEPOLIA = 'ethereum-sepolia',
  ETHEREUM_MAINNET = 'ethereum-mainnet',
  BITCOIN_MAINNET = 'bitcoin-mainnet',
  BITCOIN_TESTNET = 'bitcoin-testnet',
  POLYGON_MAINNET = 'polygon-mainnet',
  POLYGON_AMOY = 'polygon-amoy',
  BASE_MAINNET = 'base-mainnet',
}

export const getNetworkUrl = (network?: Network) => {
  const activeNetwork = network || process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK as Network;
  switch (activeNetwork) {
    case Network.SOLANA_DEVNET:
      return 'https://solana-devnet.g.alchemy.com/v2/NUZZICdM-417xyZwDhka3615uai5GQFr';
    case Network.SOLANA_MAINNET_BETA:
      return 'https://mainnet.helius-rpc.com/?api-key=f110bfa6-9b80-444d-a685-d1b0d3c48603';
    case Network.ETHEREUM_SEPOLIA:
      return 'https://eth-sepolia.g.alchemy.com/v2/demo';
    case Network.ETHEREUM_MAINNET:
      return 'https://eth-mainnet.g.alchemy.com/v2/uRHNx98oapmdwfnEUO_BTKx8eY5A5w4C';
    case Network.BITCOIN_MAINNET:
      return 'https://bitcoin-rpc.publicnode.com';
    case Network.BITCOIN_TESTNET:
      return 'https://btc.getblock.io/testnet';
    case Network.POLYGON_MAINNET:
      return 'https://polygon-mainnet.g.alchemy.com/v2/3OPrcHSm8Yo6Wsql-IioeswZ-tJTMnV2';
    case Network.POLYGON_AMOY:
      return 'https://polygon-amoy.g.alchemy.com/v2/demo';
    case Network.BASE_MAINNET:
      return 'https://base-mainnet.g.alchemy.com/v2/3OPrcHSm8Yo6Wsql-IioeswZ-tJTMnV2';
    default:
      throw new Error('Network not supported');
  }
};

export const getNetworkName = (network?: Network) => {
  const activeNetwork = network || process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK as Network;
  switch (activeNetwork) {
    case Network.SOLANA_DEVNET:
      return 'Solana (Devnet)';
    case Network.SOLANA_MAINNET_BETA:
      return 'Solana (Mainnet)';
    case Network.ETHEREUM_SEPOLIA:
      return 'Ethereum (Sepolia)';
    case Network.ETHEREUM_MAINNET:
      return 'Ethereum (Mainnet)';
    case Network.BITCOIN_MAINNET:
      return 'Bitcoin (Mainnet)';
    case Network.BITCOIN_TESTNET:
      return 'Bitcoin (Testnet)';
    case Network.POLYGON_MAINNET:
      return 'Polygon (Mainnet)';
    case Network.POLYGON_AMOY:
      return 'Polygon (Amoy)';
    case Network.BASE_MAINNET:
      return 'Base (Mainnet)';
    default:
      return 'Unknown Network';
  }
};

export const getNetworkFromTokenNetwork = (tokenNetwork: string): Network => {
  switch (tokenNetwork.toLowerCase()) {
    case 'solana':
      return Network.SOLANA_MAINNET_BETA;
    case 'ethereum':
      return Network.ETHEREUM_MAINNET;
    case 'bitcoin':
      return Network.BITCOIN_MAINNET;
    case 'polygon':
      return Network.POLYGON_MAINNET;
    case 'base':
      return Network.BASE_MAINNET;
    default:
      return Network.SOLANA_MAINNET_BETA; // Default to Solana
  }
};

export const getBlockExplorer = (addressOrTxHash: string, network?: Network) => {
  const activeNetwork = network || process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK as Network;
  
  // Determine if this is likely a transaction hash or an address
  // Transaction hashes are typically 64-66 hex characters
  const isTransactionHash = /^(0x)?[a-fA-F0-9]{64}$/.test(addressOrTxHash);
  
  // For Solana, transaction signatures are 88 characters base58 encoded
  const isSolanaSignature = /^[1-9A-HJ-NP-Za-km-z]{88}$/.test(addressOrTxHash);
  
  switch (activeNetwork) {
    case Network.SOLANA_DEVNET:
      return isSolanaSignature
        ? `https://explorer.solana.com/tx/${addressOrTxHash}?cluster=devnet`
        : `https://explorer.solana.com/address/${addressOrTxHash}?cluster=devnet`;
    case Network.SOLANA_MAINNET_BETA:
      return isSolanaSignature
        ? `https://solscan.io/tx/${addressOrTxHash}`
        : `https://solscan.io/account/${addressOrTxHash}`;
    case Network.ETHEREUM_SEPOLIA:
      return isTransactionHash
        ? `https://sepolia.etherscan.io/tx/${addressOrTxHash}`
        : `https://sepolia.etherscan.io/address/${addressOrTxHash}`;
    case Network.ETHEREUM_MAINNET:
      return isTransactionHash
        ? `https://etherscan.io/tx/${addressOrTxHash}`
        : `https://etherscan.io/address/${addressOrTxHash}`;
    case Network.BITCOIN_MAINNET:
      return isTransactionHash
        ? `https://www.blockchain.com/explorer/transactions/btc/${addressOrTxHash}`
        : `https://www.blockchain.com/explorer/addresses/btc/${addressOrTxHash}`;
    case Network.BITCOIN_TESTNET:
      return isTransactionHash
        ? `https://www.blockchain.com/explorer/transactions/btc-testnet/${addressOrTxHash}`
        : `https://www.blockchain.com/explorer/addresses/btc-testnet/${addressOrTxHash}`;
    case Network.POLYGON_MAINNET:
      return isTransactionHash
        ? `https://polygonscan.com/tx/${addressOrTxHash}`
        : `https://polygonscan.com/address/${addressOrTxHash}`;
    case Network.POLYGON_AMOY:
      return isTransactionHash
        ? `https://amoy.polygonscan.com/tx/${addressOrTxHash}`
        : `https://amoy.polygonscan.com/address/${addressOrTxHash}`;
    case Network.BASE_MAINNET:
      return isTransactionHash
        ? `https://basescan.org/tx/${addressOrTxHash}`
        : `https://basescan.org/address/${addressOrTxHash}`;
    default:
      return '';
  }
};
