import { Cluster } from '@solana/web3.js';
import { loadWallet } from 'utils';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

require('dotenv').config({
  path: __dirname + `/args.env` // Can also be used to override default env variables
});

// Constants
const CLUSTER = process.env.CLUSTER as Cluster;
const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;

export const main = async () => {
  console.log('Running testCreateLoanOffer.');

  const wallet = loadWallet(KP_PATH);

  console.log('Wallet Public Key: ' + wallet.publicKey.toString());
};

main();
