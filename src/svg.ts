import type { Conditional } from './conditional'
import type { TagMapProxy } from './define-tags'
import type { List } from './list'
import type { CommonChild, TagHandler } from './tag-handler'
import { defineTags } from './define-tags'

type SvgTags = {
	[K in keyof SVGElementTagNameMap]: {
		tag: SVGElementTagNameMap[K]
		props: Record<string, any>
	}
}

type SvgChild =
	| TagHandler<Element>
	| CommonChild
	| Conditional<any, SvgChild, any>
	| List<any, SvgChild>

export const Svg: TagMapProxy<SvgTags, SvgChild> = defineTags<SvgTags, SvgChild>({
	creator(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name)
	},
})
