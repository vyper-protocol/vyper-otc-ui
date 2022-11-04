export type RedeemLogicDigital = {
	version: '0.1.0';
	name: 'redeem_logic_digital';
	instructions: [
		{
			name: 'initialize';
			accounts: [
				{
					name: 'redeemLogicConfig';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'owner';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'payer';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				}
			];
			args: [
				{
					name: 'strike';
					type: 'f64';
				},
				{
					name: 'isCall';
					type: 'bool';
				}
			];
		},
		{
			name: 'update';
			accounts: [
				{
					name: 'redeemLogicConfig';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'owner';
					isMut: false;
					isSigner: true;
				}
			];
			args: [
				{
					name: 'strike';
					type: 'f64';
				},
				{
					name: 'isCall';
					type: 'bool';
				}
			];
		},
		{
			name: 'execute';
			accounts: [
				{
					name: 'redeemLogicConfig';
					isMut: false;
					isSigner: false;
				}
			];
			args: [
				{
					name: 'inputData';
					type: {
						defined: 'RedeemLogicExecuteInput';
					};
				}
			];
		}
	];
	accounts: [
		{
			name: 'redeemLogicConfig';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'isCall';
						type: 'bool';
					},
					{
						name: 'strike';
						type: {
							array: ['u8', 16];
						};
					},
					{
						name: 'owner';
						type: 'publicKey';
					}
				];
			};
		}
	];
	types: [
		{
			name: 'RedeemLogicExecuteInput';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'oldQuantity';
						type: {
							array: ['u64', 2];
						};
					},
					{
						name: 'oldReserveFairValue';
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
						name: 'newReserveFairValue';
						type: {
							array: [
								{
									array: ['u8', 16];
								},
								10
							];
						};
					}
				];
			};
		},
		{
			name: 'RedeemLogicExecuteResult';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'newQuantity';
						type: {
							array: ['u64', 2];
						};
					},
					{
						name: 'feeQuantity';
						type: 'u64';
					}
				];
			};
		}
	];
};

export const IDL: RedeemLogicDigital = {
	version: '0.1.0',
	name: 'redeem_logic_digital',
	instructions: [
		{
			name: 'initialize',
			accounts: [
				{
					name: 'redeemLogicConfig',
					isMut: true,
					isSigner: true
				},
				{
					name: 'owner',
					isMut: false,
					isSigner: false
				},
				{
					name: 'payer',
					isMut: true,
					isSigner: true
				},
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false
				}
			],
			args: [
				{
					name: 'strike',
					type: 'f64'
				},
				{
					name: 'isCall',
					type: 'bool'
				}
			]
		},
		{
			name: 'update',
			accounts: [
				{
					name: 'redeemLogicConfig',
					isMut: true,
					isSigner: false
				},
				{
					name: 'owner',
					isMut: false,
					isSigner: true
				}
			],
			args: [
				{
					name: 'strike',
					type: 'f64'
				},
				{
					name: 'isCall',
					type: 'bool'
				}
			]
		},
		{
			name: 'execute',
			accounts: [
				{
					name: 'redeemLogicConfig',
					isMut: false,
					isSigner: false
				}
			],
			args: [
				{
					name: 'inputData',
					type: {
						defined: 'RedeemLogicExecuteInput'
					}
				}
			]
		}
	],
	accounts: [
		{
			name: 'redeemLogicConfig',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'isCall',
						type: 'bool'
					},
					{
						name: 'strike',
						type: {
							array: ['u8', 16]
						}
					},
					{
						name: 'owner',
						type: 'publicKey'
					}
				]
			}
		}
	],
	types: [
		{
			name: 'RedeemLogicExecuteInput',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'oldQuantity',
						type: {
							array: ['u64', 2]
						}
					},
					{
						name: 'oldReserveFairValue',
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
						name: 'newReserveFairValue',
						type: {
							array: [
								{
									array: ['u8', 16]
								},
								10
							]
						}
					}
				]
			}
		},
		{
			name: 'RedeemLogicExecuteResult',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'newQuantity',
						type: {
							array: ['u64', 2]
						}
					},
					{
						name: 'feeQuantity',
						type: 'u64'
					}
				]
			}
		}
	]
};
