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
  projectId: 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [mainnet, polygon, optimism, arbitrum, base, bsc, avalanche],
  ssr: true,
});