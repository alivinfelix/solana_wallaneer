export enum Network {
  SOLANA_DEVNET = 'solana-devnet',
  SOLANA_MAINNET_BETA = 'solana-mainnet',
  ETHEREUM_SEPOLIA = 'ethereum-sepolia',
  ETHEREUM_MAINNET = 'ethereum-mainnet',
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
    default:
      return '';
  }
};
