use solana_client::client_error::ClientError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum LendingClientError {
    #[error(transparent)]
    ClientError(#[from] ClientError),
}
