export type RedeemLogicSettledForward = {
  "version": "1.0.0",
  "name": "redeem_logic_settled_forward",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "redeemLogicConfig",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Tranche config account, where all the parameters are saved"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Signer account"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "strike",
          "type": "f64"
        },
        {
          "name": "notional",
          "type": "u64"
        },
        {
          "name": "isLinear",
          "type": "bool"
        },
        {
          "name": "isStandard",
          "type": "bool"
        }
      ]
    },
    {
      "name": "execute",
      "accounts": [
        {
          "name": "redeemLogicConfig",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "inputData",
          "type": {
            "defined": "RedeemLogicExecuteInput"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "redeemLogicConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "notional",
            "type": "u64"
          },
          {
            "name": "isLinear",
            "docs": [
              "true if linear, false if inverse"
            ],
            "type": "bool"
          },
          {
            "name": "isStandard",
            "docs": [
              "true if standard, false if inverse"
            ],
            "type": "bool"
          },
          {
            "name": "strike",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "RedeemLogicExecuteInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldQuantity",
            "type": {
              "array": [
                "u64",
                2
              ]
            }
          },
          {
            "name": "oldReserveFairValue",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    16
                  ]
                },
                10
              ]
            }
          },
          {
            "name": "newReserveFairValue",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    16
                  ]
                },
                10
              ]
            }
          }
        ]
      }
    },
    {
      "name": "RedeemLogicExecuteResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newQuantity",
            "type": {
              "array": [
                "u64",
                2
              ]
            }
          },
          {
            "name": "feeQuantity",
            "type": "u64"
          }
        ]
      }
    }
  ]
};

export const IDL: RedeemLogicSettledForward = {
  "version": "1.0.0",
  "name": "redeem_logic_settled_forward",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "redeemLogicConfig",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Tranche config account, where all the parameters are saved"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Signer account"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "strike",
          "type": "f64"
        },
        {
          "name": "notional",
          "type": "u64"
        },
        {
          "name": "isLinear",
          "type": "bool"
        },
        {
          "name": "isStandard",
          "type": "bool"
        }
      ]
    },
    {
      "name": "execute",
      "accounts": [
        {
          "name": "redeemLogicConfig",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "inputData",
          "type": {
            "defined": "RedeemLogicExecuteInput"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "redeemLogicConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "notional",
            "type": "u64"
          },
          {
            "name": "isLinear",
            "docs": [
              "true if linear, false if inverse"
            ],
            "type": "bool"
          },
          {
            "name": "isStandard",
            "docs": [
              "true if standard, false if inverse"
            ],
            "type": "bool"
          },
          {
            "name": "strike",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "RedeemLogicExecuteInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldQuantity",
            "type": {
              "array": [
                "u64",
                2
              ]
            }
          },
          {
            "name": "oldReserveFairValue",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    16
                  ]
                },
                10
              ]
            }
          },
          {
            "name": "newReserveFairValue",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    16
                  ]
                },
                10
              ]
            }
          }
        ]
      }
    },
    {
      "name": "RedeemLogicExecuteResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newQuantity",
            "type": {
              "array": [
                "u64",
                2
              ]
            }
          },
          {
            "name": "feeQuantity",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
