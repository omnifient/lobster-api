import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg';

import { NETWORKS, NFT_FACTORY_ADDRESS } from './constants';
import ClientService from './services/ClientService';
import UserService from './services/UserService';

import { ethers } from "ethers";

import NFTFactoryJSON from "./contracts/NFTFactory.sol/NFTFactory.json";
import NFTJSON from "./contracts/NFT.sol/NFT.json";

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
    const network = "mumbai"
    // const network = req.body.network;
    const metadataABI = req.body.abi;
    const clientId = req.params.clientId;

    // https://docs.ethers.io/v5/api/providers/
    const provider = new ethers.providers.JsonRpcProvider(NETWORKS[network]);
    const privateKey = process.env.PRIVATE_KEY || "" // change to fetch from SQL -> use clientId to get privateKey from db
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
    JSON Metadata
    {
      network: string, - optional atm
      name,
      symbol
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
    const nftName = req.body.name;
    const nftSymbol = req.body.symbol;
    // TODO: get values from SQL
    const clientId = 1;
    const clientAddress = "0x2979885f222A7D568BE6d16e2A8aF26A99AE8B43";
    // const clientId = req.params.clientId;

    const provider = new ethers.providers.JsonRpcProvider(NETWORKS[network]);
    const privateKey = process.env.PRIVATE_KEY || "" // change to fetch from SQL -> use clientId to get privateKey from db
    const wallet = new ethers.Wallet(privateKey, provider);
    const factoryContract = await new ethers.Contract(NFT_FACTORY_ADDRESS, NFTFactoryJSON.abi, wallet);
    const tx = await factoryContract.connect(wallet).createNFT(clientId, clientAddress, nftName, nftSymbol);
    const rx = await tx.wait();
    const nftContractAddress = rx.events![0].args!["_contractAddress"];

    await clientService.insertCollection(clientId, nftContractAddress);
    // TODO: save contract address in db
    res.status(202).send(`Deployed to ${network} at ${nftContractAddress}`);
  }
  catch (error) {
    res.status(500).send(error);
  }
});

// MINT NFT
app.post("/nft/collection/:collectionId", async (req, res) => {
  // mock NFT contract address: 0x2c1D208C28A534B87bb11f8E8e80dc26ba1c7cf0
  // mint an nft of the collection
  /* 
    JSON Metadata 
    {
      userId: string,
      ipfsURI: string
    }

    SQL Metadata 
    {
      clientId: string,
      clientPublicKey: string,
      collectionId: string
    }
  */
  try {
    const collectionId = req.params.collectionId;

    const clientId = req.body.clientId;
    const userId = req.body.userId;
    const ipfsURI = req.body.ipfsURI;

    // get collection address from db
    const collections = await clientService.getCollectionAddresses(clientId);
    collections.filter((collection) => collection.id === collectionId);

    // get client wallet address public + private key from database
    const provider = new ethers.providers.JsonRpcProvider(NETWORKS["mumbai"]);
    const privateKey = await userService.getUserAddress(userId, clientId);

    // ethers create wallet
    const wallet = new ethers.Wallet(privateKey, provider);

    // ethers.js mint nft
    const nftContract = await new ethers.Contract(collectionId, NFTJSON.abi, wallet);
    const tx = await nftContract.connect(wallet).mint(wallet.address, ipfsURI);
    await tx.wait();

    res.status(202).send(`Minted token for ${wallet.address} at ${collectionId}`);

  } catch (error) {
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


