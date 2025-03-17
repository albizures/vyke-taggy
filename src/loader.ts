import type { Case, Conditional } from './conditional'
import type { ReadSignal, Signal } from './signals'
import { $when } from './conditional'
import { computed, effect, signal } from './signals'

type LoaderValue<TValue, TDefault = undefined> =
	| { status: 'loading', $value: Signal<TValue | TDefault>, error?: never }
	| { status: 'loaded', $value: Signal<TValue>, error?: never }
	| { status: 'error', $value: Signal<TValue | TDefault>, error: unknown }
type LoaderStatus = LoaderValue<unknown>['status']
export type LoaderSignal<TValue, TDefault = undefined> = ReadSignal<LoaderValue<TValue, TDefault>> & {
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
	match: <TOutput>(statuses: LoaderCases<TValue, TOutput, TDefault>, options?: MatchOptions) => Conditional<LoaderStatus, TOutput, Array<Case<LoaderStatus, LoaderStatus, TOutput>>>

	/**
	 * Reload the loader
	 */
	reload: () => void
}

type MatchOptions = {
	minTime?: number
}

type LoaderOptions<TDefault> = {
	initialValue?: TDefault
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
export function loadSignal<
	TValue,
	TDefault extends TValue | undefined = undefined,
>(
	fn: () => Promise<TValue>,
	options: LoaderOptions<TDefault> = {},
): LoaderSignal<TValue, TDefault> {
	const { initialValue } = options
	const $counter = signal(0)
	const $status = signal<LoaderStatus>('loading')
	const $value = signal<TValue | TDefault>(initialValue ?? (undefined as TValue | TDefault))
	const $error = signal<unknown>()

	const loader = computed(() => {
		const status = $status()

		switch (status) {
			case 'loading':
				return { status, $value }
			case 'loaded':
				return { status, $value }
			case 'error':
				return { status, $value, error: $error }
		}
	}) as LoaderSignal<TValue, TDefault>

	effect(() => {
		// force a re-render of the loader
		$counter()

		$status('loading')

		const promise = fn()
		promise.then((value) => {
			// if we set the status first, the value will be undefined
			$value(value)
			$status('loaded')
		}).catch((error) => {
			$error(error)
			$status('error')
		})
	})

	loader.match = <TOutput>(statuses: LoaderCases<TValue, TOutput, TDefault>, options: MatchOptions = {}) => {
		return matchLoader(loader, statuses, options)
	}

	loader.reload = () => {
		$counter($counter() + 1)
	}

	return loader
}

type LoaderCases<TValue, TOutput, TDefault = undefined> = {
	loading?: () => TOutput
	loaded?: ($value: Signal<TValue>) => TOutput
	error?: ($error: Signal<unknown | TDefault>) => TOutput
}

function matchLoader<
	TValue,
	TOutput,
	TDefault = undefined,
>(
	loader: LoaderSignal<TValue, TDefault>,
	statuses: LoaderCases<TValue, TOutput, TDefault>,
	options: MatchOptions = {},
): Conditional<LoaderStatus, TOutput, Array<Case<LoaderStatus, LoaderStatus, TOutput>>> {
	const { minTime = 1000 } = options
	const $now = signal(Date.now())
	let targetTime: number | undefined
	let interval: ReturnType<typeof setInterval> | undefined
	// Compute whether we should still show loading state based on minTime
	const $status = computed(() => {
		const currentStatus = loader().status

		if (!targetTime) {
			interval = setInterval(() => {
				$now(Date.now())
			}, 100)

			targetTime = Date.now() + minTime
		}

		const timeLeft = targetTime - $now()

		if (timeLeft > 0) {
			return 'loading'
		}

		targetTime = undefined
		clearInterval(interval)
		return currentStatus
	})

	const {
		error = () => undefined as TOutput,
		loaded = () => undefined as TOutput,
		loading = () => undefined as TOutput,
	} = statuses

	const cases: Array<Case<LoaderStatus, LoaderStatus, TOutput>> = [
		['error', () => error(loader().error as Signal<unknown>)],
		['loaded', () => loaded(loader().$value as Signal<TValue>)],
		['loading', () => loading()],
	]

	return $when($status, ...cases)
}
