/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@gbg-lending-client/types';
import { LendingClient } from '@gbg-lending-client/client/lending';
import { Loan } from '@gbg-lending-client/accounts';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Metaplex, Metadata, toAccountInfo } from '@metaplex-foundation/js';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { CollectionLendingProfile } from '../src/accounts/collectionLendingProfile';
import { publicKey } from '@project-serum/anchor/dist/cjs/utils';

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
  console.log('Running testTakeLoanOffer.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const lendingClient = new LendingClient(CLUSTER, new NodeWallet(wallet));

  const metaplex = new Metaplex(lendingClient.connection, { cluster: CLUSTER });

  // Specify a collection lending profile here
  const collectionLendingProfileAddress = new PublicKey(
    '2JjjU5n7TkWJ3QmQfeu3t3KSksUy2ssxQhvqvZDdyWi9'
  );
  // Load the collection lending profile
  const collectionLendingProfile = await CollectionLendingProfile.load(
    lendingClient,
    collectionLendingProfileAddress
  );

  // Load all of the loan offers
  const loans = await Loan.loadAll(
    lendingClient,
    collectionLendingProfileAddress
  );
  console.log('Found ' + loans.length + ' loan offers for this CLP.');

  for (const loan of loans) {
    console.log(
      'Loan: ' +
        loan.address +
        '\n\tLender: ' +
        loan.state.lender +
        '\n\tBorrower: ' +
        loan.state.borrower +
        '\n\tPrincipal: ' +
        loan.state.principalAmount +
        '\n\tPaid: ' +
        loan.state.paidAmount
    );
  }

  // Here we have to fetch an NFT from the user that actually belongs to this collection
  const collateralMint = new PublicKey(
    '3mVY7PUCBo9WMakr4XqjYYaC2irDUEHn6fGbcR6y4wXg'
  );

  //const metadata = metaplex.nfts().pdas().metadata({ mint: collateralMint });


  const { accounts, ixs } = await loans[0].takeLoan(
    metaplex,
    collectionLendingProfile,
    collateralMint,
    //add metadata TBD
  );

  const tx = new Transaction();

  for (const ix of ixs) {
    tx.add(ix);
  }

  const signature = await lendingClient.sendAndConfirm(tx, [wallet]);
  console.log('Transaction signature: ' + signature);
};

main();
