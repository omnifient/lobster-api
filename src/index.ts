import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';

import ClientService from './services/ClientService';
import UserService from './services/UserService';

import { ethers } from "ethers";

import NFTFactoryJSON from "./contracts/NFTFactory.sol/NFTFactory.json";
import NFTJSON from "./contracts/NFT.sol/NFT.json";
import NFTURISJSON = require("./contracts/NFTURIS.sol/NFTURIS.json");

dotenv.config();

import {NFT_FACTORY_ADDRESS, NETWORKS} from "./constants";


const app = express();

app.use(cors())
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

// DEPLOY ANY SMART CONTRACT
app.post("/contract/:clientId", async (req, res) => {
  /* 
    JSON Metadata
    {
      network: string, - optional atm
      abi: string containing abi & bytecode
    }

    SQL Metadata
    {
      clientId: string,
      clientPublicKey: string
    }
  
  */

  try {
    // TODO: remove network hardcoding
    const network = req.body.network || "mumbai";
    const metadataABI = req.body.abi;
    const clientId = req.params.clientId;

    const provider = new ethers.providers.JsonRpcProvider(NETWORKS[network]);
    const privateKey = await clientService.getClientPrivateKey(clientId) || process.env.PRIVATE_KEY // change to fetch from SQL -> use clientId to get privateKey from db
    const wallet = new ethers.Wallet(privateKey, provider);
    const factory = new ethers.ContractFactory(metadataABI.abi, metadataABI.bytecode, wallet);
    const contract = await factory.deploy();
    await contract.deployed();

    // TODO: save contract address in db
    res.status(202).send(`Deployed to ${network} at ${contract.address}`);
  }
  catch (error) {
    res.status(500).send(error);
  }
});

// DEPLOY NFT SMART CONTRACT
app.post("/nft/contract/:clientId", async (req, res) => {
  /* 
    JSON Request Schema
    {
      network: string, - optional atm
      name: string,
      symbol: string,
      uris: array - optional
    }
  */
  
  try {
    // TODO: remove network hardcoding
    const network = req.body.network || "mumbai";
    const nftName = req.body.name;
    const nftSymbol = req.body.symbol;
    const nftURIS = req.body.uris;

    // TODO: get values from SQL
    const clientId = req.params.clientId;
    const clientAddress = await clientService.getClientAddress(clientId);
    
    const provider = new ethers.providers.JsonRpcProvider(NETWORKS[network]);
    const privateKey = await clientService.getClientPrivateKey(clientId) || process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    const factoryContract = new ethers.Contract(NFT_FACTORY_ADDRESS, NFTFactoryJSON.abi, wallet);

    const tx = await factoryContract.connect(wallet).createNFT(clientId, clientAddress, nftName, nftSymbol, nftURIS);
    const rx = await tx.wait();
    const nftContractAddress = rx.events![0].args!["_contractAddress"];

    await clientService.insertCollection(clientId, nftContractAddress);

    res.status(202).send(`Deployed to ${network} at ${nftContractAddress}`);    
  }
  catch (error) {
    res.status(500).send(error);
  }
});

// MINT NFT
app.post("/nft/collection/:clientId/:collectionId", async (req, res) => {
  // mint an nft of the collection
  
  /* 
    JSON Request Schema 
    {
      network: string - optional,
      ipfsURIKey: int,
      userId: int
    }
  */

    try {
      const network = req.body.network || "mumbai";
      const ipfsURIKey = req.body.ipfsURIKey;
      const userId = req.body.userId;

      const collectionId = req.params.collectionId;
      const clientId = req.params.clientId; 

      const collectionJSON = NFTURISJSON; // TODO: replace with ABI from SQL
      const userWalletAddress = await userService.getUserAddress(userId, clientId);

      const provider = new ethers.providers.JsonRpcProvider(NETWORKS[network]);
      const privateKey = await clientService.getClientPrivateKey(clientId) || process.env.PRIVATE_KEY;
      const wallet = new ethers.Wallet(privateKey, provider);
      
      const nftContractAddress = await clientService.getCollectionAddress(clientId, collectionId);
      const nftContract = await new ethers.Contract(nftContractAddress, collectionJSON.abi, wallet);

      const tx = await nftContract.connect(wallet).mint(userWalletAddress, ipfsURIKey);
      const rx = await tx.wait();
  
      res.status(202).send(`Successfully minted NFT to ${userWalletAddress}`);
    }
    catch (error) {
      res.status(500).send(error);
    }
});

// Transfer NFT
app.put("/nft/collection/:collectionId", async (req, res) => {
  try {
    const collectionId = req.params.collectionId;

    const clientId = req.body.clientId;
    const tokenId = req.body.tokenId;
    const userId = req.body.userId;
    const toAddress = req.body.toAddress;

    // get collection address from db
    const collections = await clientService.getCollectionAddresses(clientId);
    collections.filter((collection) => collection.id === collectionId);

    // get client wallet address public + private key from database
    const provider = new ethers.providers.JsonRpcProvider(NETWORKS["mumbai"]);
    const privateKey = await userService.getUserAddress(userId, clientId);

    // ethers create wallet
    const userWallet = new ethers.Wallet(privateKey, provider);

    // transfer
    const nftContract = await new ethers.Contract(collectionId, NFTJSON.abi, userWallet);
    const tx = await nftContract.connect(userWallet).transferFrom(userWallet.address, toAddress, tokenId);
    await tx.wait();

    res.status(202).send(`Transfer token ${tokenId} from ${userWallet.address} to ${toAddress} at ${collectionId}`);

  } catch (error) {
    res.status(500).send(error);
  }
});

// EXPORT ACCOUNT ASSETS
app.get("/account/export/:clientId/:userId", async (req, res) => {

  try {
    const collectionsToId: {collectionAddress: string, tokenIds: number[]}[] = req.body.collectionsToId;
    const toAddress = req.body.toAddress;

    const userId = req.params.userId;
    const clientId = req.params.clientId;

    // get the user public key/private key from the database
    const provider = new ethers.providers.JsonRpcProvider(NETWORKS["mumbai"]);
    const privateKey = await userService.getUserAddress(userId, clientId);

    // ethers create wallet
    const userWallet = new ethers.Wallet(privateKey, provider);

    // transfer
    const promises = Promise.all(collectionsToId.map(async (collectionToId) => {
      const nftContract = await new ethers.Contract(collectionToId.collectionAddress, NFTJSON.abi, userWallet);
      await Promise.all(collectionToId.tokenIds.map(async (tokenId) => {
        const tx = await nftContract.connect(userWallet).transferFrom(userWallet.address, toAddress, tokenId);
        await tx.wait();
      }));
    }));

    await promises;
    res.status(202).send(`Transfered all tokens from ${userWallet.address} to ${toAddress}`);
  } catch (error) {
    res.status(500).send(error);
  }

  // array of all the nft contracts the user has
  res.send(req.params);
});

app.listen(port, () => {
  console.log(`Lobster api is running on port ${port}.`);
});

process.on('SIGTERM', () => {
  pool.end();
});