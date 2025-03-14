import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { loadSignal } from './loader'

describe('loadSignal', () => {
	it('should load a signal', async () => {
		const $signal = loadSignal(() => Promise.resolve('test'), {})

		const loader = $signal()

		expect(loader.$value()).toBeUndefined()
		expectTypeOf(loader.$value()).toEqualTypeOf<string | undefined>()

		if (loader.status === 'loaded') {
			expectTypeOf(loader.$value()).toEqualTypeOf<string>()
		}

		await vi.waitFor(() => {
			expect($signal().$value()).toEqual('test')
		})
	})

	it('should load a signal with a default value', async () => {
		const $signal = loadSignal(() => Promise.resolve('test'), { initialValue: 'default' })

		const loader = $signal()

		expect(loader.$value()).toBe('default')
		expectTypeOf(loader.$value()).toEqualTypeOf<string>()

		await vi.waitFor(() => {
			expect($signal().$value()).toBe('test')
		})
	})
})
