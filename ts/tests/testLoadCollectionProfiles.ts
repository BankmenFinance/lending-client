/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/lending-client/types';
import { LendingClient } from '@bankmenfi/lending-client/client/lending';
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
  console.log('Running testLoadCollectionProfiles.');

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
    if (lendingProfile.loanDurationSeconds.gt(new BN(3600))) {
      console.log(
        `Lending Profile: ${lendingProfile.address}` +
          `\n\tLoan Duration: ${lendingProfile.loanDuration}` +
          `\n\tInterest Rate (APY): ${lendingProfile.interestRateApy}` +
          `\n\tLoan Amount Originated: ${lendingProfile.loanAmountOriginated}`
      );
    }
  }
};

main();
