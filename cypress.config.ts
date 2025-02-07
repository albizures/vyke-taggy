import { defineConfig } from 'cypress'

export default defineConfig({
	screenshotOnRunFailure: false,
	e2e: {
		baseUrl: 'http://localhost:4321',
	},
})
