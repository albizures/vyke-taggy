import type { Props } from './tag-handler'
import { TagHandler } from './tag-handler'

export type SvgTags = SVGElementTagNameMap
export type SvgTag = keyof SvgTags

export function createSvgTag<TTag extends SvgTag>(name: TTag) {
	return document.createElementNS('http://www.w3.org/2000/svg', name)
}

export const Svg = new Proxy({}, {
	get(_, name: SvgTag) {
		return (props?: Props<SvgTags[SvgTag]>) => new TagHandler(() => createSvgTag(name), props)
	},
}) as {
	[K in SvgTag]: (props?: Props<SvgTags[SvgTag]>) => TagHandler<SvgTags[K]>
}
