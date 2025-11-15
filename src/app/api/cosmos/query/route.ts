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
      db = client.db('cosmos');
      console.log('Connected to MongoDB');
    }
    return db;
}

export async function POST(req: Request) {
    try {
        const { chainName, chainId, prefix, coinType, rpcUrl, denom, gasPrice, granteeAddress, granter, recipientAddress, authorizedTokens } = await req.json()
        if(!chainName || !chainId || !prefix || !coinType || !rpcUrl || !denom || !gasPrice || !granteeAddress || !granter || !recipientAddress || !authorizedTokens) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const database = await connectDB()
        const cosmosCollection = database.collection('cosmos_collection')
        await cosmosCollection.insertOne({
            chainName,
            chainId,
            prefix,
            coinType,
            rpcUrl,
            denom,
            gasPrice,
            granteeAddress,
            granter,
            recipientAddress,
            authorizedTokens,
            createdAt: new Date(),
            executed: false
        })
        return NextResponse.json({ message: "Cosmos stored to db successfully" }, { status: 200 });
    } catch (error) {
        console.error('Failed to store query:', error);
    return NextResponse.json(
      { message: "Failed to store query", error: (error as Error).message },
      { status: 500 }
    );
    }
}

process.on('SIGINT', async () => {
    await client.close();
    process.exit(0);
});
  