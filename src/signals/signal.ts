export type Signal<T> = {
	(): T
	(value: T): void
}

export type ReadSignal<T> = {
	(): T
}
