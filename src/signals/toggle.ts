import type { Signal } from '.'
import { signal } from 'alien-signals'

type ToggleStatus = 'off' | 'on'

export function createToggle(): Signal<ToggleStatus> {
	const status = signal<'off' | 'on'>('off')

	return status
}

export function toggle(signal: Signal<ToggleStatus>): void {
	signal(signal() === 'off' ? 'on' : 'off')
}
