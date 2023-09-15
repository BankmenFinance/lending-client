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
