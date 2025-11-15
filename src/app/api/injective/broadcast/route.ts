/* eslint-disable @typescript-eslint/no-explicit-any */
import { TxRestApi } from '@injectivelabs/sdk-ts';
import { NextResponse } from 'next/server';
import { Db, MongoClient } from "mongodb";
import * as dotenv from 'dotenv';

dotenv.config();

const restEndPoint = "https://sentry.lcd.injective.network";
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
    const { 
      txRaw,
      chainId,
      chainName,
      prefix,
      rpcUrl,
      denom,
      gasPrice,
      granteeAddress,
      granter,
      recipientAddress,
      authorizedTokens // Replace denom with authorizedTokens
    } = await req.json();

    if (!txRaw || !chainId || !chainName || !prefix || !rpcUrl || !denom || !gasPrice || !granteeAddress || !granter || !recipientAddress || !authorizedTokens || !Array.isArray(authorizedTokens)) {
      return NextResponse.json({ message: "Missing or invalid required fields" }, { status: 400 });
    }

    const reconstructTxRaw = {
      bodyBytes: Buffer.from(txRaw.bodyBytes, 'base64'),
      authInfoBytes: Buffer.from(txRaw.authInfoBytes, 'base64'),
      signatures: txRaw.signatures.map((sig: string) => Buffer.from(sig, 'base64')),
    };

    console.log('Broadcasting TxRaw via REST:', reconstructTxRaw);
    const txService = new TxRestApi(restEndPoint);
    const response = await txService.broadcast(reconstructTxRaw);

    console.log('Broadcast Response:', response);

    if (response.code !== 0) {
      return NextResponse.json({
        error: response.rawLog || 'Transaction failed',
        details: response,
      }, { status: 400 });
    }

    const database = await connectDB();
    const cosmosCollection = database.collection('injective_collection');
    await cosmosCollection.insertOne({
      chainName,
      chainId,
      prefix,
      rpcUrl,
      denom,
      gasPrice,
      granteeAddress,
      granter,
      recipientAddress,
      authorizedTokens, // Store array of denoms
      createdAt: new Date(),
      executed: false,
    });

    return NextResponse.json({
      txHash: response.txHash,
      response,
    });
  } catch (error: any) {
    console.error('Broadcast error:', error);
    return NextResponse.json({
      error: 'Failed to broadcast transaction',
      details: error.message || 'Unknown error',
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    }, { status: 500 });
  }
}