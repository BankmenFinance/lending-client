/* eslint-disable @typescript-eslint/no-unused-vars */
import { PublicKey } from '@solana/web3.js';
import { LendingClient } from '../client';
import { UserAccountState } from '../types/on-chain';
import { StateUpdateHandler } from '../types';
import { BN } from '@coral-xyz/anchor';

/**
 * Represents a User.
 *
 * This class exposes utility methods related to this on-chain account.
 */
export class User {
  constructor(
    readonly client: LendingClient,
    readonly address: PublicKey,
    public state: UserAccountState,
    private _onStateUpdate?: StateUpdateHandler<UserAccountState>
  ) {
    this.subscribe();
  }

  /**
   * Loads all existing Users.
   * @param client The Lending Client instance.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve an array of Users.
   */
  static async loadAll(
    client: LendingClient,
    onStateUpdateHandler?: StateUpdateHandler<UserAccountState>
  ): Promise<User[]> {
    const userAccounts = await client.accounts.user.all();
    const users = [];

    for (const userAccount of userAccounts) {
      users.push(
        new User(
          client,
          userAccount.publicKey,
          userAccount.account as UserAccountState,
          onStateUpdateHandler
        )
      );
    }

    return users;
  }

  /**
   * Loads the User with the given address.
   * @param client The Lending Client instance.
   * @param address The address of the User to load.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve a User.
   */
  static async load(
    client: LendingClient,
    address: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<UserAccountState>
  ): Promise<User> {
    const state = await client.accounts.user.fetchNullable(address);

    if (state === null) return null;

    return new User(
      client,
      address,
      state as UserAccountState,
      onStateUpdateHandler
    );
  }

  /**
   * Gets the authority of this User Account.
   * @returns The Public Key of the authority.
   */
  get authority(): PublicKey {
    return this.state.authority;
  }

  /**
   * Gets the number of loans that the User has foreclosed.
   * @returns The number of loans foreclosed.
   */
  get loansForeclosed(): BN {
    return this.state.loansForeclosed;
  }

  /**
   * Gets the number of loans that the User has repaid.
   * @returns The number of loans repaid.
   */
  get loansRepaid(): BN {
    return this.state.loansRepaid;
  }

  /**
   * Gets the number of loans that the User has taken.
   * @returns The number of loans taken.
   */
  get loansTaken(): BN {
    return this.state.loansTaken;
  }

  /**
   * Gets the number of loans that the User has offered.
   * @returns The number of loans offered.
   */
  get loansOffered(): BN {
    return this.state.loansOffered;
  }

  /**
   * Gets the number of loans that the User has rescinded.
   * @returns The number of loans rescinded.
   */
  get loansRescinded(): BN {
    return this.state.loansRescinded;
  }

  /**
   * Subscribes to state changes of this account.
   */
  subscribe(): void {
    this.client.accounts.collectionLendingProfile
      .subscribe(this.address)
      .on('change', (state: UserAccountState) => {
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
