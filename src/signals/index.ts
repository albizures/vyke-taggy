import { effect } from 'alien-signals'

export * from './signal'
export * from './syncValue'
export * from './toggle'

export { computed, effect, signal } from 'alien-signals'

export function effectOnce(fn: () => void) {
	const stop = effect(() => {
		fn()
		stop()
	})
}
