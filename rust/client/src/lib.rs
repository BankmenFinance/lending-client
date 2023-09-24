use std::str::from_utf8;

use anchor_lang::prelude::*;

anchor_gen::generate_cpi_interface!(idl_path = "idl.json");

#[cfg(feature = "mainnet-beta")]
declare_id!("BMfi6hbCSpTS962EZjwaa6bRvy2izUCmZrpBMuhJ1BUW");
#[cfg(not(feature = "mainnet-beta"))]
declare_id!("2Kdt8uMA6m5stQqaTxVPac45j6uKbwCg5vaPtyqwLk5C");

impl PartialEq for LoanType {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (LoanType::Simple, LoanType::Simple) => true,
            (LoanType::Simple, LoanType::LoanToValue) => false,
            (LoanType::LoanToValue, LoanType::Simple) => false,
            (LoanType::LoanToValue, LoanType::LoanToValue) => true,
        }
    }

    fn ne(&self, other: &Self) -> bool {
        match (self, other) {
            (LoanType::Simple, LoanType::Simple) => false,
            (LoanType::Simple, LoanType::LoanToValue) => true,
            (LoanType::LoanToValue, LoanType::Simple) => true,
            (LoanType::LoanToValue, LoanType::LoanToValue) => false,
        }
    }
}

impl std::fmt::Debug for CollectionLendingProfileCreated {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CollectionLendingProfileCreated")
            .field("profile", &self.profile)
            .field("collection", &self.collection)
            .field(
                "collection_name",
                &from_utf8(&self.collection_name)
                    .unwrap()
                    .trim_matches(char::from(0)),
            )
            .field("id", &self.id)
            .field("loan_token_mint", &self.loan_token_mint)
            .field("fee_rate", &self.fee_rate)
            .field("interest_rate", &self.interest_rate)
            .field("loan_duration", &self.loan_duration)
            .finish()
    }
}

impl std::fmt::Debug for CollectionLendingProfileParamsChange {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CollectionLendingProfileParamsChange")
            .field("profile", &self.profile)
            .field("fee_rate", &self.fee_rate)
            .field("interest_rate", &self.interest_rate)
            .field("loan_duration", &self.loan_duration)
            .finish()
    }
}

impl std::fmt::Debug for CollectionLendingProfileLtvEnabled {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CollectionLendingProfileLtvEnabled")
            .field("profile", &self.profile)
            .field("oracle", &self.oracle)
            .finish()
    }
}

impl std::fmt::Debug for CollectionLendingProfileLtvDisabled {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CollectionLendingProfileLtvDisabled")
            .field("profile", &self.profile)
            .finish()
    }
}

impl std::fmt::Debug for CollectionLendingProfileClosed {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CollectionLendingProfileClosed")
            .field("profile", &self.profile)
            .field("collection", &self.collection)
            .finish()
    }
}

impl std::fmt::Debug for CollectionLendingProfileStatusChange {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CollectionLendingProfileStatusChange")
            .field("profile", &self.profile)
            .field("status", &self.status)
            .finish()
    }
}

impl std::fmt::Debug for LoanOfferCreated {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("LoanOfferCreated")
            .field("profile", &self.profile)
            .field("loan", &self.loan)
            .field("loan_mint", &self.loan_mint)
            .field("lender", &self.lender)
            .field("lender_account", &self.lender_account)
            .field("amount", &self.amount)
            .finish()
    }
}

impl std::fmt::Debug for LoanOfferCanceled {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("LoanOfferCanceled")
            .field("profile", &self.profile)
            .field("loan", &self.loan)
            .field("lender", &self.lender)
            .finish()
    }
}

impl std::fmt::Debug for LoanOrigination {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("LoanOrigination")
            .field("profile", &self.profile)
            .field("loan", &self.loan)
            .field("lender", &self.lender)
            .field("borrower", &self.borrower)
            .field("borrower_account", &self.borrower_account)
            .field("loan_amount", &self.loan_amount)
            .field("repayment_amount", &self.repayment_amount)
            .field("due_timestamp", &self.due_timestamp)
            .finish()
    }
}

impl std::fmt::Debug for LoanRepayment {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("LoanRepayment")
            .field("profile", &self.profile)
            .field("loan", &self.loan)
            .field("lender", &self.lender)
            .field("borrower", &self.borrower)
            .field("paid_amount", &self.paid_amount)
            .field("amount_left", &self.amount_left)
            .finish()
    }
}

impl std::fmt::Debug for LoanForeclosed {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("LoanForeclosed")
            .field("profile", &self.profile)
            .field("loan", &self.loan)
            .field("lender", &self.lender)
            .field("borrower", &self.borrower)
            .field("paid_amount", &self.paid_amount)
            .field("amount_left", &self.amount_left)
            .field("timestamp", &self.timestamp)
            .finish()
    }
}
