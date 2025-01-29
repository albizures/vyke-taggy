import type { Props } from './tag-handler'
import { TagHandler } from './tag-handler'

export type HtmlTags = HTMLElementTagNameMap
export type HtmlTag = keyof HtmlTags

export function createHtmlTag<TTag extends HtmlTag>(name: TTag) {
	return document.createElement(name)
}

export const Html = new Proxy({}, {
	get(_, name: HtmlTag) {
		return (props?: Props<HtmlTags[HtmlTag]>) => new TagHandler(() => createHtmlTag(name), props)
	},
}) as {
	[K in HtmlTag]: (props?: Props<HtmlTags[HtmlTag]>) => TagHandler<HtmlTags[K]>
}
