import React, { useCallback, useEffect, useState } from 'react';
import Divider from '@/components/ui/Divider';
import { useMagic } from '../MagicProvider';
import FormButton from '@/components/ui/FormButton';
import FormInput from '@/components/ui/FormInput';
import ErrorText from '@/components/ui/ErrorText';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  createTransferInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction 
} from '@solana/spl-token';
import showToast from '@/utils/showToast';
import Spinner from '@/components/ui/Spinner';
import Spacer from '@/components/ui/Spacer';
import TransactionHistory from '@/components/ui/TransactionHistory';
import { Network } from '@/utils/network';

interface SendTransactionProps {
  selectedToken?: {
    name: string;
    symbol: string;
    network: string;
    address?: string;  // Token mint address (for SPL tokens)
    decimals?: number; // Token decimals (for SPL tokens)
    balance?: string;  // Current balance
  };
}

const SendTransaction: React.FC<SendTransactionProps> = ({ selectedToken }) => {
  const { magic, connection, isEthereum, isSolana, isBitcoin, isPolygon, isBase, currentNetwork } = useMagic();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [disabled, setDisabled] = useState(!toAddress || !amount);
  const [toAddressError, setToAddressError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [hash, setHash] = useState('');
  const [transactionLoading, setTransactionLoadingLoading] = useState(false);
  const publicAddress = localStorage.getItem('user');

  useEffect(() => {
    setDisabled(!toAddress || !amount);
    setAmountError(false);
    setToAddressError(false);
  }, [amount, toAddress]);

  const handleAirdrop = useCallback(async () => {
    try {
      setAirdropLoading(true);
      await connection?.requestAirdrop(new PublicKey(publicAddress as string), 2 * LAMPORTS_PER_SOL);
      setAirdropLoading(false);
      showToast({ message: 'Airdropped 2 SOL!', type: 'success' });
    } catch (e: any) {
      setAirdropLoading(false);
      if ((e.message as string).includes('429')) {
        showToast({ message: 'Limit reaced', type: 'error' });
      } else {
        showToast({
          message: 'Something went wrong. Check console for more details',
          type: 'error',
        });
      }
      console.log(e);
    }
  }, [connection]);

  // Helper function to get the currency symbol based on the current network
  const getCurrencySymbol = useCallback(() => {
    if (selectedToken) return selectedToken.symbol;
    if (isSolana) return 'SOL';
    if (isEthereum) return 'ETH';
    if (isBitcoin) return 'BTC';
    if (isPolygon) return 'MATIC';
    if (isBase) return 'ETH'; // Base uses ETH
    return '';
  }, [selectedToken, isSolana, isEthereum, isBitcoin, isPolygon, isBase]);

  // Validate address based on blockchain
  const validateAddress = useCallback((address: string): boolean => {
    // Get the network from the selected token or current network state
    const network = selectedToken?.network || 
      (isSolana ? 'solana' : 
       isEthereum ? 'ethereum' : 
       isBitcoin ? 'bitcoin' : 
       isPolygon ? 'polygon' : 
       isBase ? 'base' : '');
    
    // Log for debugging
    console.log('Validating address for network:', network, address);
    
    switch(network.toLowerCase()) {
      case 'solana':
        try {
          const pubkey = new PublicKey(address);
          return PublicKey.isOnCurve(pubkey.toBuffer());
        } catch {
          return false;
        }
      
      case 'ethereum':
      case 'polygon':  // Polygon uses Ethereum address format
      case 'base':     // Base uses Ethereum address format
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      
      case 'bitcoin':
        // Basic Bitcoin address validation (P2PKH, P2SH, Bech32)
        return (
          /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || // P2PKH, P2SH
          /^bc1[ac-hj-np-z02-9]{39,59}$/.test(address) // Bech32
        );
      
      default:
        console.warn('Unknown network for address validation:', network);
        // For unknown networks, do a basic check that the address is not empty
        return !!address && address.length > 10;
    }
  }, [isSolana, isEthereum, isBitcoin, isPolygon, isBase, selectedToken]);

  const sendTransaction = useCallback(async () => {
    if (isNaN(Number(amount))) {
      return setAmountError(true);
    }

    // Validate address
    if (!validateAddress(toAddress)) {
      return setToAddressError(true);
    }

    setDisabled(true);

    try {
      setTransactionLoadingLoading(true);
      
      if (isSolana && connection && magic) {
        const userPublicKey = new PublicKey(publicAddress as string);
        const receiverPublicKey = new PublicKey(toAddress as string);
        
        const hash = await connection.getLatestBlockhash();
        if (!hash) return;

        const transaction = new Transaction({
          feePayer: userPublicKey,
          ...hash,
        });

        // Check if we're sending an SPL token or native SOL
        const isSplToken = selectedToken?.address && selectedToken.network === 'solana' && selectedToken.symbol !== 'SOL';
        
        if (isSplToken && selectedToken?.address) {
          // SPL Token Transfer
          console.log('Sending SPL token:', selectedToken.symbol);
          
          try {
            // Get the token mint
            const mintAddress = new PublicKey(selectedToken.address);
            
            // Calculate token amount based on decimals
            const tokenDecimals = selectedToken.decimals || 9;
            const tokenAmount = Math.round(Number(amount) * Math.pow(10, tokenDecimals));
            console.log(`SPL token amount: ${tokenAmount} (${amount} with ${tokenDecimals} decimals)`);
            
            // Get the sender's token account
            const senderTokenAccount = await getAssociatedTokenAddress(
              mintAddress,
              userPublicKey
            );
            
            // Get or create the recipient's token account
            const recipientTokenAccount = await getAssociatedTokenAddress(
              mintAddress,
              receiverPublicKey
            );
            
            // Check if the recipient's token account exists
            let recipientAccountInfo;
            try {
              recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
            } catch (error) {
              console.log('Error checking recipient token account:', error);
            }
            
            // If recipient token account doesn't exist, create it
            if (!recipientAccountInfo) {
              console.log('Creating associated token account for recipient');
              
              // Create the associated token account instruction
              const createATAInstruction = createAssociatedTokenAccountInstruction(
                userPublicKey,               // Payer (fee payer)
                recipientTokenAccount,       // Associated token account to create
                receiverPublicKey,           // Token account owner
                mintAddress                  // Token mint
              );
              
              // Add the instruction to the transaction
              transaction.add(createATAInstruction);
            }
            
            // Add the transfer instruction
            const transferInstruction = createTransferInstruction(
              senderTokenAccount,
              recipientTokenAccount,
              userPublicKey,
              tokenAmount
            );
            
            transaction.add(transferInstruction);
            
          } catch (err: any) {
            console.error('Error creating SPL token transfer:', err);
            showToast({
              message: `Error creating SPL token transfer: ${err.message || 'Unknown error'}`,
              type: 'error',
            });
            setTransactionLoadingLoading(false);
            setDisabled(false);
            return;
          }
        } else {
          // Native SOL Transfer
          const lamportsAmount = Number(amount) * LAMPORTS_PER_SOL;
          console.log('SOL amount in lamports: ' + lamportsAmount);

          const transfer = SystemProgram.transfer({
            fromPubkey: userPublicKey,
            toPubkey: receiverPublicKey,
            lamports: lamportsAmount,
          });

          transaction.add(transfer);
        }

        // Sign and send the transaction
        const signedTransaction = await magic.solana.signTransaction(transaction, {
          requireAllSignatures: false,
          verifySignatures: true,
        });

        try {
          // Send the transaction with better error handling
          const signature = await connection.sendRawTransaction(
            Buffer.from(signedTransaction?.rawTransaction as string, 'base64'),
            {
              skipPreflight: false,
              preflightCommitment: 'confirmed'
            }
          );

          // Wait for confirmation
          console.log('Waiting for transaction confirmation...');
          const confirmation = await connection.confirmTransaction(signature, 'confirmed');
          
          if (confirmation.value.err) {
            throw new Error(`Transaction confirmed but failed: ${JSON.stringify(confirmation.value.err)}`);
          }

          setHash(signature ?? '');
          showToast({
            message: `Transaction successful! ${isSplToken ? 
              `Sent ${amount} ${selectedToken?.symbol}` : 
              `Sent ${amount} SOL`}. Signature: ${signature}`,
            type: 'success',
          });
        } catch (err: any) {
          console.error('Error sending transaction:', err);
          
          // Try to get detailed logs if available
          if (err.logs) {
            console.error('Transaction logs:', err.logs);
          } else if (err.getLogs) {
            try {
              const logs = await err.getLogs();
              console.error('Transaction logs from getLogs():', logs);
            } catch (logErr) {
              console.error('Failed to get transaction logs:', logErr);
            }
          }
          
          showToast({
            message: `Transaction failed: ${err.message || 'Unknown error'}`,
            type: 'error',
          });
          throw err; // Re-throw to be caught by the outer catch block
        }
      } else if ((isEthereum || isPolygon || isBase) && magic) {
        // Ethereum, Polygon, or Base transaction (all use EVM)
        const provider = magic.rpcProvider;
        
        // Convert amount to Wei (1 ETH/MATIC/etc = 10^18 Wei)
        const weiAmount = BigInt(Math.round(Number(amount) * 1e18)).toString(16);
        
        const networkName = isPolygon ? 'Polygon' : isBase ? 'Base' : 'Ethereum';
        const currency = isPolygon ? 'MATIC' : 'ETH';
        console.log(`${networkName} amount in wei: 0x${weiAmount}`);
        
        const params = [
          {
            from: publicAddress,
            to: toAddress,
            value: '0x' + weiAmount,
            gas: '0x76c0', // 30400 gas
          },
        ];
        
        const txnHash = await provider.request({
          method: 'eth_sendTransaction',
          params,
        });
        
        setHash(txnHash);
        showToast({
          message: `Transaction successful! Sent ${amount} ${currency}. Hash: ${txnHash}`,
          type: 'success',
        });
      } else if (isBitcoin && magic && magic.bitcoin) {
        // Bitcoin transaction
        try {
          // Convert BTC to satoshis (1 BTC = 100,000,000 satoshis)
          const satoshis = Math.round(Number(amount) * 100000000);
          console.log('Bitcoin amount in satoshis:', satoshis);
          
          const txnHash = await magic.bitcoin.sendTransaction({
            to: toAddress,
            amount: satoshis,
          });
          
          setHash(txnHash);
          showToast({
            message: `Transaction successful hash: ${txnHash}`,
            type: 'success',
          });
        } catch (error: any) {
          console.error('Bitcoin transaction error:', error);
          showToast({
            message: error.message || 'Bitcoin transaction failed',
            type: 'error',
          });
          throw error; // Re-throw to be caught by the outer catch block
        }
      }
      
      setTransactionLoadingLoading(false);
      setDisabled(false);
      setToAddress('');
      setAmount('');
    } catch (e: any) {
      setTransactionLoadingLoading(false);
      setDisabled(false);
      setToAddress('');
      setAmount('');
      showToast({ message: e.message || 'Transaction failed', type: 'error' });
      console.log(e);
    }
  }, [connection, amount, publicAddress, toAddress, magic, isEthereum, isSolana, isBitcoin, isPolygon, isBase, validateAddress]);

  // Get the token information
  const tokenSymbol = selectedToken?.symbol || (isSolana ? 'SOL' : isEthereum ? 'ETH' : isBitcoin ? 'BTC' : '');
  const tokenNetwork = selectedToken?.network || (isSolana ? 'solana' : isEthereum ? 'ethereum' : isBitcoin ? 'bitcoin' : '');
  
  // Ensure we're using the right network for the selected token
  useEffect(() => {
    if (selectedToken) {
      // Check if the current network matches the token's network
      const isCorrectNetwork = 
        (selectedToken.network === 'solana' && isSolana) ||
        (selectedToken.network === 'ethereum' && isEthereum) ||
        (selectedToken.network === 'bitcoin' && isBitcoin) ||
        (selectedToken.network === 'polygon' && isPolygon) ||
        (selectedToken.network === 'base' && isBase);
        
      if (!isCorrectNetwork) {
        showToast({
          message: `Warning: You're not on the ${selectedToken.network} network. Switch networks to send this token.`,
          type: 'warning'
        });
      }
    }
  }, [selectedToken, isSolana, isEthereum, isBitcoin, isPolygon, isBase]);

  return (
    <div>
      {selectedToken && (
        <div className="mb-4 p-3 bg-[#2a2a2a] rounded-lg">
          <div className="font-medium">Selected Token</div>
          <div className="flex items-center mt-2">
            <div className="text-sm text-gray-300 w-full">
              <div><span className="font-medium">Name:</span> {selectedToken.name}</div>
              <div><span className="font-medium">Symbol:</span> {selectedToken.symbol}</div>
              <div><span className="font-medium">Network:</span> {selectedToken.network}</div>
              {selectedToken.balance && (
                <div><span className="font-medium">Available Balance:</span> {selectedToken.balance} {selectedToken.symbol}</div>
              )}
              {selectedToken.address && selectedToken.network === 'solana' && selectedToken.symbol !== 'SOL' && (
                <div className="mt-2 p-2 bg-[#1a1a2e] rounded border border-blue-900">
                  <div className="text-xs text-blue-400 font-medium">SPL Token</div>
                  <div className="text-xs text-blue-300 break-all mt-1">
                    <span className="font-medium">Token Address:</span> {selectedToken.address}
                  </div>
                  {selectedToken.decimals !== undefined && (
                    <div className="text-xs text-blue-300 mt-1">
                      <span className="font-medium">Decimals:</span> {selectedToken.decimals}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* <div>
        <FormButton onClick={handleAirdrop} disabled={airdropLoading}>
          {airdropLoading ? (
            <div className="w-full loading-container">
              <Spinner />
            </div>
          ) : (
            'Airdrop 2 SOL'
          )}
        </FormButton>
        <Divider />
      </div> */}

      <FormInput
        value={toAddress}
        onChange={(e: any) => setToAddress(e.target.value)}
        placeholder="Receiving Address"
      />
      {toAddressError ? <ErrorText>Invalid address</ErrorText> : null}
      <FormInput value={amount} onChange={(e: any) => setAmount(e.target.value)} placeholder={`Amount (${tokenSymbol || getCurrencySymbol()})`} />
      {amountError ? <ErrorText className="error">Invalid amount</ErrorText> : null}
      <FormButton onClick={sendTransaction} disabled={!toAddress || !amount || disabled}>
        {transactionLoading ? (
          <div className="w-full loading-container">
            <Spinner />
          </div>
        ) : (
          'Send Transaction'
        )}
      </FormButton>
      {hash ? (
        <>
          <Spacer size={20} />
          <TransactionHistory txHash={hash} />
        </>
      ) : null}
    </div>
  );
};

export default SendTransaction;
