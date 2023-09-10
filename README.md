# Bankmen Finance Lending Client

## TypeScript

### Building

In order to build the TypeScript client, run the following commands.

For a first setup:

```yarn```

For subsequent builds:

```yarn build```

More commands can be found in the root `package.json`.

### Running code samples

In order to run the code samples of the TypeScript client found at `ts/tests/`:

```npx ts-node --project ./ts/tests/tsconfig.json --require tsconfig-paths/register ./ts/tests/FILENAME.ts```

## Rust

### Building

To build the rust client and `CLI` application:

```cargo build```

### Usage

The CLI application has a few utility commands to manage a deployment of the GBG Lending Program, with features such as:

- Creating NFT Collections
- Minting NFTs as part of those Collections
- Listing NFTs held
- Creating Lending Profiles
- Offering Loans
- Taking Loans
- Repaying Loans

If the CLI is built using the command found above, in order to run it:

```./target/debug/gbg-lending-cli --url https://light-weathered-diagram.solana-devnet.discover.quiknode.pro/47012912d873fd5d66210ca13d41a2a01d520fbc/ --keypair /path/to/keypair.json create-collection```

This command should create a new NFT Collection.

For more commands and help with their usage, see:

```./target/debug/gbg-lending-cli --url https://light-weathered-diagram.solana-devnet.discover.quiknode.pro/47012912d873fd5d66210ca13d41a2a01d520fbc/ --keypair /path/to/keypair.json -h```

## Observations

A list of NFT Collection Mints for devnet can be found at `data/devnetCollectionMints.json`.