import antfu from '@antfu/eslint-config'

export default antfu(
	{
		astro: true,
		formatters: true,
		typescript: true,
		stylistic: {
			indent: 'tab',
		},
	},
	{
		files: ['*.ts', '*.tsx'],
		rules: {
			// for some reason this rules is not working
			// when listed as general rule.
			'ts/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					fixStyle: 'inline-type-imports',
				},
			],
		},
	},
	{
		rules: {
			'prefer-const': 'off',
			'antfu/top-level-function': 'off',
			'import/no-mutable-exports': 'off',
			'ts/array-type': ['error', { default: 'generic', readonly: 'generic' }],
			'ts/consistent-type-definitions': ['error', 'type'],
			'ts/indent': 'off',
			'ts/no-redeclare': 'off',
			'arrow-parens': ['error', 'always'],
			'style/arrow-parens': ['error', 'always'],
			'curly': ['error', 'all'],
			'indent': 'off',
			'antfu/consistent-list-newline': 'off',
		},
	},
)
