// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
	srcDir: './tests',
	outDir: './build',
	devToolbar: {
		enabled: false,
	},
})
