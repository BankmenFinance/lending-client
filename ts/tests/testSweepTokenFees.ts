/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@gbg-lending-client/types';
import { LendingClient } from '@gbg-lending-client/client/lending';
import { PublicKey, Transaction } from '@solana/web3.js';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { CollectionLendingProfile } from '../src/accounts/collectionLendingProfile';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

require('dotenv').config({
  path: __dirname + `/args.env` // Can also be used to override default env variables
});

// Constants
const CLUSTER = process.env.CLUSTER as Cluster;
const KP_PATH = process.env.KEYPAIR_PATH;

export const main = async () => {
  console.log('Running testSweepTokenFees.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const lendingClient = new LendingClient(CLUSTER, new NodeWallet(wallet));

  // Specify a collection lending profile here
  const collectionLendingProfileAddress = new PublicKey(
    '2JjjU5n7TkWJ3QmQfeu3t3KSksUy2ssxQhvqvZDdyWi9'
  );
  // Load the collection lending profile
  const collectionLendingProfile = await CollectionLendingProfile.load(
    lendingClient,
    collectionLendingProfileAddress
  );

  const { ixs } = await collectionLendingProfile.sweepTokenFees(
    lendingClient,
    lendingClient.walletPubkey // this is the wallet, not the associated token account!!!
  );

  const tx = new Transaction();

  for (const ix of ixs) {
    tx.add(ix);
  }

  const signature = await lendingClient.sendAndConfirm(tx, [wallet]);
  console.log('Transaction signature: ' + signature);
};

main();
