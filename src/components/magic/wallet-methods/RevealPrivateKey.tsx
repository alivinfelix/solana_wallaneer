import React, { useState } from 'react';
import { useMagic } from '../../magic/MagicProvider';
import showToast from '@/utils/showToast';

const RevealPrivateKey = () => {
  const { magic } = useMagic();
  const [loading, setLoading] = useState(false);

  const handleRevealKey = async () => {
    try {
      setLoading(true);
      const privateKey = await magic?.user.revealPrivateKey();
      console.log('Private Key: ' + privateKey);
      showToast({
        message: 'Private key revealed in wallet',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        message: error.message || 'Failed to reveal private key',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-method-container">
      <button className="wallet-method" onClick={handleRevealKey} disabled={loading}>
        {loading ? 'Revealing...' : 'Reveal Private Key'}
      </button>
      <p className="wallet-method-desc">
        Reveals your private key in a secure window
      </p>
    </div>
  );
};

export default RevealPrivateKey;