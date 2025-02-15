import type { ReadSignal } from './signals'
import { computed } from './signals'

/**
 * Create a signal that updates the text content of a tag
 * @example
 * ```ts
 * import { signal } from '@vyke/taggy/signals'
 * import { $t } from '@vyke/taggy/text'
 *
 * const $name = signal('John Doe')
 * const $text = $t(() => `Hello, ${$name()}!`)
 *
 * const content = div([$text])
 * ```
 */
export function $t(fn: () => string): ReadSignal<string> {
	// yeap, this is simple as that
	return computed(fn)
}
