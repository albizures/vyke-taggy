import type { Props, TagChild, TagCreator } from './tag-handler'
import { TagHandler } from './tag-handler'

export type HtmlTags = HTMLElementTagNameMap
export type HtmlTag = keyof HtmlTags

export function createHtmlTag<TTag extends HtmlTag>(name: TTag) {
	return document.createElement(name)
}

export const Html = new Proxy({}, {
	get(_, name: HtmlTag) {
		return (propsOrChildren?: Props<HtmlTags[HtmlTag]> | Array<TagChild>, maybeChildren?: Array<TagChild>) => {
			const props = Array.isArray(propsOrChildren) ? undefined : propsOrChildren
			const children = Array.isArray(propsOrChildren) ? propsOrChildren : maybeChildren
			return new TagHandler(() => createHtmlTag(name), props, children ?? [])
		}
	},
}) as {
	[K in HtmlTag]: TagCreator<HtmlTags[K]>
}
