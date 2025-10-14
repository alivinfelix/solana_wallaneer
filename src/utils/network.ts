export enum Network {
  SOLANA_DEVNET = 'solana-devnet',
  SOLANA_MAINNET_BETA = 'solana-mainnet',
  ETHEREUM_SEPOLIA = 'ethereum-sepolia',
  ETHEREUM_MAINNET = 'ethereum-mainnet',
  BITCOIN_MAINNET = 'bitcoin-mainnet',
  BITCOIN_TESTNET = 'bitcoin-testnet',
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
      return 'Solana (Mainnet Beta)';
    case Network.ETHEREUM_SEPOLIA:
      return 'Ethereum (Sepolia)';
    case Network.ETHEREUM_MAINNET:
      return 'Ethereum (Mainnet)';
    case Network.BITCOIN_MAINNET:
      return 'Bitcoin (Mainnet)';
    case Network.BITCOIN_TESTNET:
      return 'Bitcoin (Testnet)';
    default:
      return 'Unknown Network';
  }
};

export const getBlockExplorer = (address: string, network?: Network) => {
  const activeNetwork = network || process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK as Network;
  switch (activeNetwork) {
    case Network.SOLANA_DEVNET:
      return `https://explorer.solana.com/address/${address}?cluster=devnet`;
    case Network.SOLANA_MAINNET_BETA:
      return `https://explorer.solana.com/address/${address}`;
    case Network.ETHEREUM_SEPOLIA:
      return `https://sepolia.etherscan.io/address/${address}`;
    case Network.ETHEREUM_MAINNET:
      return `https://etherscan.io/address/${address}`;
    case Network.BITCOIN_MAINNET:
      return `https://www.blockchain.com/explorer/addresses/btc/${address}`;
    case Network.BITCOIN_TESTNET:
      return `https://www.blockchain.com/explorer/addresses/btc-testnet/${address}`;
    default:
      return '';
  }
};
