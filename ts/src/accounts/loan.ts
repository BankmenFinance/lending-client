/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY
} from '@solana/web3.js';
import { LendingClient } from '../client';
import {
  LoanState,
  OfferLoanArgs,
  LoanType,
  TokenStandard
} from '../types/on-chain';
import { StateUpdateHandler } from '../types';
import {
  ASSOCIATED_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@coral-xyz/anchor/dist/cjs/utils/token';
import {
  deriveEscrowTokenAccount,
  deriveLoanAddress,
  deriveLoanEscrowAddress,
  deriveProfileVaultAddress,
  deriveUserAccountAddress
} from '../utils/pda';
import { CollectionLendingProfile } from './collectionLendingProfile';
import { getAssociatedTokenAddress } from '@project-serum/associated-token';
import {
  Metaplex,
  Sft,
  SftWithToken,
  Nft,
  NftWithToken
} from '@metaplex-foundation/js';
import { MPL_TOKEN_AUTH_RULES_PROGRAM_ID } from '@metaplex-foundation/mpl-token-auth-rules';
import { MPL_TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TransactionAccounts } from '../types/index';
import { BN } from '@coral-xyz/anchor';
import { bnToDate } from '../utils';

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
  ): Promise<TransactionAccounts> {
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
   * @param collectionLendingProfile The associated Collection Lending Profile, this is used as a filter.
   * @param lender The associated Lender, this is used as a filter.
   * @param borrower The associated Lender, this is used as a filter.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve an array of Loans.
   */
  static async loadAllWithOptions(
    client: LendingClient,
    collectionLendingProfile?: PublicKey,
    lender?: PublicKey,
    borrower?: PublicKey,
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

    if (lender) {
      filters.push({
        memcmp: {
          offset: 56,
          bytes: lender.toString()
        }
      });
    }

    if (borrower) {
      filters.push({
        memcmp: {
          offset: 120,
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
    metadata: Sft | SftWithToken | Nft | NftWithToken
  ): Promise<TransactionAccounts> {
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
      .metadata({ mint: metadata.address });
    const collateralEdition = metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: metadata.address });
    const borrowerCollateralAccount = await getAssociatedTokenAddress(
      this.client.walletPubkey,
      metadata.address
    );
    const borrowerTokenAccount =
      await collectionLendingProfile.getAssociatedTokenAddress();
    const collateralTokenRecord = metaplex.nfts().pdas().tokenRecord({
      mint: metadata.address,
      token: borrowerCollateralAccount
    });
    let collateralTokenAuthRules = null;
    if (
      metadata.programmableConfig &&
      metadata.programmableConfig.ruleSet &&
      !PublicKey.default.equals(metadata.programmableConfig.ruleSet)
    ) {
      collateralTokenAuthRules = metadata.programmableConfig.ruleSet;
    }
    const ix = await this.client.methods
      .takeLoan()
      .accountsStrict({
        profile: collectionLendingProfile.address,
        loan: this.address,
        loanMint: collectionLendingProfile.tokenMint,
        collateralMint: metadata.address,
        collateralMetadata,
        collateralEdition,
        collateralTokenRecord,
        collateralTokenAuthRules,
        escrow,
        escrowTokenAccount,
        borrowerTokenAccount,
        borrowerCollateralAccount,
        borrowerAccount: userAccount,
        borrower: this.client.walletPubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        authRulesProgram: MPL_TOKEN_AUTH_RULES_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY
      })
      .instruction();

    const floorPriceOracle = collectionLendingProfile.state.floorPriceOracle;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (
      (this.state.loanType as LoanType) == LoanType.LoanToValue &&
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
    metadata: Sft | SftWithToken | Nft | NftWithToken
  ): Promise<TransactionAccounts> {
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
    const collateralMetadata = metaplex
      .nfts()
      .pdas()
      .metadata({ mint: metadata.address });
    const collateralEdition = metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: metadata.address });
    const borrowerCollateralAccount = await getAssociatedTokenAddress(
      this.client.walletPubkey,
      metadata.address
    );
    const collateralTokenRecord = metaplex.nfts().pdas().tokenRecord({
      mint: metadata.address,
      token: borrowerCollateralAccount
    });
    const borrowerTokenAccount =
      await collectionLendingProfile.getAssociatedTokenAddress();
    const lenderTokenAccount = await getAssociatedTokenAddress(
      this.state.lender,
      collectionLendingProfile.tokenMint
    );
    let collateralTokenAuthRules = null;
    if (
      metadata.programmableConfig &&
      metadata.programmableConfig.ruleSet &&
      !PublicKey.default.equals(metadata.programmableConfig.ruleSet)
    ) {
      collateralTokenAuthRules = metadata.programmableConfig.ruleSet;
    }
    const ix = await this.client.methods
      .repayLoan(this.state.repaymentAmount.sub(this.state.paidAmount))
      .accountsStrict({
        profile: collectionLendingProfile.address,
        loan: this.address,
        escrow,
        escrowTokenAccount,
        vault,
        loanMint: collectionLendingProfile.tokenMint,
        collateralMint: metadata.address,
        collateralEdition,
        collateralMetadata,
        collateralTokenRecord,
        collateralTokenAuthRules,
        tokenVault: collectionLendingProfile.tokenVault,
        borrowerTokenAccount,
        borrowerCollateralAccount,
        lender: this.state.lender,
        lenderTokenAccount: lenderTokenAccount,
        borrowerAccount: userAccount,
        borrower: this.client.walletPubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        authRulesProgram: MPL_TOKEN_AUTH_RULES_PROGRAM_ID,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY
      })
      .instruction();

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
    metadata: Sft | SftWithToken | Nft | NftWithToken
  ): Promise<TransactionAccounts> {
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
      .metadata({ mint: metadata.address });
    const collateralEdition = metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: metadata.address });
    const borrowerCollateralAccount = await getAssociatedTokenAddress(
      this.state.borrower,
      metadata.address
    );
    const borrowerCollateralTokenRecord = metaplex.nfts().pdas().tokenRecord({
      mint: metadata.address,
      token: borrowerCollateralAccount
    });
    const lenderCollateralAccount = await getAssociatedTokenAddress(
      this.client.walletPubkey,
      metadata.address
    );
    const lenderCollateralTokenRecord = metaplex.nfts().pdas().tokenRecord({
      mint: metadata.address,
      token: lenderCollateralAccount
    });
    let collateralTokenAuthRules = null;
    if (
      metadata.programmableConfig &&
      metadata.programmableConfig.ruleSet &&
      !PublicKey.default.equals(metadata.programmableConfig.ruleSet)
    ) {
      collateralTokenAuthRules = metadata.programmableConfig.ruleSet;
    }
    const ix = await this.client.methods
      .forecloseLoan()
      .accountsStrict({
        profile: collectionLendingProfile.address,
        loan: this.address,
        escrow,
        escrowTokenAccount,
        lenderCollateralAccount,
        lenderCollateralTokenRecord,
        collateralMint: metadata.address,
        collateralEdition,
        collateralMetadata,
        collateralTokenAuthRules,
        borrowerCollateralAccount,
        borrowerCollateralTokenRecord,
        borrower: this.state.borrower,
        lenderAccount: userAccount,
        lender: this.client.walletPubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        authRulesProgram: MPL_TOKEN_AUTH_RULES_PROGRAM_ID,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY
      })
      .instruction();

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
  async rescindLoan(
    collectionLendingProfile: CollectionLendingProfile
  ): Promise<TransactionAccounts> {
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
   * Gets the lender associated with this Loan.
   * @returns The Public Key of the lender.
   */
  get lender(): PublicKey {
    return this.state.lender;
  }

  /**
   * Gets the borrower associated with this Loan.
   * @returns The Public Key of the borrower.
   */
  get borrower(): PublicKey {
    return this.state.lender;
  }

  /**
   * Gets the Token Mint of the token borrow associated with the Loan.
   * This does NOT represent the Token Mint of the collateral of the Loan.
   * @returns The Public Key of the SPL Token Mint.
   */
  get loanMint(): PublicKey {
    return this.state.loanMint;
  }

  /**
   * Gets the token standard of the collateral of this Loan.
   * @returns The Token Standard.
   */
  get tokenStandard(): TokenStandard {
    return this.state.tokenStandard;
  }

  /**
   * Gets the type of the Loan.
   * @returns The Loan Type.
   */
  get loanType(): LoanType {
    return this.state.loanType;
  }

  /**
   * Gets the timestamp at which this Loan is due.
   * @returns The due timestamp.
   */
  get dueTimestamp(): BN {
    return this.state.dueTimestamp;
  }

  /**
   * Gets the date at which this Loan is due.
   * @returns The due date.
   */
  get dueDate(): Date {
    return bnToDate(this.state.dueTimestamp);
  }

  /**
   * Gets the principal of the Loan.
   * @returns The principal amount.
   */
  get principal(): BN {
    if (this.loanType == LoanType.Simple) {
      return this.state.principalAmount;
    }

    return this.state.maxLtvAmount;
  }

  /**
   * Gets the repayment amount of the Loan, if it has been taken, in native token units.
   * @returns The principal amount.
   */
  get repaymentAmount(): BN {
    if (this.borrower.equals(PublicKey.default)) {
      return new BN(0);
    }
    return this.state.repaymentAmount;
  }

  /**
   * Gets the of the Loan that has been paid, if it has been taken, in native token units.
   * @returns The amount paid.
   */
  get paidAmount(): BN {
    if (this.borrower.equals(PublicKey.default)) {
      return new BN(0);
    }
    return this.state.paidAmount;
  }

  /**
   * Subscribes to state changes of this account.
   */
  subscribe(): void {
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
  async unsubscribe(): Promise<void> {
    await this.client.accounts.collectionLendingProfile.unsubscribe(
      this.address
    );
  }
}
