/* eslint-disable @typescript-eslint/no-unused-vars */
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { LendingClient } from '../client';
import { LoanState, OfferLoanArgs } from '../types/on-chain';
import { StateUpdateHandler } from '../types';
import {
  ASSOCIATED_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@project-serum/anchor/dist/cjs/utils/token';
import {
  deriveEscrowTokenAccount,
  deriveLoanAddress,
  deriveLoanEscrowAddress,
  deriveProfileVaultSignerAddress,
  deriveUserAccountAddress
} from '../utils/pda';
import { CollectionLendingProfile } from './collectionLendingProfile';
import { getAssociatedTokenAddress } from '@project-serum/associated-token';
import {
  findMasterEditionV2Pda,
  findMetadataPda,
  Metaplex,
  TransactionBuilderOptions
} from '@metaplex-foundation/js';

export class Loan {
  constructor(
    readonly client: LendingClient,
    readonly address: PublicKey,
    public state: LoanState,
    private _onStateUpdate?: StateUpdateHandler<LoanState>
  ) {
    this.subscribe();
  }

  static async create(
    client: LendingClient,
    collectionLendingProfile: CollectionLendingProfile,
    args: OfferLoanArgs,
    loanId = 0
  ) {
    const [loan, loanBump] = deriveLoanAddress(
      collectionLendingProfile.address,
      client.walletPubkey,
      loanId,
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

  static async loadAll(
    client: LendingClient,
    collectionLendingProfile?: PublicKey,
    _onStateUpdate?: StateUpdateHandler<LoanState>
  ): Promise<Loan[]> {
    const filters = [];
    if (collectionLendingProfile) {
      filters.push({
        offset: 16,
        bytes: collectionLendingProfile.toString()
      });
    }
    const loanAccounts = await client.accounts.loan.all(filters);
    const loans = [];

    for (const loanAccount of loanAccounts) {
      loans.push(
        new Loan(
          client,
          loanAccount.publicKey,
          loanAccount.account as LoanState
        )
      );
    }

    return loans;
  }

  static async load(
    client: LendingClient,
    address: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<LoanState>
  ) {
    const state = await client.accounts.collectionLendingProfile.fetchNullable(
      address
    );

    if (state === null) return null;

    return new Loan(client, address, state as LoanState, onStateUpdateHandler);
  }

  async takeLoan(
    metaplex: Metaplex,
    transactionBuilderOptions: TransactionBuilderOptions,
    collectionLendingProfile: CollectionLendingProfile,
    collateralMint: PublicKey
  ) {
    const { programs } = transactionBuilderOptions;
    const metadataProgramId = metaplex
      .programs()
      .getTokenMetadata(programs).address;
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
    const collateralMetadata = findMetadataPda(
      collateralMint,
      metadataProgramId
    );
    const collateralEdition = findMasterEditionV2Pda(
      collateralMint,
      metadataProgramId
    );
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

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  async repayLoan(
    metaplex: Metaplex,
    transactionBuilderOptions: TransactionBuilderOptions,
    collectionLendingProfile: CollectionLendingProfile,
    collateralMint: PublicKey
  ) {
    const { programs } = transactionBuilderOptions;
    const metadataProgramId = metaplex
      .programs()
      .getTokenMetadata(programs).address;
    const [escrow, escrowBump] = deriveLoanEscrowAddress(
      this.address,
      this.client.programId
    );
    const [vaultSigner, vaultSignerBump] = deriveProfileVaultSignerAddress(
      collectionLendingProfile.address,
      this.client.programId
    );
    const [userAccount, userAccountBump] = deriveUserAccountAddress(
      this.client.walletPubkey,
      this.client.programId
    );
    const collateralEdition = findMasterEditionV2Pda(
      collateralMint,
      metadataProgramId
    );
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
      .repayLoan(this.state.repaymentAmount)
      .accountsStrict({
        profile: collectionLendingProfile.address,
        loan: this.address,
        escrow,
        vaultSigner,
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
        metadataProgram: metadataProgramId
      })
      .instruction();

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  async forecloseLoan(
    metaplex: Metaplex,
    transactionBuilderOptions: TransactionBuilderOptions,
    collectionLendingProfile: CollectionLendingProfile,
    collateralMint: PublicKey
  ) {
    const { programs } = transactionBuilderOptions;
    const metadataProgramId = metaplex
      .programs()
      .getTokenMetadata(programs).address;
    const [escrow, escrowBump] = deriveLoanEscrowAddress(
      this.address,
      this.client.programId
    );
    const [userAccount, userAccountBump] = deriveUserAccountAddress(
      this.client.walletPubkey,
      this.client.programId
    );
    const collateralEdition = findMasterEditionV2Pda(
      collateralMint,
      metadataProgramId
    );
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

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

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
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .instruction();

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

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

  async unsubscribe() {
    await this.client.accounts.collectionLendingProfile.unsubscribe(
      this.address
    );
  }
}
