import { computed, effect, signal } from 'alien-signals'
import { describe, expect, it, vi } from 'vitest'
import { $when, match } from './conditional'

describe('conditional', () => {
	it('should not re-evaluate the conditional when the nested signal changes', () => {
		const $status = signal<'off' | 'on'>('on')
		const $nested = signal(0)

		const onCase = vi.fn(() => $nested())

		const conditional = $when($status,
			['on', onCase],
			['off', () => 'off'],
		)

		const $result = match(conditional)

		$result()
		const effectFn = vi.fn(() => $result())
		effect(effectFn)

		// trigger nested signal
		$nested(1)
		$nested(2)

		expect(onCase).toHaveBeenCalledOnce()
		expect(effectFn).toHaveBeenCalledOnce()
	})
})
