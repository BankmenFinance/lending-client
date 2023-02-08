export type Lending = {
  version: '0.1.0';
  name: 'lending';
  instructions: [
    {
      name: 'createCollectionLendingProfile';
      docs: ['Creates a [`CollectionLendingProfile`].'];
      accounts: [
        {
          name: 'profile';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collection';
          isMut: false;
          isSigner: false;
          docs: ['The Metaplex Collection mint.'];
        },
        {
          name: 'tokenMint';
          isMut: false;
          isSigner: false;
          docs: ['The mint of the token used by this book to issue loans.'];
        },
        {
          name: 'tokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vaultSigner';
          isMut: false;
          isSigner: false;
          docs: ['The token vault signer.'];
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
          docs: ['The authority of the [`CollectionLendingProfile`]'];
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
          docs: [
            'The payer of the rent necessary to initialize all the accounts in this context.'
          ];
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
          docs: ['The System Program.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Token Program.'];
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
          docs: ['The Rent Sysvar.'];
        }
      ];
      args: [
        {
          name: 'args';
          type: {
            defined: 'CreateCollectionLendingProfileArgs';
          };
        }
      ];
    },
    {
      name: 'closeCollectionLendingProfile';
      docs: ['Closes a [`CollectionLendingProfile`]'];
      accounts: [
        {
          name: 'profile';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vaultSigner';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'rentDestination';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'setCollectionLendingProfileStatus';
      docs: ['Sets the [Status] of a [`CollectionLendingProfile`]'];
      accounts: [
        {
          name: 'profile';
          isMut: true;
          isSigner: false;
          docs: ['The book of loans for a given collection.'];
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
          docs: ['The authority of the [`CollectionLendingProfile`].'];
        }
      ];
      args: [
        {
          name: 'status';
          type: {
            defined: 'Status';
          };
        }
      ];
    },
    {
      name: 'offerLoan';
      docs: [
        'Creates a [`Loan`] offer and adds it to the corresponding [`CollectionLendingProfile`].'
      ];
      accounts: [
        {
          name: 'profile';
          isMut: true;
          isSigner: false;
          docs: ['The book of loans for a given collection.'];
        },
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
          docs: ['The loan offered by the lender.'];
        },
        {
          name: 'loanMint';
          isMut: false;
          isSigner: false;
          docs: ['The token mint of the asset being lent.'];
        },
        {
          name: 'escrow';
          isMut: false;
          isSigner: false;
          docs: ['The escrow.'];
        },
        {
          name: 'escrowTokenAccount';
          isMut: true;
          isSigner: false;
          docs: ["The escrow's token account."];
        },
        {
          name: 'lenderTokenAccount';
          isMut: true;
          isSigner: false;
          docs: ["The lender's token account."];
        },
        {
          name: 'lender';
          isMut: true;
          isSigner: true;
          docs: ["The lender's wallet."];
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
          docs: ['The System Program.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Token Program.'];
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Associated Token Program.'];
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
          docs: ['The Rent Sysvar.'];
        }
      ];
      args: [
        {
          name: 'args';
          type: {
            defined: 'OfferLoanArgs';
          };
        }
      ];
    },
    {
      name: 'rescindLoan';
      docs: [
        'Rescinds a [`Loan`] offer and removes it from the corresponding [`CollectionLendingProfile`].'
      ];
      accounts: [
        {
          name: 'profile';
          isMut: true;
          isSigner: false;
          docs: ['The book of loans for a given collection.'];
        },
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
          docs: ['The loan offered by the lender'];
        },
        {
          name: 'loanMint';
          isMut: false;
          isSigner: false;
          docs: ['The token mint of the asset being lent.'];
        },
        {
          name: 'escrow';
          isMut: false;
          isSigner: false;
          docs: ['The escrow.'];
        },
        {
          name: 'escrowTokenAccount';
          isMut: true;
          isSigner: false;
          docs: ["The escrow's token account."];
        },
        {
          name: 'lenderTokenAccount';
          isMut: true;
          isSigner: false;
          docs: ["The lender's token account."];
        },
        {
          name: 'lender';
          isMut: false;
          isSigner: true;
          docs: ["The lender's wallet."];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Token Program.'];
        }
      ];
      args: [];
    },
    {
      name: 'repayLoan';
      docs: ['Repays a [`Loan`] and closes it.'];
      accounts: [
        {
          name: 'profile';
          isMut: true;
          isSigner: false;
          docs: ['The book of loans for a given collection.'];
        },
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
          docs: ['The loan offered by the lender.'];
        },
        {
          name: 'escrow';
          isMut: false;
          isSigner: false;
          docs: ['The escrow.'];
        },
        {
          name: 'vaultSigner';
          isMut: false;
          isSigner: false;
          docs: ['The escrow.'];
        },
        {
          name: 'tokenManager';
          isMut: true;
          isSigner: false;
          docs: ['The Cardinal Token Manager.'];
        },
        {
          name: 'loanMint';
          isMut: false;
          isSigner: false;
          docs: ['The loan token mint.'];
        },
        {
          name: 'collateralMint';
          isMut: false;
          isSigner: false;
          docs: ['The collateral token mint.'];
        },
        {
          name: 'tokenVault';
          isMut: true;
          isSigner: false;
          docs: ['The fee token vault.'];
        },
        {
          name: 'borrowerTokenAccount';
          isMut: true;
          isSigner: false;
          docs: ["The escrow's loan token account."];
        },
        {
          name: 'escrowCollateralAccount';
          isMut: true;
          isSigner: false;
          docs: ["The escrow's collateral account."];
        },
        {
          name: 'borrowerCollateralAccount';
          isMut: true;
          isSigner: false;
          docs: ["The borrower's collateral account."];
        },
        {
          name: 'tokenManagerCollateralAccount';
          isMut: true;
          isSigner: false;
          docs: ["The token manager's collateral account."];
        },
        {
          name: 'lender';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lenderTokenAccount';
          isMut: true;
          isSigner: false;
          docs: ["The lender's token account."];
        },
        {
          name: 'borrower';
          isMut: true;
          isSigner: true;
          docs: ['The wallet address of the borrower.'];
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
          docs: ['The System Program.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Token Program.'];
        },
        {
          name: 'tokenManagerProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Cardinal Token Manager Program.'];
        },
        {
          name: 'metadataProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Metaplex Token Metadata Program.'];
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'takeLoan';
      docs: [
        "Takes a [`Loan`] and pledges a token that is part of a collection as it's collateral."
      ];
      accounts: [
        {
          name: 'profile';
          isMut: true;
          isSigner: false;
          docs: ['The book of loans for a given collection.'];
        },
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
          docs: ['The loan offered by the lender.'];
        },
        {
          name: 'tokenManager';
          isMut: true;
          isSigner: false;
          docs: ['The Cardinal Token Manager.'];
        },
        {
          name: 'mintCounter';
          isMut: true;
          isSigner: false;
          docs: ['The Cardinal Mint Counter.'];
        },
        {
          name: 'loanMint';
          isMut: false;
          isSigner: false;
          docs: ['The loan token mint.'];
        },
        {
          name: 'collateralMint';
          isMut: false;
          isSigner: false;
          docs: ['The collateral token mint.'];
        },
        {
          name: 'collateralMetadata';
          isMut: false;
          isSigner: false;
          docs: ['The collateral metadata account.'];
        },
        {
          name: 'escrow';
          isMut: false;
          isSigner: false;
          docs: ['The escrow.'];
        },
        {
          name: 'escrowTokenAccount';
          isMut: true;
          isSigner: false;
          docs: ["The escrow's token account."];
        },
        {
          name: 'escrowCollateralAccount';
          isMut: true;
          isSigner: false;
          docs: ["The escrow's collateral account."];
        },
        {
          name: 'borrowerTokenAccount';
          isMut: true;
          isSigner: false;
          docs: ["The borrower's token account."];
        },
        {
          name: 'borrowerCollateralAccount';
          isMut: true;
          isSigner: false;
          docs: ["The borrower's collateral account."];
        },
        {
          name: 'tokenManagerCollateralAccount';
          isMut: true;
          isSigner: false;
          docs: ["The token manager's collateral account."];
        },
        {
          name: 'borrower';
          isMut: true;
          isSigner: true;
          docs: ['The wallet address of the borrower.'];
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
          docs: ['The System Program.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Token Program.'];
        },
        {
          name: 'tokenManagerProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Cardinal Token Manager Program.'];
        },
        {
          name: 'metadataProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Metaplex Token Metadata Program.'];
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
          docs: ['The Rent Sysvar.'];
        }
      ];
      args: [];
    },
    {
      name: 'forecloseLoan';
      docs: ["Forecloses a [`Loan`] and claims it's collateral."];
      accounts: [
        {
          name: 'profile';
          isMut: true;
          isSigner: false;
          docs: ['The book of loans for a given collection.'];
        },
        {
          name: 'loan';
          isMut: true;
          isSigner: false;
          docs: ['The loan offered by the lender.'];
        },
        {
          name: 'tokenManager';
          isMut: true;
          isSigner: false;
          docs: ['The Cardinal Token Manager.'];
        },
        {
          name: 'collateralMint';
          isMut: false;
          isSigner: false;
          docs: ['The collateral token mint.'];
        },
        {
          name: 'escrow';
          isMut: false;
          isSigner: false;
          docs: ['The escrow.'];
        },
        {
          name: 'escrowCollateralAccount';
          isMut: true;
          isSigner: false;
          docs: ["The escrow's collateral account."];
        },
        {
          name: 'lenderCollateralAccount';
          isMut: true;
          isSigner: false;
          docs: ["The lender's collateral account."];
        },
        {
          name: 'borrowerCollateralAccount';
          isMut: true;
          isSigner: false;
          docs: ["The borrower's collateral account."];
        },
        {
          name: 'tokenManagerCollateralAccount';
          isMut: true;
          isSigner: false;
          docs: ["The token manager's collateral account."];
        },
        {
          name: 'lender';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'borrower';
          isMut: true;
          isSigner: true;
          docs: ['The wallet address of the borrower.'];
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
          docs: ['The System Program.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Token Program.'];
        },
        {
          name: 'tokenManagerProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Cardinal Token Manager Program.'];
        },
        {
          name: 'metadataProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Metaplex Token Metadata Program.'];
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: 'collectionLendingProfile';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'status';
            docs: ['The status of the book.'];
            type: {
              defined: 'Status';
            };
          },
          {
            name: 'vaultSignerBump';
            docs: ['The bump of the vault signer PDA.'];
            type: 'u8';
          },
          {
            name: 'padding';
            type: {
              array: ['u8', 14];
            };
          },
          {
            name: 'authority';
            docs: [
              'The authority of this book.',
              'This authority is allowed to change the status of the book and closing it.'
            ];
            type: 'publicKey';
          },
          {
            name: 'collection';
            docs: ['The Metaplex Collection account.'];
            type: 'publicKey';
          },
          {
            name: 'tokenMint';
            docs: [
              'The mint of the token used to originate loans in using this book'
            ];
            type: 'publicKey';
          },
          {
            name: 'tokenVault';
            docs: ['The token vault, where fees are sent to.'];
            type: 'publicKey';
          },
          {
            name: 'vaultSigner';
            docs: ["The vault's signer."];
            type: 'publicKey';
          },
          {
            name: 'loanAmountOriginated';
            docs: ['The total loan principal amount originated.'];
            type: 'u128';
          },
          {
            name: 'loanAmountRepaid';
            docs: ['The total loan principal amount repaid.'];
            type: 'u128';
          },
          {
            name: 'feeRate';
            docs: ['The fee rate in bps.'];
            type: 'u64';
          },
          {
            name: 'interestRate';
            docs: ['The interest rate in bps.'];
            type: 'u64';
          },
          {
            name: 'loanDuration';
            docs: ['The duration of the loans.'];
            type: 'u64';
          },
          {
            name: 'padding2';
            type: {
              array: ['u8', 8];
            };
          },
          {
            name: 'loansOriginated';
            docs: ['The amount of loans that have been originated.'];
            type: 'u64';
          },
          {
            name: 'loansRepaid';
            docs: ['The amount of loans that have been repaid.'];
            type: 'u64';
          },
          {
            name: 'loansForeclosed';
            docs: ['The amount of loans that have been foreclosed.'];
            type: 'u64';
          },
          {
            name: 'loansRescinded';
            docs: ['The amount of loans that have been rescinded.'];
            type: 'u64';
          },
          {
            name: 'outstandingLoans';
            docs: ['The amount of loans that are currently outstanding.'];
            type: 'u64';
          },
          {
            name: 'loansOffered';
            docs: ['The amount of loans that have been offered.'];
            type: 'u64';
          },
          {
            name: 'feesAccumulated';
            docs: ['The amount of fees accumulated from this book.'];
            type: 'u64';
          },
          {
            name: 'id';
            docs: ['the id of this profile //'];
            type: 'u64';
          }
        ];
      };
    },
    {
      name: 'loan';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'escrowBumpSeed';
            docs: ['The bump of the escrow account.'];
            type: 'u8';
          },
          {
            name: 'padding';
            type: {
              array: ['u8', 15];
            };
          },
          {
            name: 'profile';
            docs: ['The [`CollectionLendingProfile`] this loan belongs to.'];
            type: 'publicKey';
          },
          {
            name: 'lender';
            docs: ['The lender of this [`CollectionLendingProfile`].'];
            type: 'publicKey';
          },
          {
            name: 'loanMint';
            docs: [
              'The mint of the token used to provide loans associated with this [`CollectionLendingProfile`].'
            ];
            type: 'publicKey';
          },
          {
            name: 'borrower';
            docs: ['The borrower.'];
            type: 'publicKey';
          },
          {
            name: 'dueTimestamp';
            docs: ['The timestamp at which the repayment amount is due.'];
            type: 'u64';
          },
          {
            name: 'principalAmount';
            docs: ["The loan's principal amount."];
            type: 'u64';
          },
          {
            name: 'repaymentAmount';
            docs: ["The loan's repayment amount."];
            type: 'u64';
          },
          {
            name: 'paidAmount';
            docs: ['The amount of the loan that has been paid.'];
            type: 'u64';
          },
          {
            name: 'id';
            type: 'u64';
          }
        ];
      };
    }
  ];
  types: [
    {
      name: 'CreateCollectionLendingProfileArgs';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'collectionName';
            docs: ['The name of the collection.'];
            type: {
              array: ['u8', 32];
            };
          },
          {
            name: 'vaultSignerBump';
            docs: [
              'The bump of the vault signer for this [CollectionLendingProfile] token vault.'
            ];
            type: 'u8';
          },
          {
            name: 'interestRate';
            docs: [
              'The interest rate for the loans originated through this book, in bps.'
            ];
            type: 'u64';
          },
          {
            name: 'feeRate';
            docs: [
              'The fee rate for the loans originated through this book, in bps.'
            ];
            type: 'u64';
          },
          {
            name: 'id';
            type: 'u64';
          }
        ];
      };
    },
    {
      name: 'OfferLoanArgs';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'id';
            type: 'u64';
          }
        ];
      };
    },
    {
      name: 'Status';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Active';
          },
          {
            name: 'Suspended';
          }
        ];
      };
    }
  ];
  events: [
    {
      name: 'CollectionLendingProfileCreated';
      fields: [
        {
          name: 'profile';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'collection';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'loanTokenMint';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'interestRate';
          type: 'u64';
          index: false;
        },
        {
          name: 'feeRate';
          type: 'u64';
          index: false;
        }
      ];
    },
    {
      name: 'CollectionLendingProfileClosed';
      fields: [
        {
          name: 'profile';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'collection';
          type: 'publicKey';
          index: false;
        }
      ];
    },
    {
      name: 'LoanOfferCreated';
      fields: [
        {
          name: 'profile';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'loanMint';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'lender';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        }
      ];
    },
    {
      name: 'LoanOfferCanceled';
      fields: [
        {
          name: 'profile';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'lender';
          type: 'publicKey';
          index: false;
        }
      ];
    },
    {
      name: 'LoanOrigination';
      fields: [
        {
          name: 'profile';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'lender';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'borrower';
          type: 'publicKey';
          index: false;
        }
      ];
    },
    {
      name: 'LoanRepayment';
      fields: [
        {
          name: 'profile';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'lender';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'borrower';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'paidAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'amountLeft';
          type: 'u64';
          index: false;
        }
      ];
    },
    {
      name: 'LoanForeclosed';
      fields: [
        {
          name: 'profile';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'loan';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'lender';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'borrower';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'timestamp';
          type: 'u64';
          index: false;
        },
        {
          name: 'paidAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'amountLeft';
          type: 'u64';
          index: false;
        }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'Default';
      msg: 'default error';
    },
    {
      code: 6001;
      name: 'InvalidTimestampConversion';
      msg: 'Timestamp should be convertible from i64 to u64.';
    },
    {
      code: 6002;
      name: 'InvalidVaultSigner';
      msg: 'Invalid vault signer provided.';
    },
    {
      code: 6003;
      name: 'InvalidSigner';
      msg: 'Invalid signer provided.';
    },
    {
      code: 6004;
      name: 'InvalidTokenMint';
      msg: 'Invalid Token Mint provided.';
    },
    {
      code: 6005;
      name: 'InvalidTokenVault';
      msg: 'Invalid Token Vault provided.';
    },
    {
      code: 6006;
      name: 'InvalidCollectionLendingProfile';
      msg: 'Invalid Loan Book provided.';
    },
    {
      code: 6007;
      name: 'InvalidAmount';
      msg: 'Invalid Token amount provided.';
    },
    {
      code: 6008;
      name: 'InvalidForeclosure';
      msg: 'Invalid foreclosure attempted.';
    },
    {
      code: 6009;
      name: 'InvalidMetadataCollection';
      msg: 'Invalid Metadata Collection.';
    },
    {
      code: 6010;
      name: 'MetadataWithoutCollection';
      msg: 'The given Metadata does not have a Collection.';
    },
    {
      code: 6011;
      name: 'MetadataCollectionUnverified';
      msg: 'The given Metadata Collection is unverified.';
    },
    {
      code: 6012;
      name: 'CollectionMetaWithOutstandingLoans';
      msg: 'The given collection meta has outstanding Loans.';
    },
    {
      code: 6013;
      name: 'CollectionMetaWithLoanOffers';
      msg: 'The given collection meta has existing Loan offers.';
    },
    {
      code: 6014;
      name: 'LoanAlreadyOriginated';
      msg: 'The given Loan has already been originated.';
    },
    {
      code: 6015;
      name: 'CollectionLendingProfileWithOutstandingLoans';
      msg: 'The given Loan Book has outstanding Loans.';
    },
    {
      code: 6016;
      name: 'CollectionLendingProfileWithLoanOffers';
      msg: 'The given Loan Book has existing Loan offers.';
    },
    {
      code: 6017;
      name: 'CollectionLendingProfileWithAccumulatedFees';
      msg: 'The given Loan Book has accumulated fees.';
    },
    {
      code: 6018;
      name: 'CollectionLendingProfileWithoutAccumulatedFees';
      msg: 'The given Loan Book does not have accumulated fees.';
    },
    {
      code: 6019;
      name: 'CollectionLendingProfileFull';
      msg: 'The given Loan Book is full.';
    },
    {
      code: 6020;
      name: 'LoanOfferNotFound';
      msg: 'The given Loan offer could not be found.';
    }
  ];
};

export const IDL: Lending = {
  version: '0.1.0',
  name: 'lending',
  instructions: [
    {
      name: 'createCollectionLendingProfile',
      docs: ['Creates a [`CollectionLendingProfile`].'],
      accounts: [
        {
          name: 'profile',
          isMut: true,
          isSigner: false
        },
        {
          name: 'collection',
          isMut: false,
          isSigner: false,
          docs: ['The Metaplex Collection mint.']
        },
        {
          name: 'tokenMint',
          isMut: false,
          isSigner: false,
          docs: ['The mint of the token used by this book to issue loans.']
        },
        {
          name: 'tokenVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'vaultSigner',
          isMut: false,
          isSigner: false,
          docs: ['The token vault signer.']
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
          docs: ['The authority of the [`CollectionLendingProfile`]']
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
          docs: [
            'The payer of the rent necessary to initialize all the accounts in this context.'
          ]
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
          docs: ['The System Program.']
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Token Program.']
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
          docs: ['The Rent Sysvar.']
        }
      ],
      args: [
        {
          name: 'args',
          type: {
            defined: 'CreateCollectionLendingProfileArgs'
          }
        }
      ]
    },
    {
      name: 'closeCollectionLendingProfile',
      docs: ['Closes a [`CollectionLendingProfile`]'],
      accounts: [
        {
          name: 'profile',
          isMut: true,
          isSigner: false
        },
        {
          name: 'tokenVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'vaultSigner',
          isMut: false,
          isSigner: false
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true
        },
        {
          name: 'rentDestination',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'setCollectionLendingProfileStatus',
      docs: ['Sets the [Status] of a [`CollectionLendingProfile`]'],
      accounts: [
        {
          name: 'profile',
          isMut: true,
          isSigner: false,
          docs: ['The book of loans for a given collection.']
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
          docs: ['The authority of the [`CollectionLendingProfile`].']
        }
      ],
      args: [
        {
          name: 'status',
          type: {
            defined: 'Status'
          }
        }
      ]
    },
    {
      name: 'offerLoan',
      docs: [
        'Creates a [`Loan`] offer and adds it to the corresponding [`CollectionLendingProfile`].'
      ],
      accounts: [
        {
          name: 'profile',
          isMut: true,
          isSigner: false,
          docs: ['The book of loans for a given collection.']
        },
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
          docs: ['The loan offered by the lender.']
        },
        {
          name: 'loanMint',
          isMut: false,
          isSigner: false,
          docs: ['The token mint of the asset being lent.']
        },
        {
          name: 'escrow',
          isMut: false,
          isSigner: false,
          docs: ['The escrow.']
        },
        {
          name: 'escrowTokenAccount',
          isMut: true,
          isSigner: false,
          docs: ["The escrow's token account."]
        },
        {
          name: 'lenderTokenAccount',
          isMut: true,
          isSigner: false,
          docs: ["The lender's token account."]
        },
        {
          name: 'lender',
          isMut: true,
          isSigner: true,
          docs: ["The lender's wallet."]
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
          docs: ['The System Program.']
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Token Program.']
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Associated Token Program.']
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
          docs: ['The Rent Sysvar.']
        }
      ],
      args: [
        {
          name: 'args',
          type: {
            defined: 'OfferLoanArgs'
          }
        }
      ]
    },
    {
      name: 'rescindLoan',
      docs: [
        'Rescinds a [`Loan`] offer and removes it from the corresponding [`CollectionLendingProfile`].'
      ],
      accounts: [
        {
          name: 'profile',
          isMut: true,
          isSigner: false,
          docs: ['The book of loans for a given collection.']
        },
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
          docs: ['The loan offered by the lender']
        },
        {
          name: 'loanMint',
          isMut: false,
          isSigner: false,
          docs: ['The token mint of the asset being lent.']
        },
        {
          name: 'escrow',
          isMut: false,
          isSigner: false,
          docs: ['The escrow.']
        },
        {
          name: 'escrowTokenAccount',
          isMut: true,
          isSigner: false,
          docs: ["The escrow's token account."]
        },
        {
          name: 'lenderTokenAccount',
          isMut: true,
          isSigner: false,
          docs: ["The lender's token account."]
        },
        {
          name: 'lender',
          isMut: false,
          isSigner: true,
          docs: ["The lender's wallet."]
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Token Program.']
        }
      ],
      args: []
    },
    {
      name: 'repayLoan',
      docs: ['Repays a [`Loan`] and closes it.'],
      accounts: [
        {
          name: 'profile',
          isMut: true,
          isSigner: false,
          docs: ['The book of loans for a given collection.']
        },
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
          docs: ['The loan offered by the lender.']
        },
        {
          name: 'escrow',
          isMut: false,
          isSigner: false,
          docs: ['The escrow.']
        },
        {
          name: 'vaultSigner',
          isMut: false,
          isSigner: false,
          docs: ['The escrow.']
        },
        {
          name: 'tokenManager',
          isMut: true,
          isSigner: false,
          docs: ['The Cardinal Token Manager.']
        },
        {
          name: 'loanMint',
          isMut: false,
          isSigner: false,
          docs: ['The loan token mint.']
        },
        {
          name: 'collateralMint',
          isMut: false,
          isSigner: false,
          docs: ['The collateral token mint.']
        },
        {
          name: 'tokenVault',
          isMut: true,
          isSigner: false,
          docs: ['The fee token vault.']
        },
        {
          name: 'borrowerTokenAccount',
          isMut: true,
          isSigner: false,
          docs: ["The escrow's loan token account."]
        },
        {
          name: 'escrowCollateralAccount',
          isMut: true,
          isSigner: false,
          docs: ["The escrow's collateral account."]
        },
        {
          name: 'borrowerCollateralAccount',
          isMut: true,
          isSigner: false,
          docs: ["The borrower's collateral account."]
        },
        {
          name: 'tokenManagerCollateralAccount',
          isMut: true,
          isSigner: false,
          docs: ["The token manager's collateral account."]
        },
        {
          name: 'lender',
          isMut: true,
          isSigner: false
        },
        {
          name: 'lenderTokenAccount',
          isMut: true,
          isSigner: false,
          docs: ["The lender's token account."]
        },
        {
          name: 'borrower',
          isMut: true,
          isSigner: true,
          docs: ['The wallet address of the borrower.']
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
          docs: ['The System Program.']
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Token Program.']
        },
        {
          name: 'tokenManagerProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Cardinal Token Manager Program.']
        },
        {
          name: 'metadataProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Metaplex Token Metadata Program.']
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'amount',
          type: 'u64'
        }
      ]
    },
    {
      name: 'takeLoan',
      docs: [
        "Takes a [`Loan`] and pledges a token that is part of a collection as it's collateral."
      ],
      accounts: [
        {
          name: 'profile',
          isMut: true,
          isSigner: false,
          docs: ['The book of loans for a given collection.']
        },
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
          docs: ['The loan offered by the lender.']
        },
        {
          name: 'tokenManager',
          isMut: true,
          isSigner: false,
          docs: ['The Cardinal Token Manager.']
        },
        {
          name: 'mintCounter',
          isMut: true,
          isSigner: false,
          docs: ['The Cardinal Mint Counter.']
        },
        {
          name: 'loanMint',
          isMut: false,
          isSigner: false,
          docs: ['The loan token mint.']
        },
        {
          name: 'collateralMint',
          isMut: false,
          isSigner: false,
          docs: ['The collateral token mint.']
        },
        {
          name: 'collateralMetadata',
          isMut: false,
          isSigner: false,
          docs: ['The collateral metadata account.']
        },
        {
          name: 'escrow',
          isMut: false,
          isSigner: false,
          docs: ['The escrow.']
        },
        {
          name: 'escrowTokenAccount',
          isMut: true,
          isSigner: false,
          docs: ["The escrow's token account."]
        },
        {
          name: 'escrowCollateralAccount',
          isMut: true,
          isSigner: false,
          docs: ["The escrow's collateral account."]
        },
        {
          name: 'borrowerTokenAccount',
          isMut: true,
          isSigner: false,
          docs: ["The borrower's token account."]
        },
        {
          name: 'borrowerCollateralAccount',
          isMut: true,
          isSigner: false,
          docs: ["The borrower's collateral account."]
        },
        {
          name: 'tokenManagerCollateralAccount',
          isMut: true,
          isSigner: false,
          docs: ["The token manager's collateral account."]
        },
        {
          name: 'borrower',
          isMut: true,
          isSigner: true,
          docs: ['The wallet address of the borrower.']
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
          docs: ['The System Program.']
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Token Program.']
        },
        {
          name: 'tokenManagerProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Cardinal Token Manager Program.']
        },
        {
          name: 'metadataProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Metaplex Token Metadata Program.']
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
          docs: ['The Rent Sysvar.']
        }
      ],
      args: []
    },
    {
      name: 'forecloseLoan',
      docs: ["Forecloses a [`Loan`] and claims it's collateral."],
      accounts: [
        {
          name: 'profile',
          isMut: true,
          isSigner: false,
          docs: ['The book of loans for a given collection.']
        },
        {
          name: 'loan',
          isMut: true,
          isSigner: false,
          docs: ['The loan offered by the lender.']
        },
        {
          name: 'tokenManager',
          isMut: true,
          isSigner: false,
          docs: ['The Cardinal Token Manager.']
        },
        {
          name: 'collateralMint',
          isMut: false,
          isSigner: false,
          docs: ['The collateral token mint.']
        },
        {
          name: 'escrow',
          isMut: false,
          isSigner: false,
          docs: ['The escrow.']
        },
        {
          name: 'escrowCollateralAccount',
          isMut: true,
          isSigner: false,
          docs: ["The escrow's collateral account."]
        },
        {
          name: 'lenderCollateralAccount',
          isMut: true,
          isSigner: false,
          docs: ["The lender's collateral account."]
        },
        {
          name: 'borrowerCollateralAccount',
          isMut: true,
          isSigner: false,
          docs: ["The borrower's collateral account."]
        },
        {
          name: 'tokenManagerCollateralAccount',
          isMut: true,
          isSigner: false,
          docs: ["The token manager's collateral account."]
        },
        {
          name: 'lender',
          isMut: true,
          isSigner: false
        },
        {
          name: 'borrower',
          isMut: true,
          isSigner: true,
          docs: ['The wallet address of the borrower.']
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
          docs: ['The System Program.']
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Token Program.']
        },
        {
          name: 'tokenManagerProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Cardinal Token Manager Program.']
        },
        {
          name: 'metadataProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Metaplex Token Metadata Program.']
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: 'collectionLendingProfile',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'status',
            docs: ['The status of the book.'],
            type: {
              defined: 'Status'
            }
          },
          {
            name: 'vaultSignerBump',
            docs: ['The bump of the vault signer PDA.'],
            type: 'u8'
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 14]
            }
          },
          {
            name: 'authority',
            docs: [
              'The authority of this book.',
              'This authority is allowed to change the status of the book and closing it.'
            ],
            type: 'publicKey'
          },
          {
            name: 'collection',
            docs: ['The Metaplex Collection account.'],
            type: 'publicKey'
          },
          {
            name: 'tokenMint',
            docs: [
              'The mint of the token used to originate loans in using this book'
            ],
            type: 'publicKey'
          },
          {
            name: 'tokenVault',
            docs: ['The token vault, where fees are sent to.'],
            type: 'publicKey'
          },
          {
            name: 'vaultSigner',
            docs: ["The vault's signer."],
            type: 'publicKey'
          },
          {
            name: 'loanAmountOriginated',
            docs: ['The total loan principal amount originated.'],
            type: 'u128'
          },
          {
            name: 'loanAmountRepaid',
            docs: ['The total loan principal amount repaid.'],
            type: 'u128'
          },
          {
            name: 'feeRate',
            docs: ['The fee rate in bps.'],
            type: 'u64'
          },
          {
            name: 'interestRate',
            docs: ['The interest rate in bps.'],
            type: 'u64'
          },
          {
            name: 'loanDuration',
            docs: ['The duration of the loans.'],
            type: 'u64'
          },
          {
            name: 'padding2',
            type: {
              array: ['u8', 8]
            }
          },
          {
            name: 'loansOriginated',
            docs: ['The amount of loans that have been originated.'],
            type: 'u64'
          },
          {
            name: 'loansRepaid',
            docs: ['The amount of loans that have been repaid.'],
            type: 'u64'
          },
          {
            name: 'loansForeclosed',
            docs: ['The amount of loans that have been foreclosed.'],
            type: 'u64'
          },
          {
            name: 'loansRescinded',
            docs: ['The amount of loans that have been rescinded.'],
            type: 'u64'
          },
          {
            name: 'outstandingLoans',
            docs: ['The amount of loans that are currently outstanding.'],
            type: 'u64'
          },
          {
            name: 'loansOffered',
            docs: ['The amount of loans that have been offered.'],
            type: 'u64'
          },
          {
            name: 'feesAccumulated',
            docs: ['The amount of fees accumulated from this book.'],
            type: 'u64'
          },
          {
            name: 'id',
            docs: ['the id of this profile //'],
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'loan',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'escrowBumpSeed',
            docs: ['The bump of the escrow account.'],
            type: 'u8'
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 15]
            }
          },
          {
            name: 'profile',
            docs: ['The [`CollectionLendingProfile`] this loan belongs to.'],
            type: 'publicKey'
          },
          {
            name: 'lender',
            docs: ['The lender of this [`CollectionLendingProfile`].'],
            type: 'publicKey'
          },
          {
            name: 'loanMint',
            docs: [
              'The mint of the token used to provide loans associated with this [`CollectionLendingProfile`].'
            ],
            type: 'publicKey'
          },
          {
            name: 'borrower',
            docs: ['The borrower.'],
            type: 'publicKey'
          },
          {
            name: 'dueTimestamp',
            docs: ['The timestamp at which the repayment amount is due.'],
            type: 'u64'
          },
          {
            name: 'principalAmount',
            docs: ["The loan's principal amount."],
            type: 'u64'
          },
          {
            name: 'repaymentAmount',
            docs: ["The loan's repayment amount."],
            type: 'u64'
          },
          {
            name: 'paidAmount',
            docs: ['The amount of the loan that has been paid.'],
            type: 'u64'
          },
          {
            name: 'id',
            type: 'u64'
          }
        ]
      }
    }
  ],
  types: [
    {
      name: 'CreateCollectionLendingProfileArgs',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'collectionName',
            docs: ['The name of the collection.'],
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'vaultSignerBump',
            docs: [
              'The bump of the vault signer for this [CollectionLendingProfile] token vault.'
            ],
            type: 'u8'
          },
          {
            name: 'interestRate',
            docs: [
              'The interest rate for the loans originated through this book, in bps.'
            ],
            type: 'u64'
          },
          {
            name: 'feeRate',
            docs: [
              'The fee rate for the loans originated through this book, in bps.'
            ],
            type: 'u64'
          },
          {
            name: 'id',
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'OfferLoanArgs',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            type: 'u64'
          },
          {
            name: 'id',
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'Status',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Active'
          },
          {
            name: 'Suspended'
          }
        ]
      }
    }
  ],
  events: [
    {
      name: 'CollectionLendingProfileCreated',
      fields: [
        {
          name: 'profile',
          type: 'publicKey',
          index: false
        },
        {
          name: 'collection',
          type: 'publicKey',
          index: false
        },
        {
          name: 'loanTokenMint',
          type: 'publicKey',
          index: false
        },
        {
          name: 'interestRate',
          type: 'u64',
          index: false
        },
        {
          name: 'feeRate',
          type: 'u64',
          index: false
        }
      ]
    },
    {
      name: 'CollectionLendingProfileClosed',
      fields: [
        {
          name: 'profile',
          type: 'publicKey',
          index: false
        },
        {
          name: 'collection',
          type: 'publicKey',
          index: false
        }
      ]
    },
    {
      name: 'LoanOfferCreated',
      fields: [
        {
          name: 'profile',
          type: 'publicKey',
          index: false
        },
        {
          name: 'loan',
          type: 'publicKey',
          index: false
        },
        {
          name: 'loanMint',
          type: 'publicKey',
          index: false
        },
        {
          name: 'lender',
          type: 'publicKey',
          index: false
        },
        {
          name: 'amount',
          type: 'u64',
          index: false
        }
      ]
    },
    {
      name: 'LoanOfferCanceled',
      fields: [
        {
          name: 'profile',
          type: 'publicKey',
          index: false
        },
        {
          name: 'loan',
          type: 'publicKey',
          index: false
        },
        {
          name: 'lender',
          type: 'publicKey',
          index: false
        }
      ]
    },
    {
      name: 'LoanOrigination',
      fields: [
        {
          name: 'profile',
          type: 'publicKey',
          index: false
        },
        {
          name: 'loan',
          type: 'publicKey',
          index: false
        },
        {
          name: 'lender',
          type: 'publicKey',
          index: false
        },
        {
          name: 'borrower',
          type: 'publicKey',
          index: false
        }
      ]
    },
    {
      name: 'LoanRepayment',
      fields: [
        {
          name: 'profile',
          type: 'publicKey',
          index: false
        },
        {
          name: 'loan',
          type: 'publicKey',
          index: false
        },
        {
          name: 'lender',
          type: 'publicKey',
          index: false
        },
        {
          name: 'borrower',
          type: 'publicKey',
          index: false
        },
        {
          name: 'paidAmount',
          type: 'u64',
          index: false
        },
        {
          name: 'amountLeft',
          type: 'u64',
          index: false
        }
      ]
    },
    {
      name: 'LoanForeclosed',
      fields: [
        {
          name: 'profile',
          type: 'publicKey',
          index: false
        },
        {
          name: 'loan',
          type: 'publicKey',
          index: false
        },
        {
          name: 'lender',
          type: 'publicKey',
          index: false
        },
        {
          name: 'borrower',
          type: 'publicKey',
          index: false
        },
        {
          name: 'timestamp',
          type: 'u64',
          index: false
        },
        {
          name: 'paidAmount',
          type: 'u64',
          index: false
        },
        {
          name: 'amountLeft',
          type: 'u64',
          index: false
        }
      ]
    }
  ],
  errors: [
    {
      code: 6000,
      name: 'Default',
      msg: 'default error'
    },
    {
      code: 6001,
      name: 'InvalidTimestampConversion',
      msg: 'Timestamp should be convertible from i64 to u64.'
    },
    {
      code: 6002,
      name: 'InvalidVaultSigner',
      msg: 'Invalid vault signer provided.'
    },
    {
      code: 6003,
      name: 'InvalidSigner',
      msg: 'Invalid signer provided.'
    },
    {
      code: 6004,
      name: 'InvalidTokenMint',
      msg: 'Invalid Token Mint provided.'
    },
    {
      code: 6005,
      name: 'InvalidTokenVault',
      msg: 'Invalid Token Vault provided.'
    },
    {
      code: 6006,
      name: 'InvalidCollectionLendingProfile',
      msg: 'Invalid Loan Book provided.'
    },
    {
      code: 6007,
      name: 'InvalidAmount',
      msg: 'Invalid Token amount provided.'
    },
    {
      code: 6008,
      name: 'InvalidForeclosure',
      msg: 'Invalid foreclosure attempted.'
    },
    {
      code: 6009,
      name: 'InvalidMetadataCollection',
      msg: 'Invalid Metadata Collection.'
    },
    {
      code: 6010,
      name: 'MetadataWithoutCollection',
      msg: 'The given Metadata does not have a Collection.'
    },
    {
      code: 6011,
      name: 'MetadataCollectionUnverified',
      msg: 'The given Metadata Collection is unverified.'
    },
    {
      code: 6012,
      name: 'CollectionMetaWithOutstandingLoans',
      msg: 'The given collection meta has outstanding Loans.'
    },
    {
      code: 6013,
      name: 'CollectionMetaWithLoanOffers',
      msg: 'The given collection meta has existing Loan offers.'
    },
    {
      code: 6014,
      name: 'LoanAlreadyOriginated',
      msg: 'The given Loan has already been originated.'
    },
    {
      code: 6015,
      name: 'CollectionLendingProfileWithOutstandingLoans',
      msg: 'The given Loan Book has outstanding Loans.'
    },
    {
      code: 6016,
      name: 'CollectionLendingProfileWithLoanOffers',
      msg: 'The given Loan Book has existing Loan offers.'
    },
    {
      code: 6017,
      name: 'CollectionLendingProfileWithAccumulatedFees',
      msg: 'The given Loan Book has accumulated fees.'
    },
    {
      code: 6018,
      name: 'CollectionLendingProfileWithoutAccumulatedFees',
      msg: 'The given Loan Book does not have accumulated fees.'
    },
    {
      code: 6019,
      name: 'CollectionLendingProfileFull',
      msg: 'The given Loan Book is full.'
    },
    {
      code: 6020,
      name: 'LoanOfferNotFound',
      msg: 'The given Loan offer could not be found.'
    }
  ]
};
