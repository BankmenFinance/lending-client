/* eslint-disable @typescript-eslint/no-unused-vars */
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js';
import { LendingClient } from '../client';
import { LoanState, LoanType, OfferLoanArgs } from '../types/on-chain';
import { StateUpdateHandler } from '../types';
import {
  ASSOCIATED_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@project-serum/anchor/dist/cjs/utils/token';
import {
  deriveEscrowTokenAccount,
  deriveLoanAddress,
  deriveLoanEscrowAddress,
  deriveProfileVaultAddress,
  deriveUserAccountAddress
} from '../utils/pda';
import { CollectionLendingProfile } from './collectionLendingProfile';
import { getAssociatedTokenAddress } from '@project-serum/associated-token';
import { Metaplex, Metadata } from '@metaplex-foundation/js';
import { MPL_TOKEN_AUTH_RULES_PROGRAM_ID as token_auth_rules_program_id } from '@metaplex-foundation/mpl-token-auth-rules';

/**
 * Represents a Loan.
 *
 * This class exposes utility methods related to this on-chain account.
 */
export class Loan {
  constructor(
    readonly client: LendingClient,
    readonly address: PublicKey,
    public state: LoanState,
    private _onStateUpdate?: StateUpdateHandler<LoanState>
  ) {
    this.subscribe();
  }

  /**
   * Derives program addresses and generates necessary intructions to foreclose an existing Loan.
   * @param client The Lending Client.
   * @param collectionLendingProfile The Collection Lending Profile.
   * @param args The arguments to create the Loan Offer.
   * @param loanId The loan ID.
   * @returns The accounts, instructions and signers, if necessary.
   */
  static async create(
    client: LendingClient,
    collectionLendingProfile: CollectionLendingProfile,
    args: OfferLoanArgs
  ) {
    const [loan, loanBump] = deriveLoanAddress(
      collectionLendingProfile.address,
      client.walletPubkey,
      args.id.toNumber(),
      client.programId
    );
    const [escrow, escrowBump] = deriveLoanEscrowAddress(
      loan,
      client.programId
    );
    const [escrowTokenAccount, escrowTokenAccountbump] =
      deriveEscrowTokenAccount(escrow, client.programId);
    const [userAccount, userAccountBump] = deriveUserAccountAddress(
      client.walletPubkey,
      client.programId
    );
    const lenderTokenAccount =
      await collectionLendingProfile.getAssociatedTokenAddress();
    const ix = await client.methods
      .offerLoan(args)
      .accountsStrict({
        profile: collectionLendingProfile.address,
        loan,
        loanMint: collectionLendingProfile.tokenMint,
        escrow,
        escrowTokenAccount,
        lenderTokenAccount,
        lender: client.walletPubkey,
        lenderAccount: userAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY
      })
      .instruction();

    return {
      accounts: [loan, escrow, escrowTokenAccount],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Loads all existing Loans, if a Collection Lending Profile is specified, only Loans associated to it will be loaded.
   * @param client The Lending Client instance.
   * @param collectionLendingProfile The associated Collection Lending Profile, this is used as a filter.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve an array of Loans.
   */
  static async loadAll(
    client: LendingClient,
    collectionLendingProfile?: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<LoanState>
  ): Promise<Loan[]> {
    const filters = [];

    if (collectionLendingProfile) {
      filters.push({
        memcmp: {
          offset: 24,
          bytes: collectionLendingProfile.toString()
        }
      });
    }
    const loanAccounts = await client.accounts.loan.all(filters);
    const loans = [];

    for (const loanAccount of loanAccounts) {
      loans.push(
        new Loan(
          client,
          loanAccount.publicKey,
          loanAccount.account as LoanState,
          onStateUpdateHandler
        )
      );
    }

    return loans;
  }

  /**
   * Loads all existing Loans, if a Collection Lending Profile is specified, only Loans associated to it will be loaded.
   * @param client The Lending Client instance.
   * @param address The address of the Loan to load.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve a Loan.
   */
  static async load(
    client: LendingClient,
    address: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<LoanState>
  ): Promise<Loan> {
    const state = await client.accounts.loan.fetchNullable(address);

    if (state === null) return null;

    return new Loan(client, address, state as LoanState, onStateUpdateHandler);
  }

  /**
   * Derives program addresses and generates necessary intructions to take an existing Loan Offer.
   * @param metaplex The Metaplex Client.
   * @param collectionLendingProfile The Collection Lending Profile.
   * @param collateralMint The SPL Token Mint of the Collateral NFT of the borrower.
   * @param metadata The metadata account.
   * @returns The accounts, instructions and signers, if necessary.
   */
  async takeLoan(
    metaplex: Metaplex,
    collectionLendingProfile: CollectionLendingProfile,
    collateralMint: PublicKey,
    metadata: Metadata
  ) {
    const metadataProgramId = metaplex.programs().getTokenMetadata().address;
    const [escrow, escrowBump] = deriveLoanEscrowAddress(
      this.address,
      this.client.programId
    );
    const [escrowTokenAccount, escrowTokenAccountbump] =
      deriveEscrowTokenAccount(escrow, this.client.programId);
    const [userAccount, userAccountBump] = deriveUserAccountAddress(
      this.client.walletPubkey,
      this.client.programId
    );
    const collateralMetadata = metaplex
      .nfts()
      .pdas()
      .metadata({ mint: collateralMint });
    const collateralEdition = metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: collateralMint });
    const borrowerCollateralAccount = await getAssociatedTokenAddress(
      this.client.walletPubkey,
      collateralMint
    );
    const borrowerTokenAccount =
      await collectionLendingProfile.getAssociatedTokenAddress();
    const ix = await this.client.methods
      .takeLoan()
      .accountsStrict({
        profile: collectionLendingProfile.address,
        loan: this.address,
        loanMint: collectionLendingProfile.tokenMint,
        collateralMint,
        collateralMetadata,
        collateralEdition,
        escrow,
        escrowTokenAccount,
        borrowerTokenAccount,
        borrowerCollateralAccount,
        borrowerAccount: userAccount,
        borrower: this.client.walletPubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: metadataProgramId,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
      })
      .instruction();

    const floorPriceOracle = collectionLendingProfile.state.floorPriceOracle;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (
      (this.state.loanType as any).loanToValue &&
      !PublicKey.default.equals(floorPriceOracle)
    ) {
      ix.keys.push({
        pubkey: floorPriceOracle,
        isSigner: false,
        isWritable: false
      });
      ix.keys.push({
        pubkey: this.state.lender,
        isSigner: false,
        isWritable: true
      });
    }


    const delegateRecord = metaplex.nfts().pdas().metadataDelegateRecord({
      mint: collateralMint,
      type: 'ProgrammableConfigV1',
      updateAuthority: this.client.walletPubkey,
      delegate: this.client.walletPubkey
    });
    const tokenRecord = metaplex.nfts().pdas().tokenRecord({
      mint: collateralMint,
      token: borrowerCollateralAccount
    });
    const token_auth_rules_account_id = metadata.programmableConfig.ruleSet;

    if(metadata.tokenStandard == 4 || metadata.tokenStandard == 5) {
      // this is the token record account
      ix.keys.push({
        pubkey: tokenRecord,
        isSigner: false,
        isWritable: true
      });
      // this is the instructions sysvar
      ix.keys.push({
        pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
        isSigner: false,
        isWritable: false,
      });
      if ( token_auth_rules_account_id.toString().length > 0) {
        // this is the mpl token auth rules program
        ix.keys.push({
            pubkey: token_auth_rules_program_id,
            isSigner: false,
            isWritable: false,
        });
        // this is the mpl token auth rules account
        ix.keys.push({
            pubkey: token_auth_rules_account_id,
            isSigner: false,
            isWritable: false,
        });
      }
      //this is the delegate record
      ix.keys.push({
          pubkey: delegateRecord,
          isSigner: false,
          isWritable: true,
      });
    }

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Derives program addresses and generates necessary intructions to repay an existing Loan.
   * @param metaplex The Metaplex Client.
   * @param collectionLendingProfile The Collection Lending Profile.
   * @param collateralMint The SPL Token Mint of the Collateral NFT of the borrower.
   * @param metadata The metadata account.
   * @returns The accounts, instructions and signers, if necessary.
   */
  async repayLoan(
    metaplex: Metaplex,
    collectionLendingProfile: CollectionLendingProfile,
    collateralMint: PublicKey,
    metadata: Metadata
  ) {
    const metadataProgramId = metaplex.programs().getTokenMetadata().address;
    const [escrow, escrowBump] = deriveLoanEscrowAddress(
      this.address,
      this.client.programId
    );
    const [escrowTokenAccount, escrowTokenAccountbump] =
      deriveEscrowTokenAccount(escrow, this.client.programId);
    const [vault, vaultBump] = deriveProfileVaultAddress(
      collectionLendingProfile.address,
      this.client.programId
    );
    const [userAccount, userAccountBump] = deriveUserAccountAddress(
      this.client.walletPubkey,
      this.client.programId
    );
    const collateralEdition = metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: collateralMint });
    const borrowerCollateralAccount = await getAssociatedTokenAddress(
      this.client.walletPubkey,
      collateralMint
    );
    const borrowerTokenAccount =
      await collectionLendingProfile.getAssociatedTokenAddress();
    const lenderTokenAccount = await getAssociatedTokenAddress(
      this.state.lender,
      collectionLendingProfile.tokenMint
    );
    const ix = await this.client.methods
      .repayLoan(this.state.repaymentAmount.sub(this.state.paidAmount))
      .accountsStrict({
        profile: collectionLendingProfile.address,
        loan: this.address,
        escrow,
        escrowTokenAccount,
        vault,
        loanMint: collectionLendingProfile.tokenMint,
        collateralMint,
        collateralEdition,
        tokenVault: collectionLendingProfile.tokenVault,
        borrowerTokenAccount,
        borrowerCollateralAccount,
        lender: this.state.lender,
        lenderTokenAccount: lenderTokenAccount,
        borrowerAccount: userAccount,
        borrower: this.client.walletPubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: metadataProgramId,
        systemProgram: SystemProgram.programId
      })
      .instruction();

      const tokenRecord = metaplex.nfts().pdas().tokenRecord({
        mint: collateralMint,
        token: borrowerCollateralAccount
      });
      const token_auth_rules_account_id = metadata.programmableConfig.ruleSet;
      
      if(metadata.tokenStandard == 4 || metadata.tokenStandard == 5) {
        // this is the metadata account
        ix.keys.push({
          pubkey: metadata.address,
          isSigner: false,
          isWritable: true
        });
        // this is the token record account
        ix.keys.push({
          pubkey: tokenRecord,
          isSigner: false,
          isWritable: true
        });
        // this is the instructions sysvar
        ix.keys.push({
          pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
          isSigner: false,
          isWritable: false,
        });
        if ( token_auth_rules_account_id.toString().length > 0) {
          // this is the mpl token auth rules program
          ix.keys.push({
              pubkey: token_auth_rules_program_id,
              isSigner: false,
              isWritable: false,
          });
          // this is the mpl token auth rules account
          ix.keys.push({
              pubkey: token_auth_rules_account_id,
              isSigner: false,
              isWritable: false,
          });
        }
      }

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Derives program addresses and generates necessary intructions to foreclose an existing Loan.
   * @param metaplex The Metaplex Client.
   * @param collectionLendingProfile The Collection Lending Profile.
   * @param collateralMint The SPL Token Mint of the Collateral NFT of the borrower.
   * @param metadata The metadata account.
   * @returns The accounts, instructions and signers, if necessary.
   */
  async forecloseLoan(
    metaplex: Metaplex,
    collectionLendingProfile: CollectionLendingProfile,
    collateralMint: PublicKey,
    metadata: Metadata
  ) {
    const metadataProgramId = metaplex.programs().getTokenMetadata().address;
    const [escrow, escrowBump] = deriveLoanEscrowAddress(
      this.address,
      this.client.programId
    );
    const [escrowTokenAccount, escrowTokenAccountbump] =
      deriveEscrowTokenAccount(escrow, this.client.programId);
    const [userAccount, userAccountBump] = deriveUserAccountAddress(
      this.client.walletPubkey,
      this.client.programId
    );
    const collateralEdition = metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: collateralMint });
    const lenderCollateralAccount = await getAssociatedTokenAddress(
      this.client.walletPubkey,
      collateralMint
    );
    const borrowerCollateralAccount = await getAssociatedTokenAddress(
      this.state.borrower,
      collateralMint
    );
    const ix = await this.client.methods
      .forecloseLoan()
      .accountsStrict({
        profile: collectionLendingProfile.address,
        loan: this.address,
        collateralMint,
        escrow,
        escrowTokenAccount,
        lenderCollateralAccount,
        collateralEdition,
        borrowerCollateralAccount,
        borrower: this.state.borrower,
        lenderAccount: userAccount,
        lender: this.client.walletPubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: metadataProgramId
      })
      .instruction();

      const tokenRecord = metaplex.nfts().pdas().tokenRecord({
        mint: collateralMint,
        token: borrowerCollateralAccount
      });
      const token_auth_rules_account_id = metadata.programmableConfig.ruleSet;
      
      if(metadata.tokenStandard == 4 || metadata.tokenStandard == 5) {
        // this is the metadata account
        ix.keys.push({
          pubkey: metadata.address,
          isSigner: false,
          isWritable: true
        });
        // this is the token record account
        ix.keys.push({
          pubkey: tokenRecord,
          isSigner: false,
          isWritable: true
        });
        // this is the instructions sysvar
        ix.keys.push({
          pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
          isSigner: false,
          isWritable: false,
        });
        if ( token_auth_rules_account_id.toString().length > 0) {
          // this is the mpl token auth rules program
          ix.keys.push({
              pubkey: token_auth_rules_program_id,
              isSigner: false,
              isWritable: false,
          });
          // this is the mpl token auth rules account
          ix.keys.push({
              pubkey: token_auth_rules_account_id,
              isSigner: false,
              isWritable: false,
          });
        }
      }

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Derives program addresses and generates necessary intructions to rescind an existing Loan.
   * @param collectionLendingProfile The Collection Lending Profile.
   * @returns The accounts, instructions and signers, if necessary.
   */
  async rescindLoan(collectionLendingProfile: CollectionLendingProfile) {
    const [escrow, escrowBump] = deriveLoanEscrowAddress(
      this.address,
      this.client.programId
    );
    const [escrowTokenAccount, escrowTokenAccountbump] =
      deriveEscrowTokenAccount(escrow, this.client.programId);
    const [lenderAccount, lenderAccountBump] = deriveUserAccountAddress(
      this.client.walletPubkey,
      this.client.programId
    );
    const lenderTokenAccount =
      await collectionLendingProfile.getAssociatedTokenAddress();
    const ix = await this.client.methods
      .rescindLoan()
      .accountsStrict({
        profile: collectionLendingProfile.address,
        loan: this.address,
        loanMint: this.state.loanMint,
        escrow,
        escrowTokenAccount,
        lenderTokenAccount,
        lenderAccount,
        lender: this.state.lender,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .instruction();

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Subscribes to state changes of this account.
   */
  subscribe() {
    this.client.accounts.collectionLendingProfile
      .subscribe(this.address)
      .on('change', (state: LoanState) => {
        this.state = state;
        // todo: check if dexMarkets need to be reloaded.(market listing/delisting)
        if (this._onStateUpdate) {
          this._onStateUpdate(this.state);
        }
      });
  }

  /**
   * Unsubscribes to state changes of this account.
   */
  async unsubscribe() {
    await this.client.accounts.collectionLendingProfile.unsubscribe(
      this.address
    );
  }
}
