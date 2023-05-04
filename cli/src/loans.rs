use anchor_spl::{associated_token::get_associated_token_address, token};
use clap::{App, Arg, SubCommand};
use lending::{CollectionLendingProfile, Loan, OfferLoanArgs, User};
use lending_client::{
    instructions::{offer_loan as offer_loan_ix, rescind_loan, take_loan as take_loan_ix},
    prelude::LendingClient,
    utils::{create_transaction, get_program_account, send_transaction},
};
use mpl_token_metadata::pda::{find_master_edition_account, find_metadata_account};
use solana_sdk::{pubkey::Pubkey, signer::Signer};
use spl_associated_token_account::instruction::create_associated_token_account;

use crate::CliConfig;

pub trait LoanSubCommands {
    fn loan_subcommands(self) -> Self;
}

impl LoanSubCommands for App<'_, '_> {
    fn loan_subcommands(self) -> Self {
        self.subcommand(
            SubCommand::with_name("list-loans")
                .about("Lists all existing Collection Lending Profiles.")
                .arg(
                    Arg::with_name("lending-profile")
                        .short("l")
                        .takes_value(true)
                        .long("lending-profile")
                        .value_name("OPTIONAL")
                        .help("The Lending Profile, value should be a pubkey."),
                ),
        )
        .subcommand(
            SubCommand::with_name("create-loan")
                .about("Creates a Loan.")
                .arg(
                    Arg::with_name("lending-profile")
                        .short("l")
                        .takes_value(true)
                        .long("lending-profile")
                        .help("The Lending Profile, value should be a pubkey."),
                )
                .arg(
                    Arg::with_name("amount")
                        .short("a")
                        .takes_value(true)
                        .long("amount")
                        .help("The amount to lend, value should fit in a u64."),
                ),
        )
        .subcommand(
            SubCommand::with_name("cancel-loan")
                .about("Creates a Loan.")
                .arg(
                    Arg::with_name("loan")
                        .short("l")
                        .takes_value(true)
                        .long("loan")
                        .help("The Loan, value should be a pubkey."),
                ),
        )
        .subcommand(
            SubCommand::with_name("take-loan")
                .about("Takes a Loan.")
                .arg(
                    Arg::with_name("loan")
                        .short("l")
                        .takes_value(true)
                        .long("loan")
                        .help("The Loan, value should be a pubkey."),
                )
                .arg(
                    Arg::with_name("collateral-mint")
                        .short("c")
                        .takes_value(true)
                        .long("collateral-mint")
                        .help("The Collateral Mint, value should be a pubkey."),
                ),
        )
    }
}

pub async fn list_loans(
    cli_config: &CliConfig,
    lending_profile: Option<&Pubkey>,
) -> Result<(), Box<dyn std::error::Error>> {
    let rpc_client = cli_config.rpc_client.as_ref().unwrap();

    let lending_client = LendingClient::new(rpc_client.clone());

    let loans = match lending_client.get_loans(lending_profile).await {
        Ok(a) => a,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    println!("Fetched {} loan offers.", loans.len());

    for loan in loans.iter() {
        println!(
            "\nLoan: {}\n\tLending Profile: {}\n\tToken Mint: {}\n\tLender: {}\n\tBorrower: {}\n\tPrincipal Amount: {}\n\tRepayment Amount: {}\n\tDue Timestamp: {}",
            loan.pubkey,
            loan.state.profile,
            loan.state.loan_mint,
            loan.state.lender,
            loan.state.borrower,
            loan.state.principal_amount,
            loan.state.repayment_amount,
            loan.state.due_timestamp
        );
    }

    Ok(())
}

pub async fn create_loan(
    cli_config: &CliConfig,
    profile: &Pubkey,
    amount: u64,
) -> Result<(), Box<dyn std::error::Error>> {
    let rpc_client = cli_config.rpc_client.as_ref().unwrap();
    let keypair = cli_config.keypair.as_ref().unwrap();

    // if we fail fetching the profile we shouldn't proceed
    let profile_account =
        match get_program_account::<CollectionLendingProfile>(rpc_client, profile).await {
            Ok(a) => a,
            Err(e) => {
                return Err(e);
            }
        };

    let (user, _) = User::derive_address(&keypair.pubkey());

    // if we fail fetching the user account, we can proceed anyway
    let user_account = match get_program_account::<User>(rpc_client, &user).await {
        Ok(a) => Some(a),
        Err(_) => None,
    };

    let loan_id = if let Some(account) = user_account {
        account.loans_offered
    } else {
        0
    };

    let (loan, _) = Loan::derive_address(profile, &keypair.pubkey(), loan_id);
    let (escrow, _) = Loan::derive_escrow_address(&loan);
    let (escrow_token_account, _) = Loan::derive_escrow_token_account_address(&escrow);

    // we have to check if the account exists or not, if not, then we have to create it before calling `OfferLoan`
    let lender_token_account =
        get_associated_token_address(&keypair.pubkey(), &profile_account.token_mint);

    let args = OfferLoanArgs {
        amount,
        id: loan_id,
    };

    let mut ixs = Vec::new();

    match rpc_client.get_token_account(&lender_token_account).await {
        Ok(a) => {
            if a.is_none() {
                ixs.push(create_associated_token_account(
                    &keypair.pubkey(),
                    &keypair.pubkey(),
                    &profile_account.token_mint,
                    &token::ID,
                ))
            }
        }
        Err(_) => {
            ixs.push(create_associated_token_account(
                &keypair.pubkey(),
                &keypair.pubkey(),
                &profile_account.token_mint,
                &token::ID,
            ));
        }
    }

    ixs.push(offer_loan_ix(
        profile,
        &loan,
        &profile_account.token_mint,
        &escrow,
        &escrow_token_account,
        &lender_token_account,
        &user,
        &keypair.pubkey(),
        &args,
    ));

    println!("{:?}", ixs);

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

    println!("Successfully offered loan. Transaction signature: {}", sig);

    Ok(())
}

pub async fn cancel_loan(
    cli_config: &CliConfig,
    loan: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
    let rpc_client = cli_config.rpc_client.as_ref().unwrap();
    let keypair = cli_config.keypair.as_ref().unwrap();

    let (user, _) = User::derive_address(&keypair.pubkey());

    let loan_account = match get_program_account::<Loan>(rpc_client, &loan).await {
        Ok(a) => a,
        Err(e) => return Err(e),
    };

    let (escrow, _) = Loan::derive_escrow_address(&loan);
    let (escrow_token_account, _) = Loan::derive_escrow_token_account_address(&escrow);

    // we have to check if the account exists or not, if not, then we have to create it before calling `OfferLoan`
    let lender_token_account =
        get_associated_token_address(&keypair.pubkey(), &loan_account.loan_mint);

    let ixs = vec![rescind_loan(
        &loan_account.profile,
        loan,
        &loan_account.loan_mint,
        &escrow,
        &escrow_token_account,
        &lender_token_account,
        &user,
        &keypair.pubkey(),
    )];

    println!("{:?}", ixs);

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

    println!("Successfully canceled loan. Transaction signature: {}", sig);
    Ok(())
}

pub async fn take_loan(
    cli_config: &CliConfig,
    loan: &Pubkey,
    collateral_mint: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
    let rpc_client = cli_config.rpc_client.as_ref().unwrap();
    let keypair = cli_config.keypair.as_ref().unwrap();

    // if we fail fetching the profile we shouldn't proceed
    let loan_account = match get_program_account::<Loan>(rpc_client, loan).await {
        Ok(a) => a,
        Err(e) => {
            return Err(e);
        }
    };

    let (user, _) = User::derive_address(&keypair.pubkey());

    // if we fail fetching the user account, we can proceed anyway
    let _user_account = match get_program_account::<User>(rpc_client, &user).await {
        Ok(a) => Some(a),
        Err(_) => None,
    };

    let (escrow, _) = Loan::derive_escrow_address(loan);
    let (escrow_token_account, _) = Loan::derive_escrow_token_account_address(&escrow);
    let (collateral_metadata, _) = find_metadata_account(collateral_mint);
    let (collateral_edition, _) = find_master_edition_account(collateral_mint);

    // we have to check if the account exists or not, if not, then we have to create it before calling `OfferLoan`
    let borrower_token_account =
        get_associated_token_address(&keypair.pubkey(), &loan_account.loan_mint);
    let borrower_collateral_account =
        get_associated_token_address(&keypair.pubkey(), collateral_mint);

    let mut ixs = Vec::new();

    match rpc_client.get_token_account(&borrower_token_account).await {
        Ok(a) => {
            if a.is_none() {
                ixs.push(create_associated_token_account(
                    &keypair.pubkey(),
                    &keypair.pubkey(),
                    &loan_account.loan_mint,
                    &token::ID,
                ))
            }
        }
        Err(e) => {
            return Err(Box::new(e));
        }
    }

    let ixs = vec![take_loan_ix(
        &loan_account.profile,
        loan,
        &loan_account.loan_mint,
        collateral_mint,
        &collateral_metadata,
        &collateral_edition,
        &escrow,
        &escrow_token_account,
        &user,
        &borrower_token_account,
        &borrower_collateral_account,
        &keypair.pubkey(),
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

    println!("Successfully took loan. Transaction signature: {}", sig);

    Ok(())
}
