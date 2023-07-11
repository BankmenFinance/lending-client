import {
  Transaction,
  TransactionInstruction,
  Signer,
  ConfirmOptions,
  Connection
} from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { CONFIGS } from '../constants';
import lendingIdl from '../generated/idl/lending.json';
import type { Lending } from '../generated/types/lending';
import type { Cluster, Wallet } from '../types';

/**
 * This Lending Client exposes utility methods to facilitate transaction submission.
 */
export class LendingClient {
  private _program: Program<Lending>;

  constructor(
    readonly cluster: Cluster,
    rpcEndpoint: string,
    wallet?: Wallet,
    confirmOpts = AnchorProvider.defaultOptions()
  ) {
    const provider = {
      connection: new Connection(rpcEndpoint, confirmOpts.commitment)
    };
    this._program = new Program<Lending>(
      lendingIdl as Lending,
      CONFIGS[this.cluster].PROGRAM_ID,
      provider
    );
    if (wallet) {
      this.connectWallet(wallet, confirmOpts);
    }
  }

  connectWallet(wallet: Wallet, confirmOpts = AnchorProvider.defaultOptions()) {
    const provider = new AnchorProvider(this.connection, wallet, confirmOpts);
    this._program = new Program<Lending>(
      lendingIdl as Lending,
      CONFIGS[this.cluster].PROGRAM_ID,
      provider
    );
  }

  private get _provider() {
    return this._program.provider;
  }

  get anchorProvider() {
    const provider = this._program.provider as AnchorProvider;
    if (provider.wallet) {
      return provider;
    }
  }

  get connection() {
    return this._provider.connection;
  }

  get methods() {
    return this._program.methods;
  }

  get accounts() {
    return this._program.account;
  }

  get isWalletConnected() {
    return !!this.anchorProvider;
  }

  get walletPubkey() {
    return this.anchorProvider?.wallet.publicKey;
  }

  get programId() {
    return CONFIGS[this.cluster].PROGRAM_ID;
  }

  addEventListener(
    eventName: string,
    // eslint-disable-next-line
    callback: (event: any, slot: number) => void
  ) {
    return this._program.addEventListener(eventName, callback);
  }

  async removeEventListener(listener: number) {
    return await this._program.removeEventListener(listener);
  }

  async sendAndConfirm(
    tx: Transaction,
    signers?: Signer[],
    opts?: ConfirmOptions
  ) {
    return this.anchorProvider?.sendAndConfirm(tx, signers, opts);
  }

  async sendAndConfirmIxs(
    ixs: TransactionInstruction[],
    signers?: Signer[],
    opts?: ConfirmOptions
  ) {
    const tx = new Transaction();
    tx.add(...ixs);
    return this.sendAndConfirm(tx, signers, opts);
  }
}
