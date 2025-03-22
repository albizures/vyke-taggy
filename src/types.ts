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

export type CommonProps<TTag> =
	& Record<`data-${string}`, MaybeReadSignal<string>>
	& Omit<{
		[TPropName in keyof TTag]?: TTag[TPropName] extends SVGAnimatedLength
			? MaybeReadSignal<number>
			: MaybeReadSignal<TTag[TPropName]>
	}, 'style'>
	& {
		style?: MaybeReadSignal<Record<string, string>> | MaybeReadSignal<string>
	}
