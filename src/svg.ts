import type { Case, Conditional } from './conditional'
import type { TagMapProxy } from './define-tags'
import type { List } from './list'
import type { ReadSignal } from './signals'
import type { CommonChild, TagHandler } from './tag-handler'
import { defineTags } from './define-tags'

type SvgTags = {
	[K in keyof SVGElementTagNameMap]: {
		tag: SVGElementTagNameMap[K]
		props: Record<string, any>
	}
}

type Child =
	| TagHandler<Element>
	| CommonChild
	| Conditional<any, Array<Case<any, any, Child>>>
	| List<any, Child>

type SvgChild =
	| Child
	| ReadSignal<Child>

export const Svg: TagMapProxy<SvgTags, SvgChild> = defineTags<SvgTags, SvgChild>({
	creator(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name)
	},
})
