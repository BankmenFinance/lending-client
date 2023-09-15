import { PublicKey } from '@solana/web3.js';
import type { Cluster, Config } from '../types';
import { BN } from '@coral-xyz/anchor';

/**
 * The divisor for calculations where the numerators are denominated in basis points.
 */
export const BASIS_POINTS_DIVISOR = new BN(10000);

/**
 * The static seed for a Collection Lending Profile's Program Derived Address.
 */
export const B_COLLECTION_LENDING_PROFILE = 'COLLECTION_LENDING_PROFILE';
/**
 * The static seed for a Collection Lending Profile's Token Vault Program Derived Address.
 */
export const B_PROFILE_VAULT = 'PROFILE_VAULT';
/**
 * The static seed for a Collection Lending Profile's Vault Program Derived Address.
 */
export const B_VAULT = 'VAULT';
/**
 * The static seed for a Loan's Program Derived Address.
 */
export const B_LOAN = 'LOAN';
/**
 * The static seed for a Loan's Escrow Program Derived Address.
 */
export const B_ESCROW = 'ESCROW';
/**
 * The static seed for a Loan's Escrow Token Account Derived Address.
 */
export const B_ESCROW_TOKEN_ACCOUNT = 'ESCROW_TOKEN_ACCOUNT';
/**
 * The static seed for a User's Program Derived Address.
 */
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
