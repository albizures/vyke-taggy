import type { Case, Conditional } from './conditional'
import type { TagMapProxy } from './define-tags'
import type { List } from './list'
import type { ReadSignal } from './signals'
import type { TagHandler } from './tag-handler'
import type { CommonChild, CommonTag } from './types'
import { defineTags } from './define-tags'

type HtmlTags = {
	[TTag in keyof HTMLElementTagNameMap]: CommonTag<HTMLElementTagNameMap[TTag]>
}

type Child =
	| TagHandler<Element>
	| CommonChild
	| Conditional<any, Array<Case<any, any, Child>>>
	| List<any, Child>

export type HtmlChild =
	| Child
	| ReadSignal<Child>

export const Html: TagMapProxy<HtmlTags, HtmlChild> = defineTags<HtmlTags, HtmlChild>({
	creator(name) {
		return document.createElement(name)
	},
})
