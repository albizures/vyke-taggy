export type Signal<T> = {
	(): T
	(value: T): void
}

export type ReadSignal<T> = {
	(): T
}

export type AnySignal<TValue> = ReadSignal<TValue> | Signal<TValue>
