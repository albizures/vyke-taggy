describe('loader', () => {
	beforeEach(() => {
		cy.visit('/loader')
	})

	it('should handle successful loading states', () => {
		// Check initial state
		cy.get('span').should('contain', 'Id selected: 1')
		cy.get('div').should('contain', 'loading')

		// Wait for load and check loaded state
		cy.get('span').should('contain', 'user: johndoe (1)')

		// Change id and verify loading/loaded states
		cy.get('button').contains('change id').click()
		cy.get('span').should('contain', 'Id selected: 2')
		cy.get('div').should('contain', 'loading')
		cy.get('span').should('contain', 'user: johndoe (2)')
	})

	it('should handle error states', () => {
		// Trigger error state with invalid id
		cy.get('button').contains('a invalid id').click()
		cy.get('span').should('contain', 'Id selected: 100')
		cy.get('div').should('contain', 'loading')

		// Verify error message appears
		cy.get('span').should('contain', 'error Error: invalid id')
	})
})
