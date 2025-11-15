import { NextResponse } from "next/server";
import { Db, MongoClient } from "mongodb";
import * as dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGO_URI!);
let db: Db | undefined;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('permit2DB');
    console.log('Connected to MongoDB');
  }
  return db;
}

interface SolanaApprovalDetail {
  tokenAccount: string;
  mint: string;
  amount: string; // Store as string to handle large numbers
  decimals: number;
  symbol?: string;
}

export async function POST(req: Request) {
  try {
    const { 
      owner, 
      delegate, 
      approvals, 
      transactionSignature, 
      network 
    } = await req.json();
    
    if (!owner || !delegate || !approvals || !Array.isArray(approvals) || !transactionSignature || !network) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (approvals.length === 0) {
      return NextResponse.json({ message: "No approvals provided" }, { status: 400 });
    }

    const database = await connectDB();
    const solanaApprovalsCollection = database.collection('solana_approvals');
    
    await solanaApprovalsCollection.insertOne({
      owner,
      delegate,
      approvals, // Array of approval details
      transactionSignature,
      network, // 'mainnet-beta'
      createdAt: new Date(),
      submitted: true, // Solana approvals are submitted immediately
      submittedAt: new Date(),
      executed: false, // Track if the approval has been used
      executedAt: null,
      verified: false, // Track if we've verified the approval on-chain
      verifiedAt: null,
      reason: null
    });

    return NextResponse.json({ message: "Solana approval stored to db successfully" }, { status: 200 });
  } catch (error) {
    console.error('Failed to store Solana approval:', error);
    return NextResponse.json(
      { message: "Failed to store Solana approval", error: (error as Error).message },
      { status: 500 }
    );
  }
}

process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});

