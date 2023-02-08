pub mod client;
pub mod error;
pub mod utils;

pub mod prelude {
    pub use crate::client::*;
    pub use crate::error::*;
    pub use crate::utils::*;
}
use anchor_lang::prelude::Pubkey;
use gbg_lending_sdk::{CollectionLendingProfile, Loan, User};

#[derive(Default, Clone)]
pub struct LoanAccount {
    pub state: Box<Loan>,
    pub pubkey: Pubkey,
}

#[derive(Default, Clone)]
pub struct CollectionLendingProfileAccount {
    pub state: Box<CollectionLendingProfile>,
    pub pubkey: Pubkey,
}

#[derive(Default, Clone)]
pub struct UserAccount {
    pub state: Box<User>,
    pub pubkey: Pubkey,
}
