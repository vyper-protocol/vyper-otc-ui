export type VyperOtc = {
  "version": "0.1.1",
  "name": "vyper_otc",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "otcState",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "otcAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "otcSeniorReserveTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "otcJuniorReserveTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "otcSeniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "otcJuniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "reserveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperTrancheConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vyperCore",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "inputData",
          "type": {
            "defined": "InitializeInputData"
          }
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "userReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "beneficiaryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "otcSeniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcSeniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperTrancheConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperTrancheAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vyperReserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperCore",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "inputData",
          "type": {
            "defined": "DepositInputData"
          }
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "userReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "beneficiaryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "otcSeniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "settle",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "otcState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "otcSeniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcSeniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperTrancheConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperTrancheAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vyperReserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperCore",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "otcState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "otcAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "beneficiaryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcSeniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "otcState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "created",
            "type": "i64"
          },
          {
            "name": "depositStart",
            "type": "i64"
          },
          {
            "name": "depositEnd",
            "type": "i64"
          },
          {
            "name": "settleStart",
            "type": "i64"
          },
          {
            "name": "settleExecuted",
            "type": "bool"
          },
          {
            "name": "seniorDepositAmount",
            "type": "u64"
          },
          {
            "name": "juniorDepositAmount",
            "type": "u64"
          },
          {
            "name": "seniorSideBeneficiary",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "juniorSideBeneficiary",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "vyperTrancheConfig",
            "type": "publicKey"
          },
          {
            "name": "vyperCore",
            "type": "publicKey"
          },
          {
            "name": "otcSeniorReserveTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "otcJuniorReserveTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "otcSeniorTrancheTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "otcJuniorTrancheTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "otcAuthority",
            "type": "publicKey"
          },
          {
            "name": "authoritySeed",
            "type": "publicKey"
          },
          {
            "name": "authorityBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "version",
            "type": {
              "array": [
                "u8",
                3
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "DepositInputData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isSeniorSide",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "InitializeInputData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seniorDepositAmount",
            "type": "u64"
          },
          {
            "name": "juniorDepositAmount",
            "type": "u64"
          },
          {
            "name": "depositStart",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "depositEnd",
            "type": "i64"
          },
          {
            "name": "settleStart",
            "type": "i64"
          },
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "InitializeEvent",
      "fields": [
        {
          "name": "otcState",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seniorDepositAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "juniorDepositAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "depositExpiration",
          "type": "i64",
          "index": false
        },
        {
          "name": "settleAvailableFrom",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GenericError",
      "msg": "generic error"
    },
    {
      "code": 6001,
      "name": "InitializationError",
      "msg": "initialization error"
    },
    {
      "code": 6002,
      "name": "SideAlreadyTaken",
      "msg": "side already taken"
    },
    {
      "code": 6003,
      "name": "DepositOpen",
      "msg": "deposit is open"
    },
    {
      "code": 6004,
      "name": "DepositClosed",
      "msg": "deposit is closed"
    },
    {
      "code": 6005,
      "name": "BothPositionsTaken",
      "msg": "both positions taken"
    },
    {
      "code": 6006,
      "name": "OtcClosed",
      "msg": "otc is closed"
    },
    {
      "code": 6007,
      "name": "BeneficiaryNotFound",
      "msg": "beneficiary not found"
    },
    {
      "code": 6008,
      "name": "SettleNotExecutedYet",
      "msg": "settle not executed yet"
    },
    {
      "code": 6009,
      "name": "SettleAlreadyExecuted",
      "msg": "settle already executed"
    }
  ]
};

export const IDL: VyperOtc = {
  "version": "0.1.1",
  "name": "vyper_otc",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "otcState",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "otcAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "otcSeniorReserveTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "otcJuniorReserveTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "otcSeniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "otcJuniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "reserveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperTrancheConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vyperCore",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "inputData",
          "type": {
            "defined": "InitializeInputData"
          }
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "userReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "beneficiaryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "otcSeniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcSeniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperTrancheConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperTrancheAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vyperReserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperCore",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "inputData",
          "type": {
            "defined": "DepositInputData"
          }
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "userReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "beneficiaryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "otcSeniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "settle",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "otcState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "otcSeniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcSeniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorTrancheTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juniorTrancheMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperTrancheConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperTrancheAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vyperReserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vyperCore",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "otcState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "otcAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "beneficiaryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcSeniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "otcJuniorReserveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "otcState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "created",
            "type": "i64"
          },
          {
            "name": "depositStart",
            "type": "i64"
          },
          {
            "name": "depositEnd",
            "type": "i64"
          },
          {
            "name": "settleStart",
            "type": "i64"
          },
          {
            "name": "settleExecuted",
            "type": "bool"
          },
          {
            "name": "seniorDepositAmount",
            "type": "u64"
          },
          {
            "name": "juniorDepositAmount",
            "type": "u64"
          },
          {
            "name": "seniorSideBeneficiary",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "juniorSideBeneficiary",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "vyperTrancheConfig",
            "type": "publicKey"
          },
          {
            "name": "vyperCore",
            "type": "publicKey"
          },
          {
            "name": "otcSeniorReserveTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "otcJuniorReserveTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "otcSeniorTrancheTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "otcJuniorTrancheTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "otcAuthority",
            "type": "publicKey"
          },
          {
            "name": "authoritySeed",
            "type": "publicKey"
          },
          {
            "name": "authorityBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "version",
            "type": {
              "array": [
                "u8",
                3
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "DepositInputData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isSeniorSide",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "InitializeInputData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seniorDepositAmount",
            "type": "u64"
          },
          {
            "name": "juniorDepositAmount",
            "type": "u64"
          },
          {
            "name": "depositStart",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "depositEnd",
            "type": "i64"
          },
          {
            "name": "settleStart",
            "type": "i64"
          },
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "InitializeEvent",
      "fields": [
        {
          "name": "otcState",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seniorDepositAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "juniorDepositAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "depositExpiration",
          "type": "i64",
          "index": false
        },
        {
          "name": "settleAvailableFrom",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GenericError",
      "msg": "generic error"
    },
    {
      "code": 6001,
      "name": "InitializationError",
      "msg": "initialization error"
    },
    {
      "code": 6002,
      "name": "SideAlreadyTaken",
      "msg": "side already taken"
    },
    {
      "code": 6003,
      "name": "DepositOpen",
      "msg": "deposit is open"
    },
    {
      "code": 6004,
      "name": "DepositClosed",
      "msg": "deposit is closed"
    },
    {
      "code": 6005,
      "name": "BothPositionsTaken",
      "msg": "both positions taken"
    },
    {
      "code": 6006,
      "name": "OtcClosed",
      "msg": "otc is closed"
    },
    {
      "code": 6007,
      "name": "BeneficiaryNotFound",
      "msg": "beneficiary not found"
    },
    {
      "code": 6008,
      "name": "SettleNotExecutedYet",
      "msg": "settle not executed yet"
    },
    {
      "code": 6009,
      "name": "SettleAlreadyExecuted",
      "msg": "settle already executed"
    }
  ]
};
