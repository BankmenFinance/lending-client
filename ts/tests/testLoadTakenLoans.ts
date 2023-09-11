/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/lending-client/types';
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
  console.log('Running testLoadTakenLoans.');

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

  const loans = await Loan.loadAll(
    lendingClient,
    collectionLendingProfileAddress
  );
  console.log('Found ' + loans.length + ' loan offers for this CLP.');

  const filteredLoans = loans.filter(
    (l) => !PublicKey.default.equals(l.state.borrower)
  );

  // Get current timestamp in seconds
  const currentTimestamp = new BN(Math.floor(Date.now() / 1000));

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
        loan.state.paidAmount +
        '\n\tDue Timestamp: ' +
        loan.state.dueTimestamp +
        '\n\tSeconds Until Default: ' +
        loan.state.dueTimestamp.sub(currentTimestamp)
    );
  }
};

main();
