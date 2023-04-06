use anchor_lang::{
    prelude::Pubkey,
    solana_program::{instruction::Instruction, sysvar::rent},
    system_program, InstructionData, ToAccountMetas,
};
use anchor_spl::{associated_token, token};
use lending::{CreateCollectionLendingProfileArgs, OfferLoanArgs};

#[allow(clippy::too_many_arguments)]
pub fn create_lending_profile(
    profile: &Pubkey,
    collection: &Pubkey,
    token_mint: &Pubkey,
    token_vault: &Pubkey,
    vault: &Pubkey,
    authority: &Pubkey,
    payer: &Pubkey,
    args: &CreateCollectionLendingProfileArgs,
) -> Instruction {
    let accounts = lending::accounts::CreateCollectionLendingProfile {
        profile: *profile,
        collection: *collection,
        token_mint: *token_mint,
        token_vault: *token_vault,
        vault: *vault,
        authority: *authority,
        payer: *payer,
        system_program: system_program::ID,
        token_program: token::ID,
        rent: rent::ID,
    };
    let ix_data = lending::instruction::CreateCollectionLendingProfile { args: *args };
    Instruction {
        program_id: lending::id(),
        accounts: accounts.to_account_metas(Some(false)),
        data: ix_data.data(),
    }
}

#[allow(clippy::too_many_arguments)]
pub fn offer_loan(
    profile: &Pubkey,
    loan: &Pubkey,
    loan_mint: &Pubkey,
    escrow: &Pubkey,
    escrow_token_account: &Pubkey,
    lender_token_account: &Pubkey,
    lender_account: &Pubkey,
    lender: &Pubkey,
    args: &OfferLoanArgs,
) -> Instruction {
    let accounts = lending::accounts::OfferLoan {
        profile: *profile,
        loan: *loan,
        loan_mint: *loan_mint,
        escrow: *escrow,
        escrow_token_account: *escrow_token_account,
        lender_token_account: *lender_token_account,
        lender_account: *lender_account,
        lender: *lender,
        associated_token_program: associated_token::ID,
        system_program: system_program::ID,
        token_program: token::ID,
        rent: rent::ID,
    };
    let ix_data = lending::instruction::OfferLoan { args: *args };
    Instruction {
        program_id: lending::id(),
        accounts: accounts.to_account_metas(Some(false)),
        data: ix_data.data(),
    }
}

#[allow(clippy::too_many_arguments)]
pub fn rescind_loan(
    profile: &Pubkey,
    loan: &Pubkey,
    loan_mint: &Pubkey,
    escrow: &Pubkey,
    escrow_token_account: &Pubkey,
    lender_token_account: &Pubkey,
    lender_account: &Pubkey,
    lender: &Pubkey,
) -> Instruction {
    let accounts = lending::accounts::RescindLoan {
        profile: *profile,
        loan: *loan,
        loan_mint: *loan_mint,
        escrow: *escrow,
        escrow_token_account: *escrow_token_account,
        lender_token_account: *lender_token_account,
        lender_account: *lender_account,
        lender: *lender,
        token_program: token::ID,
        system_program: system_program::ID,
    };
    let ix_data = lending::instruction::RescindLoan {};
    Instruction {
        program_id: lending::id(),
        accounts: accounts.to_account_metas(Some(false)),
        data: ix_data.data(),
    }
}

#[allow(clippy::too_many_arguments)]
pub fn take_loan(
    profile: &Pubkey,
    loan: &Pubkey,
    loan_mint: &Pubkey,
    collateral_mint: &Pubkey,
    collateral_metadata: &Pubkey,
    collateral_edition: &Pubkey,
    escrow: &Pubkey,
    escrow_token_account: &Pubkey,
    borrower_account: &Pubkey,
    borrower_token_account: &Pubkey,
    borrower_collateral_account: &Pubkey,
    borrower: &Pubkey,
) -> Instruction {
    let accounts = lending::accounts::TakeLoan {
        profile: *profile,
        loan: *loan,
        loan_mint: *loan_mint,
        collateral_mint: *collateral_mint,
        collateral_metadata: *collateral_metadata,
        collateral_edition: *collateral_edition,
        escrow: *escrow,
        escrow_token_account: *escrow_token_account,
        borrower_account: *borrower_account,
        borrower_token_account: *borrower_token_account,
        borrower_collateral_account: *borrower_collateral_account,
        borrower: *borrower,
        token_program: token::ID,
        metadata_program: mpl_token_metadata::ID,
        system_program: system_program::ID,
        rent: rent::ID,
    };
    let ix_data = lending::instruction::TakeLoan {};
    Instruction {
        program_id: lending::id(),
        accounts: accounts.to_account_metas(Some(false)),
        data: ix_data.data(),
    }
}

#[allow(clippy::too_many_arguments)]
pub fn repay_loan(
    profile: &Pubkey,
    loan: &Pubkey,
    loan_mint: &Pubkey,
    token_vault: &Pubkey,
    vault: &Pubkey,
    collateral_mint: &Pubkey,
    collateral_edition: &Pubkey,
    escrow: &Pubkey,
    escrow_token_account: &Pubkey,
    borrower_account: &Pubkey,
    borrower_token_account: &Pubkey,
    borrower_collateral_account: &Pubkey,
    borrower: &Pubkey,
    lender: &Pubkey,
    lender_token_account: &Pubkey,
    amount: u64,
) -> Instruction {
    let accounts = lending::accounts::RepayLoan {
        profile: *profile,
        loan: *loan,
        escrow: *escrow,
        escrow_token_account: *escrow_token_account,
        vault: *vault,
        loan_mint: *loan_mint,
        collateral_mint: *collateral_mint,
        collateral_edition: *collateral_edition,
        token_vault: *token_vault,
        borrower_account: *borrower_account,
        borrower_token_account: *borrower_token_account,
        borrower_collateral_account: *borrower_collateral_account,
        lender: *lender,
        lender_token_account: *lender_token_account,
        borrower: *borrower,
        token_program: token::ID,
        metadata_program: mpl_token_metadata::ID,
        system_program: system_program::ID,
    };
    let ix_data = lending::instruction::RepayLoan { amount };
    Instruction {
        program_id: lending::id(),
        accounts: accounts.to_account_metas(Some(false)),
        data: ix_data.data(),
    }
}
