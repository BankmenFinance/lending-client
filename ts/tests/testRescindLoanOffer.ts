/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/lending-client/types';
import { LendingClient } from '@bankmenfi/lending-client/client/lending';
import { Loan } from '@bankmenfi/lending-client/accounts';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { CollectionLendingProfile } from '../src/accounts/collectionLendingProfile';
import { CONFIGS } from '@bankmenfi/lending-client/constants';

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
  console.log('Running testRescindLoanOffer.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const lendingClient = new LendingClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

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

  // filter loans that we offered but haven't been taken yet
  const filteredLoans = loans.filter(
    (l) =>
      l.state.lender.toString() == lendingClient.walletPubkey.toString() &&
      l.state.borrower.toString() == PublicKey.default.toString()
  );

  if (filteredLoans.length == 0) {
    console.log('No loans to rescind for this CLP..');
    return;
  }
  console.log(
    'Found ' + filteredLoans.length + ' loans to rescind for this CLP.'
  );

  // The keypair
  const loanToRescind = filteredLoans[0];

  console.log(
    'Loan Principal: ' +
      loanToRescind.state.principalAmount +
      '\nRepayment Amount: ' +
      loanToRescind.state.repaymentAmount +
      '\nPaid Amount: ' +
      loanToRescind.state.paidAmount +
      '\nAmount Left: ' +
      loanToRescind.state.repaymentAmount.sub(loanToRescind.state.paidAmount)
  );

  const { accounts, ixs } = await loanToRescind.rescindLoan(
    collectionLendingProfile
  );

  const tx = new Transaction();

  for (const ix of ixs) {
    tx.add(ix);
  }

  const signature = await lendingClient.sendAndConfirm(tx, [wallet]);
  console.log('Transaction signature: ' + signature);
};

main();
