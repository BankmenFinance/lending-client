/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { delay, loadWallet } from 'utils';
import { Cluster, LoanType } from '@bankmenfi/lending-client/types';
import { LendingClient } from '@bankmenfi/lending-client/client/lending';
import { Loan } from '@bankmenfi/lending-client/accounts';
import { PublicKey } from '@solana/web3.js';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { CollectionLendingProfile } from '../src/accounts/collectionLendingProfile';
import { CONFIGS } from '@bankmenfi/lending-client/constants';
import { BN } from '@coral-xyz/anchor';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

require('dotenv').config({
  path: __dirname + `/args.env` // Can also be used to override default env variables
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;

export const main = async () => {
  console.log('Running testLoadOpenOffers.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const lendingClient = new LendingClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  // Load the collection lending profile
  const collectionLendingProfiles = await CollectionLendingProfile.loadAll(
    lendingClient
  );
  console.log(`Found ${collectionLendingProfiles.length} Lending Profiles.`);

  for (const lendingProfile of collectionLendingProfiles) {
    console.log(
      `\n\tLending Profile: ${lendingProfile.address}\n\tCollection: ${lendingProfile.collectionMint}`
    );

    const loans = await Loan.loadAllWithOptions(
      lendingClient,
      lendingProfile.address,
      wallet.publicKey
    );
    console.log(
      `Found ${loans.length} Loan Accounts for this Lending Profile where the loaded wallet is a Lender.`
    );

    const filteredLoans = loans.filter(
      (l) =>
        l.state.lender.equals(wallet.publicKey) &&
        PublicKey.default.equals(l.state.borrower)
    );

    console.log(
      `Found ${filteredLoans.length} open Loan Offers for this Lending Profile.`
    );

    for (const loan of filteredLoans) {
      console.log(
        `Loan: ${loan.address}` +
          `\n\tLender: ${loan.lender}` +
          `\n\tLoan Type: ${loan.loanType}` +
          `\n\tPrincipal: ${loan.state.principalAmount}` +
          `\n\tMax LTV Amount: ${loan.state.maxLtvAmount}` +
          `\n\tLTV: ${loan.state.ltvAmount}`
      );
    }
    await delay(250);
  }
};

main();
