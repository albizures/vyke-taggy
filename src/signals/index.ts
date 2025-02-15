import { effect } from 'alien-signals'

export * from './access'
export * from './signal'
export * from './syncValue'
export * from './toggle'

export function effectOnce(fn: () => void) {
	const stop = effect(() => {
		fn()
		stop()
	})
}

export { computed, effect, signal } from 'alien-signals'
