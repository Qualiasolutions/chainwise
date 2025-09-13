import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  bsc,
  avalanche,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ChainWise Portfolio Tracker',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'e28ce48c93df5d31685eb4c328fb4db5', // Get from https://cloud.walletconnect.com
  chains: [mainnet, polygon, optimism, arbitrum, base, bsc, avalanche],
  ssr: true,
});