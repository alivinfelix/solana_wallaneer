import React from 'react';
import Image from 'next/image';
import Link from 'public/link.svg';
import { getBlockExplorer } from '@/utils/network';
import { useMagic } from '@/components/magic/MagicProvider';

interface TransactionHistoryProps {
  txHash?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ txHash }) => {
  const { currentNetwork } = useMagic();
  const publicAddress = localStorage.getItem('user');
  
  // If we have a transaction hash, use that for the explorer link
  // Otherwise, use the address for a general history view
  const target = txHash || publicAddress;
  const isTransaction = !!txHash;
  
  // Get the appropriate explorer URL based on the current network
  const explorerUrl = getBlockExplorer(target as string, currentNetwork);

  return (
    <a className="action-button" href={explorerUrl} target="_blank" rel="noreferrer">
      <div className="flex items-center justify-center">
        {isTransaction ? 'View Transaction' : 'Transaction History'} <Image src={Link} alt="link-icon" className="ml-[3px]" />
      </div>
    </a>
  );
};

export default TransactionHistory;
