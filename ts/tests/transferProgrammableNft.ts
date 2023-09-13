/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/lending-client/types';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  Metaplex,
  Nft,
  NftWithToken,
  Sft,
  SftWithToken,
  keypairIdentity,
  token
} from '@metaplex-foundation/js';
import { CONFIGS } from '@bankmenfi/lending-client/constants';
import { getAssociatedTokenAddress } from '@solana/spl-token';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

require('dotenv').config({
  path: __dirname + `/args.env` // Can also be used to override default env variables
});

// Constants
const KP_PATH = process.env.KEYPAIR_PATH;
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function transferProgrammableNft(
  metaplex: Metaplex,
  nft: Sft | SftWithToken | Nft | NftWithToken,
  destination: PublicKey
) {
  try {
    console.log(`       Transferring pNFT to ${destination.toString()}`);
    const fromToken = await getAssociatedTokenAddress(
      nft.address,
      metaplex.identity().publicKey
    );
    const toToken = await getAssociatedTokenAddress(nft.address, destination);
    const nftTxBuilder = await metaplex
      .nfts()
      .builders()
      .transfer({
        authority: metaplex.identity(),
        nftOrSft: nft,
        fromOwner: metaplex.identity().publicKey,
        fromToken,
        toOwner: destination,
        toToken,
        amount: token(1)
      });

    const { signature, confirmResponse } = await metaplex
      .rpc()
      .sendAndConfirmTransaction(nftTxBuilder);
    if (confirmResponse.value.err) {
      throw new Error('failed to confirm transaction');
    }
    console.log(`       Success!🎉`);
    console.log(
      `       Transferred pNFT: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
    );
    console.log(
      `       Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );

    await delay(15000);
  } catch (err) {
    console.log(err);
  }
}

export const main = async () => {
  console.log('Running testCreateLendingProfile.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());
  const connection = new Connection(RPC_ENDPOINT);

  const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

  const mintAddress = new PublicKey(
    'GpRGfrFtRjutTM8FBKVGX9hmhNreFAysi61rRLsUjNeM'
  );

  const nft = await metaplex.nfts().findByMint({ mintAddress });

  const destination = new PublicKey(
    '8dS2VtnDmY3J5hUayyVGR8crqouxz1nYQ59UKvCaeB3c'
  );

  await transferProgrammableNft(metaplex, nft, destination);
};

main();
