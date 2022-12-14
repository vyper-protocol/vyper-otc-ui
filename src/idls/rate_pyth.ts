export type RatePyth = {
	version: '0.1.0';
	name: 'rate_pyth';
	instructions: [
		{
			name: 'initialize';
			accounts: [
				{
					name: 'signer';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'rateData';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				}
			];
			args: [];
		},
		{
			name: 'refresh';
			accounts: [
				{
					name: 'signer';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'rateData';
					isMut: true;
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
					},
					{
						name: 'pythOracles';
						type: {
							array: [
								{
									option: 'publicKey';
								},
								10
							];
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
			name: 'InvalidAggregatorsNumber';
			msg: 'invalid aggregators number';
		},
		{
			code: 6002;
			name: 'MathError';
			msg: 'math error';
		}
	];
};

export const IDL: RatePyth = {
	version: '0.1.0',
	name: 'rate_pyth',
	instructions: [
		{
			name: 'initialize',
			accounts: [
				{
					name: 'signer',
					isMut: true,
					isSigner: true
				},
				{
					name: 'rateData',
					isMut: true,
					isSigner: true
				},
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false
				}
			],
			args: []
		},
		{
			name: 'refresh',
			accounts: [
				{
					name: 'signer',
					isMut: false,
					isSigner: true
				},
				{
					name: 'rateData',
					isMut: true,
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
					},
					{
						name: 'pythOracles',
						type: {
							array: [
								{
									option: 'publicKey'
								},
								10
							]
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
			name: 'InvalidAggregatorsNumber',
			msg: 'invalid aggregators number'
		},
		{
			code: 6002,
			name: 'MathError',
			msg: 'math error'
		}
	]
};
