import type { AnySignal, Signal } from './signal'
import { computed } from 'alien-signals'

export type AccessSignal<TValue extends Record<string, unknown>> = Signal<TValue> & {
	[K in keyof TValue]-?: TValue[K] extends Record<string, unknown> ? AccessSignal<TValue[K]> : Signal<TValue[K]>
}

const cache = new WeakMap<object, AccessSignal<any>>()

/**
 * Creates an access signal helper to access nested signals
 * @example
 * ```ts
 * import { $access } from '@vyke/taggy/signals'
 *
 * const $value = signal({
 * 	nested: {
 * 		count: 0,
 * 	}
 * })
 * const $nested = $access($value)
 * // where $count is a computed signal
 * const $count = $nested.nested.count
 * ```
 */
export function $access<TValue extends Record<string, unknown>>($value: AnySignal<TValue>): AccessSignal<TValue> {
	let $savedAccessor = cache.get($value)
	if ($savedAccessor) {
		return $savedAccessor as AccessSignal<TValue>
	}

	const signalCache = new Map<string, Signal<unknown>>()

	const $accessor = new Proxy($value, {
		get(target, prop: string) {
			// Check if we already have a cached signal for this property
			const cached = signalCache.get(prop)
			if (cached) {
				return cached
			}

			let isObject = false
			const $nested = computed(() => {
				const value = $value()

				if (prop in value) {
					const nestedValue = value[prop]
					isObject = typeof nestedValue === 'object' && nestedValue !== null
					return nestedValue
				}

				return undefined
			})

			// force the signal to be computed
			$nested()

			if (isObject) {
				// @ts-expect-error - $nested is unknown but we know it's an object
				const $nestedAccess = $access($nested)
				signalCache.set(prop, $nestedAccess)
				return $nestedAccess
			}

			signalCache.set(prop, $nested)
			return $nested
		},
		apply(target, thisArg, argArray) {
			return Reflect.apply(target, thisArg, argArray)
		},
	}) as AccessSignal<TValue>

	cache.set($value, $accessor)
	return $accessor
}
