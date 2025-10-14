import React, { useCallback, useEffect, useState } from 'react';
import Divider from '@/components/ui/Divider';
import { useMagic } from '../MagicProvider';
import FormButton from '@/components/ui/FormButton';
import FormInput from '@/components/ui/FormInput';
import ErrorText from '@/components/ui/ErrorText';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import showToast from '@/utils/showToast';
import Spinner from '@/components/ui/Spinner';
import Spacer from '@/components/ui/Spacer';
import TransactionHistory from '@/components/ui/TransactionHistory';

const SendTransaction = () => {
  const { magic, connection, isEthereum, isSolana } = useMagic();
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

  const sendTransaction = useCallback(async () => {
    if (isNaN(Number(amount))) {
      return setAmountError(true);
    }
    setDisabled(true);

    try {
      setTransactionLoadingLoading(true);
      
      if (isSolana && connection) {
        // Solana transaction
        const userPublicKey = new PublicKey(publicAddress as string);
        const receiverPublicKey = new PublicKey(toAddress as string);
        
        if (!PublicKey.isOnCurve(receiverPublicKey.toBuffer())) {
          setTransactionLoadingLoading(false);
          setDisabled(false);
          return setToAddressError(true);
        }
        
        const hash = await connection.getLatestBlockhash();
        if (!hash) return;

        const transaction = new Transaction({
          feePayer: userPublicKey,
          ...hash,
        });

        const lamportsAmount = Number(amount) * LAMPORTS_PER_SOL;
        console.log('Solana amount: ' + lamportsAmount);

        const transfer = SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: receiverPublicKey,
          lamports: lamportsAmount,
        });

        transaction.add(transfer);

        const signedTransaction = await magic?.solana.signTransaction(transaction, {
          requireAllSignatures: false,
          verifySignatures: true,
        });

        const signature = await connection.sendRawTransaction(
          Buffer.from(signedTransaction?.rawTransaction as string, 'base64'),
        );

        setHash(signature ?? '');
        showToast({
          message: `Transaction successful sig: ${signature}`,
          type: 'success',
        });
      } else if (isEthereum && magic) {
        // Ethereum transaction
        // Validate Ethereum address
        if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
          setTransactionLoadingLoading(false);
          setDisabled(false);
          return setToAddressError(true);
        }
        
        const provider = magic.rpcProvider;
        
        // Convert ETH to Wei (1 ETH = 10^18 Wei)
        const weiAmount = BigInt(Math.round(Number(amount) * 1e18)).toString(16);
        console.log('Ethereum amount in wei: 0x' + weiAmount);
        
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
          message: `Transaction successful hash: ${txnHash}`,
          type: 'success',
        });
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
  }, [connection, amount, publicAddress, toAddress, magic, isEthereum, isSolana]);

  return (
    <Card>
      <CardHeader id="send-transaction">Send Transaction</CardHeader>
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
      <FormInput value={amount} onChange={(e: any) => setAmount(e.target.value)} placeholder={`Amount (${isSolana ? 'SOL' : 'ETH'})`} />
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
          <TransactionHistory />
        </>
      ) : null}
    </Card>
  );
};

export default SendTransaction;
