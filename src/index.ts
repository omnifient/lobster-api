import * as dotenv from "dotenv";

import { constants } from "buffer";
import express, { Request, Response, NextFunction } from "express";
const { ethers } = require("ethers");

dotenv.config();

import {NFT_FACTORY_ADDRESS, NETWORKS} from "./constants";
const NFTFactoryJSON = require("./contracts/NFTFactory.sol/NFTFactory.json");
const app = express();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const port = 3000;

// ONBOARD CLIENTS
// TODO: TBI

// CREATE USER ACCOUNT
app.post("/account/:clientId", (req, res) => {
  const clientId = req.params.clientId;
  const userId = req.body.userId;

  // generate random wallet
  let randomWallet = ethers.Wallet.createRandom();

  // store in db
  // storeWallet(clientId, userId, randomWallet.mnemonic.phrase, randomWallet.mnemonic.path)

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

    // TODO: save contract address in db
    res.status(202).send(`Deployed to ${network} at ${nftContractAddress}`);
  }
  catch (error) {
    res.status(500).send(error);
  }
});

// MINT NFT
app.post("/nft/collection/:collectionId", (req, res) => {
  // mock NFT contract address: 0x2c1D208C28A534B87bb11f8E8e80dc26ba1c7cf0
  // mint an nft of the collection
  /* 
    JSON Metadata 
    {

    }

    SQL Metadata 
    {
      clientId: string,
      clientPublicKey: string,
      collectionId: string
    }
  */
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
