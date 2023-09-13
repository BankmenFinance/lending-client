use anchor_lang::prelude::*;

anchor_gen::generate_cpi_interface!(idl_path = "idl.json");

#[cfg(feature = "mainnet-beta")]
declare_id!("BMfi6hbCSpTS962EZjwaa6bRvy2izUCmZrpBMuhJ1BUW");
#[cfg(not(feature = "mainnet-beta"))]
declare_id!("2Kdt8uMA6m5stQqaTxVPac45j6uKbwCg5vaPtyqwLk5C");
