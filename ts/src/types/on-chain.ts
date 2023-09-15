import { Event } from '@coral-xyz/anchor';
import { TypeDef } from '@coral-xyz/anchor/dist/cjs/program/namespace/types';
import type { Lending } from '../generated/types/lending';

type _CollectionLendingProfile = TypeDef<Lending['accounts'][0], Lending>;
type _LoanState = TypeDef<Lending['accounts'][1], Lending>;
export type UserAccountState = TypeDef<Lending['accounts'][2], Lending>;

export type CreateCollectionLendingProfileArgs = TypeDef<
  Lending['types'][0],
  Lending
>;
export type OfferLoanArgs = TypeDef<Lending['types'][1], Lending>;

export type CollectionLendingProfileCreated = Event<
  Lending['events'][0],
  Lending
>;
export type CollectionLendingProfileClosed = Event<
  Lending['events'][1],
  Lending
>;
export type CollectionLendingProfileLtvEnabled = Event<
  Lending['events'][2],
  Lending
>;
export type CollectionLendingProfileLtvDisabled = Event<
  Lending['events'][3],
  Lending
>;
export type CollectionLendingProfileStatusChange = Event<
  Lending['events'][4],
  Lending
>;
export type CollectionLendingProfileParamsChange = Event<
  Lending['events'][5],
  Lending
>;
export type LoanOfferCreated = Event<Lending['events'][6], Lending>;
export type LoanOfferCanceled = Event<Lending['events'][7], Lending>;
export type LoanOrigination = Event<Lending['events'][8], Lending>;
export type LoanRepayment = Event<Lending['events'][9], Lending>;
export type LoanForeclosed = Event<Lending['events'][10], Lending>;

export interface CollectionLendingProfileState
  extends _CollectionLendingProfile {
  status: Status;
}

export interface LoanState extends _LoanState {
  loanType: LoanType;
  accountVersion: AccountVersion;
  tokenStandard: TokenStandard;
}

export class Status {
  static readonly Active = { active: {} };
  static readonly Suspended = { suspended: {} };

  public toString = (): string => {
    if ((this as Status) == Status.Active) {
      return 'Active';
    } else if ((this as Status) == Status.Suspended) {
      return 'Suspended';
    }
  };
}

export class LoanType {
  static readonly Simple = { simple: {} };
  static readonly LoanToValue = { loanToValue: {} };

  public toString = (): string => {
    if ((this as LoanType) == LoanType.Simple) {
      return 'Simple';
    } else if ((this as LoanType) == LoanType.LoanToValue) {
      return 'LTV';
    }
  };
}

export class TokenStandard {
  static readonly Legacy = { legacy: {} };
  static readonly Programmable = { programmable: {} };
  static readonly ProgrammableWithRuleSet = { programmableWithRuleSet: {} };

  public toString = (): string => {
    if ((this as TokenStandard) == TokenStandard.Legacy) {
      return 'Legacy';
    } else if ((this as TokenStandard) == TokenStandard.Programmable) {
      return 'Programmable';
    } else if (
      (this as TokenStandard) == TokenStandard.ProgrammableWithRuleSet
    ) {
      return 'Programmable With Rule Set';
    }
  };
}

export class AccountVersion {
  static readonly Base = { base: {} };
}
