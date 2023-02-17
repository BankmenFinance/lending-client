use clap::ArgMatches;
use solana_clap_utils::input_validators::normalize_to_url_if_moniker;
use solana_client::{client_error::ClientError, nonblocking::rpc_client::RpcClient};
use solana_sdk::{
    commitment_config::CommitmentConfig, pubkey::Pubkey, signature::Keypair, signer::Signer,
};
use std::{fs::File, io::Read, str::FromStr, sync::Arc};
use thiserror::Error;

use crate::{
    create_collection, create_lending_profile, create_loan, create_token, list_lending_profiles,
    list_loans, list_tokens, send_token, take_loan,
};

pub enum CliCommand {
    CreateCollection,
    CreateToken {
        collection_mint: Pubkey,
    },
    ListTokens,
    SendToken {
        token_mint: Pubkey,
        destination: Pubkey,
    },
    CreateLendingProfile {
        collection_name: String,
        collection_mint: Pubkey,
        token_mint: Pubkey,
        id: u64,
        loan_duration: u64,
        interest_rate: u64,
        fee_rate: u64,
    },
    ListLendingProfiles {
        collection: Option<Pubkey>,
    },
    CreateLoan {
        lending_profile: Pubkey,
        amount: u64,
    },
    TakeLoan {
        loan: Pubkey,
        collateral_mint: Pubkey,
    },
    ListLoans {
        lending_profile: Option<Pubkey>,
    },
}

pub struct CliCommandInfo {
    pub command: CliCommand,
}

pub struct CliConfig {
    pub command: CliCommand,
    pub json_rpc_url: String,
    pub keypair_path: String,
    pub rpc_client: Option<Arc<RpcClient>>,
    pub keypair: Option<Keypair>,
}

#[derive(Debug, Error)]
#[allow(clippy::large_enum_variant)]
pub enum CliError {
    #[error("Bad parameter: {0}")]
    BadParameters(String),
    #[error(transparent)]
    ClientError(#[from] ClientError),
    #[error("Command not recognized: {0}")]
    CommandNotRecognized(String),
    #[error("Keypair file opening error: {0}")]
    KeypairFileOpenError(String),
    #[error("Keypair file read error: {0}")]
    KeypairFileReadError(String),
    #[error("Keypair loading error: {0}")]
    KeypairLoadError(String),
}

fn load_keypair(path: &str) -> Result<Keypair, Box<dyn std::error::Error>> {
    let fd = File::open(path);

    let mut file = match fd {
        Ok(f) => f,
        Err(e) => {
            return Err(Box::new(CliError::KeypairFileOpenError(e.to_string())));
        }
    };

    let file_string = &mut String::new();
    let file_read_res = file.read_to_string(file_string);

    if let Err(e) = file_read_res {
        return Err(Box::new(CliError::KeypairFileReadError(e.to_string())));
    };

    let keypair_bytes: Vec<u8> = file_string
        .replace('[', "")
        .replace(']', "")
        .replace(',', " ")
        .split(' ')
        .map(|x| u8::from_str(x).unwrap())
        .collect();

    let keypair = Keypair::from_bytes(keypair_bytes.as_ref());

    match keypair {
        Ok(kp) => Ok(kp),
        Err(e) => Err(Box::new(CliError::KeypairLoadError(e.to_string()))),
    }
}

pub async fn process_command(config: &CliConfig) -> Result<String, Box<dyn std::error::Error>> {
    match &config.command {
        CliCommand::CreateCollection {} => match create_collection(config).await {
            Ok(_) => Ok("Successfully created collection.".to_string()),
            Err(e) => Err(e),
        },
        CliCommand::CreateToken { collection_mint } => {
            match create_token(config, collection_mint).await {
                Ok(_) => Ok("Successfully created token.".to_string()),
                Err(e) => Err(e),
            }
        }
        CliCommand::ListTokens {} => match list_tokens(config).await {
            Ok(_) => Ok("Successfully listed tokens.".to_string()),
            Err(e) => Err(e),
        },
        CliCommand::SendToken {
            token_mint,
            destination,
        } => match send_token(config, token_mint, destination).await {
            Ok(_) => Ok("Successfully sent token.".to_string()),
            Err(e) => Err(e),
        },
        CliCommand::CreateLendingProfile {
            collection_name,
            collection_mint,
            token_mint,
            id,
            loan_duration,
            interest_rate,
            fee_rate,
        } => match create_lending_profile(
            config,
            collection_name,
            collection_mint,
            token_mint,
            *id,
            *loan_duration,
            *interest_rate,
            *fee_rate,
        )
        .await
        {
            Ok(_) => Ok("Successfully created lending profile.".to_string()),
            Err(e) => Err(e),
        },
        CliCommand::ListLendingProfiles { collection } => {
            match list_lending_profiles(config, collection.as_ref()).await {
                Ok(_) => Ok("Successfully listed lending profiles.".to_string()),
                Err(e) => Err(e),
            }
        }
        CliCommand::CreateLoan {
            lending_profile,
            amount,
        } => match create_loan(config, lending_profile, *amount).await {
            Ok(_) => Ok("Successfully offered loan.".to_string()),
            Err(e) => Err(e),
        },
        CliCommand::TakeLoan {
            loan,
            collateral_mint,
        } => match take_loan(config, loan, collateral_mint).await {
            Ok(_) => Ok("Successfully took loan.".to_string()),
            Err(e) => Err(e),
        },
        CliCommand::ListLoans { lending_profile } => {
            match list_loans(config, lending_profile.as_ref()).await {
                Ok(_) => Ok("Successfully listed loans.".to_string()),
                Err(e) => Err(e),
            }
        }
    }
}

pub fn parse_command(matches: &ArgMatches) -> Result<CliCommandInfo, Box<dyn std::error::Error>> {
    let response = match matches.subcommand() {
        ("create-lending-profile", Some(matches)) => {
            let collection_name = matches.value_of("collection-name").unwrap();
            let collection_mint =
                Pubkey::from_str(matches.value_of("collection-mint").unwrap()).unwrap();
            let token_mint = Pubkey::from_str(matches.value_of("token-mint").unwrap()).unwrap();
            let id = u64::from_str(matches.value_of("id").unwrap()).unwrap();
            let loan_duration = u64::from_str(matches.value_of("loan-duration").unwrap()).unwrap();
            let interest_rate = u64::from_str(matches.value_of("interest-rate").unwrap()).unwrap();
            let fee_rate = u64::from_str(matches.value_of("fee-rate").unwrap()).unwrap();
            Ok(CliCommandInfo {
                command: CliCommand::CreateLendingProfile {
                    collection_name: collection_name.to_string(),
                    collection_mint,
                    token_mint,
                    id,
                    loan_duration,
                    interest_rate,
                    fee_rate,
                },
            })
        }
        ("list-lending-profiles", Some(matches)) => {
            let collection = matches
                .value_of("collecton")
                .map(|s| Pubkey::from_str(s).unwrap());
            Ok(CliCommandInfo {
                command: CliCommand::ListLendingProfiles { collection },
            })
        }
        ("create-loan", Some(matches)) => {
            let lending_profile =
                Pubkey::from_str(matches.value_of("lending-profile").unwrap()).unwrap();
            let amount = u64::from_str(matches.value_of("amount").unwrap()).unwrap();
            Ok(CliCommandInfo {
                command: CliCommand::CreateLoan {
                    lending_profile,
                    amount,
                },
            })
        }
        ("take-loan", Some(matches)) => {
            let loan = Pubkey::from_str(matches.value_of("loan").unwrap()).unwrap();
            let collateral_mint =
                Pubkey::from_str(matches.value_of("collateral-mint").unwrap()).unwrap();
            Ok(CliCommandInfo {
                command: CliCommand::TakeLoan {
                    loan,
                    collateral_mint,
                },
            })
        }
        ("list-loans", Some(matches)) => {
            let lending_profile = matches
                .value_of("lending-profile")
                .map(|s| Pubkey::from_str(s).unwrap());
            Ok(CliCommandInfo {
                command: CliCommand::ListLoans { lending_profile },
            })
        }
        ("create-token", Some(matches)) => {
            let lending_profile = matches
                .value_of("lending-profile")
                .map(|s| Pubkey::from_str(s).unwrap());
            Ok(CliCommandInfo {
                command: CliCommand::ListLoans { lending_profile },
            })
        }
        ("send-token", Some(matches)) => {
            let lending_profile = matches
                .value_of("lending-profile")
                .map(|s| Pubkey::from_str(s).unwrap());
            Ok(CliCommandInfo {
                command: CliCommand::ListLoans { lending_profile },
            })
        }
        ("list-tokens", Some(matches)) => {
            let lending_profile = matches
                .value_of("lending-profile")
                .map(|s| Pubkey::from_str(s).unwrap());
            Ok(CliCommandInfo {
                command: CliCommand::ListLoans { lending_profile },
            })
        }
        ("", None) => {
            eprintln!("{}", matches.usage());
            Err(CliError::CommandNotRecognized(
                "no subcommand given".to_string(),
            ))
        }
        _ => unreachable!(),
    }?;
    Ok(response)
}

pub fn parse_args(matches: &ArgMatches<'_>) -> Result<CliConfig, Box<dyn std::error::Error>> {
    let json_rpc_url = matches.value_of("json_rpc_url").unwrap();
    let keypair_path = matches.value_of("keypair").unwrap();

    let normalized_url = normalize_to_url_if_moniker(json_rpc_url);
    println!("Using JSON-RPC URL: {}", normalized_url);

    println!("Loading keypair from: {}", keypair_path);
    let keypair = load_keypair(keypair_path)?;
    println!("Loaded keypair with address: {}", keypair.pubkey());

    let CliCommandInfo { command } = parse_command(matches)?;

    Ok(CliConfig {
        command,
        json_rpc_url: normalized_url.to_string(),
        keypair_path: keypair_path.to_string(),
        rpc_client: Some(Arc::new(RpcClient::new_with_commitment(
            normalized_url,
            CommitmentConfig::confirmed(),
        ))),
        keypair: Some(keypair),
    })
}
