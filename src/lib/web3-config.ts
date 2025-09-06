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
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '21fef48091f12692cad574a6f7753643', // Get from https://cloud.walletconnect.com
  chains: [mainnet, polygon, optimism, arbitrum, base, bsc, avalanche],
  ssr: true,
});