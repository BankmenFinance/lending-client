/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@gbg-lending-client/types';
import { LendingClient } from '@gbg-lending-client/client/lending';
import { Loan } from '@gbg-lending-client/accounts';
import { PublicKey } from '@solana/web3.js';
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
  console.log('Running testLoadCollectionProfiles.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const lendingClient = new LendingClient(CLUSTER, new NodeWallet(wallet));

  // Load the collection lending profile
  const collectionLendingProfiles = await CollectionLendingProfile.loadAll(
    lendingClient
  );

  console.log('Found ' + collectionLendingProfiles.length + ' CLPs.');
  for (const collectionLendingProfile of collectionLendingProfiles) {
    console.log(
      'Loan: ' +
        collectionLendingProfile.address +
        '\n\tCollection: ' +
        collectionLendingProfile.state.collection +
        '\n\tToken Mint: ' +
        collectionLendingProfile.state.tokenMint +
        '\n\tToken Vault: ' +
        collectionLendingProfile.state.tokenVault +
        '\n\tInterest Rate: ' +
        collectionLendingProfile.state.interestRate +
        '\n\tFees Accumulated: ' +
        collectionLendingProfile.state.feesAccumulated +
        '\n\tFee Rate: ' +
        collectionLendingProfile.state.feeRate +
        '\n\tLoan Amount Originated: ' +
        collectionLendingProfile.state.loanAmountOriginated +
        '\n\tLoan Amount Repaid: ' +
        collectionLendingProfile.state.loanAmountRepaid +
        '\n\tLoans Offered: ' +
        collectionLendingProfile.state.loansOffered +
        '\n\tLoans Originated: ' +
        collectionLendingProfile.state.loansOriginated +
        '\n\tLoans Repaid: ' +
        collectionLendingProfile.state.loansRepaid +
        '\n\tLoans Rescinded: ' +
        collectionLendingProfile.state.loansRescinded +
        '\n\tLoans Foreclosed: ' +
        collectionLendingProfile.state.loansForeclosed
    );
  }
};

main();
