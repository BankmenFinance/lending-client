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
type _Status = TypeDef<Lending['types'][2], Lending>;
type _TokenStandard = TypeDef<Lending['types'][3], Lending>;
type _LoanType = TypeDef<Lending['types'][4], Lending>;
type _AccountVersion = TypeDef<Lending['types'][5], Lending>;

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
  status: _Status;
  accountVersion: _AccountVersion;
}

export interface LoanState extends _LoanState {
  loanType: _LoanType;
  accountVersion: _AccountVersion;
  tokenStandard: _TokenStandard;
}

export class Status extends Object {
  static readonly Active = { active: {} };
  static readonly Suspended = { suspended: {} };

  constructor(readonly inner: _Status) {
    super(inner);
  }

  public override toString = (): string => {
    if (this.inner.active) {
      return 'Active';
    } else if (this.inner.suspended) {
      return 'Suspended';
    }
  };

  public equals = (object: object): boolean => {
    const status = object as _Status;
    return (
      status.active == this.inner.active ||
      status.suspended == this.inner.suspended
    );
  };
}

export class LoanType extends Object {
  static readonly Simple = { simple: {} };
  static readonly LoanToValue = { loanToValue: {} };

  constructor(readonly inner: _LoanType) {
    super(inner);
  }

  public override toString = (): string => {
    if (this.inner.simple) {
      return 'Simple';
    } else if (this.inner.loanToValue) {
      return 'LTV';
    }
  };

  public equals = (object: object): boolean => {
    const loanType = object as _LoanType;
    const eq =
      loanType.simple === this.inner.simple ||
      loanType.loanToValue == this.inner.loanToValue;
    return eq;
  };
}

export class TokenStandard extends Object {
  static readonly Legacy = { legacy: {} };
  static readonly Programmable = { programmable: {} };
  static readonly ProgrammableWithRuleSet = { programmableWithRuleSet: {} };

  constructor(readonly inner: _TokenStandard) {
    super(inner);
  }

  public override toString = (): string => {
    if (this.inner.legacy) {
      return 'Legacy';
    } else if (this.inner.programmable) {
      return 'Programmable';
    } else if (this.inner.programmableWithRuleSet) {
      return 'Programmable With Rule Set';
    }
  };

  public equals = (object: object): boolean => {
    const tokenStandard = object as _TokenStandard;
    return (
      tokenStandard.legacy == this.inner.legacy ||
      tokenStandard.programmable == this.inner.programmable ||
      tokenStandard.programmableWithRuleSet ==
        this.inner.programmableWithRuleSet
    );
  };
}

export class AccountVersion extends Object {
  static readonly Base = { base: {} };

  constructor(readonly inner: _AccountVersion) {
    super(inner);
  }

  public override toString = (): string => {
    if (this.inner.base) {
      return 'Base';
    }
  };

  public equals = (object: object): boolean => {
    return (object as _AccountVersion).base == this.inner.base;
  };
}
