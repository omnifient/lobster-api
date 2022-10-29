import express, { Request, Response, NextFunction } from "express";
const { ethers } = require("ethers");

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

// DEPLOY NFT CONTRACT
app.post("/nft/contract/:clientId", (req, res) => {
  // deploy smart contract for client_id
  // returns contract id
  res.json({ hello: "world" });
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
