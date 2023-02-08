import { PublicKey } from '@solana/web3.js';
import {
  B_COLLECTION_LENDING_PROFILE,
  B_ESCROW,
  B_ESCROW_TOKEN_ACCOUNT,
  B_LOAN,
  B_PROFILE_VAULT,
  B_VAULT_AUTHORITY
} from '../constants/shared';
import { utils } from '@project-serum/anchor';

export const deriveCollectionLendingProfileAddress = (
  collectionMint: PublicKey,
  tokenMint: PublicKey,
  collectionId: number,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_COLLECTION_LENDING_PROFILE);

  return utils.publicKey.findProgramAddressSync(
    [
      seed,
      collectionMint.toBuffer(),
      tokenMint.toBuffer(),
      Buffer.from([collectionId])
    ],
    programId
  );
};

export const deriveProfileVaultAddress = (
  collectionLendingProfile: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_PROFILE_VAULT);

  return utils.publicKey.findProgramAddressSync(
    [seed, collectionLendingProfile.toBuffer()],
    programId
  );
};

export const deriveProfileVaultSignerAddress = (
  collectionLendingProfile: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_VAULT_AUTHORITY);

  return utils.publicKey.findProgramAddressSync(
    [seed, collectionLendingProfile.toBuffer()],
    programId
  );
};

export const deriveLoanAddress = (
  collectionLendingProfile: PublicKey,
  lender: PublicKey,
  loanId: number,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_LOAN);

  return utils.publicKey.findProgramAddressSync(
    [
      seed,
      collectionLendingProfile.toBuffer(),
      lender.toBuffer(),
      Buffer.from([loanId])
    ],
    programId
  );
};

export const deriveLoanEscrowAddress = (
  loan: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_ESCROW);

  return utils.publicKey.findProgramAddressSync(
    [seed, loan.toBuffer()],
    programId
  );
};

export const deriveEscrowTokenAccount = (
  escrow: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_ESCROW_TOKEN_ACCOUNT);

  return utils.publicKey.findProgramAddressSync(
    [seed, escrow.toBuffer()],
    programId
  );
};
