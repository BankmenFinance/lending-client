/* eslint-disable @typescript-eslint/no-unused-vars */
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { LendingClient } from '../client';
import { deriveCollectionLendingProfileAddress } from '../utils';
import {
  CollectionLendingProfileState,
  CreateCollectionLendingProfileArgs
} from '../types/on-chain';
import { StateUpdateHandler } from '../types';
import {
  deriveProfileTokenVaultAddress,
  deriveProfileVaultAddress
} from '../utils/pda';
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { getAssociatedTokenAddress } from '@project-serum/associated-token';

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
    args: CreateCollectionLendingProfileArgs,
    profileId = 0
  ) {
    const [profile, profileBump] = deriveCollectionLendingProfileAddress(
      collectionMint,
      tokenMint,
      profileId,
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
   * Gets the SPL Token Mint associated with this Collection Lending Profile.
   * @returns The Public Key of the SPL Token Mint.
   */
  get tokenMint() {
    return this.state.tokenMint;
  }

  /**
   * Gets the SPL Token Vault associated with this Collection Lending Profile.
   * @returns The Public Key of the SPL Token Account.
   */
  get tokenVault() {
    return this.state.tokenVault;
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
  subscribe() {
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
  async unsubscribe() {
    await this.client.accounts.collectionLendingProfile.unsubscribe(
      this.address
    );
  }
}
