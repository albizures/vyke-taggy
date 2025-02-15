import type { Case } from './conditional'
import type { ReadSignal, Signal } from './signals'
import type { TagChild } from './tag-handler'
import { $when } from './conditional'
import { computed, effect, signal } from './signals'

type LoaderValue<TValue> =
	| { status: 'loading', value?: never, error?: never }
	| { status: 'loaded', value: Signal<TValue>, error?: never }
	| { status: 'error', value?: never, error: unknown }
type LoaderStatus = LoaderValue<unknown>['status']
type LoaderSignal<TValue> = ReadSignal<LoaderValue<TValue>>

type LoadOptions = {
	minTime?: number
}

async function wait(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

export function loadSignal<TValue>(fn: () => Promise<TValue>, options: LoadOptions = {}): LoaderSignal<TValue> {
	const { minTime = 1000 } = options
	const $status = signal<LoaderStatus>('loading')
	const $value = signal<TValue>()
	const $error = signal<unknown>()

	const loader = computed(() => {
		const status = $status()

		switch (status) {
			case 'loading':
				return { status }
			case 'loaded':
				return { status, value: $value }
			case 'error':
				return { status, error: $error }
		}
	})

	const targetTime = Date.now() + minTime

	effect(() => {
		$status('loading')

		const promise = fn()
		promise.then(async (value) => {
			const timeLeft = targetTime - Date.now()

			if (timeLeft > 0) {
				await wait(timeLeft)
			}

			// order is important here
			// if we set the status first, the value will be undefined
			$value(value)
			$status('loaded')
		}).catch((error) => {
			$error(error)
			$status('error')
		})
	})

	return loader as LoaderSignal<TValue>
}

type LoaderCases<TValue> = {
	loading?: () => TagChild
	loaded?: ($value: Signal<TValue>) => TagChild
	error?: ($error: Signal<unknown>) => TagChild
}
/**
 * Render a loader based on the status of a loader signal
 * @example
 * ```ts
 * import { $load, $when } from '@vyke/taggy'
 * import { signal } from '@vyke/taggy/signals'
 *
 * const $user = signal({
 * 	username: 'john_doe',
 * 	age: 30,
 * })
 *
 * const $profile = loadSignal(async ()=> {
 * 	await getProfile($user().username)
 * })
 *
 * const content = div([
 * 	$load($profile, {
 * 		loading: () => 'Loading...',
 * 		loaded: ($value) => $value().name,
 * 		error: ($error) => 'Error: ' + $error(),
 * 	})
 * ])
 * ```
 */
export function $load<TValue>(loader: LoaderSignal<TValue>, statuses: LoaderCases<TValue>): TagChild {
	const $status = computed(() => loader().status)

	const {
		error = () => '',
		loaded = () => '',
		loading = () => '',
	} = statuses

	const cases: Array<Case<LoaderStatus>> = [
		['error', () => error(loader().error as Signal<unknown>)],
		['loaded', () => loaded(loader().value as Signal<TValue>)],
		['loading', () => loading()],
	]

	return $when($status, ...cases)
}
