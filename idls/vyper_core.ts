export type VyperCore = {
	version: '0.1.0';
	name: 'vyper_core';
	instructions: [
		{
			name: 'initialize';
			accounts: [
				{
					name: 'payer';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'owner';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'trancheConfig';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'trancheAuthority';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'rateProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'rateProgramState';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'redeemLogicProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'redeemLogicProgramState';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'reserveMint';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'reserve';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'seniorTrancheMint';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'juniorTrancheMint';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'tokenProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'rent';
					isMut: false;
					isSigner: false;
				}
			];
			args: [
				{
					name: 'inputData';
					type: {
						defined: 'InitializeInput';
					};
				}
			];
		},
		{
			name: 'updateTrancheData';
			accounts: [
				{
					name: 'owner';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'trancheConfig';
					isMut: true;
					isSigner: false;
				}
			];
			args: [
				{
					name: 'inputData';
					type: {
						defined: 'UpdateTrancheDataInput';
					};
				}
			];
		},
		{
			name: 'refreshTrancheFairValue';
			accounts: [
				{
					name: 'signer';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'trancheConfig';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'seniorTrancheMint';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'juniorTrancheMint';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'rateProgramState';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'redeemLogicProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'redeemLogicProgramState';
					isMut: false;
					isSigner: false;
				}
			];
			args: [];
		},
		{
			name: 'deposit';
			accounts: [
				{
					name: 'signer';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'trancheConfig';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'trancheAuthority';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'reserve';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'userReserveToken';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'seniorTrancheMint';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'juniorTrancheMint';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'seniorTrancheDest';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'juniorTrancheDest';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'tokenProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'rent';
					isMut: false;
					isSigner: false;
				}
			];
			args: [
				{
					name: 'inputData';
					type: {
						defined: 'DepositInput';
					};
				}
			];
		},
		{
			name: 'redeem';
			accounts: [
				{
					name: 'signer';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'trancheConfig';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'trancheAuthority';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'reserve';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'userReserveToken';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'seniorTrancheMint';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'juniorTrancheMint';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'seniorTrancheSource';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'juniorTrancheSource';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'tokenProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'rent';
					isMut: false;
					isSigner: false;
				}
			];
			args: [
				{
					name: 'inputData';
					type: {
						defined: 'RedeemInput';
					};
				}
			];
		},
		{
			name: 'collectFee';
			accounts: [
				{
					name: 'trancheConfig';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'trancheAuthority';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'reserve';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'destReserve';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'owner';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'tokenProgram';
					isMut: false;
					isSigner: false;
				}
			];
			args: [];
		}
	];
	accounts: [
		{
			name: 'rateState';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'fairValue';
						type: {
							array: [
								{
									array: ['u8', 16];
								},
								10
							];
						};
					},
					{
						name: 'refreshedSlot';
						type: 'u64';
					}
				];
			};
		},
		{
			name: 'trancheConfig';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'reserveMint';
						type: 'publicKey';
					},
					{
						name: 'reserve';
						type: 'publicKey';
					},
					{
						name: 'trancheData';
						type: {
							defined: 'TrancheData';
						};
					},
					{
						name: 'seniorTrancheMint';
						type: 'publicKey';
					},
					{
						name: 'juniorTrancheMint';
						type: 'publicKey';
					},
					{
						name: 'trancheAuthority';
						type: 'publicKey';
					},
					{
						name: 'authoritySeed';
						type: 'publicKey';
					},
					{
						name: 'authorityBump';
						type: {
							array: ['u8', 1];
						};
					},
					{
						name: 'owner';
						type: 'publicKey';
					},
					{
						name: 'rateProgram';
						type: 'publicKey';
					},
					{
						name: 'rateProgramState';
						type: 'publicKey';
					},
					{
						name: 'redeemLogicProgram';
						type: 'publicKey';
					},
					{
						name: 'redeemLogicProgramState';
						type: 'publicKey';
					},
					{
						name: 'version';
						type: {
							array: ['u8', 3];
						};
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'reserved';
						type: {
							array: ['u8', 256];
						};
					}
				];
			};
		}
	];
	types: [
		{
			name: 'DepositInput';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'reserveQuantity';
						type: {
							array: ['u64', 2];
						};
					}
				];
			};
		},
		{
			name: 'InitializeInput';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'trancheMintDecimals';
						type: 'u8';
					},
					{
						name: 'haltFlags';
						type: 'u16';
					},
					{
						name: 'ownerRestrictedIxs';
						type: 'u16';
					}
				];
			};
		},
		{
			name: 'RedeemInput';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'trancheQuantity';
						type: {
							array: ['u64', 2];
						};
					}
				];
			};
		},
		{
			name: 'UpdateTrancheDataInput';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'bitmask';
						type: 'u16';
					},
					{
						name: 'haltFlags';
						type: 'u16';
					},
					{
						name: 'ownerRestrictedIxs';
						type: 'u16';
					},
					{
						name: 'reserveFairValueStaleSlotThreshold';
						type: 'u64';
					},
					{
						name: 'trancheFairValueStaleSlotThreshold';
						type: 'u64';
					},
					{
						name: 'depositCap';
						type: {
							array: [
								{
									option: 'u64';
								},
								2
							];
						};
					}
				];
			};
		},
		{
			name: 'LastUpdate';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'slot';
						type: 'u64';
					},
					{
						name: 'padding';
						type: {
							array: ['u8', 8];
						};
					}
				];
			};
		},
		{
			name: 'ReserveFairValue';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'value';
						type: {
							array: [
								{
									array: ['u8', 16];
								},
								10
							];
						};
					},
					{
						name: 'slotTracking';
						type: {
							defined: 'SlotTracking';
						};
					}
				];
			};
		},
		{
			name: 'SlotTracking';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'lastUpdate';
						type: {
							defined: 'LastUpdate';
						};
					},
					{
						name: 'staleSlotThreshold';
						type: 'u64';
					}
				];
			};
		},
		{
			name: 'TrancheData';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'depositedQuantity';
						type: {
							array: ['u64', 2];
						};
					},
					{
						name: 'feeToCollectQuantity';
						type: 'u64';
					},
					{
						name: 'reserveFairValue';
						type: {
							defined: 'ReserveFairValue';
						};
					},
					{
						name: 'trancheFairValue';
						type: {
							defined: 'TrancheFairValue';
						};
					},
					{
						name: 'haltFlags';
						type: 'u16';
					},
					{
						name: 'ownerRestrictedIx';
						type: 'u16';
					},
					{
						name: 'depositCap';
						type: {
							array: [
								{
									option: 'u64';
								},
								2
							];
						};
					}
				];
			};
		},
		{
			name: 'TrancheFairValue';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'value';
						type: {
							array: [
								{
									array: ['u8', 16];
								},
								2
							];
						};
					},
					{
						name: 'slotTracking';
						type: {
							defined: 'SlotTracking';
						};
					}
				];
			};
		}
	];
	errors: [
		{
			code: 6000;
			name: 'GenericError';
			msg: 'generic error';
		},
		{
			code: 6001;
			name: 'InvalidInput';
			msg: 'invalid input';
		},
		{
			code: 6002;
			name: 'MathError';
			msg: 'failed to perform some math operation safely';
		},
		{
			code: 6003;
			name: 'InvalidTrancheHaltFlags';
			msg: 'Bits passed in do not result in valid halt flags';
		},
		{
			code: 6004;
			name: 'HaltError';
			msg: 'Current operation is not available because is halted';
		},
		{
			code: 6005;
			name: 'InvalidOwnerRestrictedIxFlags';
			msg: 'Bits passed in do not result in valid owner restricted instruction flags';
		},
		{
			code: 6006;
			name: 'OwnerRestrictedIx';
			msg: 'Current operation is available only for tranche config owner';
		},
		{
			code: 6007;
			name: 'StaleFairValue';
			msg: 'Fair value is stale, refresh it';
		},
		{
			code: 6008;
			name: 'RedeemLogicNoReturn';
			msg: "The redeem logic plugin didn't return anything, maybe we forgot to set solana_program::program::set_return_data()?";
		},
		{
			code: 6009;
			name: 'PluginCpiError';
			msg: 'cross-program invocation error calling a vyper plugin';
		},
		{
			code: 6010;
			name: 'InvalidBitmask';
			msg: "bitmask value provided can't be converted";
		},
		{
			code: 6011;
			name: 'DepositExceededCap';
			msg: 'current deposit exceeded cap';
		}
	];
};

export const IDL: VyperCore = {
	version: '0.1.0',
	name: 'vyper_core',
	instructions: [
		{
			name: 'initialize',
			accounts: [
				{
					name: 'payer',
					isMut: true,
					isSigner: true
				},
				{
					name: 'owner',
					isMut: false,
					isSigner: false
				},
				{
					name: 'trancheConfig',
					isMut: true,
					isSigner: true
				},
				{
					name: 'trancheAuthority',
					isMut: false,
					isSigner: false
				},
				{
					name: 'rateProgram',
					isMut: false,
					isSigner: false
				},
				{
					name: 'rateProgramState',
					isMut: false,
					isSigner: false
				},
				{
					name: 'redeemLogicProgram',
					isMut: false,
					isSigner: false
				},
				{
					name: 'redeemLogicProgramState',
					isMut: false,
					isSigner: false
				},
				{
					name: 'reserveMint',
					isMut: false,
					isSigner: false
				},
				{
					name: 'reserve',
					isMut: true,
					isSigner: false
				},
				{
					name: 'seniorTrancheMint',
					isMut: true,
					isSigner: true
				},
				{
					name: 'juniorTrancheMint',
					isMut: true,
					isSigner: true
				},
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false
				},
				{
					name: 'tokenProgram',
					isMut: false,
					isSigner: false
				},
				{
					name: 'rent',
					isMut: false,
					isSigner: false
				}
			],
			args: [
				{
					name: 'inputData',
					type: {
						defined: 'InitializeInput'
					}
				}
			]
		},
		{
			name: 'updateTrancheData',
			accounts: [
				{
					name: 'owner',
					isMut: false,
					isSigner: true
				},
				{
					name: 'trancheConfig',
					isMut: true,
					isSigner: false
				}
			],
			args: [
				{
					name: 'inputData',
					type: {
						defined: 'UpdateTrancheDataInput'
					}
				}
			]
		},
		{
			name: 'refreshTrancheFairValue',
			accounts: [
				{
					name: 'signer',
					isMut: false,
					isSigner: true
				},
				{
					name: 'trancheConfig',
					isMut: true,
					isSigner: false
				},
				{
					name: 'seniorTrancheMint',
					isMut: true,
					isSigner: false
				},
				{
					name: 'juniorTrancheMint',
					isMut: true,
					isSigner: false
				},
				{
					name: 'rateProgramState',
					isMut: false,
					isSigner: false
				},
				{
					name: 'redeemLogicProgram',
					isMut: false,
					isSigner: false
				},
				{
					name: 'redeemLogicProgramState',
					isMut: false,
					isSigner: false
				}
			],
			args: []
		},
		{
			name: 'deposit',
			accounts: [
				{
					name: 'signer',
					isMut: false,
					isSigner: true
				},
				{
					name: 'trancheConfig',
					isMut: true,
					isSigner: false
				},
				{
					name: 'trancheAuthority',
					isMut: false,
					isSigner: false
				},
				{
					name: 'reserve',
					isMut: true,
					isSigner: false
				},
				{
					name: 'userReserveToken',
					isMut: true,
					isSigner: false
				},
				{
					name: 'seniorTrancheMint',
					isMut: true,
					isSigner: false
				},
				{
					name: 'juniorTrancheMint',
					isMut: true,
					isSigner: false
				},
				{
					name: 'seniorTrancheDest',
					isMut: true,
					isSigner: false
				},
				{
					name: 'juniorTrancheDest',
					isMut: true,
					isSigner: false
				},
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false
				},
				{
					name: 'tokenProgram',
					isMut: false,
					isSigner: false
				},
				{
					name: 'rent',
					isMut: false,
					isSigner: false
				}
			],
			args: [
				{
					name: 'inputData',
					type: {
						defined: 'DepositInput'
					}
				}
			]
		},
		{
			name: 'redeem',
			accounts: [
				{
					name: 'signer',
					isMut: false,
					isSigner: true
				},
				{
					name: 'trancheConfig',
					isMut: true,
					isSigner: false
				},
				{
					name: 'trancheAuthority',
					isMut: false,
					isSigner: false
				},
				{
					name: 'reserve',
					isMut: true,
					isSigner: false
				},
				{
					name: 'userReserveToken',
					isMut: true,
					isSigner: false
				},
				{
					name: 'seniorTrancheMint',
					isMut: true,
					isSigner: false
				},
				{
					name: 'juniorTrancheMint',
					isMut: true,
					isSigner: false
				},
				{
					name: 'seniorTrancheSource',
					isMut: true,
					isSigner: false
				},
				{
					name: 'juniorTrancheSource',
					isMut: true,
					isSigner: false
				},
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false
				},
				{
					name: 'tokenProgram',
					isMut: false,
					isSigner: false
				},
				{
					name: 'rent',
					isMut: false,
					isSigner: false
				}
			],
			args: [
				{
					name: 'inputData',
					type: {
						defined: 'RedeemInput'
					}
				}
			]
		},
		{
			name: 'collectFee',
			accounts: [
				{
					name: 'trancheConfig',
					isMut: true,
					isSigner: false
				},
				{
					name: 'trancheAuthority',
					isMut: false,
					isSigner: false
				},
				{
					name: 'reserve',
					isMut: true,
					isSigner: false
				},
				{
					name: 'destReserve',
					isMut: true,
					isSigner: false
				},
				{
					name: 'owner',
					isMut: false,
					isSigner: true
				},
				{
					name: 'tokenProgram',
					isMut: false,
					isSigner: false
				}
			],
			args: []
		}
	],
	accounts: [
		{
			name: 'rateState',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'fairValue',
						type: {
							array: [
								{
									array: ['u8', 16]
								},
								10
							]
						}
					},
					{
						name: 'refreshedSlot',
						type: 'u64'
					}
				]
			}
		},
		{
			name: 'trancheConfig',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'reserveMint',
						type: 'publicKey'
					},
					{
						name: 'reserve',
						type: 'publicKey'
					},
					{
						name: 'trancheData',
						type: {
							defined: 'TrancheData'
						}
					},
					{
						name: 'seniorTrancheMint',
						type: 'publicKey'
					},
					{
						name: 'juniorTrancheMint',
						type: 'publicKey'
					},
					{
						name: 'trancheAuthority',
						type: 'publicKey'
					},
					{
						name: 'authoritySeed',
						type: 'publicKey'
					},
					{
						name: 'authorityBump',
						type: {
							array: ['u8', 1]
						}
					},
					{
						name: 'owner',
						type: 'publicKey'
					},
					{
						name: 'rateProgram',
						type: 'publicKey'
					},
					{
						name: 'rateProgramState',
						type: 'publicKey'
					},
					{
						name: 'redeemLogicProgram',
						type: 'publicKey'
					},
					{
						name: 'redeemLogicProgramState',
						type: 'publicKey'
					},
					{
						name: 'version',
						type: {
							array: ['u8', 3]
						}
					},
					{
						name: 'createdAt',
						type: 'i64'
					},
					{
						name: 'reserved',
						type: {
							array: ['u8', 256]
						}
					}
				]
			}
		}
	],
	types: [
		{
			name: 'DepositInput',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'reserveQuantity',
						type: {
							array: ['u64', 2]
						}
					}
				]
			}
		},
		{
			name: 'InitializeInput',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'trancheMintDecimals',
						type: 'u8'
					},
					{
						name: 'haltFlags',
						type: 'u16'
					},
					{
						name: 'ownerRestrictedIxs',
						type: 'u16'
					}
				]
			}
		},
		{
			name: 'RedeemInput',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'trancheQuantity',
						type: {
							array: ['u64', 2]
						}
					}
				]
			}
		},
		{
			name: 'UpdateTrancheDataInput',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'bitmask',
						type: 'u16'
					},
					{
						name: 'haltFlags',
						type: 'u16'
					},
					{
						name: 'ownerRestrictedIxs',
						type: 'u16'
					},
					{
						name: 'reserveFairValueStaleSlotThreshold',
						type: 'u64'
					},
					{
						name: 'trancheFairValueStaleSlotThreshold',
						type: 'u64'
					},
					{
						name: 'depositCap',
						type: {
							array: [
								{
									option: 'u64'
								},
								2
							]
						}
					}
				]
			}
		},
		{
			name: 'LastUpdate',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'slot',
						type: 'u64'
					},
					{
						name: 'padding',
						type: {
							array: ['u8', 8]
						}
					}
				]
			}
		},
		{
			name: 'ReserveFairValue',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'value',
						type: {
							array: [
								{
									array: ['u8', 16]
								},
								10
							]
						}
					},
					{
						name: 'slotTracking',
						type: {
							defined: 'SlotTracking'
						}
					}
				]
			}
		},
		{
			name: 'SlotTracking',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'lastUpdate',
						type: {
							defined: 'LastUpdate'
						}
					},
					{
						name: 'staleSlotThreshold',
						type: 'u64'
					}
				]
			}
		},
		{
			name: 'TrancheData',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'depositedQuantity',
						type: {
							array: ['u64', 2]
						}
					},
					{
						name: 'feeToCollectQuantity',
						type: 'u64'
					},
					{
						name: 'reserveFairValue',
						type: {
							defined: 'ReserveFairValue'
						}
					},
					{
						name: 'trancheFairValue',
						type: {
							defined: 'TrancheFairValue'
						}
					},
					{
						name: 'haltFlags',
						type: 'u16'
					},
					{
						name: 'ownerRestrictedIx',
						type: 'u16'
					},
					{
						name: 'depositCap',
						type: {
							array: [
								{
									option: 'u64'
								},
								2
							]
						}
					}
				]
			}
		},
		{
			name: 'TrancheFairValue',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'value',
						type: {
							array: [
								{
									array: ['u8', 16]
								},
								2
							]
						}
					},
					{
						name: 'slotTracking',
						type: {
							defined: 'SlotTracking'
						}
					}
				]
			}
		}
	],
	errors: [
		{
			code: 6000,
			name: 'GenericError',
			msg: 'generic error'
		},
		{
			code: 6001,
			name: 'InvalidInput',
			msg: 'invalid input'
		},
		{
			code: 6002,
			name: 'MathError',
			msg: 'failed to perform some math operation safely'
		},
		{
			code: 6003,
			name: 'InvalidTrancheHaltFlags',
			msg: 'Bits passed in do not result in valid halt flags'
		},
		{
			code: 6004,
			name: 'HaltError',
			msg: 'Current operation is not available because is halted'
		},
		{
			code: 6005,
			name: 'InvalidOwnerRestrictedIxFlags',
			msg: 'Bits passed in do not result in valid owner restricted instruction flags'
		},
		{
			code: 6006,
			name: 'OwnerRestrictedIx',
			msg: 'Current operation is available only for tranche config owner'
		},
		{
			code: 6007,
			name: 'StaleFairValue',
			msg: 'Fair value is stale, refresh it'
		},
		{
			code: 6008,
			name: 'RedeemLogicNoReturn',
			msg: "The redeem logic plugin didn't return anything, maybe we forgot to set solana_program::program::set_return_data()?"
		},
		{
			code: 6009,
			name: 'PluginCpiError',
			msg: 'cross-program invocation error calling a vyper plugin'
		},
		{
			code: 6010,
			name: 'InvalidBitmask',
			msg: "bitmask value provided can't be converted"
		},
		{
			code: 6011,
			name: 'DepositExceededCap',
			msg: 'current deposit exceeded cap'
		}
	]
};
