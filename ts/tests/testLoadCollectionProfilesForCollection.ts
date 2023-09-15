/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/lending-client/types';
import { LendingClient } from '@bankmenfi/lending-client/client/lending';
import { PublicKey } from '@solana/web3.js';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { CollectionLendingProfile } from '../src/accounts/collectionLendingProfile';
import { CONFIGS } from '@bankmenfi/lending-client/constants';
import { getDurationAndUnitFromTime } from '../src/utils/shared';

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

const COLLECTION = new PublicKey(
  'EW8mqV277inu7v4rF983tpii445oGDuDQJQtXRwabfZ5'
);

export const main = async () => {
  console.log('Running testLoadCollectionProfiles.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const lendingClient = new LendingClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  // Load the collection lending profile
  const collectionLendingProfiles =
    await CollectionLendingProfile.loadAllWithOptions(
      lendingClient,
      COLLECTION
    );
  console.log(`Found ${collectionLendingProfiles.length} Lending Profiles.`);

  for (const lendingProfile of collectionLendingProfiles) {
    const { duration, durationUnit } = getDurationAndUnitFromTime(
      lendingProfile.loanDuration
    );
    console.log(
      `Lending Profile: ${lendingProfile.address}` +
        `\n\tAuthority: ${lendingProfile.state.authority}` +
        `\n\tStatus: ${lendingProfile.status}` +
        `\n\tLoan Duration: ${duration} ${durationUnit}` +
        `\n\tInterest Rate (APY): ${lendingProfile.interestRateApy}` +
        `\n\tLoan Amount Originated: ${lendingProfile.loanAmountOriginated}`
    );
  }
};

main();
