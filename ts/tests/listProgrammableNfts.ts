/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/lending-client/types';
import { LendingClient } from '@bankmenfi/lending-client/client/lending';
import { PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { CollectionLendingProfile } from '../src/accounts/collectionLendingProfile';
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
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;

export const main = async () => {
  console.log('Running listProgrammableNfts.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const lendingClient = new LendingClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  const metaplex = Metaplex.make(lendingClient.connection, {
    cluster: CLUSTER
  }).use(keypairIdentity(wallet));

  // Specify a collection lending profile here
  const collectionLendingProfileAddress = new PublicKey(
    'DhcBDFaMJrMsMKbqWSb48vaH8wNmDeTe2MGbfmhXkEz8'
  );
  // Load the collection lending profile
  const collectionLendingProfile = await CollectionLendingProfile.load(
    lendingClient,
    collectionLendingProfileAddress
  );

  const metadatas = await metaplex
    .nfts()
    .findAllByOwner({ owner: metaplex.identity().publicKey });

  if (metadatas.length == 0) {
    console.log(`No pNFTs found for owner ${metaplex.identity().publicKey}`);
    return;
  }

  const filteredMetadatas = metadatas.filter(
    (m) =>
      m.collection &&
      m.collection.address.equals(collectionLendingProfile.collectionMint)
  );

  for (const metadata of filteredMetadatas) {
    const nft = await metaplex
      .nfts()
      .findByMetadata({ metadata: metadata.address });
    const tokenAccount = await getAssociatedTokenAddress(
      nft.address,
      metaplex.identity().publicKey
    );
    console.log(
      'Metadata: ' +
        metadata.address +
        '\n\tModel: ' +
        nft.model +
        '\n\tToken Mint: ' +
        nft.address +
        '\n\tToken Account: ' +
        tokenAccount +
        '\n\tToken Standard: ' +
        metadata.tokenStandard
    );
  }
};

main();
