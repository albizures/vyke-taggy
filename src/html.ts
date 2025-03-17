import type { Case, Conditional } from './conditional'
import type { TagMapProxy } from './define-tags'
import type { List } from './list'
import type { ReadSignal } from './signals'
import type { CommonChild, TagHandler } from './tag-handler'
import { defineTags } from './define-tags'

type HtmlTags = {
	[TTag in keyof HTMLElementTagNameMap]: {
		tag: HTMLElementTagNameMap[TTag]
		props:
			& {
				[TPropName in keyof HTMLElementTagNameMap[TTag]]?:
					| HTMLElementTagNameMap[TTag][TPropName]
					| ReadSignal<HTMLElementTagNameMap[TTag][TPropName]>
			}
			& Record<`data-${string}`, string | ReadSignal<string>>
	}
}

type Child =
	| TagHandler<Element>
	| CommonChild
	| Conditional<any, Array<Case<any, any, Child>>>
	| List<any, Child>

type HtmlChild =
	| Child
	| ReadSignal<Child>

export const Html: TagMapProxy<HtmlTags, HtmlChild> = defineTags<HtmlTags, HtmlChild>({
	creator(name) {
		return document.createElement(name)
	},
})
