use clap::{App, Arg, SubCommand};
use gbg_lending_client::{
    instructions::create_lending_profile as create_lending_profile_ix,
    prelude::LendingClient,
    utils::encode_string,
    utils::{create_transaction, send_transaction},
};
use lending::{CollectionLendingProfile, CreateCollectionLendingProfileArgs};
use solana_sdk::{pubkey::Pubkey, signer::Signer};

use crate::CliConfig;

pub trait LendingProfileSubCommands {
    fn lending_profile_subcommands(self) -> Self;
}

impl LendingProfileSubCommands for App<'_, '_> {
    fn lending_profile_subcommands(self) -> Self {
        self.subcommand(
            SubCommand::with_name("list-lending-profiles")
                .about("Lists all existing Collection Lending Profiles.")
                .arg(
                    Arg::with_name("collection")
                        .short("c")
                        .takes_value(true)
                        .long("collection")
                        .value_name("OPTIONAL")
                        .help("The Collection Mint, value should be a pubkey."),
                ),
        )
        .subcommand(
            SubCommand::with_name("create-lending-profile")
                .about("Creates a Collection Lending Profile.")
                .arg(
                    Arg::with_name("collection-name")
                        .short("c")
                        .takes_value(true)
                        .long("collection-name")
                        .help("The collection name.."),
                )
                .arg(
                    Arg::with_name("collection-mint")
                        .takes_value(true)
                        .long("collection-mint")
                        .help("The Collection Mint, value should be a pubkey."),
                )
                .arg(
                    Arg::with_name("token-mint")
                        .short("t")
                        .takes_value(true)
                        .long("token-mint")
                       .help("The Token Mint of the Collection Lending Profile, value should be a pubkey."),
                )
                .arg(
                    Arg::with_name("id")
                        .takes_value(true)
                        .long("id")
                        .help("The id of the Collection Lending Profile, value should fit in a u64."),
                )
                .arg(
                    Arg::with_name("loan-duration")
                        .short("d")
                        .takes_value(true)
                        .long("loan-duration")
                        .help("The duration of the loans issued through this Lending Profile, in seconds, value should fit in a u64."),
                )
                .arg(
                    Arg::with_name("interest-rate")
                        .short("i")
                        .takes_value(true)
                        .long("interest-rate")
                        .help("The interest of the loans issued through this Lending Profile, in bps, value should fit in a u64."),
                )
                .arg(
                    Arg::with_name("fee-rate")
                        .short("f")
                        .takes_value(true)
                        .long("interesfee-rate")
                        .help("The fee of the loans issued through this Lending Profile, in bps, value should fit in a u64."),
                ),
        )
    }
}

pub async fn list_lending_profiles(
    cli_config: &CliConfig,
    collection_mint: Option<&Pubkey>,
) -> Result<(), Box<dyn std::error::Error>> {
    let rpc_client = cli_config.rpc_client.as_ref().unwrap();

    let lending_client = LendingClient::new(rpc_client.clone());

    let lending_profiles = match lending_client.get_lending_profiles().await {
        Ok(a) => a,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    for lending_profile in lending_profiles.iter() {
        // if the collection mint gets passed in, filter lending profiles that have the same collection
        if let Some(collection_mint) = collection_mint {
            if &lending_profile.state.collection == collection_mint {
                println!(
                    "\nLending Profile: {}\n\tCollection Mint: {}\n\tToken Mint: {}\n\tToken Vault: {}\n\tFee Rate: {}\n\tInterest Rate: {}\n\t",
                    lending_profile.pubkey,
                    lending_profile.state.collection,
                    lending_profile.state.token_mint,
                    lending_profile.state.token_vault,
                    lending_profile.state.fee_rate,
                    lending_profile.state.interest_rate
                );
            }
        } else {
            //let collection_name = lending_profile.
            println!(
                    "\nLending Profile: {}\n\tCollection Mint: {}\n\tToken Mint: {}\n\tToken Vault: {}\n\tFee Rate: {}\n\tInterest Rate: {}\n\t",
                    lending_profile.pubkey,
                    lending_profile.state.collection,
                    lending_profile.state.token_mint,
                    lending_profile.state.token_vault,
                    lending_profile.state.fee_rate,
                    lending_profile.state.interest_rate
                );
        }
    }

    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub async fn create_lending_profile(
    cli_config: &CliConfig,
    collection_name: &str,
    collection_mint: &Pubkey,
    token_mint: &Pubkey,
    id: u64,
    loan_duration: u64,
    interest_rate: u64,
    fee_rate: u64,
) -> Result<(), Box<dyn std::error::Error>> {
    let rpc_client = cli_config.rpc_client.as_ref().unwrap();
    let keypair = cli_config.keypair.as_ref().unwrap();

    let (profile, _) = CollectionLendingProfile::derive_address(collection_mint, token_mint, id);
    let (profile_vault, _) = CollectionLendingProfile::derive_token_vault_address(&profile);
    let (profile_vault_signer, _) = CollectionLendingProfile::derive_vault_address(&profile);

    let encoded_name = encode_string(collection_name);

    let args = CreateCollectionLendingProfileArgs {
        collection_name: encoded_name,
        interest_rate,
        fee_rate,
        id,
        loan_duration,
    };

    let ixs = vec![create_lending_profile_ix(
        &profile,
        collection_mint,
        token_mint,
        &profile_vault,
        &profile_vault_signer,
        &keypair.pubkey(),
        &keypair.pubkey(),
        &args,
    )];

    let blockhash = match rpc_client.get_latest_blockhash().await {
        Ok(bh) => bh,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    let tx = create_transaction(blockhash, &ixs, keypair, None);

    let sig = match send_transaction(rpc_client, &tx, true).await {
        Ok(s) => s,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    println!(
        "Successfully created lending profile. Transaction signature: {}",
        sig
    );

    Ok(())
}
