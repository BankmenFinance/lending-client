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
  deriveLoanEscrowAddress
} from '../utils/pda';
import { CollectionLendingProfile } from './collectionLendingProfile';

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

  //   async takeLoan(

  //   ) {

  //   }

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
