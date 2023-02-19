import { Event } from '@project-serum/anchor';
import { TypeDef } from '@project-serum/anchor/dist/cjs/program/namespace/types';
import type { Lending } from '../generated/types/lending';

type _CollectionLendingProfile = TypeDef<Lending['accounts'][0], Lending>;
export type LoanState = TypeDef<Lending['accounts'][1], Lending>;
export type UserAccount = TypeDef<Lending['accounts'][2], Lending>;

export type CreateCollectionLendingProfileArgs = TypeDef<
  Lending['types'][0],
  Lending
>;
export type OfferLoanArgs = TypeDef<Lending['types'][1], Lending>;
export type Status = TypeDef<Lending['types'][2], Lending>;

export type CollectionLendingProfileCreated = Event<
  Lending['events'][0],
  Lending
>;
export type CollectionLendingProfileClosed = Event<
  Lending['events'][1],
  Lending
>;
export type LoanOfferCreated = Event<Lending['events'][2], Lending>;
export type LoanOfferCanceled = Event<Lending['events'][3], Lending>;
export type LoanOrigination = Event<Lending['events'][4], Lending>;
export type LoanRepayment = Event<Lending['events'][5], Lending>;
export type LoanForeclosed = Event<Lending['events'][6], Lending>;

export interface CollectionLendingProfileState
  extends _CollectionLendingProfile {
  status: Status;
}
