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
  deriveProfileVaultAddress,
  deriveProfileVaultSignerAddress
} from '../utils/pda';
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { getAssociatedTokenAddress } from '@project-serum/associated-token';

export class CollectionLendingProfile {
  constructor(
    readonly client: LendingClient,
    readonly address: PublicKey,
    public state: CollectionLendingProfileState,
    private _onStateUpdate?: StateUpdateHandler<CollectionLendingProfileState>
  ) {
    this.subscribe();
  }

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
    const [profileVault, profileVaultBump] = deriveProfileVaultAddress(
      profile,
      client.programId
    );
    const [vaultSigner, vaultSignerBump] = deriveProfileVaultSignerAddress(
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
        vaultSigner,
        authority: profileAuthority,
        payer: client.walletPubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY
      })
      .instruction();

    return {
      accounts: [profile, profileVault, vaultSigner],
      ixs: [ix],
      signers: []
    };
  }

  static async loadAll(
    client: LendingClient,
    _onStateUpdate?: StateUpdateHandler<CollectionLendingProfileState>
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
          _onStateUpdate
        )
      );
    }

    return loans;
  }

  static async load(
    client: LendingClient,
    address: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<CollectionLendingProfileState>
  ) {
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

  get tokenMint() {
    return this.state.tokenMint;
  }

  get tokenVault() {
    return this.state.tokenVault;
  }

  async getAssociatedTokenAddress(): Promise<PublicKey> {
    return getAssociatedTokenAddress(this.client.walletPubkey, this.tokenMint);
  }

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

  async unsubscribe() {
    await this.client.accounts.collectionLendingProfile.unsubscribe(
      this.address
    );
  }
}
