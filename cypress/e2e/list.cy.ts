describe('list', () => {
	it('should update when the input value changes', () => {
		cy.visit('/list')

		cy.get('li').should('contain', '1')
		cy.get('li').should('contain', '2')
		cy.get('li').should('contain', '3')

		cy.get('button').contains('Add').click()
		cy.get('li').should('contain', '4')

		cy.get('button').contains('Remove').click()
		cy.get('li').should('contain', '3')
	})
})
