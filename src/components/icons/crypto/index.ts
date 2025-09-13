// Individual icon exports
export { BitcoinIcon } from './bitcoin-icon';
export { EthereumIcon } from './ethereum-icon';
export { SolanaIcon } from './solana-icon';
export { CardanoIcon } from './cardano-icon';
export { PolygonIcon } from './polygon-icon';
export { ChainlinkIcon } from './chainlink-icon';

// Import all icons for the array
import { BitcoinIcon } from './bitcoin-icon';
import { EthereumIcon } from './ethereum-icon';
import { SolanaIcon } from './solana-icon';
import { CardanoIcon } from './cardano-icon';
import { PolygonIcon } from './polygon-icon';
import { ChainlinkIcon } from './chainlink-icon';

// Array of all crypto icons for easy usage
export const cryptoIcons = [
  { name: 'Bitcoin', component: BitcoinIcon, color: '#f7931a' },
  { name: 'Ethereum', component: EthereumIcon, color: '#627eea' },
  { name: 'Solana', component: SolanaIcon, color: '#9c48ff' },
  { name: 'Cardano', component: CardanoIcon, color: '#0033ad' },
  { name: 'Polygon', component: PolygonIcon, color: '#8247e5' },
  { name: 'Chainlink', component: ChainlinkIcon, color: '#376fff' },
];