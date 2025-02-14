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
