import type { ReadSignal, Signal } from './signals'
import type { TagChild } from './tag-handler'
import { computed } from 'alien-signals'

export type Case<TValue> = [value: TValue, () => TagChild]

export class Conditional<TValue> {
	constructor(
		readonly signal: ReadSignal<TValue>,
		readonly cases: Array<Case<TValue>>) {}
}

/**
 * Render the given element based on given cases
 * @example
 * ```ts
 * import { $when } from '@vyke/taggy'
 * import { signal } from '@vyke/taggy/signals'
 *
 * const $value = signal(1)
 *
 * const content = div([
 * 	$when($value,
 * 		[1, () => 'One'],
 * 		[2, () => 'Two'],
 * 	)
 * ])
 * ```
 */
export function $when<TValue>(signal: ReadSignal<TValue> | Signal<TValue>, ...cases: Array<Case<TValue>>): Conditional<TValue> {
	return new Conditional(signal, cases)
}

export function match<TValue>(conditional: Conditional<TValue>) {
	return computed(() => {
		const value = conditional.signal()
		for (const [caseValue, handler] of conditional.cases) {
			if (value === caseValue) {
				return handler()
			}
		}
	})
}
