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
type LoaderSignal<TValue> = ReadSignal<LoaderValue<TValue>> & {
	/**
	 * Match the status of the loader
	 * @example
	 * ```ts
	 * const $profile = loadSignal(async () => {
	 * 	await getProfile($user().username)
	 * })
	 *
	 * $profile.match({
	 * 	loading: () => 'Loading...',
	 * 	loaded: ($value) => $value().name,
	 * 	error: ($error) => `Error: ${$error()}`,
	 * })
	 * ```
	 */
	match: (statuses: LoaderCases<TValue>) => TagChild

	/**
	 * Reload the loader
	 */
	reload: () => void
}

type LoadOptions = {
	minTime?: number
}

async function wait(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

/**
 * creates a loader signal that will render a loader based
 * on the status of the promise
 * @example
 * ```ts
 * import { loadSignal } from '@vyke/taggy'
 * import { signal } from '@vyke/taggy/signals'
 *
 * const $user = signal({
 * 	username: 'john_doe',
 * 	age: 30,
 * })
 *
 * const $profile = loadSignal(async () => {
 * 	await getProfile($user().username)
 * })
 *
 * const content = div([
 * 	$profile.match({
 * 		loading: () => 'Loading...',
 * 		loaded: ($value) => $value().name,
 * 		error: ($error) => `Error: ${$error()}`,
 * 	})
 * ])
 * ```
 */
export function loadSignal<TValue>(fn: () => Promise<TValue>, options: LoadOptions = {}): LoaderSignal<TValue> {
	const { minTime = 1000 } = options
	const $counter = signal(0)
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
	}) as LoaderSignal<TValue>

	let targetTime = Date.now() + minTime

	effect(() => {
		// force a re-render of the loader
		$counter()

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

	loader.match = (statuses: LoaderCases<TValue>) => {
		return matchLoader(loader, statuses)
	}

	loader.reload = () => {
		$counter($counter() + 1)
		targetTime = Date.now() + minTime
	}

	return loader as LoaderSignal<TValue>
}

type LoaderCases<TValue> = {
	loading?: () => TagChild
	loaded?: ($value: Signal<TValue>) => TagChild
	error?: ($error: Signal<unknown>) => TagChild
}

function matchLoader<TValue>(loader: LoaderSignal<TValue>, statuses: LoaderCases<TValue>): TagChild {
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
