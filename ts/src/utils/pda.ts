import {
  B_COLLECTION_LENDING_PROFILE,
  B_ESCROW,
  B_ESCROW_TOKEN_ACCOUNT,
  B_LOAN,
  B_PROFILE_VAULT,
  B_VAULT,
  B_USER
} from '../constants/shared';
import { utils } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export const deriveCollectionLendingProfileAddress = (
  collectionMint: PublicKey,
  tokenMint: PublicKey,
  collectionId: number,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_COLLECTION_LENDING_PROFILE);

  const buffer = Buffer.alloc(8);
  buffer.writeUInt32LE(collectionId, 0);

  return PublicKey.findProgramAddressSync(
    [seed, collectionMint.toBuffer(), tokenMint.toBuffer(), buffer],
    programId
  );
};

export const deriveProfileTokenVaultAddress = (
  collectionLendingProfile: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_PROFILE_VAULT);

  return PublicKey.findProgramAddressSync(
    [seed, collectionLendingProfile.toBuffer()],
    programId
  );
};

export const deriveProfileVaultAddress = (
  collectionLendingProfile: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_VAULT);

  return PublicKey.findProgramAddressSync(
    [seed, collectionLendingProfile.toBuffer()],
    programId
  );
};

export const deriveUserAccountAddress = (
  wallet: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_USER);

  return PublicKey.findProgramAddressSync([seed, wallet.toBuffer()], programId);
};

export const deriveLoanAddress = (
  collectionLendingProfile: PublicKey,
  lender: PublicKey,
  loanId: number,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_LOAN);

  const buffer = Buffer.alloc(8);
  buffer.writeUInt32LE(loanId, 0);

  return PublicKey.findProgramAddressSync(
    [seed, collectionLendingProfile.toBuffer(), lender.toBuffer(), buffer],
    programId
  );
};

export const deriveLoanEscrowAddress = (
  loan: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_ESCROW);

  return PublicKey.findProgramAddressSync([seed, loan.toBuffer()], programId);
};

export const deriveEscrowTokenAccount = (
  escrow: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_ESCROW_TOKEN_ACCOUNT);

  return PublicKey.findProgramAddressSync([seed, escrow.toBuffer()], programId);
};
