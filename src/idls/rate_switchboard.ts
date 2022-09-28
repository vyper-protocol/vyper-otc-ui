export type RateSwitchboard = {
	version: '0.1.1';
	name: 'rate_switchboard';
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
						name: 'switchboardAggregators';
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
			name: 'InvalidAggregatorOwner';
			msg: 'invalid aggregator owner';
		},
		{
			code: 6002;
			name: 'InvalidAggregatorsNumber';
			msg: 'invalid aggregators number';
		},
		{
			code: 6003;
			name: 'MathError';
			msg: 'math error';
		}
	];
};

export const IDL: RateSwitchboard = {
	version: '0.1.1',
	name: 'rate_switchboard',
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
						name: 'switchboardAggregators',
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
			name: 'InvalidAggregatorOwner',
			msg: 'invalid aggregator owner'
		},
		{
			code: 6002,
			name: 'InvalidAggregatorsNumber',
			msg: 'invalid aggregators number'
		},
		{
			code: 6003,
			name: 'MathError',
			msg: 'math error'
		}
	]
};
