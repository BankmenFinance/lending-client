/* eslint-disable @typescript-eslint/no-unused-vars */
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { LendingClient } from '../client';
import {
  convertSecondsToTime,
  deriveCollectionLendingProfileAddress
} from '../utils';
import {
  CollectionLendingProfileState,
  CreateCollectionLendingProfileArgs,
  Status
} from '../types/on-chain';
import { StateUpdateHandler, TransactionAccounts } from '../types';
import {
  deriveProfileTokenVaultAddress,
  deriveProfileVaultAddress
} from '../utils/pda';
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import { getAssociatedTokenAddress } from '@project-serum/associated-token';
import BN from 'bn.js';
import { BASIS_POINTS_DIVISOR } from '../constants';
import { AccountVersion } from '../types/on-chain';
import {
  basisPointsToApr,
  getDurationAndUnitFromTime,
  convertAprToApy
} from '../utils/shared';

/**
 * Represents a Collection Lending Profile.
 *
 * This class exposes utility methods related to this on-chain account.
 */
export class CollectionLendingProfile {
  constructor(
    readonly client: LendingClient,
    readonly address: PublicKey,
    public state: CollectionLendingProfileState,
    private _onStateUpdate?: StateUpdateHandler<CollectionLendingProfileState>
  ) {
    this.subscribe();
  }

  /**
   * Derives program addresses and generates necessary intructions to create a new Collection Lending Profile.
   * @param client The Lending Client instance.
   * @param collectionMint The SPL Token Mint of the NFT Collection associated.
   * @param tokenMint The SPL Token Mint of the SPL Token used to issue loans.
   * @param profileAuthority The authority of the Collection Lending Profile.
   * @param args The arguments to create a Collection Lending Profile.
   * @returns The accounts, instructions and signers, if necessary.
   */
  static async create(
    client: LendingClient,
    collectionMint: PublicKey,
    tokenMint: PublicKey,
    profileAuthority: PublicKey,
    args: CreateCollectionLendingProfileArgs
  ): Promise<TransactionAccounts> {
    const [profile, profileBump] = deriveCollectionLendingProfileAddress(
      collectionMint,
      tokenMint,
      args.id.toNumber(),
      client.programId
    );
    const [profileVault, profileVaultBump] = deriveProfileTokenVaultAddress(
      profile,
      client.programId
    );
    const [vault, vaultBump] = deriveProfileVaultAddress(
      profile,
      client.programId
    );
    const ix = await client.methods
      .createCollectionLendingProfile(args)
      .accountsStrict({
        profile,
        collection: collectionMint,
        tokenMint,
        tokenVault: profileVault,
        vault,
        authority: profileAuthority,
        payer: client.walletPubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY
      })
      .instruction();

    return {
      accounts: [profile, profileVault, vault],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Loads all existing Collection Lending Profiles.
   * @param client The Lending Client instance.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve an array of Collection Lending Profiles.
   */
  static async loadAll(
    client: LendingClient,
    onStateUpdateHandler?: StateUpdateHandler<CollectionLendingProfileState>
  ): Promise<CollectionLendingProfile[]> {
    const lendingProfileAccounts =
      await client.accounts.collectionLendingProfile.all();
    const loans = [];

    for (const lendingProfileAccount of lendingProfileAccounts) {
      loans.push(
        new CollectionLendingProfile(
          client,
          lendingProfileAccount.publicKey,
          lendingProfileAccount.account as CollectionLendingProfileState,
          onStateUpdateHandler
        )
      );
    }

    return loans;
  }

  /**
   * Loads all existing Collection Lending Profiles.
   * @param client The Lending Client instance.
   * @param collectionMint The Collection Mint associated with the Collection Lending Profile, this is used as a filter.
   * @param tokenMint The Mint of the token used to lend in the Collection Lending Profile, this is used as a filter.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve an array of Collection Lending Profiles.
   */
  static async loadAllWithOptions(
    client: LendingClient,
    collectionMint?: PublicKey,
    tokenMint?: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<CollectionLendingProfileState>
  ): Promise<CollectionLendingProfile[]> {
    const filters = [];

    if (collectionMint) {
      filters.push({
        memcmp: {
          offset: 56,
          bytes: collectionMint.toString()
        }
      });
    }

    if (tokenMint) {
      filters.push({
        memcmp: {
          offset: 120,
          bytes: tokenMint.toString()
        }
      });
    }

    const lendingProfileAccounts =
      await client.accounts.collectionLendingProfile.all(filters);
    const loans = [];

    for (const lendingProfileAccount of lendingProfileAccounts) {
      loans.push(
        new CollectionLendingProfile(
          client,
          lendingProfileAccount.publicKey,
          lendingProfileAccount.account as CollectionLendingProfileState,
          onStateUpdateHandler
        )
      );
    }

    return loans;
  }

  /**
   * Loads the Collection Lending Profile with the given address.
   * @param client The Lending Client instance.
   * @param address The Collection Lending Profile address.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve an array of Collection Lending Profiles.
   */
  static async load(
    client: LendingClient,
    address: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<CollectionLendingProfileState>
  ): Promise<CollectionLendingProfile> {
    const state = await client.accounts.collectionLendingProfile.fetchNullable(
      address
    );

    if (state === null) return null;

    return new CollectionLendingProfile(
      client,
      address,
      state as CollectionLendingProfileState,
      onStateUpdateHandler
    );
  }

  /**
   * Sweeps the accumulated native fees from this Collection Lending Profile.
   * @param client The Lending Client instance.
   * @param feesDestination The destination of the fees accumulated.
   * @returns The accounts, instructions and signers, if necessary.
   */
  async sweepNativeFees(
    client: LendingClient,
    feesDestination: PublicKey
  ): Promise<TransactionAccounts> {
    const [vault, vaultBump] = deriveProfileVaultAddress(
      this.address,
      client.programId
    );
    const ix = await client.methods
      .sweepNativeFees()
      .accountsStrict({
        profile: this.address,
        vault,
        feesDestination,
        authority: this.state.authority,
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
   * Sweeps the accumulated token fees from this Collection Lending Profile.
   * @param client The Lending Client instance.
   * @param feesDestination The destination of the fees accumulated.
   * @returns The accounts, instructions and signers, if necessary.
   */
  async sweepTokenFees(
    client: LendingClient,
    feesDestination: PublicKey
  ): Promise<TransactionAccounts> {
    const [vault, vaultBump] = deriveProfileVaultAddress(
      this.address,
      client.programId
    );
    const destinationAssociatedTokenAccount = await getAssociatedTokenAddress(
      feesDestination,
      this.state.tokenMint
    );
    const ix = await client.methods
      .sweepTokenFees()
      .accountsStrict({
        profile: this.address,
        tokenMint: this.state.tokenMint,
        tokenVault: this.state.tokenVault,
        vault,
        feesDestination: destinationAssociatedTokenAccount,
        authority: this.state.authority,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .instruction();

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Sets the status on this Collection Lending Profile.
   * @param client The Lending Client instance.
   * @param status The new status.
   * @returns The accounts, instructions and signers, if necessary.
   */
  async setStatus(
    client: LendingClient,
    status: Status
  ): Promise<TransactionAccounts> {
    console.log(status);
    const ix = await client.methods
      .setCollectionLendingProfileStatus(status as never)
      .accountsStrict({
        profile: this.address,
        authority: this.state.authority
      })
      .instruction();

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Sets the status on this Collection Lending Profile.
   * @param client The Lending Client instance.
   * @param loanDuration The new loan duration.
   * @param interestRate The new interest rate, in basis points.
   * @param feeRate The new fee rate, in basis points.
   * @returns The accounts, instructions and signers, if necessary.
   */
  async setParams(
    client: LendingClient,
    loanDuration?: BN,
    interestRate?: BN,
    feeRate?: BN
  ): Promise<TransactionAccounts> {
    const ix = await client.methods
      .setCollectionLendingProfileParams(loanDuration, interestRate, feeRate)
      .accountsStrict({
        profile: this.address,
        authority: this.state.authority
      })
      .instruction();

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Enables LTV based loans on this Collection Lending Profile.
   * @param client The Lending Client instance.
   * @param floorPriceOracle The Floor Price Oracle
   * @returns The accounts, instructions and signers, if necessary.
   */
  async enableLtv(
    client: LendingClient,
    floorPriceOracle: PublicKey
  ): Promise<TransactionAccounts> {
    const ix = await client.methods
      .enableLtv()
      .accountsStrict({
        profile: this.address,
        authority: this.state.authority
      })
      .instruction();

    ix.keys.push({
      pubkey: floorPriceOracle,
      isSigner: false,
      isWritable: false
    });

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Disables LTV based loans on this Collection Lending Profile.
   * @param client The Lending Client instance.
   * @returns The accounts, instructions and signers, if necessary.
   */
  async disableLtv(client: LendingClient): Promise<TransactionAccounts> {
    const ix = await client.methods
      .disableLtv()
      .accountsStrict({
        profile: this.address,
        authority: this.state.authority
      })
      .instruction();

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Gets the account version of the Collection Lending Profile.
   * @returns The account version.
   */
  get accountVersion(): AccountVersion {
    return new AccountVersion(this.state.accountVersion);
  }

  /**
   * Gets the status of the Collection Lending Profile.
   * @returns The status.
   */
  get status(): Status {
    return new Status(this.state.status);
  }

  /**
   * Gets the Token Mint associated with this Collection Lending Profile.
   * @returns The Public Key of the SPL Token Mint.
   */
  get tokenMint(): PublicKey {
    return this.state.tokenMint;
  }

  /**
   * Gets the Token Vault associated with this Collection Lending Profile.
   * @returns The Public Key of the SPL Token Account.
   */
  get tokenVault(): PublicKey {
    return this.state.tokenVault;
  }

  /**
   * Gets the Token Mint of the Collection NFT associated with this Collection Lending Profile.
   * @returns The Public Key of the SPL Token Mint of the Collection NFT.
   */
  get collectionMint(): PublicKey {
    return this.state.collection;
  }

  /**
   * Gets the amount of fees that the Collection Lending Profile has accumulated.
   * @returns The amount of fees accumulated.
   */
  get feesAccumulated(): BN {
    return this.state.feesAccumulated;
  }

  /**
   * Gets the fee rate taken by the Collection Lending Profile, denominated in basis points.
   * @returns The fee rate.
   */
  get feeRateBps(): BN {
    return this.state.feeRate;
  }

  /**
   * Gets the fee rate taken by the Collection Lending Profile, denominated in basis points.
   * @returns The fee rate.
   */
  get feeRate(): number {
    return this.state.feeRate.div(BASIS_POINTS_DIVISOR).toNumber();
  }

  /**
   * Gets the interest rate offered by the Collection Lending Profile, denominated in basis points.
   * @returns The interest rate.
   */
  get interestRateBps(): BN {
    return this.state.interestRate;
  }

  /**
   * Gets the interest rate offered by the Collection Lending Profile, denominated in basis points.
   * @returns The interest rate.
   */
  get interestRateApy(): number {
    const timeDuration = convertSecondsToTime(
      this.state.loanDuration.toNumber()
    );
    const { duration, durationUnit } = getDurationAndUnitFromTime(timeDuration);
    const interestRateApr = basisPointsToApr(
      this.interestRateBps.toNumber(),
      duration,
      durationUnit
    );

    return convertAprToApy(interestRateApr, duration, durationUnit);
  }

  /**
   * Gets the duration of loans associated with this Collection Lending Profile.
   * @returns The duration in seconds.
   */
  get loanDurationSeconds(): BN {
    return this.state.loanDuration;
  }

  /**
   * Gets the duration of loans associated with this Collection Lending Profile.
   * @returns The duration of time, specified as 'weeks:days:hours:minutes:seconds'.
   */
  get loanDuration(): string {
    return convertSecondsToTime(this.state.loanDuration.toNumber());
  }

  /**
   * Gets the number of loans that the Collection Lending Profile has foreclosed.
   * @returns The number of loans foreclosed.
   */
  get loansForeclosed(): BN {
    return this.state.loansForeclosed;
  }

  /**
   * Gets the number of loans that the Collection Lending Profile has repaid.
   * @returns The number of loans repaid.
   */
  get loansRepaid(): BN {
    return this.state.loansRepaid;
  }

  /**
   * Gets the number of loans that the Collection Lending Profile has originated.
   * @returns The number of loans originated.
   */
  get loansOriginated(): BN {
    return this.state.loansOriginated;
  }

  /**
   * Gets the number of loans that the Collection Lending Profile has offered.
   * @returns The number of loans offered.
   */
  get loansOffered(): BN {
    return this.state.loansOffered;
  }

  /**
   * Gets the number of loans that the Collection Lending Profile has rescinded.
   * @returns The number of loans rescinded.
   */
  get loansRescinded(): BN {
    return this.state.loansRescinded;
  }

  /**
   * Gets the native token amount of the Collection Lending Profile's loan token that it's loans originated.
   * @returns The total token amount originated.
   */
  get loanAmountOriginated(): BN {
    return this.state.loanAmountOriginated;
  }

  /**
   * Gets the native token amount of the Collection Lending Profile's loan token that has been repaid.
   * @returns The total token amount repaid.
   */
  get loanAmountRepaid(): BN {
    return this.state.loanAmountRepaid;
  }

  /**
   * Gets the Associated Token Address for the SPL Token Mint of this Collection Lending Profile.
   * @returns The Public Key of the SPL Token Account.
   */
  async getAssociatedTokenAddress(): Promise<PublicKey> {
    return getAssociatedTokenAddress(this.client.walletPubkey, this.tokenMint);
  }

  /**
   * Subscribes to state changes of this account.
   */
  subscribe(): void {
    this.client.accounts.collectionLendingProfile
      .subscribe(this.address)
      .on('change', (state: CollectionLendingProfileState) => {
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
