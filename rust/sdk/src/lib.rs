pub mod instructions;
pub mod utils;

pub mod prelude {
    pub use crate::*;
}

pub mod constants {
    pub const BASIS_POINTS_DIVISOR: u64 = 10_000;
    pub const B_COLLECTION_LENDING_PROFILE: &[u8] = b"COLLECTION_LENDING_PROFILE";
    pub const B_PROFILE_VAULT: &[u8] = b"PROFILE_VAULT";
    pub const B_VAULT_AUTHORITY: &[u8] = b"VAULT_AUTHORITY";
    pub const B_LOAN: &[u8] = b"LOAN";
    pub const B_ESCROW: &[u8] = b"LOAN_ESCROW";
    pub const B_ESCROW_TOKEN_ACCOUNT: &[u8] = b"LOAN_ESCROW_TOKEN_ACCOUNT";
    pub const B_USER_ACCOUNT: &[u8] = b"USER_ACCOUNT";
}

use anchor_lang::prelude::*;
use constants::*;

anchor_gen::generate_cpi_interface!(idl_path = "idl.json",);

#[cfg(feature = "mainnet-beta")]
declare_id!("2SbxAmEuKkya36EtEmCeUWXBKG6wvHYLpJp76vtQMNc7");
#[cfg(not(feature = "mainnet-beta"))]
declare_id!("2SbxAmEuKkya36EtEmCeUWXBKG6wvHYLpJp76vtQMNc7");

impl CollectionLendingProfile {
    /// Derives the address of a [`CollectionLendingProfile`].
    pub fn derive_address(collection_mint: &Pubkey, token_mint: &Pubkey, id: u64) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[
                B_COLLECTION_LENDING_PROFILE,
                collection_mint.as_ref(),
                token_mint.as_ref(),
                id.to_le_bytes().as_ref(),
            ],
            &crate::id(),
        )
    }

    /// Derives the address of a [`CollectionLendingProfile`]'s token vault.
    pub fn derive_vault_address(profile: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[B_PROFILE_VAULT, profile.as_ref()], &crate::id())
    }

    /// Derives the address of a [`CollectionLendingProfile`]'s token vault authority.
    pub fn derive_vault_authority_address(profile: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[B_VAULT_AUTHORITY, profile.as_ref()], &crate::id())
    }

    pub fn stats(&self) -> u64 {
        u64::default()
    }
}

impl Loan {
    /// Derives the address of a [`Loan`].
    pub fn derive_address(profile: &Pubkey, lender: &Pubkey, id: u64) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[
                B_LOAN,
                profile.as_ref(),
                lender.as_ref(),
                id.to_le_bytes().as_ref(),
            ],
            &crate::id(),
        )
    }

    /// Derives the address of a [`Loan`]'s escrow.
    pub fn derive_escrow_address(loan: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[B_ESCROW, loan.as_ref()], &crate::id())
    }

    /// Derives the address of a [`Loan`]'s escrow token account.
    pub fn derive_escrow_token_account_address(escrow: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[B_ESCROW_TOKEN_ACCOUNT, escrow.as_ref()], &crate::id())
    }

    pub fn duration(&self) -> u64 {
        u64::default()
    }
}

impl User {
    /// Derives the address of a [`User`].
    pub fn derive_address(user: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[B_USER_ACCOUNT, user.as_ref()], &crate::id())
    }
}
