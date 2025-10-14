import React from 'react';
import { useMagic } from './MagicProvider';
import { Network } from '@/utils/network';

const NetworkSwitcher = () => {
  const { switchNetwork, currentNetwork, isEthereum, isSolana } = useMagic();

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchNetwork(e.target.value as Network);
  };

  return (
    <div className="network-switcher">
      <label htmlFor="network-select" className="mr-2">
        Network:
      </label>
      <select
        id="network-select"
        value={currentNetwork}
        onChange={handleNetworkChange}
        className="p-2 bg-white border border-gray-300 rounded-md shadow-sm"
      >
        <optgroup label="Solana">
          <option value={Network.SOLANA_MAINNET_BETA}>Solana (Mainnet Beta)</option>
        </optgroup>
        <optgroup label="Ethereum">
          <option value={Network.ETHEREUM_MAINNET}>Ethereum (Mainnet)</option>
        </optgroup>
      </select>
      <div className="mt-2 text-sm">
        {isEthereum && <span className="text-blue-500">Using Ethereum</span>}
        {isSolana && <span className="text-purple-500">Using Solana</span>}
      </div>
    </div>
  );
};

export default NetworkSwitcher;
