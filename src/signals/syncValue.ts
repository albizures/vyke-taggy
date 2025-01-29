import type { Signal } from './signal'
import { computed } from 'alien-signals'
import { assert } from '../error'

export type SyncValueProps = {
	value: Signal<string>
	oninput: (event: Event) => void
}

export function syncValue(value: Signal<string | number>): SyncValueProps {
	return {
		value: computed(() => String(value())),
		oninput(event: Event) {
			assert(
				event.target instanceof HTMLInputElement,
				'syncValue can only be used with input elements',
				event.target,
			)
			value(event.target.value)
		},
	}
}
