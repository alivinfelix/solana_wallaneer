import { getNetworkUrl } from '@/utils/network';
import { OAuthExtension } from '@magic-ext/oauth';
import { Magic } from 'magic-sdk';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SolanaExtension } from '@magic-ext/solana';
import { Connection } from '@solana/web3.js';
import { Network } from '@/utils/network';

// Re-export Magic type for use in other files
export type { Magic } from 'magic-sdk';

// Use any type for Magic instances to avoid TypeScript errors
type AnyMagicType = any;

type MagicContextType = {
  magic: AnyMagicType | null;
  connection: Connection | null;
  isEthereum: boolean;
  isSolana: boolean;
  switchNetwork: (network: Network) => void;
  currentNetwork: Network;
};

const MagicContext = createContext<MagicContextType>({
  magic: null,
  connection: null,
  isEthereum: false,
  isSolana: true,
  switchNetwork: () => {},
  currentNetwork: Network.SOLANA_DEVNET,
});

export const useMagic = () => useContext(MagicContext);

const MagicProvider = ({ children }: { children: ReactNode }) => {
  // Store both Magic instances
  const [solanaMagic, setSolanaMagic] = useState<AnyMagicType | null>(null);
  const [ethereumMagic, setEthereumMagic] = useState<AnyMagicType | null>(null);
  // Active magic instance based on current network
  const [magic, setMagic] = useState<AnyMagicType | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<Network>(
    (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK as Network) || Network.SOLANA_MAINNET_BETA
  );

  const isEthereum = useMemo(() => {
    return currentNetwork === Network.ETHEREUM_SEPOLIA || currentNetwork === Network.ETHEREUM_MAINNET;
  }, [currentNetwork]);

  const isSolana = useMemo(() => {
    return currentNetwork === Network.SOLANA_DEVNET || currentNetwork === Network.SOLANA_MAINNET_BETA;
  }, [currentNetwork]);

  // Initialize both Magic instances once
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MAGIC_API_KEY) {
      // Initialize Solana Magic instance
      const solanaInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY as string, {
        extensions: [
          new OAuthExtension(),
          new SolanaExtension({
            rpcUrl: getNetworkUrl(Network.SOLANA_MAINNET_BETA),
          }),
        ],
      });
      setSolanaMagic(solanaInstance);
      
      // Initialize Ethereum Magic instance
      const ethereumInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY as string, {
        extensions: [new OAuthExtension()],
      });
      setEthereumMagic(ethereumInstance);
    }
  }, []);
  
  // Switch between networks
  const switchNetwork = (network: Network) => {
    setCurrentNetwork(network);
  };
  
  // Update active magic instance and connection when network changes
  useEffect(() => {
    if (isEthereum && ethereumMagic) {
      setMagic(ethereumMagic);
      setConnection(null); // No Solana connection for Ethereum
    } else if (isSolana && solanaMagic) {
      setMagic(solanaMagic);
      // Create Solana connection
      const connection = new Connection(getNetworkUrl(currentNetwork));
      setConnection(connection);
    }
  }, [currentNetwork, isEthereum, isSolana, ethereumMagic, solanaMagic]);

  const value = useMemo(() => {
    return {
      magic,
      connection,
      isEthereum,
      isSolana,
      switchNetwork,
      currentNetwork,
    };
  }, [magic, connection, isEthereum, isSolana, currentNetwork]);

  return <MagicContext.Provider value={value}>{children}</MagicContext.Provider>;
};

export default MagicProvider;
