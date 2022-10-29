import express, { Request, Response, NextFunction } from "express";

const app = express();
const port = 3000;

// CREATE ACCOUNT
app.post("/account/:clientId", (req, res) => {
  // Get the master seed from app table
  // Derive a private/public key pair
  // Store it in the user table
  // return the public key
  res.send(req.params);
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
