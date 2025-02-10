export type Quartz = {
  "version": "0.3.2",
  "name": "quartz",
  "instructions": [
    {
      "name": "reclaimBridgeRent",
      "accounts": [
        {
          "name": "rentReclaimer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bridgeRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageTransmitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageSentEventData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cctpMessageTransmitter",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "attestation",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "initUser",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeUser",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "initDriftAccount",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeDriftAccount",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "topUpCard",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerUsdc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "usdcMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "senderAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "messageTransmitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMessenger",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "remoteTokenMessenger",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMinter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "localToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageSentEventData",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "messageTransmitterProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMessengerMinterProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountUsdcBaseUnits",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerDepositSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callerWithdrawSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintDeposit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintWithdraw",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramDeposit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramWithdraw",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "depositCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "depositMarketIndex",
          "type": "u16"
        }
      ]
    },
    {
      "name": "withdrawCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "depositPriceUpdate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "withdrawPriceUpdate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawMarketIndex",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "collateralRepayLedger",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "deposit",
            "type": "u64"
          },
          {
            "name": "withdraw",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "IllegalCollateralRepayInstructions",
      "msg": "Illegal collateral repay instructions"
    },
    {
      "code": 6001,
      "name": "InvalidMint",
      "msg": "Invalid mint provided"
    },
    {
      "code": 6002,
      "name": "MaxSlippageExceeded",
      "msg": "Price slippage is above maximum"
    },
    {
      "code": 6003,
      "name": "InvalidPlatformFee",
      "msg": "Swap platform fee must be zero"
    },
    {
      "code": 6004,
      "name": "InvalidUserAccounts",
      "msg": "User accounts for deposit and withdraw do not match"
    },
    {
      "code": 6005,
      "name": "InvalidSourceTokenAccount",
      "msg": "Swap source token account does not match withdraw"
    },
    {
      "code": 6006,
      "name": "InvalidDestinationTokenAccount",
      "msg": "Swap destination token account does not match deposit"
    },
    {
      "code": 6007,
      "name": "InvalidStartBalance",
      "msg": "Declared start balance is not accurate"
    },
    {
      "code": 6008,
      "name": "NegativeOraclePrice",
      "msg": "Price received from oracle should be a positive number"
    },
    {
      "code": 6009,
      "name": "InvalidMarketIndex",
      "msg": "Invalid market index"
    },
    {
      "code": 6010,
      "name": "MathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6011,
      "name": "InvalidPriceExponent",
      "msg": "Price exponents received from oracle should be the same"
    },
    {
      "code": 6012,
      "name": "UnableToLoadAccountLoader",
      "msg": "Unable to load account loader"
    },
    {
      "code": 6013,
      "name": "DeserializationError",
      "msg": "Could not deserialize introspection instruction data"
    },
    {
      "code": 6014,
      "name": "NotReachedCollateralRepayThreshold",
      "msg": "Account health is not low enough for collateral_repay"
    },
    {
      "code": 6015,
      "name": "CollateralRepayHealthTooHigh",
      "msg": "Too much collateral sold in collateral_repay"
    },
    {
      "code": 6016,
      "name": "CollateralRepayHealthTooLow",
      "msg": "User health is still zero after collateral_repay"
    },
    {
      "code": 6017,
      "name": "IdenticalCollateralRepayMarkets",
      "msg": "Collateral repay deposit and withdraw markets must be different"
    },
    {
      "code": 6018,
      "name": "InvalidStartingVaultBalance",
      "msg": "Invalid starting vault balance"
    },
    {
      "code": 6019,
      "name": "FreshTokenLedgerRequired",
      "msg": "Provided token ledger is not empty"
    },
    {
      "code": 6020,
      "name": "InvalidEvmAddress",
      "msg": "Provided EVM address does not match expected format"
    }
  ]
};

export const IDL: Quartz = {
  "version": "0.3.2",
  "name": "quartz",
  "instructions": [
    {
      "name": "reclaimBridgeRent",
      "accounts": [
        {
          "name": "rentReclaimer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bridgeRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageTransmitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageSentEventData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cctpMessageTransmitter",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "attestation",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "initUser",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeUser",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "initDriftAccount",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeDriftAccount",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountBaseUnits",
          "type": "u64"
        },
        {
          "name": "driftMarketIndex",
          "type": "u16"
        },
        {
          "name": "reduceOnly",
          "type": "bool"
        }
      ]
    },
    {
      "name": "topUpCard",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerUsdc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "usdcMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bridgeRentPayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "senderAuthorityPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "messageTransmitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMessenger",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "remoteTokenMessenger",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMinter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "localToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "messageSentEventData",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "messageTransmitterProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMessengerMinterProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountUsdcBaseUnits",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerDepositSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "callerWithdrawSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintDeposit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintWithdraw",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramDeposit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramWithdraw",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "depositCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "depositMarketIndex",
          "type": "u16"
        }
      ]
    },
    {
      "name": "withdrawCollateralRepay",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "callerSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSpl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "splMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftUserStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spotMarketVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "driftSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "driftProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "depositPriceUpdate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "withdrawPriceUpdate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ledger",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawMarketIndex",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "collateralRepayLedger",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "deposit",
            "type": "u64"
          },
          {
            "name": "withdraw",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "IllegalCollateralRepayInstructions",
      "msg": "Illegal collateral repay instructions"
    },
    {
      "code": 6001,
      "name": "InvalidMint",
      "msg": "Invalid mint provided"
    },
    {
      "code": 6002,
      "name": "MaxSlippageExceeded",
      "msg": "Price slippage is above maximum"
    },
    {
      "code": 6003,
      "name": "InvalidPlatformFee",
      "msg": "Swap platform fee must be zero"
    },
    {
      "code": 6004,
      "name": "InvalidUserAccounts",
      "msg": "User accounts for deposit and withdraw do not match"
    },
    {
      "code": 6005,
      "name": "InvalidSourceTokenAccount",
      "msg": "Swap source token account does not match withdraw"
    },
    {
      "code": 6006,
      "name": "InvalidDestinationTokenAccount",
      "msg": "Swap destination token account does not match deposit"
    },
    {
      "code": 6007,
      "name": "InvalidStartBalance",
      "msg": "Declared start balance is not accurate"
    },
    {
      "code": 6008,
      "name": "NegativeOraclePrice",
      "msg": "Price received from oracle should be a positive number"
    },
    {
      "code": 6009,
      "name": "InvalidMarketIndex",
      "msg": "Invalid market index"
    },
    {
      "code": 6010,
      "name": "MathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6011,
      "name": "InvalidPriceExponent",
      "msg": "Price exponents received from oracle should be the same"
    },
    {
      "code": 6012,
      "name": "UnableToLoadAccountLoader",
      "msg": "Unable to load account loader"
    },
    {
      "code": 6013,
      "name": "DeserializationError",
      "msg": "Could not deserialize introspection instruction data"
    },
    {
      "code": 6014,
      "name": "NotReachedCollateralRepayThreshold",
      "msg": "Account health is not low enough for collateral_repay"
    },
    {
      "code": 6015,
      "name": "CollateralRepayHealthTooHigh",
      "msg": "Too much collateral sold in collateral_repay"
    },
    {
      "code": 6016,
      "name": "CollateralRepayHealthTooLow",
      "msg": "User health is still zero after collateral_repay"
    },
    {
      "code": 6017,
      "name": "IdenticalCollateralRepayMarkets",
      "msg": "Collateral repay deposit and withdraw markets must be different"
    },
    {
      "code": 6018,
      "name": "InvalidStartingVaultBalance",
      "msg": "Invalid starting vault balance"
    },
    {
      "code": 6019,
      "name": "FreshTokenLedgerRequired",
      "msg": "Provided token ledger is not empty"
    },
    {
      "code": 6020,
      "name": "InvalidEvmAddress",
      "msg": "Provided EVM address does not match expected format"
    }
  ]
};
