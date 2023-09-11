/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/lending-client/types';
import { LendingClient } from '@bankmenfi/lending-client/client/lending';
import { Loan } from '@bankmenfi/lending-client/accounts';
import {
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  PublicKey,
  Transaction
} from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
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
  console.log('Running testRepayLoanOffer.');

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
    'DhcBDFaMJrMsMKbqWSb48vaH8wNmDeTe2MGbfmhXkEz8'
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

  // Get current timestamp in seconds
  const currentTimestamp = new BN(Math.floor(Date.now() / 1000));

  const filteredLoans = loans.filter(
    (l) =>
      l.state.borrower.toString() == lendingClient.walletPubkey.toString() &&
      l.state.dueTimestamp.gt(currentTimestamp)
  );

  if (filteredLoans.length == 0) {
    console.log('No loans to repay for this collection..');
    return;
  }
  console.log(
    'Found ' + filteredLoans.length + ' loans to repay for this CLP.'
  );

  // Here we have to fetch an NFT from the user that actually belongs to this collection
  const collateralMint = new PublicKey(
    '6Gqh9LuQADcpemqM7QhgAu5wB6LdPSSTsHLTQnr44m3h'
  );

  const metadata = await metaplex
    .nfts()
    .findByMint({ mintAddress: collateralMint });

  // The keypair
  const loanToRepay = filteredLoans[0];
  console.log(loanToRepay.address.toString());

  console.log(
    'Loan: ' +
      loanToRepay.address +
      '\n\tLoan Principal: ' +
      loanToRepay.state.principalAmount +
      '\n\tRepayment Amount: ' +
      loanToRepay.state.repaymentAmount +
      '\n\tPaid Amount: ' +
      loanToRepay.state.paidAmount +
      '\n\tAmount Left: ' +
      loanToRepay.state.repaymentAmount.sub(loanToRepay.state.paidAmount)
  );

  const { accounts, ixs } = await loanToRepay.repayLoan(
    metaplex,
    collectionLendingProfile,
    metadata
  );

  const tx = new Transaction();

  for (const ix of ixs) {
    tx.add(ix);
  }

  const signature = await lendingClient.sendAndConfirm(tx, [wallet]);
  console.log('Transaction signature: ' + signature);
};

main();
