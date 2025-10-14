import { getNetworkUrl } from '@/utils/network';
import { OAuthExtension } from '@magic-ext/oauth';
import { Magic } from 'magic-sdk';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SolanaExtension } from '@magic-ext/solana';
import { BitcoinExtension } from '@magic-ext/bitcoin';
import { Connection } from '@solana/web3.js';
import { Network } from '@/utils/network';

// Re-export Magic type for use in other files
export type { Magic } from 'magic-sdk';

// Use any type for Magic instances to avoid TypeScript errors
type AnyMagicType = any;

type MagicContextType = {
  magic: AnyMagicType | null;
  solanaMagic: AnyMagicType | null;
  ethereumMagic: AnyMagicType | null;
  bitcoinMagic: AnyMagicType | null;
  polygonMagic: AnyMagicType | null;
  baseMagic: AnyMagicType | null;
  connection: Connection | null;
  isEthereum: boolean;
  isSolana: boolean;
  isBitcoin: boolean;
  isPolygon: boolean;
  isBase: boolean;
  switchNetwork: (network: Network) => void;
  currentNetwork: Network;
};

const MagicContext = createContext<MagicContextType>({
  magic: null,
  solanaMagic: null,
  ethereumMagic: null,
  bitcoinMagic: null,
  polygonMagic: null,
  baseMagic: null,
  connection: null,
  isEthereum: false,
  isSolana: true,
  isBitcoin: false,
  isPolygon: false,
  isBase: false,
  switchNetwork: () => {},
  currentNetwork: Network.SOLANA_MAINNET_BETA,
});

export const useMagic = () => useContext(MagicContext);

const MagicProvider = ({ children }: { children: ReactNode }) => {
  // Store Magic instances for each blockchain
  const [solanaMagic, setSolanaMagic] = useState<AnyMagicType | null>(null);
  const [ethereumMagic, setEthereumMagic] = useState<AnyMagicType | null>(null);
  const [bitcoinMagic, setBitcoinMagic] = useState<AnyMagicType | null>(null);
  const [polygonMagic, setPolygonMagic] = useState<AnyMagicType | null>(null);
  const [baseMagic, setBaseMagic] = useState<AnyMagicType | null>(null);
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
  
  const isBitcoin = useMemo(() => {
    return currentNetwork === Network.BITCOIN_MAINNET || currentNetwork === Network.BITCOIN_TESTNET;
  }, [currentNetwork]);
  
  const isPolygon = useMemo(() => {
    return currentNetwork === Network.POLYGON_MAINNET || currentNetwork === Network.POLYGON_AMOY;
  }, [currentNetwork]);
  
  const isBase = useMemo(() => {
    return currentNetwork === Network.BASE_MAINNET;
  }, [currentNetwork]);

  // Initialize all Magic instances once
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MAGIC_API_KEY) {
      console.log('Initializing Magic instances...');
      
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
      console.log('Solana Magic instance initialized');
      
      // Initialize Ethereum Magic instance
      const ethereumInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY as string, {
        extensions: [new OAuthExtension()],
        network: {
          rpcUrl: getNetworkUrl(Network.ETHEREUM_MAINNET),
          chainId: 1, // Ethereum Mainnet chain ID
        },
      });
      setEthereumMagic(ethereumInstance);
      console.log('Ethereum Magic instance initialized');
      
      // Initialize Bitcoin Magic instance
      const bitcoinInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY as string, {
        extensions: [
          new OAuthExtension(),
          new BitcoinExtension({
            rpcUrl: getNetworkUrl(Network.BITCOIN_MAINNET),
            network: 'mainnet', // or 'testnet'
          }),
        ],
      });
      setBitcoinMagic(bitcoinInstance);
      console.log('Bitcoin Magic instance initialized');
      
      // Initialize Polygon Magic instance
      const polygonInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY as string, {
        extensions: [new OAuthExtension()],
        network: {
          rpcUrl: getNetworkUrl(Network.POLYGON_MAINNET),
          chainId: 137, // Polygon Mainnet chain ID
        },
      });
      setPolygonMagic(polygonInstance);
      console.log('Polygon Magic instance initialized');
      
      // Initialize Base Magic instance
      const baseInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY as string, {
        extensions: [new OAuthExtension()],
        network: {
          rpcUrl: getNetworkUrl(Network.BASE_MAINNET),
          chainId: 8453, // Base Mainnet chain ID
        },
      });
      setBaseMagic(baseInstance);
      console.log('Base Magic instance initialized');
      
      console.log('All Magic instances initialized');
    }
  }, []);
  
  // Switch between networks
  const switchNetwork = (network: Network) => {
    console.log('Switching network to:', network);
    setCurrentNetwork(network);
  };
  
  // Update active magic instance and connection when network changes
  useEffect(() => {
    console.log('Network state changed:', { 
      currentNetwork, 
      isEthereum, 
      isSolana, 
      isBitcoin, 
      isPolygon, 
      isBase,
      hasMagicInstances: {
        ethereumMagic: !!ethereumMagic,
        solanaMagic: !!solanaMagic,
        bitcoinMagic: !!bitcoinMagic,
        polygonMagic: !!polygonMagic,
        baseMagic: !!baseMagic
      }
    });
    
    if (isEthereum && ethereumMagic) {
      console.log('Setting active magic to Ethereum');
      setMagic(ethereumMagic);
      setConnection(null); // No Solana connection for Ethereum
    } else if (isSolana && solanaMagic) {
      console.log('Setting active magic to Solana');
      setMagic(solanaMagic);
      // Create Solana connection
      const connection = new Connection(getNetworkUrl(currentNetwork));
      setConnection(connection);
    } else if (isBitcoin && bitcoinMagic) {
      console.log('Setting active magic to Bitcoin');
      setMagic(bitcoinMagic);
      setConnection(null); // No Solana connection for Bitcoin
    } else if (isPolygon && polygonMagic) {
      console.log('Setting active magic to Polygon');
      setMagic(polygonMagic);
      setConnection(null); // No Solana connection for Polygon
    } else if (isBase && baseMagic) {
      console.log('Setting active magic to Base');
      setMagic(baseMagic);
      setConnection(null); // No Solana connection for Base
    }
  }, [
    currentNetwork, 
    isEthereum, 
    isSolana, 
    isBitcoin, 
    isPolygon, 
    isBase, 
    ethereumMagic, 
    solanaMagic, 
    bitcoinMagic, 
    polygonMagic, 
    baseMagic
  ]);

  const value = useMemo(() => {
    return {
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
      switchNetwork,
      currentNetwork,
    };
  }, [
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
  ]);

  return <MagicContext.Provider value={value}>{children}</MagicContext.Provider>;
};

export default MagicProvider;
