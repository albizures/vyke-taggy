import type { Signal } from './signal'
import { signal } from 'alien-signals'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { $access } from './access'

describe('access', () => {
	it('should allow normal signal access', () => {
		const $value = signal({
			nested: {
				count: 0,
			},
		})

		const $accessor = $access($value)
		expect($accessor()).toBe($value())
	})

	it('should access nested signals', () => {
		const $value = signal({
			nested: {
				count: 0,
			},
		})

		const $nested = $access($value)
		const $count = $nested.nested.count

		expect($count()).toBe(0)
	})

	it('should update nested signals', () => {
		const $value = signal({
			nested: {
				count: 0,
			},
		})

		const $nested = $access($value)
		const $count = $nested.nested.count

		expect($count()).toBe(0)

		$value({
			nested: {
				count: 1,
			},
		})

		expect($count()).toBe(1)
	})

	it('should return the same signal when accessing the same nested signal', () => {
		const $value = signal({
			nested: {
				count: 0,
			},
		})

		const $nested = $access($value)
		const $count1 = $nested.nested.count
		const $count2 = $nested.nested.count

		expect($count1).toBe($count2)
	})

	describe('when the give object has optional properties', () => {
		it('should not throw an error', () => {
			type Value = {
				optional?: number
				required: number
			}
			const $value = signal<Value>({
				optional: undefined,
				required: 1,
			})

			const $accessor = $access($value)
			expectTypeOf($accessor.optional).toEqualTypeOf<Signal<number | undefined>>()
			expect($accessor.optional()).toBeUndefined()
			expectTypeOf($accessor.required).toEqualTypeOf<Signal<number>>()
			expect($accessor.required()).toBe(1)
		})
	})
})
