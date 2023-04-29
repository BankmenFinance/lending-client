/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@gbg-lending-client/types';
import { LendingClient } from '@gbg-lending-client/client/lending';
import {
  aprToBasisPoints,
  basisPointsToApr,
  convertTimeToSeconds,
  encodeStrToUint8Array
} from '@gbg-lending-client/utils/shared';
import { CollectionLendingProfile } from '@gbg-lending-client/accounts/collectionLendingProfile';
import { PublicKey, Transaction } from '@solana/web3.js';
import { WRAPPED_SOL_MINT } from '@metaplex-foundation/js';
import { BN } from 'bn.js';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

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
  console.log('Running testCreateLendingProfile.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const lendingClient = new LendingClient(CLUSTER, new NodeWallet(wallet));

  // Calculate interest rate in bps, 0.15 means 15% APR
  const interestRateBps = aprToBasisPoints(1.5, 1, 'hours');
  console.log('Interest Rate (bps): ' + interestRateBps);

  const interestRateApr = basisPointsToApr(interestRateBps, 1, 'hours');
  console.log('Interest Rate (APR): ' + interestRateApr);

  // Calculate loan duration in seconds
  const loanDuration = convertTimeToSeconds('0:1:0:0');
  console.log('Loan Duration: ' + loanDuration);

  // Specify a collection mint here
  const collectionMint = new PublicKey(
    'FVPw1R7kG4iB25BpzpRFAuGxc17Xs2QAvU4yqmA1zQmG'
  );

  const profileId = 6;

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
