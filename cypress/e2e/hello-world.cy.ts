describe('hello world', () => {
	it('should update when the input value changes', () => {
		cy.visit('/hello-world')

		cy.get('h1').should('contain', 'Hello, world!')
		cy.get('input').should('have.value', 'world')

		cy.get('input').clear()
		cy.get('input').type('Joe')
		cy.get('h1').should('contain', 'Hello, Joe!')
	})
})
