import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useWalletConnection = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (connected) {
      navigate('/dashboard');
    } else {
      // Trigger wallet connection modal
      const walletButton = document.querySelector('.wallet-adapter-button') as HTMLButtonElement;
      if (walletButton) {
        walletButton.click();
      }
    }
  };

  return { connected, handleGetStarted };
};

// Auto-redirect to dashboard when wallet connects
export const useAutoRedirect = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected) {
      // Optional: Add a small delay to allow wallet connection to fully complete
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  }, [connected, navigate]);
};
