import type { TagMapProxy } from '../define-tags'
import type { DomChild, HtmlTags } from './dom-handlers'
import { defineTags } from '../define-tags'
import { childHandler, propHandler } from './dom-handlers'

export const Html: TagMapProxy<HtmlTags, DomChild, ChildNode> = defineTags<HtmlTags, DomChild, ChildNode>({
	creator(name) {
		return document.createElement(name)
	},
	childHandlers: [
		childHandler,
	],
	propHandlers: [
		propHandler,
	],
})
