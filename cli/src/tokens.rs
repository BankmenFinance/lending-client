use anchor_lang::prelude::Pubkey;
use anchor_spl::token::{self, spl_token::instruction::initialize_mint, Mint};
use clap::{App, Arg, SubCommand};
use gbg_lending_client::utils::{create_transaction, send_transaction};
use mpl_token_metadata::{
    instruction::{create_master_edition_v3, create_metadata_accounts_v3, verify_collection},
    pda::{find_master_edition_account, find_metadata_account},
    state::{Collection, Creator, MAX_METADATA_LEN},
};
use solana_account_decoder::UiAccountData;
use solana_client::rpc_request::TokenAccountsFilter;
use solana_sdk::{signature::Keypair, signer::Signer, system_instruction::create_account};

use crate::CliConfig;

pub trait TokenSubCommands {
    fn token_subcommands(self) -> Self;
}

impl TokenSubCommands for App<'_, '_> {
    fn token_subcommands(self) -> Self {
        self.subcommand(
            SubCommand::with_name("list-tokens")
                .about("Lists all NFTs held.")
                .arg(
                    Arg::with_name("collection")
                        .short("c")
                        .takes_value(true)
                        .long("collection")
                        .value_name("OPTIONAL")
                        .help("The Collection Mint, value should be a pubkey."),
                ),
        )
        .subcommand(SubCommand::with_name("create-collection").about("Creates a Collection NFT."))
        .subcommand(
            SubCommand::with_name("create-token")
                .about("Creates an NFT.")
                .arg(
                    Arg::with_name("collection-mint")
                        .short("c")
                        .takes_value(true)
                        .long("collection-mint")
                        .help("The Collection Mint, value should be a pubkey."),
                ),
        )
        .subcommand(
            SubCommand::with_name("send-token")
                .about("Sends an NFT.")
                .arg(
                    Arg::with_name("token-mint")
                        .short("t")
                        .takes_value(true)
                        .long("token-mint")
                        .help("The Token Mint, value should be a pubkey."),
                )
                .arg(
                    Arg::with_name("destination")
                        .short("d")
                        .takes_value(true)
                        .long("destination")
                        .help("The destination, value should be a pubkey."),
                ),
        )
    }
}

pub async fn create_collection(cli_config: &CliConfig) -> Result<(), Box<dyn std::error::Error>> {
    let rpc_client = cli_config.rpc_client.as_ref().unwrap();
    let keypair = cli_config.keypair.as_ref().unwrap();

    let mint = Keypair::new();
    // nft accouts
    let metadata = find_metadata_account(&mint.pubkey()).0;
    let edition = find_master_edition_account(&mint.pubkey()).0;

    let metadata_rent = rpc_client
        .get_minimum_balance_for_rent_exemption(MAX_METADATA_LEN)
        .await
        .unwrap();
    let mint_rent = rpc_client
        .get_minimum_balance_for_rent_exemption(Mint::LEN)
        .await
        .unwrap();

    let ixs = vec![
        create_account(
            &keypair.pubkey(),
            &mint.pubkey(),
            mint_rent,
            Mint::LEN as u64,
            &token::ID,
        ),
        initialize_mint(&token::ID, &mint.pubkey(), &keypair.pubkey(), None, 0).unwrap(),
        create_account(
            &keypair.pubkey(),
            &metadata,
            metadata_rent,
            MAX_METADATA_LEN as u64,
            &mpl_token_metadata::id(),
        ),
        create_metadata_accounts_v3(
            mpl_token_metadata::id(),
            metadata,
            mint.pubkey(),
            keypair.pubkey(),
            keypair.pubkey(),
            keypair.pubkey(),
            "GBG Lending Test Collection".to_string(),
            "GLTC".to_string(),
            "https://blockmountain.io".to_string(),
            Some(vec![Creator {
                address: keypair.pubkey(),
                verified: false,
                share: 100,
            }]),
            0,
            true,
            false,
            None,
            None,
            None,
        ),
        create_master_edition_v3(
            mpl_token_metadata::id(),
            edition,
            mint.pubkey(),
            keypair.pubkey(),
            keypair.pubkey(),
            metadata,
            keypair.pubkey(),
            Some(1),
        ),
    ];

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
        "Successfully created collection. Transaction signature: {}",
        sig
    );

    Ok(())
}

pub async fn create_token(
    cli_config: &CliConfig,
    collection_mint: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
    let rpc_client = cli_config.rpc_client.as_ref().unwrap();
    let keypair = cli_config.keypair.as_ref().unwrap();

    let mint = Keypair::new();
    // collection accounts
    let collection_metadata = find_metadata_account(collection_mint).0;
    let collection_master_edition = find_master_edition_account(collection_mint).0;
    // nft accouts
    let metadata = find_metadata_account(&mint.pubkey()).0;
    let edition = find_master_edition_account(&mint.pubkey()).0;

    let metadata_rent = rpc_client
        .get_minimum_balance_for_rent_exemption(MAX_METADATA_LEN)
        .await
        .unwrap();
    let mint_rent = rpc_client
        .get_minimum_balance_for_rent_exemption(Mint::LEN)
        .await
        .unwrap();

    let ixs = vec![
        create_account(
            &keypair.pubkey(),
            &mint.pubkey(),
            mint_rent,
            Mint::LEN as u64,
            &token::ID,
        ),
        initialize_mint(&token::ID, &mint.pubkey(), &keypair.pubkey(), None, 0).unwrap(),
        create_account(
            &keypair.pubkey(),
            &metadata,
            metadata_rent,
            MAX_METADATA_LEN as u64,
            &mpl_token_metadata::id(),
        ),
        create_metadata_accounts_v3(
            mpl_token_metadata::id(),
            metadata,
            mint.pubkey(),
            keypair.pubkey(),
            keypair.pubkey(),
            keypair.pubkey(),
            "GBG Lending Test".to_string(),
            "GLT".to_string(),
            "https://blockmountain.io".to_string(),
            Some(vec![Creator {
                address: keypair.pubkey(),
                verified: false,
                share: 100,
            }]),
            0,
            true,
            false,
            Some(Collection {
                verified: false,
                key: *collection_mint,
            }),
            None,
            None,
        ),
        create_master_edition_v3(
            mpl_token_metadata::id(),
            edition,
            mint.pubkey(),
            keypair.pubkey(),
            keypair.pubkey(),
            metadata,
            keypair.pubkey(),
            Some(1),
        ),
        verify_collection(
            mpl_token_metadata::id(),
            metadata,
            keypair.pubkey(),
            keypair.pubkey(),
            *collection_mint,
            collection_metadata,
            collection_master_edition,
            None,
        ),
    ];

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

    println!("Successfully created token. Transaction signature: {}", sig);

    Ok(())
}

#[derive(serde::Deserialize)]
struct Parsed {
    info: SplToken,
}

#[derive(serde::Deserialize)]
struct SplToken {
    mint: String,
    #[serde(rename(deserialize = "tokenAmount"))]
    token_amount: Amount,
}

#[allow(dead_code)]
#[derive(serde::Deserialize)]
struct Amount {
    amount: String,
    #[serde(rename(deserialize = "uiAmountString"))]
    ui_amount_string: String,
    #[serde(rename(deserialize = "uiAmount"))]
    ui_amount: f64,
    decimals: u8,
}

pub async fn list_tokens(cli_config: &CliConfig) -> Result<(), Box<dyn std::error::Error>> {
    let rpc_client = cli_config.rpc_client.as_ref().unwrap();
    let keypair = cli_config.keypair.as_ref().unwrap();

    let accounts = match rpc_client
        .get_token_accounts_by_owner(&keypair.pubkey(), TokenAccountsFilter::ProgramId(token::ID))
        .await
    {
        Ok(a) => a,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    let accounts: Vec<_> = accounts
        .iter()
        .filter_map(|x| {
            if let UiAccountData::Json(d) = &x.account.data {
                Some(d)
            } else {
                None
            }
        })
        .collect();

    let parsed: Vec<_> = accounts
        .iter()
        .filter_map(|x| serde_json::from_value::<Parsed>(x.parsed.clone()).ok())
        .filter(|x| x.info.token_amount.decimals == 0 && x.info.token_amount.ui_amount == 1.0)
        .map(|x| x.info.mint)
        .collect();

    for token_mint in parsed.iter() {
        println!("Mint: {}", token_mint);
    }

    Ok(())
}

pub async fn send_token(
    cli_config: &CliConfig,
    _token_mint: &Pubkey,
    _destination: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
    let _rpc_client = cli_config.rpc_client.as_ref().unwrap();

    Ok(())
}
