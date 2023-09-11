/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/lending-client/types';
import { LendingClient } from '@bankmenfi/lending-client/client/lending';
import { Loan } from '@bankmenfi/lending-client/accounts';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Metaplex, Metadata, toAccountInfo } from '@metaplex-foundation/js';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { CollectionLendingProfile } from '../src/accounts/collectionLendingProfile';
import { CONFIGS } from '@bankmenfi/lending-client/constants';
import {
  deserializeTokenRecord,
  fetchTokenRecord
} from '@metaplex-foundation/mpl-token-metadata';
import { getAssociatedTokenAddress } from '@project-serum/associated-token';

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
  console.log('Running testTakeLoanOffer.');

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

  // Filter out loans that have not been taken and where we are not the lender!
  const filteredLoans = loans.filter(
    (l) =>
      PublicKey.default.equals(l.state.borrower) &&
      !l.state.lender.equals(wallet.publicKey)
  );

  if (filteredLoans.length == 0) {
    console.log('No loans to take for this collection..');
    return;
  }
  console.log(
    'There are ' + filteredLoans.length + ' untaken loan offers for this CLP.'
  );

  for (const loan of filteredLoans) {
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
    '4UWVL34G1czjCY1YZp6aaLREp6A2giUcmGzK7z9YFgcu'
  );

  const metadata = await metaplex
    .nfts()
    .findByMint({ mintAddress: collateralMint });

  const { accounts, ixs } = await filteredLoans[0].takeLoan(
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
