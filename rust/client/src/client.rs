use crate::{
    prelude::LendingClientError,
    utils::{deserialize_account, get_program_accounts},
    CollectionLendingProfileAccount, LoanAccount, UserAccount,
};
use anchor_lang::prelude::Pubkey;
use lending::{CollectionLendingProfile, Loan, User};
use log::warn;
use solana_client::{
    nonblocking::rpc_client::RpcClient,
    rpc_filter::{Memcmp, MemcmpEncodedBytes, MemcmpEncoding, RpcFilterType},
};
use std::sync::Arc;

pub struct LendingClient {
    pub rpc_client: Arc<RpcClient>,
}

impl LendingClient {
    pub fn new(rpc_client: Arc<RpcClient>) -> Self {
        Self { rpc_client }
    }

    /// Gets all existing [`CollectionLendingProfile`]s.
    ///
    /// # Errors
    ///
    /// This function will return an error if there is an error performing the RPC request.
    pub async fn get_lending_profiles(
        &self,
    ) -> Result<Vec<CollectionLendingProfileAccount>, LendingClientError> {
        let filters: Vec<RpcFilterType> = vec![RpcFilterType::DataSize(std::mem::size_of::<
            CollectionLendingProfile,
        >() as u64)];

        let accounts = match get_program_accounts(&self.rpc_client, filters, &lending::id()).await {
            Ok(a) => a,
            Err(e) => {
                return Err(LendingClientError::ClientError(e));
            }
        };

        let mut profiles = Vec::new();

        for (account_pubkey, account) in accounts.iter() {
            let profile =
                match deserialize_account::<CollectionLendingProfile>(&mut account.data.as_slice())
                {
                    Ok(a) => a,
                    Err(e) => {
                        warn!(
                            "Failed to deserialize account {}. Error: {:?}",
                            account_pubkey, e
                        );
                        continue;
                    }
                };
            profiles.push(CollectionLendingProfileAccount {
                state: profile,
                pubkey: *account_pubkey,
            });
        }

        Ok(profiles)
    }

    /// Gets all existing [`Loan`]s.
    ///
    /// If a lending profile [`Pubkey`] is given, it will filter only loans associated with it.
    ///
    /// # Errors
    ///
    /// This function will return an error if there is an error performing the RPC request.
    #[allow(deprecated)]
    pub async fn get_loans(
        &self,
        lending_profile: Option<&Pubkey>,
    ) -> Result<Vec<LoanAccount>, LendingClientError> {
        let mut filters: Vec<RpcFilterType> =
            vec![RpcFilterType::DataSize(std::mem::size_of::<Loan>() as u64)];

        // if the lending profile gets passed in, let's add it as a filter
        if lending_profile.is_some() {
            let lending_profile = lending_profile.unwrap();
            filters.push(RpcFilterType::Memcmp(Memcmp {
                offset: 24,
                bytes: MemcmpEncodedBytes::Base58(lending_profile.to_string()),
                encoding: Some(MemcmpEncoding::Binary),
            }));
        }

        let accounts = match get_program_accounts(&self.rpc_client, filters, &lending::id()).await {
            Ok(a) => a,
            Err(e) => {
                return Err(LendingClientError::ClientError(e));
            }
        };

        let mut loans = Vec::new();

        for (account_pubkey, account) in accounts.iter() {
            let loan = match deserialize_account::<Loan>(&mut account.data.as_slice()) {
                Ok(a) => a,
                Err(e) => {
                    warn!(
                        "Failed to deserialize account {}. Error: {:?}",
                        account_pubkey, e
                    );
                    continue;
                }
            };
            loans.push(LoanAccount {
                state: loan,
                pubkey: *account_pubkey,
            });
        }

        Ok(loans)
    }

    /// Gets all existing [`User`]s.
    ///
    /// # Errors
    ///
    /// This function will return an error if there is an error performing the RPC request.
    #[allow(deprecated)]
    pub async fn get_users(&self) -> Result<Vec<UserAccount>, LendingClientError> {
        let filters: Vec<RpcFilterType> =
            vec![RpcFilterType::DataSize(std::mem::size_of::<User>() as u64)];

        let accounts = match get_program_accounts(&self.rpc_client, filters, &lending::id()).await {
            Ok(a) => a,
            Err(e) => {
                return Err(LendingClientError::ClientError(e));
            }
        };

        let mut users = Vec::new();

        for (account_pubkey, account) in accounts.iter() {
            let user = match deserialize_account::<User>(&mut account.data.as_slice()) {
                Ok(a) => a,
                Err(e) => {
                    warn!(
                        "Failed to deserialize account {}. Error: {:?}",
                        account_pubkey, e
                    );
                    continue;
                }
            };
            users.push(UserAccount {
                state: user,
                pubkey: *account_pubkey,
            });
        }

        Ok(users)
    }
}
