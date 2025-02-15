import type { Props, TagChild, TagCreator } from './tag-handler'
import { TagHandler } from './tag-handler'

export type SvgTags = SVGElementTagNameMap
export type SvgTag = keyof SvgTags

export function createSvgTag<TTag extends SvgTag>(name: TTag) {
	return document.createElementNS('http://www.w3.org/2000/svg', name)
}

export const Svg = new Proxy({}, {
	get(_, name: SvgTag) {
		return (propsOrChildren?: Props<SvgTags[SvgTag]> | Array<TagChild>, maybeChildren?: Array<TagChild>) => {
			const props = Array.isArray(propsOrChildren)
				? undefined
				: propsOrChildren
			const children = Array.isArray(propsOrChildren)
				? propsOrChildren
				: maybeChildren
			return new TagHandler(() => createSvgTag(name), props, children ?? [])
		}
	},
}) as {
	[K in SvgTag]: TagCreator<SvgTags[K]>
}
