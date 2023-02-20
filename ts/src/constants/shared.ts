import { PublicKey } from '@solana/web3.js';
import type { Cluster, Config } from '../types';

export const B_COLLECTION_LENDING_PROFILE = 'COLLECTION_LENDING_PROFILE';
export const B_PROFILE_VAULT = 'PROFILE_VAULT';
export const B_VAULT_AUTHORITY = 'VAULT_AUTHORITY';
export const B_LOAN = 'LOAN';
export const B_ESCROW = 'LOAN_ESCROW';
export const B_ESCROW_TOKEN_ACCOUNT = 'LOAN_ESCROW_TOKEN_ACCOUNT';
export const B_USER = 'USER_ACCOUNT';

export const CONFIGS: { [key in Cluster]: Config } = {
  localnet: {
    RPC_ENDPOINT: 'http://127.0.0.1:8899',
    PROGRAM_ID: new PublicKey('6prLRRLSvwWLkCBc7V2B3FWi716AssNyPfp1NH88751v')
  },
  devnet: {
    RPC_ENDPOINT:
      'https://light-weathered-diagram.solana-devnet.discover.quiknode.pro/47012912d873fd5d66210ca13d41a2a01d520fbc/',
    PROGRAM_ID: new PublicKey('6prLRRLSvwWLkCBc7V2B3FWi716AssNyPfp1NH88751v')
  },
  'mainnet-beta': {
    RPC_ENDPOINT:
      'https://spring-capable-arrow.solana-mainnet.discover.quiknode.pro/35397e1b1848110883f7bc034a20286efb77639f/',
    PROGRAM_ID: new PublicKey('CYPH3o83JX6jY6NkbproSpdmQ5VWJtxjfJ5P8veyYVu3')
  }
};
