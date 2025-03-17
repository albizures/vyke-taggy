import type { ReadSignal, Signal } from './signals'
import { computed, pauseTracking, resumeTracking } from 'alien-signals'

type ValueAsserter<TInput, TExpected extends TInput> = (value: TInput) => value is TExpected

type AssertedCase<TInput, TExpected extends TInput, TOutput> = [
	asserter: ValueAsserter<TInput, TExpected>,
	handler: (value: TExpected) => TOutput,
]
type ValueCase<TInput, TOutput> = [
	value: TInput,
	handler: (value: TInput) => TOutput,
]

export type Case<TInput, TExpected extends TInput, TOutput> =
	| AssertedCase<TInput, TExpected, TOutput>
	| ValueCase<TInput, TOutput>

export type InferCaseOutput<TCase> = TCase extends Case<any, any, infer TOutput> ? TOutput : never

export class Conditional<TValue, TCases extends Array<Case<any, any, any>>> {
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
export function $when<TValue, TCases extends Array<Case<any, any, any>>>(
	signal: ReadSignal<TValue> | Signal<TValue>,
	...cases: [...TCases]
): Conditional<TValue, TCases> {
	return new Conditional(signal, cases)
}

$when.case = <TValue, TExpected extends TValue, TOutput>(
	asserter: ValueAsserter<TValue, TExpected>,
	handler: (value: TExpected) => TOutput,
): Case<TValue, TExpected, TOutput> => {
	return [asserter, handler] as const satisfies AssertedCase<TValue, TExpected, TOutput>
}

$when.otherwise = <TValue, TOutput>(handler: () => TOutput): Case<TValue, TValue, TOutput> => {
	return [
		(value: TValue): value is TValue => true,
		handler,
	] as const satisfies AssertedCase<TValue, TValue, TOutput>
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

export function match<TConditional extends Conditional<any, any>>(conditional: TConditional) {
	return computed(() => {
		const value = conditional.signal()
		for (const [caseValue, handler] of conditional.cases) {
			if ((isValueAsserter(caseValue) && caseValue(value)) || Object.is(caseValue, value)) {
				pauseTracking()
				const result = handler(value)
				resumeTracking()
				return result
			}
		}
	})
}

function isValueAsserter<TValue>(value: TValue | ValueAsserter<any, any>): value is ValueAsserter<any, any> {
	return typeof value === 'function'
}
