import type { ReadSignal, Signal } from './signals'
import type { TagChild } from './tag-handler'
import { computed } from 'alien-signals'

type ValueAsserter<TInput, TExpected extends TInput> = (value: TInput) => value is TExpected

type AssertedCase<TInput, TExpected extends TInput> = [
	asserter: ValueAsserter<TInput, TExpected>,
	handler: (value: TExpected) => TagChild,
]
type ValueCase<TInput> = [
	value: TInput,
	handler: (value: TInput) => TagChild,
]

export type Case<TInput, TExpected extends TInput> = AssertedCase<TInput, TExpected> | ValueCase<TInput>

export class Conditional<TValue, TCases extends Array<Case<any, any>>> {
	constructor(
		readonly signal: ReadSignal<TValue>,
		readonly cases: TCases,
	) {}
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
 * 		[1, (value) => `One: ${value}`],
 * 		[2, (value) => `Two: ${value}`],
 * 		$when.case((value) => value === 3, (value) => `Three: ${value}`),
 * 	)
 * ])
 * ```
 */
export function $when<TValue, TCases extends Array<Case<any, any>>>(
	signal: ReadSignal<TValue> | Signal<TValue>,
	...cases: [...TCases]
): Conditional<TValue, TCases> {
	return new Conditional(signal, cases)
}

$when.case = <TValue, TExpected extends TValue>(asserter: ValueAsserter<TValue, TExpected>, handler: (value: TExpected) => TagChild) => {
	return [asserter, handler] as const satisfies AssertedCase<TValue, TExpected>
}

$when.isString = (value: unknown): value is string => {
	return typeof value === 'string'
}

$when.isNumber = (value: unknown): value is number => {
	return typeof value === 'number'
}

$when.isBoolean = (value: unknown): value is boolean => {
	return typeof value === 'boolean'
}

export function match<TValue, TCases extends Array<Case<any, any>>>(conditional: Conditional<TValue, TCases>) {
	return computed(() => {
		const value = conditional.signal()
		for (const [caseValue, handler] of conditional.cases) {
			if ((isValueAsserter(caseValue) && caseValue(value)) || Object.is(caseValue, value)) {
				return handler(value)
			}
		}
	})
}

function isValueAsserter<TValue>(value: TValue | ValueAsserter<any, any>): value is ValueAsserter<any, any> {
	return typeof value === 'function'
}
