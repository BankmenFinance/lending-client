use anchor_lang::{AccountDeserialize, Discriminator, Owner};
use solana_account_decoder::UiAccountEncoding;
use solana_client::{
    client_error::ClientError,
    nonblocking::rpc_client::RpcClient,
    rpc_config::{RpcAccountInfoConfig, RpcProgramAccountsConfig, RpcSendTransactionConfig},
    rpc_filter::RpcFilterType,
};
use solana_sdk::{
    account::Account,
    commitment_config::{CommitmentConfig, CommitmentLevel},
    hash::Hash,
    instruction::Instruction,
    pubkey::Pubkey,
    signature::{Keypair, Signature},
    signer::Signer,
    transaction::Transaction,
};

/// Sends a transaction
#[inline(always)]
pub async fn send_transaction(
    rpc_client: &RpcClient,
    tx: &Transaction,
    confirm: bool,
) -> Result<Signature, ClientError> {
    let config = RpcSendTransactionConfig {
        preflight_commitment: Some(CommitmentLevel::Processed),
        ..Default::default()
    };
    let submit_res = if confirm {
        rpc_client.send_and_confirm_transaction(tx).await
    } else {
        rpc_client.send_transaction_with_config(tx, config).await
    };
    match submit_res {
        Ok(s) => Ok(s),
        Err(e) => Err(e),
    }
}

/// Creates a transaction with the given blockhash, instructions, payer and signers.
pub fn create_transaction(
    blockhash: Hash,
    ixs: &[Instruction],
    payer: &Keypair,
    signers: Option<&[&Keypair]>,
) -> Transaction {
    let mut all_signers = vec![payer];
    if let Some(signers) = signers {
        all_signers.extend_from_slice(signers);
    }
    let mut transaction = Transaction::new_with_payer(ixs, Some(&payer.pubkey()));

    transaction.sign(&all_signers, blockhash);
    transaction
}

/// Gets all program accounts according to the given filters for the given program.
pub async fn get_program_accounts(
    rpc_client: &RpcClient,
    filters: Vec<RpcFilterType>,
    program_id: &Pubkey,
) -> Result<Vec<(Pubkey, Account)>, ClientError> {
    rpc_client
        .get_program_accounts_with_config(
            program_id,
            RpcProgramAccountsConfig {
                filters: Some(filters),
                account_config: RpcAccountInfoConfig {
                    encoding: Some(UiAccountEncoding::Base64),
                    commitment: Some(CommitmentConfig::confirmed()),
                    ..RpcAccountInfoConfig::default()
                },
                ..RpcProgramAccountsConfig::default()
            },
        )
        .await
}

/// Gets the account and attempts deserializing the received account data into the the account [`T`].
///
/// # Errors
///
/// This function will return an error if there is an error during deserialization.
pub async fn get_program_account<T>(
    rpc_client: &RpcClient,
    account: &Pubkey,
) -> Result<Box<T>, Box<dyn std::error::Error>>
where
    T: Owner + Discriminator + AccountDeserialize,
{
    let account = match rpc_client.get_account_data(account).await {
        Ok(a) => a,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    deserialize_account::<T>(&mut account.as_slice())
}

/// Attempts deserializing the given account data into the the account [`T`].
///
/// # Errors
///
/// This function will return an error if there is an error during deserialization.
pub fn deserialize_account<T>(data: &mut &[u8]) -> Result<Box<T>, Box<dyn std::error::Error>>
where
    T: Owner + Discriminator + AccountDeserialize,
{
    let decoded = match T::try_deserialize(data) {
        Ok(a) => a,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    Ok(Box::new(decoded))
}
