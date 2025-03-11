describe('conditional rendering', () => {
	it('should update when the input value changes', () => {
		cy.visit('/conditional-rendering')

		cy.get('button').click()
		cy.get('span').should('contain', 'on')

		cy.get('button').click()
		cy.get('span').should('contain', 'off')
	})

	describe('when an value asserter is used', () => {
		it('should render the correct element', () => {
			cy.visit('/conditional-rendering')

			cy.get('button').click()
			cy.get('span').should('contain', 'it\'s a string: hello')

			cy.get('button').click()
			cy.get('span').should('contain', 'no string')
		})
	})
})
