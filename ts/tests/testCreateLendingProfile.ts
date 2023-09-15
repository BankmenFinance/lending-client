/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/lending-client/types';
import { LendingClient } from '@bankmenfi/lending-client/client/lending';
import {
  aprToBasisPoints,
  basisPointsToApr,
  convertAprToApy,
  convertApyToApr,
  convertTimeToSeconds,
  encodeStrToUint8Array
} from '@bankmenfi/lending-client/utils/shared';
import { CollectionLendingProfile } from '@bankmenfi/lending-client/accounts/collectionLendingProfile';
import { PublicKey, Transaction } from '@solana/web3.js';
import { WRAPPED_SOL_MINT } from '@metaplex-foundation/js';
import { BN } from 'bn.js';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { CONFIGS } from '@bankmenfi/lending-clientconstants';
import {
  getDurationAndUnitFromTime,
  convertSecondsToTime
} from '../src/utils/shared';

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
  console.log('Running testCreateLendingProfile.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const lendingClient = new LendingClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  // Calculate loan duration in seconds
  const loanDuration = convertTimeToSeconds('0:1:0:0');
  console.log(`Loan Duration: ${loanDuration} seconds`);

  const timeDurationString = convertSecondsToTime(loanDuration);
  console.log(`Loan Duration: ${timeDurationString}`);

  const { duration, durationUnit } =
    getDurationAndUnitFromTime(timeDurationString);
  console.log(`Duration: ${duration} | Unit: ${durationUnit}`);

  // calculate desired APR for 150% APY
  const apr = convertApyToApr(150, duration, durationUnit);
  console.log('APR: ' + apr);

  const interestRateBps = aprToBasisPoints(apr, duration, durationUnit);
  console.log('Interest Rate (bps): ' + interestRateBps);

  const interestRateApr = basisPointsToApr(
    interestRateBps,
    duration,
    durationUnit
  );
  console.log('Interest Rate (APR): ' + interestRateApr);

  const apy = convertAprToApy(interestRateApr, duration, durationUnit);
  console.log('APY Converted Back: ' + apy);

  // Specify a collection mint here
  const collectionMint = new PublicKey(
    '7CdaMhWfcR57uFzGUMKyuiqeAqdzdEdF4Y4ghti12p7J'
  );

  const profileId = 99;

  const args = {
    collectionName: encodeStrToUint8Array('Short Term Collection'),
    loanDuration: new BN(loanDuration),
    interestRate: new BN(interestRateBps),
    // let's specify 25 bps as the fee we take from every collection
    feeRate: new BN(25),
    // this is the lending profile id, we can create more than one for the same collection and token mint based on this
    id: new BN(profileId)
  };
  console.log(JSON.stringify(args));

  const { accounts, ixs } = await CollectionLendingProfile.create(
    lendingClient,
    collectionMint,
    WRAPPED_SOL_MINT,
    wallet.publicKey,
    args
  );

  console.log(
    'Lending Profile: ' +
      accounts[0] +
      '\nProfile Vault (SPL): ' +
      accounts[1] +
      '\nVault (Native)/Authority: ' +
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
