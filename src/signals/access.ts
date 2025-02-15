import type { ReadSignal, Signal } from './signal'

type AccessProxy<T> = {
	readonly [K in keyof T]: T[K] extends object ? AccessProxy<T[K]> : T[K]
}

/**
 * Creates a proxy that allows direct property access on signals containing objects
 * @param $signal The signal to create an access proxy for
 * @returns A proxy object that allows direct property access
 *
 * @example
 * const $value = signal({ foo: 1, nested: { bar: 2 } })
 * const $access = access($value)
 *
 * effect(() => console.log($access.foo)) // logs 1
 * effect(() => console.log($access.nested.bar)) // logs 2
 */
export function access<TValue extends Record<string, unknown>>(
	$signal: Signal<TValue> | ReadSignal<TValue>,
): AccessProxy<TValue> {
	return new Proxy(
		{},
		{
			get(_, prop: string | symbol) {
				const value = $signal()[prop as keyof TValue]

				if (value && typeof value === 'object') {
					return access(() => value as any)
				}

				return value
			},
		},
	) as AccessProxy<TValue>
}
