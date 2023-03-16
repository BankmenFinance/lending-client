/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@gbg-lending-client/types';
import { LendingClient } from '@gbg-lending-client/client/lending';
import { Loan, User } from '@gbg-lending-client/accounts';
import { PublicKey, Transaction } from '@solana/web3.js';
import { BN } from 'bn.js';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { CollectionLendingProfile } from '../src/accounts/collectionLendingProfile';
import { deriveUserAccountAddress } from '@gbg-lending-client/utils';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

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
  console.log('Running testCreateLoanOffer.');

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

  // Derive the user's account address
  // this account holds stats from the user's usage of the program
  const [userAccountAddress, userAccountBump] = deriveUserAccountAddress(
    lendingClient.walletPubkey,
    lendingClient.programId
  );

  // Load the user's account
  const userAccount = await User.load(lendingClient, userAccountAddress);

  let loanId = new BN(0);
  // If this happens then the user account doesn't exist yet
  // the instruction will create it for us below
  // this is just so we can get the loan id
  if (userAccount == null) {
    loanId = new BN(0);
  } else {
    loanId = userAccount.state.loansOffered;
  }

  // We need to make sure that the lender and the borrower have a token account
  // for the token mint of the Collection Lending Profile, even if it is SOL being used for the loans.
  const lenderTokenAccount = await getOrCreateAssociatedTokenAccount(
    lendingClient.connection,
    wallet,
    collectionLendingProfile.tokenMint,
    lendingClient.walletPubkey
  );

  const args = {
    amount: new BN(1_000_000_000), // this is 1 SOL
    id: loanId
  };
  console.log(JSON.stringify(args));

  const { accounts, ixs } = await Loan.create(
    lendingClient,
    collectionLendingProfile,
    args
  );

  console.log(
    'Loan: ' +
      accounts[0] +
      '\nEscrow: ' +
      accounts[1] +
      '\nEscrow Token Account: ' +
      accounts[2]
  );

  const tx = new Transaction();

  for (const ix of ixs) {
    tx.add(ix);
  }

  const signature = await lendingClient.sendAndConfirm(tx, [wallet]);
  console.log('Transaction signature: ' + signature);
};

main();
