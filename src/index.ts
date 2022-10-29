import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg';

import { NETWORKS } from './constants';
import ClientService from './services/ClientService';
import UserService from './services/UserService';

const { ethers } = require("ethers");
dotenv.config();

const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const port = 3000;
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false
  }
});

const userService = new UserService(pool);
const clientService = new ClientService(pool);

// ONBOARD CLIENTS
// TODO: TBI

// CREATE USER ACCOUNT
app.post("/account/:clientId", async (req, res) => {
  const clientId = req.params.clientId;
  // userId will be implemented globally (as part of a unique DB table)
  // we could thing of a table interal id to external id mapping
  const userId = req.body.userId;

  // generate random wallet
  let randomWallet = ethers.Wallet.createRandom();
  
  // store in db
  await userService.storeWallet(userId, clientId, randomWallet.mnemonic.phrase, randomWallet.mnemonic.path);

  // return the wallet's address
  res.json({
    clientId: clientId,
    userId: userId,
    address: randomWallet.address,
  });
});

// DEPLOY NFT CONTRACT
app.post("/nft/contract/:clientId", async (req, res) => {
  /* 
    JSON Metadata
    {
      network: string, - optional atm
      abi: string
    }

    SQL Metadata
    {
      clientId: string,
      clientPublicKey: string
    }
  
  */

  /* 
    // 0. predeploy factory smart contract
    // 1. get client wallet address public + private key from database
    // 2. ethers create wallet
    // 3. ethers.js deploy smart contract
    // 4. save smart contract address in db linked to client id
  */

  try {
    // TODO: remove network hardcoding
    const network = "mumbai"
    // const network = req.body.network;
    const metadata = req.body.abi;
    const clientId = req.params.clientId;

    // https://docs.ethers.io/v5/api/providers/
    const provider = new ethers.providers.JsonRpcProvider(NETWORKS[network]);
    const privateKey = process.env.PRIVATE_KEY || "" // change to fetch from SQL -> use clientId to get privateKey from db
    const wallet = new ethers.Wallet(privateKey, provider);
    const factory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, wallet);
    const contract = await factory.deploy();
    await contract.deployed();

    // TODO: save contract address in db
    res.status(202).send(`Deployed on ${network} at ${contract.address}`);
  }
  catch (error) {
    res.status(500).send(error);
  }
});

// MINT NFT
app.post("/nft/collection/:collectionId", (req, res) => {
  // mint an nft of the collection
  res.json({ hello: "world" });
});

// UPDATE NFT
app.put("/nft/collection/:collectionId/:nftId", (req, res) => {
  // update the nft of the collection (e.g. transfer nft)
  res.json({ hello: "world" });
});

// EXPORT ACCOUNT ASSETS
app.get("/account/export/:userId/:targetAddress", (req, res) => {
  // ?? targetAddress: is the userId (public key) the only thing needed?
  // Get the private key in the user table from the userId
  // return it
  res.send(req.params);
});

app.listen(port, () => {
  console.log(`Lobster api is running on port ${port}.`);
});


