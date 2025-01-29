describe('conditional rendering', () => {
	it('should update when the input value changes', () => {
		cy.visit('/conditional-rendering')

		cy.get('button').click()
		cy.get('span').should('contain', 'on')

		cy.get('button').click()
		cy.get('span').should('contain', 'off')
	})
})
