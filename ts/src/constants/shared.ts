import { PublicKey } from '@solana/web3.js';
import type { Cluster, Config } from '../types';

export const B_COLLECTION_LENDING_PROFILE = 'COLLECTION_LENDING_PROFILE';
export const B_PROFILE_VAULT = 'PROFILE_VAULT';
export const B_VAULT = 'VAULT';
export const B_LOAN = 'LOAN';
export const B_ESCROW = 'ESCROW';
export const B_ESCROW_TOKEN_ACCOUNT = 'ESCROW_TOKEN_ACCOUNT';
export const B_USER = 'USER_ACCOUNT';

export const CONFIGS: { [key in Cluster]: Config } = {
  localnet: {
    RPC_ENDPOINT: 'http://127.0.0.1:8899',
    PROGRAM_ID: new PublicKey('2Kdt8uMA6m5stQqaTxVPac45j6uKbwCg5vaPtyqwLk5C'),
    HISTORY_API_GRAPHQL: 'http://localhost:8081/v1/graphql'
  },
  devnet: {
    RPC_ENDPOINT: 'https://bankmen-main71f-f62a.devnet.rpcpool.com',
    PROGRAM_ID: new PublicKey('2Kdt8uMA6m5stQqaTxVPac45j6uKbwCg5vaPtyqwLk5C'),
    HISTORY_API_GRAPHQL: 'https://gbg-lending-prod.hasura.app/v1/graphql'
  },
  'mainnet-beta': {
    RPC_ENDPOINT:
      'https://bankmen-main71f-f62a.mainnet.rpcpool.com/f6f0b0ad-6b0f-4a33-95eb-8944a9474e6f',
    PROGRAM_ID: new PublicKey('BMfi6hbCSpTS962EZjwaa6bRvy2izUCmZrpBMuhJ1BUW'),
    HISTORY_API_GRAPHQL: 'https://gbg-lending.hasura.app/v1/graphql'
  }
};
