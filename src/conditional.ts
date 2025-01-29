import type { TagChild } from './tag-handler'
import { computed } from 'alien-signals'

type Getter<T> = {
	(): T
	(value: T): void
}

type Case<TValue> = [value: TValue, () => TagChild]

export class Conditional<TValue> {
	constructor(
		readonly getter: Getter<TValue>,
		readonly cases: Array<Case<TValue>>) {}
}

export function when<TValue>(getter: Getter<TValue>, ...cases: Array<Case<TValue>>) {
	return new Conditional(getter, cases)
}

export function match<TValue>(conditional: Conditional<TValue>) {
	return computed(() => {
		const value = conditional.getter()
		for (const [caseValue, handler] of conditional.cases) {
			if (value === caseValue) {
				return handler()
			}
		}
	})
}
