'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { config } from '@/lib/web3-config';
import { useTheme } from './ThemeProvider';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  // Suppress WalletConnect and Coinbase wallet console errors
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      
      // Suppress known Web3 wallet errors that don't affect functionality
      if (
        message.includes('WalletConnect') ||
        message.includes('cloud.reown.com') ||
        message.includes('cca-lite.coinbase.com') ||
        message.includes('Allowlist') ||
        message.includes('pulse.walletconnect.org') ||
        message.includes('net::ERR_ABORTED 401') ||
        message.includes('net::ERR_ABORTED 403')
      ) {
        return; // Suppress these specific errors
      }
      
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      
      // Suppress known Web3 wallet warnings
      if (
        message.includes('WalletConnect') ||
        message.includes('Coinbase') ||
        message.includes('wallet connection')
      ) {
        return; // Suppress these specific warnings
      }
      
      originalConsoleWarn.apply(console, args);
    };
    
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={theme === 'dark' ? darkTheme() : lightTheme()}
          coolMode
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}