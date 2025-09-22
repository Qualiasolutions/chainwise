// Context7 MCP Integration Service
// Provides access to up-to-date documentation for enhanced AI responses

interface Context7Response {
  content: string;
  source: string;
  relevance: number;
}

interface LibraryInfo {
  id: string;
  name: string;
  description: string;
}

export class Context7Service {
  // Resolve library names to Context7-compatible IDs
  static async resolveLibraryId(libraryName: string): Promise<string | null> {
    try {
      // Use MCP Context7 tools if available in the environment
      if (typeof window === 'undefined') {
        // Server-side: attempt to use MCP tools
        try {
          const { mcp__context7__resolve_library_id } = await import('@/lib/mcp-tools');
          const result = await mcp__context7__resolve_library_id({
            libraryName
          });

          if (result && Array.isArray(result) && result.length > 0) {
            return result[0].id || null;
          }
        } catch (error) {
          console.warn('MCP Context7 tools not available:', error);
        }
      }

      // Fallback: manual mapping for common crypto libraries
      const commonLibraries: Record<string, string> = {
        'bitcoin': '/bitcoin/bitcoin',
        'ethereum': '/ethereum/go-ethereum',
        'web3': '/web3/web3.js',
        'ethers': '/ethers-io/ethers.js',
        'solidity': '/ethereum/solidity',
        'truffle': '/trufflesuite/truffle',
        'hardhat': '/nomiclabs/hardhat',
        'metamask': '/metamask/metamask-extension',
        'openzeppelin': '/openzeppelin/openzeppelin-contracts',
        'chainlink': '/smartcontractkit/chainlink',
        'polygon': '/maticnetwork/bor',
        'avalanche': '/ava-labs/avalanchego',
        'binance': '/binance-chain/bsc',
        'cardano': '/input-output-hk/cardano-node',
        'polkadot': '/paritytech/polkadot',
        'solana': '/solana-labs/solana',
        'cosmos': '/cosmos/cosmos-sdk',
        'near': '/near/nearcore',
        'algorand': '/algorand/go-algorand'
      };

      const normalizedName = libraryName.toLowerCase();
      return commonLibraries[normalizedName] || null;
    } catch (error) {
      console.error('Error resolving library ID:', error);
      return null;
    }
  }

  // Get documentation for a specific library
  static async getLibraryDocs(libraryId: string, topic?: string, maxTokens: number = 3000): Promise<Context7Response | null> {
    try {
      // Use MCP Context7 tools if available
      if (typeof window === 'undefined') {
        try {
          const { mcp__context7__get_library_docs } = await import('@/lib/mcp-tools');
          const result = await mcp__context7__get_library_docs({
            context7CompatibleLibraryID: libraryId,
            tokens: maxTokens,
            topic: topic
          });

          if (result && typeof result === 'object') {
            return {
              content: result.content || '',
              source: libraryId,
              relevance: 0.8
            };
          }
        } catch (error) {
          console.warn('MCP Context7 get docs not available:', error);
        }
      }

      // Fallback: return null if MCP tools are not available
      return null;
    } catch (error) {
      console.error('Error getting library docs:', error);
      return null;
    }
  }

  // Enhanced documentation retrieval for crypto-specific topics
  static async getCryptoDocumentation(topic: string): Promise<Context7Response[]> {
    const responses: Context7Response[] = [];

    try {
      // Define crypto-related library mappings
      const cryptoLibraries = [
        { name: 'web3', topics: ['smart contracts', 'ethereum', 'blockchain', 'dapp'] },
        { name: 'ethers', topics: ['ethereum', 'smart contracts', 'wallet', 'provider'] },
        { name: 'bitcoin', topics: ['bitcoin', 'mining', 'wallet', 'transaction'] },
        { name: 'solidity', topics: ['smart contracts', 'ethereum', 'programming', 'development'] },
        { name: 'openzeppelin', topics: ['smart contracts', 'security', 'standards', 'erc20'] },
        { name: 'chainlink', topics: ['oracle', 'data feed', 'price', 'defi'] }
      ];

      const lowerTopic = topic.toLowerCase();

      // Find relevant libraries based on topic
      const relevantLibraries = cryptoLibraries.filter(lib =>
        lib.topics.some(t => lowerTopic.includes(t) || t.includes(lowerTopic))
      );

      // Get documentation from top 2 most relevant libraries
      for (const lib of relevantLibraries.slice(0, 2)) {
        const libraryId = await this.resolveLibraryId(lib.name);
        if (libraryId) {
          const docs = await this.getLibraryDocs(libraryId, topic, 2000);
          if (docs) {
            responses.push(docs);
          }
        }
      }

      return responses;
    } catch (error) {
      console.error('Error getting crypto documentation:', error);
      return [];
    }
  }

  // Get contextual information for AI personas
  static async getContextualInfo(persona: string, userMessage: string): Promise<string> {
    try {
      const lowerMessage = userMessage.toLowerCase();
      let topic = '';
      let libraryHints: string[] = [];

      // Extract topics and relevant libraries based on message content
      if (lowerMessage.includes('smart contract') || lowerMessage.includes('solidity')) {
        topic = 'smart contracts';
        libraryHints = ['solidity', 'openzeppelin', 'hardhat'];
      } else if (lowerMessage.includes('defi') || lowerMessage.includes('yield') || lowerMessage.includes('liquidity')) {
        topic = 'decentralized finance';
        libraryHints = ['web3', 'ethers', 'chainlink'];
      } else if (lowerMessage.includes('nft') || lowerMessage.includes('erc721')) {
        topic = 'non-fungible tokens';
        libraryHints = ['openzeppelin', 'ethers'];
      } else if (lowerMessage.includes('wallet') || lowerMessage.includes('metamask')) {
        topic = 'wallet integration';
        libraryHints = ['web3', 'ethers', 'metamask'];
      } else if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
        topic = 'bitcoin';
        libraryHints = ['bitcoin'];
      } else if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) {
        topic = 'ethereum';
        libraryHints = ['ethereum', 'web3', 'ethers'];
      }

      if (!topic) {
        return '';
      }

      // Get documentation from most relevant library
      for (const hint of libraryHints.slice(0, 1)) {
        const libraryId = await this.resolveLibraryId(hint);
        if (libraryId) {
          const docs = await this.getLibraryDocs(libraryId, topic, 1500);
          if (docs && docs.content) {
            return `\n\nRelevant documentation from ${hint}:\n${docs.content.substring(0, 1000)}...`;
          }
        }
      }

      return '';
    } catch (error) {
      console.error('Error getting contextual info:', error);
      return '';
    }
  }

  // Format documentation for AI consumption
  static formatDocsForAI(docs: Context7Response[], maxLength: number = 2000): string {
    if (!docs.length) {
      return '';
    }

    let formatted = '\n\n--- Documentation Context ---\n';
    let totalLength = formatted.length;

    for (const doc of docs) {
      const addition = `\nSource: ${doc.source}\n${doc.content}\n`;
      if (totalLength + addition.length > maxLength) {
        break;
      }
      formatted += addition;
      totalLength += addition.length;
    }

    formatted += '--- End Documentation ---\n';
    return formatted;
  }
}