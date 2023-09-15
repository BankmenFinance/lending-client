/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/lending-client/types';
import { LendingClient } from '@bankmenfi/lending-client/client/lending';
import { Loan, User } from '@bankmenfi/lending-client/accounts';
import { PublicKey, Transaction } from '@solana/web3.js';
import { BN } from 'bn.js';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { CollectionLendingProfile } from '@bankmenfi/lending-client/accounts/collectionLendingProfile';
import { deriveUserAccountAddress } from '@bankmenfi/lending-client/utils';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
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
  console.log('Running testCreateLoanOffer.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const lendingClient = new LendingClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  // Specify a collection lending profile here
  const collectionLendingProfileAddress = new PublicKey(
    'DhcBDFaMJrMsMKbqWSb48vaH8wNmDeTe2MGbfmhXkEz8'
  );
  // Load the collection lending profile
  const collectionLendingProfile = await CollectionLendingProfile.load(
    lendingClient,
    collectionLendingProfileAddress
  );

  // Derive the user's account address
  // this account holds stats from the user's usage of the program
  const [userAccountAddress] = deriveUserAccountAddress(
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
    loanId = userAccount.state.loansOffered.add(new BN(1));
  }

  // We need to make sure that the lender and the borrower have a token account
  // for the token mint of the Collection Lending Profile, even if it is SOL being used for the loans.
  await getOrCreateAssociatedTokenAccount(
    lendingClient.connection,
    wallet,
    collectionLendingProfile.tokenMint,
    lendingClient.walletPubkey
  );

  const args = {
    amount: new BN(1_000_000_000), // this is 1 SOL
    id: loanId,
    isLtv: false,
    ltvAmount: 0, // 7500 bps = 75%
    maxLtvAmount: new BN(0) // this is 1 SOL
  };

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
