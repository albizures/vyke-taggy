import type { ReadSignal } from './signals'

export type MaybeReadSignal<TValue> = TValue | ReadSignal<TValue>

export type CommonChild =
	| string
	| number
	| undefined
	| boolean

export type CommonTag<TTag> = {
	tag: TTag
	props: CommonProps<TTag>
}

export type CommonProps<TTag> = Record<`data-${string}`, MaybeReadSignal<string>> & {
	[TPropName in keyof TTag]?: MaybeReadSignal<TTag[TPropName]>
}
