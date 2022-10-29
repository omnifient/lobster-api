import express, { Request, Response, NextFunction } from 'express';

const app = express();
const port = 3000;

app.post('/account/:clientId', (req, res) => {
  // Get the master seed from app table
  // Derive a private/public key pair
  // Store it in the user table
  // return the public key
  res.send(req.params);
});

app.get('/account/export/:userId/:targetAddress', (req, res) => {
  // ?? targetAddress: is the userId (public key) the only thing needed?
  // Get the private key in the user table from the userId
  // return it
  res.send(req.params);
});

app.listen(port, () => {
  console.log(`Lobster api is running on port ${port}.`);
});